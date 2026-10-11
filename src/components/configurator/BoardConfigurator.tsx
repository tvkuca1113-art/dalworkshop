'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBoardStore } from '@/store/configStore';
import { DEFAULT_BOARD } from '@/lib/config/defaults';
import {
  BOARD_EDGES,
  BOARD_FINISHES,
  BOARD_GROOVES,
  BOARD_HANDLES,
  BOARD_MODELS,
  BOARD_PURPOSES,
  BOARD_RULES,
  BOARD_STEPS,
  boardModel,
} from '@/lib/catalog/board';
import { CUSTOM_PROPOSAL_COPY } from '@/lib/catalog/status';
import { WOOD_LOOK } from '@/lib/catalog/woods';
import {
  boardDimensionKeys,
  boardDimensionRange,
  boardGrooveStates,
  boardHandleStates,
  boardIssues,
  dimensionLabel,
  visibleConstructions,
} from '@/lib/config/rules';
import { boardSpec } from '@/lib/config/summary';
import { computeBoardLayout } from '@/lib/geometry/board-layout';
import { boxAt, evaluateEngraving, validateEngravingText } from '@/lib/engraving/fit';
import { ensureFont, measureLines, type MeasuredText } from '@/lib/engraving/measure';
import { formatCm } from '@/lib/config/units';
import { permalink } from '@/lib/config/url';
import { FLAGS } from '@/lib/flags';
import { ViewerShell } from '../three/ViewerShell';
import type { EngravingRender } from '../three/types';
import { DimensionField, NoticeList, OptionGroup, SpecList, Stepper } from './ui';
import { ReviewPanel } from './ReviewPanel';
import { PrintSheet } from './PrintSheet';
import { ConfirmDialog } from './ConfirmDialog';
import { PersonalizationEditor } from './PersonalizationEditor';
import { useConfigUrl, useFooterVisible, useTyping } from './useConfigUrl';
import { usePrint } from './usePrint';
import { useMounted, useOrigin } from '../useClient';
import type { EngravingDraw } from './Plan2D';
import styles from './Frame.module.css';

const ALL_STEPS = ['Model i namjena', 'Drvo i dimenzije', 'Detalji', 'Personalizacija', 'Pregled'] as const;
type StepName = (typeof ALL_STEPS)[number];

