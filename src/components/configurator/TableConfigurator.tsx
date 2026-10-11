'use client';

import { useMemo, useRef, useState } from 'react';
import { useTableStore } from '@/store/configStore';
import { DEFAULT_TABLE } from '@/lib/config/defaults';
import {
  TABLE_EDGES,
  TABLE_FINISHES,
  TABLE_SHAPES,
  TABLE_STEPS,
  TABLE_WOODS,
  TABLE_BASES,
  FINISH_DISCLAIMER,
  TABLE_RULES,
} from '@/lib/catalog/table';
import { CUSTOM_PROPOSAL_COPY } from '@/lib/catalog/status';
import { dimensionLabel, tableBaseStates, tableDimensionKeys, tableDimensionRange, tableIssues } from '@/lib/config/rules';
import { tableSpec } from '@/lib/config/summary';
import { naturalEdgeWidthRange } from '@/lib/geometry/outline';
import { formatCm } from '@/lib/config/units';
import { ViewerShell } from '../three/ViewerShell';
import { DimensionField, NoticeList, OptionGroup, SpecList, Stepper } from './ui';
import { ReviewPanel } from './ReviewPanel';
import { PrintSheet } from './PrintSheet';
import { ConfirmDialog } from './ConfirmDialog';
import { useConfigUrl, useFooterVisible, useTyping } from './useConfigUrl';
import { usePrint } from './usePrint';
import { permalink } from '@/lib/config/url';
import { useMounted, useOrigin } from '../useClient';
import type { TableUncertainKey } from '@/lib/config/types';
import { ReferenceUpload, useReferenceImages } from './ReferenceUpload';
import { SpatialTableDrawing } from './SpatialTableDrawing';
import styles from './Frame.module.css';

const STEPS = ['Oblik', 'Drvo i dimenzije', 'Ivica i postolje', 'Detalji', 'Pregled'] as const;

