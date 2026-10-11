'use client';

import { useId, useState, type ReactNode } from 'react';
import { AVAILABILITY_HINT, AVAILABILITY_LABEL, type Availability } from '@/lib/catalog/status';
import { formatCm, parseCmToMm } from '@/lib/config/units';
import type { Range } from '@/lib/catalog/table';
import type { Notice } from '@/lib/config/rules';
import type { SpecLine } from '@/lib/config/summary';
import styles from './ui.module.css';

export function StatusBadge({ status, withHint = false }: { status: Availability; withHint?: boolean }) {
  return (
    <span className={`status status--${status}`} title={AVAILABILITY_HINT[status]}>
      {AVAILABILITY_LABEL[status]}
      {withHint && <span className="visually-hidden">: {AVAILABILITY_HINT[status]}</span>}
    </span>
  );
}

export interface TileOption<Id extends string> {
  id: Id;
  label: string;
  description?: string;
  status?: Availability;
  disabled?: boolean;
  reason?: string;
  swatch?: string;
  preview?: ReactNode;
  fontFamily?: string;
}

export function OptionGroup<Id extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 2,
  hint,
  unsure,
  quietStatus = false,
}: {
  legend: string;
  name: string;
  options: readonly TileOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  columns?: 1 | 2 | 3;
  hint?: ReactNode;
  unsure?: { checked: boolean; onSelect: () => void };
  quietStatus?: boolean;
}) {
  const hintId = useId();
  return (
    <fieldset className={styles.group} aria-describedby={hint ? hintId : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={hintId} className={`note ${styles.groupHint}`}>
          {hint}
        </p>
      )}
      <div className={styles.tiles} data-columns={columns}>
        {options.map((o) => {
          const id = `${name}-${o.id}`;
          const reasonId = `${id}-reason`;
          return (
            <label key={o.id} className={styles.tile} data-preview={Boolean(o.preview) || undefined} data-checked={!unsure?.checked && value === o.id} data-disabled={o.disabled || undefined} htmlFor={id}>
              <input
                type="radio"
                id={id}
                name={name}
                value={o.id}
                checked={!unsure?.checked && value === o.id}
                disabled={o.disabled}
                onChange={() => onChange(o.id)}
                aria-describedby={o.disabled && o.reason ? reasonId : undefined}
                className={styles.radio}
              />
              {o.swatch && <span className={styles.swatch} style={{ background: o.swatch }} aria-hidden="true" />}
              {o.preview}
              <span className={styles.tileText}>
                <span className={styles.tileLabel} style={o.fontFamily ? { fontFamily: o.fontFamily } : undefined}>
                  {o.label}
                </span>
                {o.description && <span className={styles.tileDesc}>{o.description}</span>}
                {o.status && !quietStatus && <StatusBadge status={o.status} withHint />}
                {o.disabled && o.reason && (
                  <span id={reasonId} className={styles.reason}>
                    {o.reason}
                  </span>
                )}
              </span>
            </label>
          );
        })}
        {unsure && (
          <label className={`${styles.tile} ${styles.unsureTile}`} data-checked={unsure.checked} htmlFor={`${name}-unsure`}>
            <input className={styles.radio} id={`${name}-unsure`} name={name} type="radio" checked={unsure.checked} onChange={unsure.onSelect} />
            <span className={styles.tileText}><span className={styles.tileLabel}>Nisam siguran</span><span className={styles.tileDesc}>Želim prijedlog radionice. Prikaz ostaje kao inspiracija.</span></span>
          </label>
        )}
      </div>
    </fieldset>
  );
}

/**
 * Centimetre input with decimal comma or point, plus step buttons.
 * Out-of-range values are explained and never applied silently.
 */
