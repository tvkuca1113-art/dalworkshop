'use client';

import { useId } from 'react';
import { ENGRAVING_FONTS, ENGRAVING_PLACEMENTS, PERSONALIZATION, engravingPlacement, type EngravingPlacementId } from '@/lib/catalog/board';
import { countChars, type EngravingEvaluation } from '@/lib/engraving/fit';
import type { BoardConfig, Personalization } from '@/lib/config/types';
import { boardModel } from '@/lib/catalog/board';
import { OptionGroup, StatusBadge } from './ui';
import styles from './PersonalizationEditor.module.css';

export function PersonalizationEditor({
  config,
  evaluation,
  inkSize,
  onChange,
}: {
  config: BoardConfig;
  evaluation: EngravingEvaluation | { status: 'measuring' };
  inkSize: { w: number; h: number } | null;
  onChange: (patch: Partial<Personalization>) => void;
}) {
  const p = config.personalization;
  const id = useId();
  const round = boardModel(config.modelId).shape === 'circle';
  const chars = countChars(p.text);
  const [min, max] = PERSONALIZATION.sizeRangeMm;

  return (
    <div className={styles.editor}>
      <div className={styles.intro}>
        <h2 className={styles.title}>{PERSONALIZATION.title}</h2>
        <StatusBadge status={PERSONALIZATION.availability} withHint />
        <p className="note">{PERSONALIZATION.copy}</p>
      </div>
      <label className={styles.toggle}>
        <input type="checkbox" checked={p.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} data-testid="engrave-toggle" />
        Želim personalizaciju (tekst na dasci)
      </label>
      {!p.enabled && p.text && <p className="note">Tekst „{p.text.replace(/\n/g, ' / ')}“ je sačuvan i vraća se kad ponovo uključite personalizaciju.</p>}

      {p.enabled && (
        <>
          <div className={styles.field}>
            <label htmlFor={`${id}-text`}>Tekst (do {PERSONALIZATION.maxChars} znakova, najviše 2 reda)</label>
            <textarea
              id={`${id}-text`}
              rows={2}
              value={p.text}
              maxLength={90}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              onChange={(e) => onChange({ text: e.target.value })}
              aria-describedby={`${id}-count ${id}-status`}
              data-testid="engrave-text"
            />
            <p id={`${id}-count`} className={`note ${chars > PERSONALIZATION.maxChars ? styles.over : ''}`}>
              {chars}/{PERSONALIZATION.maxChars} znakova · tekst ostaje tačno kako ste ga napisali
            </p>
          </div>

          <OptionGroup
            legend="Font"
            name="font"
            columns={3}
            value={p.fontId}
            onChange={(v) => onChange({ fontId: v })}
            options={ENGRAVING_FONTS.map((f) => ({ id: f.id, label: f.label, fontFamily: `var(${f.cssVar})` }))}
          />

          <OptionGroup
            legend="Položaj"
            name="polozaj"
            columns={3}
            value={p.placement}
            onChange={(v) => onChange({ placement: v })}
            options={ENGRAVING_PLACEMENTS.map((pl) => ({
              id: pl.id,
              label: pl.label,
              description: pl.description,
              disabled: round && pl.id === 'corner',
              reason: round && pl.id === 'corner' ? 'Okrugla daska nema ugao.' : undefined,
            }))}
          />

          <div className={styles.field}>
            <label htmlFor={`${id}-size`}>Visina slova (mm)</label>
            <div className={styles.sizeRow}>
              <button type="button" className={styles.step} onClick={() => onChange({ sizeMm: Math.max(min, p.sizeMm - 1) })} disabled={p.sizeMm <= min} aria-label="Manja slova">
                −
              </button>
              <input
                id={`${id}-size`}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step={1}
                value={p.sizeMm}
                onChange={(e) => {
                  const v = Math.round(Number(e.target.value));
                  if (Number.isFinite(v) && v >= min && v <= max) onChange({ sizeMm: v });
                }}
                className={`${styles.size} tabular`}
                data-testid="engrave-size"
              />
              <button type="button" className={styles.step} onClick={() => onChange({ sizeMm: Math.min(max, p.sizeMm + 1) })} disabled={p.sizeMm >= max} aria-label="Veća slova">
                +
              </button>
            </div>
            <p className="note">
              Raspon {min}–{max} mm. Veličina se odnosi na visinu slova u fontu.
            </p>
          </div>

          <div id={`${id}-status`} aria-live="polite" className={styles.status} data-testid="engrave-status" data-status={evaluation.status}>
            {evaluation.status === 'measuring' && <p>Mjerim tekst u izabranom fontu…</p>}
            {evaluation.status === 'invalid_text' && <p className={styles.warn}>{evaluation.message}</p>}
            {evaluation.status === 'ok' && inkSize && (
              <p className={styles.ok}>
                Natpis zauzima oko {Math.round(inkSize.w)} × {Math.round(inkSize.h)} mm i stoji unutar sigurne zone ({engravingPlacement(p.placement).label.toLowerCase()}), bez dodira s utorima i ručkama.
              </p>
            )}
            {(evaluation.status === 'too_large' || evaluation.status === 'placement_unavailable') && (
              <div className={styles.conflict}>
                <p className={styles.warn}>{evaluation.message} Tekst je sačuvan — izaberite rješenje:</p>
                <div className={styles.actions}>
                  {evaluation.status === 'too_large' && evaluation.maxSizeHere >= min && (
                    <button type="button" className="btn btn--small" onClick={() => onChange({ sizeMm: evaluation.maxSizeHere })}>
                      Smanji slova na {evaluation.maxSizeHere} mm
                    </button>
                  )}
                  {evaluation.alternatives.map((a) => (
                    <button
                      key={a.placement}
                      type="button"
                      className="btn btn--ghost btn--small"
                      onClick={() => onChange(a.fitsCurrent ? { placement: a.placement as EngravingPlacementId } : { placement: a.placement as EngravingPlacementId, sizeMm: a.maxSize })}
                    >
                      {engravingPlacement(a.placement).label}
                      {a.fitsCurrent ? '' : ` (${a.maxSize} mm)`}
                    </button>
                  ))}
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange({ enabled: false })}>
                    Isključi personalizaciju
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="note">
            Za poseban logotip ili crtež opišite želju u polju „Poseban zahtjev“ na pregledu; datoteku dogovarate s radionicom.
          </p>
        </>
      )}
    </div>
  );
}