function sameConfig(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function TableConfigurator({ formEnabled }: { formEnabled: boolean }) {
  const config = useTableStore((s) => s.config);
  const notices = useTableStore((s) => s.notices);
  const apply = useTableStore((s) => s.apply);
  const replace = useTableStore((s) => s.replace);
  const undo = useTableStore((s) => s.undo);
  const dismiss = useTableStore((s) => s.dismiss);
  const reset = useTableStore((s) => s.reset);
  const [step, setStep] = useState(0);
  const references = useReferenceImages();
  const unsure = (key: TableUncertainKey) => ({ checked: Boolean(config.uncertain?.includes(key)), onSelect: () => apply({ type: 'uncertain', key, value: true }) });
  const [confirmReset, setConfirmReset] = useState(false);
  const captureRef = useRef<(() => string | null) | null>(null);
  const { snapshot, print } = usePrint(captureRef);
  const url = useConfigUrl('table', config, replace, DEFAULT_TABLE);
  const typing = useTyping();
  const footerVisible = useFooterVisible();
  const panelTop = useRef<HTMLDivElement>(null);
  const origin = useOrigin();
  const mounted = useMounted();

  const spec = useMemo(() => tableSpec(config), [config]);
  const issues = useMemo(() => tableIssues(config), [config]);
  const baseStates = tableBaseStates(config);
  const isDefault = sameConfig(config, DEFAULT_TABLE);

  const go = (i: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
    panelTop.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  const requestReset = () => {
    // Ask inside the app when the reset would erase something the customer typed or chose.
    if (isDefault) return;
    setConfirmReset(true);
  };

  const dims = tableDimensionKeys(config.shapeId);
  const natural = config.shapeId === 'natural_edge' ? naturalEdgeWidthRange(config.dimensionsMm.width, TABLE_RULES.naturalEdgeMaxDeviationMm, config.seed) : null;

  return (
    <>
      <div className={`${styles.layout} no-print`}>
        <div className={styles.viewer}>
          <ViewerShell config={config} variant="configurator" captureRef={captureRef} label="3D prikaz stola" />
        </div>
        <div className={styles.panel} ref={panelTop}>
          <header className={styles.head}>
            <p className="eyebrow">Konfigurator · stol po mjeri</p>
            <h1>Kreirajte svoj stol</h1>
            <p className="note">
              Birajte ono što vam se sviđa. Za sve ostalo izaberite „Nisam siguran“ — zajedno ćemo pronaći rješenje. Na kraju tražite ponudu, bez obaveze naručivanja.
            </p>
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
              <p>Na ovom uređaju imate sačuvan izbor stola ({new Date(url.saved.savedAt).toLocaleString('bs-BA', { dateStyle: 'short', timeStyle: 'short' })}).</p>
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

          <div style={{ ['--steps' as string]: STEPS.length }}>
            <Stepper steps={STEPS} active={step} onSelect={go} />
          </div>
          <NoticeList notices={notices} onUndo={undo} onDismiss={dismiss} />

          <div className={styles.step} data-testid={`step-${step}`}>
            {step === 0 && (
              <OptionGroup
                legend="Oblik ploče"
                unsure={unsure('shape')} quietStatus
                name="oblik"
                columns={2}
                value={config.shapeId}
                onChange={(v) => apply({ type: 'shape', value: v })}
                options={TABLE_SHAPES.map((s) => ({ id: s.id, label: s.label, description: s.description, status: s.status, preview: <SpatialTableDrawing config={{ ...DEFAULT_TABLE, shapeId: s.id, baseId: s.id === 'circle' ? 'central_pedestal' : DEFAULT_TABLE.baseId }} preview /> }))}
              />
            )}
            {step === 1 && (
              <>
                <OptionGroup
                  legend="Drvo"
                  unsure={unsure('wood')} quietStatus
                  name="drvo"
                  columns={1}
                  value={config.woodId}
                  onChange={(v) => apply({ type: 'wood', value: v })}
                  options={TABLE_WOODS.map((w) => ({ id: w.id, label: w.label, description: w.description, status: w.status, swatch: `url(/materials/${w.id}.webp) center / cover`, preview: undefined }))}
                  hint="Izaberite karakter drveta koji vam se sviđa. Cijenu potvrđujemo uz ponudu."
                />
                <fieldset className="dims" style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                  <legend style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', marginBottom: '0.5rem' }}>Dimenzije</legend>
                  <div className={styles.advice}><strong>Koliko mjesta za stolom?</strong><p>Za početno planiranje računajte oko 60–70 cm po osobi duž strane stola. Provjerite i prostor za izvlačenje stolica. Postolje utiče na stvaran raspored sjedenja.</p></div>
                  {dims.map((key) => (
                    <DimensionField
                      key={`${config.shapeId}-${key}`}
                      label={key === 'width' && natural ? 'Širina (najšire mjesto)' : dimensionLabel(key)}
                      valueMm={config.dimensionsMm[key]}
                      range={tableDimensionRange(config.shapeId, key)}
                      step={TABLE_STEPS[key]}
                      onCommit={(mm) => apply({ type: 'dimension', key, value: mm })}
                      help={key === 'totalHeight' ? 'Izmjerite i visinu sjedišta i naslona za ruke na svojim stolicama.' : undefined}
                      unsure={{ checked: Boolean(config.uncertain?.includes(key)), onChange: (value) => apply({ type: 'uncertain', key, value }) }}
                      testId={`dim-${key}`}
                    />
                  ))}
                  {natural && (
                    <p className="note">
                      Prirodna ivica: širina je procjena. Na najužem mjestu oko {formatCm(natural.min)} cm, na najširem {formatCm(natural.max)} cm.
                      Konačni obris zavisi od izabranih komada drveta.
                    </p>
                  )}
                  <p className="note">{CUSTOM_PROPOSAL_COPY} Za dimenziju izvan raspona koristite „Poseban zahtjev“ na pregledu.</p>
                </fieldset>
              </>
            )}
            {step === 2 && (
              <>
                <OptionGroup
                  legend="Ivica"
                  unsure={unsure('edge')} quietStatus
                  name="ivica"
                  value={config.edgeId}
                  onChange={(v) => apply({ type: 'edge', value: v })}
                  options={TABLE_EDGES.map((e) => ({ id: e.id, label: e.label, description: e.description, status: e.status }))}
                />
                <OptionGroup
                  legend="Postolje"
                  unsure={unsure('base')} quietStatus
                  name="postolje"
                  columns={2}
                  value={config.baseId}
                  onChange={(v) => apply({ type: 'base', value: v })}
                  options={TABLE_BASES.map((b) => {
                    const st = baseStates.find((s) => s.id === b.id)!;
                    return { id: b.id, label: b.label, description: b.description, status: b.status, disabled: st.disabled, reason: st.reason, preview: <SpatialTableDrawing config={{ ...DEFAULT_TABLE, woodId: config.woodId, baseId: b.id }} preview /> };
                  })}
                  hint="Pogledajte karakter svakog postolja. Predložene modele i konstrukciju dogovaramo s radionicom."
                />
                <div className={styles.advice}><strong>Postolje biramo i zbog udobnosti.</strong><p>Pošaljite širinu svojih stolica i recite želite li sjediti na krajevima stola. Tako dogovaramo položaj nogu i prostor ispod ploče.</p></div>
                <ReferenceUpload references={references} />
              </>
            )}
            {step === 3 && (
              <>
                <OptionGroup
                  legend="Nijansa (vizuelni prijedlog)"
                  unsure={unsure('finish')} quietStatus
                  name="nijansa"
                  value={config.finishId}
                  onChange={(v) => apply({ type: 'finish', value: v })}
                  options={TABLE_FINISHES.map((f) => ({ id: f.id, label: f.label, status: f.status, swatch: f.swatch }))}
                  hint={FINISH_DISCLAIMER}
                />
                {config.shapeId === 'natural_edge' && (
                  <div className="note" style={{ display: 'grid', gap: '0.5rem' }}>
                    <p>Obris prirodne ivice je varijanta {config.seed}. Stvarni rub zavisi od komada drveta.</p>
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => apply({ type: 'reseed', value: (config.seed * 1103515245 + 12345) >>> 0 })}>
                      Prikaži drugi mogući obris
                    </button>
                  </div>
                )}
              </>
            )}
            {step === 4 && (
              <ReviewPanel
                config={config}
                formEnabled={formEnabled}
                onNote={(v) => apply({ type: 'note', value: v })}
                onPrint={print}
                references={references}
                blockingIssue={issues.length ? issues.map((i) => i.message).join(' ') : null}
              />
            )}
          </div>

          <div className={styles.nav}>
            <button type="button" className="btn btn--ghost" onClick={() => go(step - 1)} disabled={step === 0}>
              Nazad
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn" onClick={() => go(step + 1)} data-testid="next-step">
                Dalje: {STEPS[step + 1]}
              </button>
            ) : null}
          </div>

          {step < STEPS.length - 1 && (
            <section className={styles.summary} aria-labelledby="sazetak">
              <h2 id="sazetak">Vaš izbor</h2>
              <SpecList lines={spec} compact />
              <p className="note">Cijena prema odabranoj konfiguraciji — šaljemo ponudu.</p>
            </section>
          )}

          <div className={styles.resetRow}>
            <button type="button" className="btn btn--ghost btn--small" onClick={requestReset} disabled={isDefault} data-testid="reset-config">
              Vrati početne opcije
            </button>
            <span className="note">Vraća polazni hrastov stol. Pogled kamere ostaje isti.</span>
          </div>
        </div>
        <div className={styles.bar} data-hidden={typing || footerVisible}>
          <span className={styles.barText}>
            Korak {step + 1}/{STEPS.length} · {STEPS[step]}
          </span>
          {step < STEPS.length - 1 ? (
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
      {mounted && <PrintSheet config={config} lines={spec} snapshot={snapshot} link={permalink(origin, config)} references={references.files} />}
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
        <p>Vaš trenutni izbor stola{config.note ? ' i poseban zahtjev' : ''} bit će zamijenjen polaznim hrastovim stolom 150 × 70 cm.</p>
        <p>Ako želite zadržati izbor, prvo ga sačuvajte ili kopirajte link na pregledu.</p>
      </ConfirmDialog>
    </>
  );
}