export function DimensionField({
  label,
  valueMm,
  range,
  step,
  onCommit,
  help,
  testId,
  unsure,
}: {
  label: string;
  valueMm: number;
  range: Range;
  step: number;
  onCommit: (mm: number) => void;
  help?: string;
  testId?: string;
  unsure?: { checked: boolean; onChange: (checked: boolean) => void };
}) {
  const id = useId();
  const [text, setText] = useState(formatCm(valueMm));
  const [error, setError] = useState<string | null>(null);
  // Re-sync the text when the value changes from outside (step buttons, rules, undo).
  const [shown, setShown] = useState(valueMm);
  if (shown !== valueMm) {
    setShown(valueMm);
    setText(formatCm(valueMm));
    setError(null);
  }

  const commit = (raw: string) => {
    const r = parseCmToMm(raw);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    if (r.mm < range[0] || r.mm > range[1]) {
      setError(
        `Predloženi raspon je ${formatCm(range[0])}–${formatCm(range[1])} cm. Drugu mjeru opišite u polju „Poseban zahtjev“ na pregledu.`,
      );
      return;
    }
    setError(null);
    if (r.mm !== valueMm) onCommit(r.mm);
    setText(formatCm(r.mm));
  };

  const stepBy = (dir: 1 | -1) => {
    const next = Math.min(range[1], Math.max(range[0], Math.round((valueMm + dir * step) / step) * step));
    setError(null);
    if (next !== valueMm) onCommit(next);
  };

  return (
    <div className={styles.dim} data-testid={testId}>
      <label htmlFor={id} className={styles.dimLabel}>
        {label}
      </label>
      {unsure && <label className={styles.unsureDimension}><input type="checkbox" aria-label={`${label}: Nisam siguran`} checked={unsure.checked} onChange={(e) => unsure.onChange(e.target.checked)} />Nisam siguran</label>}
      <div className={styles.dimRow}>
        <button type="button" className={styles.stepBtn} onClick={() => stepBy(-1)} disabled={valueMm <= range[0]} aria-label={`${label}: smanji za ${formatCm(step)} cm`}>
          −
        </button>
        <div className={styles.inputWrap}>
          <input
            id={id}
            className={`${styles.input} tabular`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-hint${error ? ` ${id}-err` : ''}`}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit((e.target as HTMLInputElement).value);
              }
            }}
          />
          <span className={styles.unit} aria-hidden="true">
            cm
          </span>
        </div>
        <button type="button" className={styles.stepBtn} onClick={() => stepBy(1)} disabled={valueMm >= range[1]} aria-label={`${label}: povećaj za ${formatCm(step)} cm`}>
          +
        </button>
      </div>
      <p id={`${id}-hint`} className={styles.dimHint}>
        {unsure?.checked ? 'Ova mjera je samo prijedlog za prikaz. Radionica će vam pomoći odabrati. ' : ''}{help ? `${help} ` : ''}Raspon prijedloga {formatCm(range[0])}–{formatCm(range[1])} cm.
      </p>
      {error && (
        <p id={`${id}-err`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Stepper({ steps, active, onSelect }: { steps: readonly string[]; active: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Koraci konfiguracije" className={styles.stepper}>
      <ol>
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" aria-current={i === active ? 'step' : undefined} onClick={() => onSelect(i)} className={styles.stepBtnNav}>
              <span className={styles.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <span>{s}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function NoticeList<C>({ notices, onUndo, onDismiss }: { notices: (Notice<C> & { key: number })[]; onUndo: (key: number) => void; onDismiss: (key: number) => void }) {
  return (
    <div aria-live="polite" className={styles.notices} data-testid="notices">
      {notices.map((n) => (
        <div key={n.key} className={styles.notice}>
          <p>{n.message}</p>
          <div className={styles.noticeActions}>
            {n.undo && (
              <button type="button" className="btn btn--ghost btn--small" onClick={() => onUndo(n.key)}>
                Poništi
              </button>
            )}
            <button type="button" className="btn btn--ghost btn--small" onClick={() => onDismiss(n.key)} aria-label="Zatvori obavijest">
              U redu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpecList({ lines, compact = false }: { lines: readonly SpecLine[]; compact?: boolean }) {
  return (
    <dl className={`${styles.spec} ${compact ? styles.specCompact : ''}`} data-testid="spec">
      {lines.map((l) => (
        <div key={l.key} className={styles.specRow} data-key={l.key}>
          <dt>{l.label}</dt>
          <dd>
            <span className="tabular">{l.value}</span>
            {!compact && l.status && (
              <>
                {' '}
                <StatusBadge status={l.status} />
              </>
            )}
            {!compact && l.note && <span className={styles.specNote}>{l.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