function sameConfig(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function BoardConfigurator({ formEnabled }: { formEnabled: boolean }) {
  const config = useBoardStore((s) => s.config);
  const notices = useBoardStore((s) => s.notices);
  const apply = useBoardStore((s) => s.apply);
  const replace = useBoardStore((s) => s.replace);
  const undo = useBoardStore((s) => s.undo);
  const dismiss = useBoardStore((s) => s.dismiss);
  const reset = useBoardStore((s) => s.reset);
  const steps: readonly StepName[] = FLAGS.personalization ? ALL_STEPS : ALL_STEPS.filter((s) => s !== 'Personalizacija');
  const [step, setStep] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);
  const { snapshot, print } = usePrint(captureRef);
  const url = useConfigUrl('board', config, replace, DEFAULT_BOARD);
  const typing = useTyping();
  const footerVisible = useFooterVisible();
  const panelTop = useRef<HTMLDivElement>(null);
  const origin = useOrigin();
  const mounted = useMounted();

  const model = boardModel(config.modelId);
  const layout = useMemo(() => computeBoardLayout(config), [config]);
  const spec = useMemo(() => boardSpec(config), [config]);
  const issues = useMemo(() => boardIssues(config), [config]);
  const p = config.personalization;
  const personalization = FLAGS.personalization ? p : { ...p, enabled: false };

  // Measure the text with the real font (diacritics included) whenever it changes.
  const [measured, setMeasured] = useState<{ key: string; m: MeasuredText } | null>(null);
  const measureKey = `${p.fontId}|${p.text}`;
  useEffect(() => {
    if (!personalization.enabled) return;
    const v = validateEngravingText(p.text);
    if (!v.ok) return;
    let alive = true;
    ensureFont(p.fontId, p.text).then(() => {
      if (alive) setMeasured({ key: `${p.fontId}|${p.text}`, m: measureLines(v.lines, p.fontId) });
    });
    return () => {
      alive = false;
    };
  }, [personalization.enabled, p.fontId, p.text]);
  const metrics = measured && measured.key === measureKey ? measured.m : null;
  const evaluation = evaluateEngraving(layout, personalization, metrics);
  const engraving: EngravingRender | null =
    evaluation.status === 'ok' && metrics && measured
      ? { measured: metrics, fontId: p.fontId, placement: p.placement, sizeMm: p.sizeMm, rect: evaluation.rect, fontKey: measured.key }
      : null;
  const engravingDraw: EngravingDraw | null =
    evaluation.status === 'ok' ? { rect: evaluation.rect, lines: p.text.split('\n'), fontId: p.fontId, placement: p.placement } : null;
  const inkSize = metrics ? boxAt(metrics, p.sizeMm) : null;

  const engravingConflict =
    personalization.enabled && (evaluation.status === 'too_large' || evaluation.status === 'placement_unavailable' || evaluation.status === 'invalid_text')
      ? 'Personalizacija traži vašu odluku prije slanja: natpis ne stane na izabrano mjesto ili tekst nije ispravan. Tekst je sačuvan.'
      : null;
  const blockingIssue = [issues.map((i) => i.message).join(' '), engravingConflict].filter(Boolean).join(' ') || null;

  const isDefault = sameConfig(config, DEFAULT_BOARD);
  const current = steps[step]!;
  const go = (i: number) => {
    setStep(Math.max(0, Math.min(steps.length - 1, i)));
    panelTop.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  return (
    <>
      <div className={`${styles.layout} no-print`}>
        <div className={styles.viewer}>
          <ViewerShell config={config} variant="configurator" captureRef={captureRef} engraving={engraving} engravingDraw={engravingDraw} label="3D prikaz daske" />
        </div>
        <div className={styles.panel} ref={panelTop}>
          <header className={styles.head}>
            <p className="eyebrow">Konfigurator · daska za rezanje i serviranje</p>
            <h1>Kreirajte svoju dasku</h1>
            <p className="note">Izaberite model, prilagodite dimenzije i dodajte svoje detalje. Izradu i cijenu potvrđujemo uz ponudu.</p>
          </header>

          {url.message && (
            <div className={`${styles.banner} ${styles['banner--error']}`} role="alert">
              <p>{url.message}</p>
              <div className={styles.bannerActions}>
                <button type="button" className="btn btn--ghost btn--small" onClick={url.dismissMessage}>
                  U redu
                </button>
              </div>
            </div>
          )}
          {url.saved && !sameConfig(url.saved.config, config) && (
            <div className={styles.banner}>
              <p>Na ovom uređaju imate sačuvan izbor daske ({new Date(url.saved.savedAt).toLocaleString('bs-BA', { dateStyle: 'short', timeStyle: 'short' })}).</p>
              <div className={styles.bannerActions}>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => {
                    replace(url.saved!.config);
                    url.dismissSaved();
                  }}
                >
                  Otvori sačuvani izbor
                </button>
                <button type="button" className="btn btn--ghost btn--small" onClick={url.dismissSaved}>
                  Zanemari
                </button>
              </div>
            </div>
          )}

          <div style={{ ['--steps' as string]: steps.length }}>
            <Stepper steps={steps} active={step} onSelect={go} />
          </div>
          <NoticeList notices={notices} onUndo={undo} onDismiss={dismiss} />

          <div className={styles.step} data-testid={`step-${step}`}>
            {current === 'Model i namjena' && (
              <>
                <OptionGroup
                  legend="Polazni model"
                  name="model"
                  columns={1}
                  value={config.modelId}
                  onChange={(v) => apply({ type: 'model', value: v })}
                  options={BOARD_MODELS.map((m) => ({
                    id: m.id,
                    label: m.label,
                    description: m.description + (m.dimensionsEstimated ? ' Dimenzije s fotografije su procjena.' : ''),
                    status: m.status,
                    preview: m.photo ? (
                      <Image src={m.photo} alt="" width={64} height={64} sizes="64px" style={{ objectFit: 'cover', flex: 'none', width: 64, height: 64 }} />
                    ) : undefined,
                  }))}
                />
                <OptionGroup
                  legend="Namjena"
                  name="namjena"
                  columns={3}
                  value={config.purposeId}
                  onChange={(v) => apply({ type: 'purpose', value: v })}
                  options={BOARD_PURPOSES.map((pp) => ({ id: pp.id, label: pp.label, description: pp.description }))}
                />
              </>
            )}
            {current === 'Drvo i dimenzije' && (
              <>
                <OptionGroup
                  legend="Drvo i konstrukcija"
                  name="drvo"
                  columns={1}
                  value={config.constructionId}
                  onChange={(v) => apply({ type: 'construction', value: v })}
                  options={visibleConstructions().map((c) => ({
                    id: c.id,
                    label: c.label,
                    description: c.description,
                    status: c.status,
                    swatch: c.strips.length > 1 && c.strips[0]!.species !== c.strips[1]!.species
                      ? `linear-gradient(90deg, ${WOOD_LOOK[c.strips[0]!.species].base} 50%, ${WOOD_LOOK[c.strips[1]!.species].base} 50%)`
                      : WOOD_LOOK[c.strips[0]!.species].base,
                  }))}
                />
                <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                  <legend style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '0.5rem' }}>Dimenzije</legend>
                  {boardDimensionKeys(config).map((key) => (
                    <DimensionField
                      key={`${config.modelId}-${key}`}
                      label={key === 'length' && model.shape === 'paddle' ? 'Ukupna dužina (uključuje dršku)' : dimensionLabel(key)}
                      valueMm={config.dimensionsMm[key]}
                      range={boardDimensionRange(config, key)}
                      step={BOARD_STEPS[key]}
                      onCommit={(mm) => apply({ type: 'dimension', key, value: mm })}
                      testId={`dim-${key}`}
                    />
                  ))}
                  {model.shape === 'paddle' && (
                    <p className="note" data-testid="usable-surface">
                      Drška je {formatCm(BOARD_RULES.paddleHandleLengthMm)} cm i uključena je u ukupnu dužinu. Korisna ploha: {formatCm(layout.usable.length)} ×{' '}
                      {formatCm(layout.usable.width)} cm.
                    </p>
                  )}
                  {model.dimensionsEstimated && <p className="note">Polazne mjere su prijedlog. Prilagodite ih svojoj kuhinji i načinu upotrebe.</p>}
                  <p className="note">{CUSTOM_PROPOSAL_COPY} Trebate drugu mjeru? Dodajte je u poseban zahtjev na pregledu.</p>
                </fieldset>
              </>
            )}
            {current === 'Detalji' && (
              <>
                <OptionGroup
                  legend="Utori"
                  name="utori"
                  columns={1}
                  value={config.grooveId}
                  onChange={(v) => apply({ type: 'groove', value: v })}
                  options={BOARD_GROOVES.map((g) => {
                    const st = boardGrooveStates(config).find((s) => s.id === g.id)!;
                    return { id: g.id, label: g.label, description: g.description, status: g.status, disabled: st.disabled, reason: st.reason };
                  })}
                  hint={`Prijedlog dubine utora: oko ${formatCm(layout.grooveDepthMm)} cm. Izradu potvrđujemo uz ponudu.`}
                />
                <OptionGroup
                  legend="Ručke"
                  name="rucke"
                  columns={1}
                  value={config.handleId}
                  onChange={(v) => apply({ type: 'handle', value: v })}
                  options={BOARD_HANDLES.map((h) => {
                    const st = boardHandleStates(config).find((s) => s.id === h.id)!;
                    return { id: h.id, label: h.label, description: h.description, status: h.status, disabled: st.disabled, reason: st.reason };
                  })}
                />
                <OptionGroup
                  legend="Ivica"
                  name="ivica"
                  value={config.edgeId}
                  onChange={(v) => apply({ type: 'edge', value: v })}
                  options={BOARD_EDGES.map((e) => ({ id: e.id, label: e.label, description: e.description, status: e.status }))}
                />
                <OptionGroup
                  legend="Završna obrada"
                  name="obrada"
                  columns={1}
                  value={config.finishId}
                  onChange={(v) => apply({ type: 'finish', value: v })}
                  options={BOARD_FINISHES.map((f) => ({ id: f.id, label: f.label, description: f.description, status: f.status }))}
                  hint="Nudimo samo obrade spomenute u DAL objavama; tačan proizvod potvrđuje radionica."
                />
              </>
            )}
            {current === 'Personalizacija' && (
              <PersonalizationEditor
                config={config}
                evaluation={evaluation}
                inkSize={inkSize}
                onChange={(value) => apply({ type: 'personalization', value })}
              />
            )}
            {current === 'Pregled' && (
              <ReviewPanel
                config={config}
                formEnabled={formEnabled}
                onNote={(v) => apply({ type: 'note', value: v })}
                onPrint={print}
                blockingIssue={blockingIssue}
                blockingActions={
                  engravingConflict ? (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn--small" onClick={() => go(steps.indexOf('Personalizacija'))}>
                        Riješi personalizaciju
                      </button>
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => apply({ type: 'personalization', value: { enabled: false } })}>
                        Pošalji bez personalizacije
                      </button>
                    </div>
                  ) : null
                }
              />
            )}
          </div>

          <div className={styles.nav}>
            <button type="button" className="btn btn--ghost" onClick={() => go(step - 1)} disabled={step === 0}>
              Nazad
            </button>
            {step < steps.length - 1 ? (
              <button type="button" className="btn" onClick={() => go(step + 1)} data-testid="next-step">
                Dalje: {steps[step + 1]}
              </button>
            ) : null}
          </div>

          {current !== 'Pregled' && (
            <section className={styles.summary} aria-labelledby="sazetak">
              <h2 id="sazetak">Vaš izbor</h2>
              <SpecList lines={spec} compact />
              <p className="note">Cijena prema odabranoj konfiguraciji — šaljemo ponudu.</p>
            </section>
          )}

          <div className={styles.resetRow}>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => !isDefault && setConfirmReset(true)} disabled={isDefault} data-testid="reset-config">
              Vrati početne opcije
            </button>
            <span className="note">Vraća dasku od javora i bukve. Pogled kamere ostaje isti.</span>
          </div>
        </div>
        <div className={styles.bar} data-hidden={typing || footerVisible}>
          <span className={styles.barText}>
            Korak {step + 1}/{steps.length} · {current}
          </span>
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn--small" onClick={() => go(step + 1)}>
              Dalje
            </button>
          ) : (
            <a href="#pregled-naslov" className="btn btn--small">
              Upit
            </a>
          )}
        </div>
      </div>
      {mounted && <PrintSheet config={config} lines={spec} snapshot={snapshot} link={permalink(origin, config)} engravingDraw={engravingDraw} />}
      <ConfirmDialog
        open={confirmReset}
        title="Vratiti početne opcije?"
        confirmLabel="Da, vrati početne opcije"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          reset();
          setConfirmReset(false);
          setStep(0);
        }}
      >
        <p>
          Trenutni izbor daske bit će zamijenjen polaznom daskom od javora i bukve.
          {p.text ? ` Upisani tekst personalizacije („${p.text.replace(/\n/g, ' / ')}“) bit će obrisan.` : ''}
          {config.note ? ' Poseban zahtjev bit će obrisan.' : ''}
        </p>
        <p>Ako želite zadržati izbor, prvo ga sačuvajte ili kopirajte link na pregledu.</p>
      </ConfirmDialog>
    </>
  );
}
