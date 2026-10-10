'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { TREAD_CATALOG, TREAD_WOODS } from '@/lib/catalog/treads';
import { DEFAULT_TREAD, treadMessage, treadPrice, treadSelectionSchema, treadUrl, type TreadSelection } from '@/lib/config/tread';
import { formatKm } from '@/lib/config/units';
import { whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { TreadPreview } from './TreadPreview';
import styles from './TreadSelector.module.css';

const subscribe = () => () => {};
const originSnapshot = () => window.location.origin;
const serverOrigin = () => '';

export function TreadSelector({ initial = DEFAULT_TREAD, reset = false }: { initial?: TreadSelection; reset?: boolean }) {
  const id = useId();
  const [wood, setWood] = useState(initial.wood);
  const [thickness, setThickness] = useState(initial.thickness);
  const [quantity, setQuantity] = useState(String(initial.quantity));
  const [note, setNote] = useState('');
  const [topView, setTopView] = useState(false);
  const [copyState, setCopyState] = useState('');
  const origin = useSyncExternalStore(subscribe, originSnapshot, serverOrigin);
  const parsed = treadSelectionSchema.safeParse({ wood, thickness, quantity: quantity.trim() === '' ? NaN : Number(quantity) });
  const selection: TreadSelection = { wood, thickness, quantity: parsed.success ? parsed.data.quantity : 1 };
  const price = treadPrice(selection);
  const selectedWood = TREAD_WOODS.find(w => w.id === wood)!;
  const share = `${origin}${treadUrl(selection)}`;
  async function copyLink() {
    if (!parsed.success) return;
    try { await navigator.clipboard.writeText(share); setCopyState('Link izbora je kopiran.'); }
    catch { setCopyState('Kopirajte adresu ispod.'); }
  }
  return (
    <div className={styles.selector} data-testid="tread-selector">
      <figure className={styles.preview}>
        <div className={styles.previewTop}><span>{selectedWood.label} · Nauljeno</span><span>100 × 30 cm</span></div>
        <div className={styles.stage}><TreadPreview selection={selection} topView={topView} /></div>
        <div className={styles.views} role="group" aria-label="Pogled na gazište">
          <button type="button" aria-pressed={!topView} onClick={() => setTopView(false)}>Prostorni pogled</button>
          <button type="button" aria-pressed={topView} onClick={() => setTopView(true)}>Odozgo</button>
        </div>
        <figcaption>Vizuelni prikaz drveta. Svako gazište ima vlastite šare i nijanse.</figcaption>
      </figure>
      <div className={styles.controls}>
        {reset && <p className="note" role="status">Link sadrži nevažeći izbor. Prikazane su početne opcije.</p>}
        <fieldset className={styles.fieldset}>
          <legend>01 / Izaberite drvo</legend>
          <div className={styles.woods}>
            {TREAD_WOODS.map(w => (
              <label key={w.id} className={styles.wood} data-selected={wood === w.id}>
                <input type="radio" name={`${id}-wood`} value={w.id} checked={wood === w.id} onChange={() => { setWood(w.id); setCopyState(''); }} aria-label={w.label} />
                <span className={styles.swatch} style={{ backgroundColor: w.color }} aria-hidden="true" />
                <span>{w.label}</span><span className={styles.check} aria-hidden="true">{wood === w.id ? '✓' : ''}</span>
              </label>
            ))}
          </div>
          <p className={styles.woodNote} aria-live="polite">{selectedWood.description}</p>
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend>02 / Izaberite debljinu</legend>
          <div className={styles.thicknesses}>
            {TREAD_CATALOG.variants.map(v => (
              <label key={v.thicknessMm} className={styles.thickness} data-selected={thickness === v.thicknessMm}>
                <input type="radio" name={`${id}-thickness`} value={v.thicknessMm} checked={thickness === v.thicknessMm} onChange={() => { setThickness(v.thicknessMm); setCopyState(''); }} aria-label={`${v.thicknessMm / 10} cm`} />
                <span>{v.thicknessMm / 10} cm</span><small>{formatKm(v.priceFening)}</small>
              </label>
            ))}
          </div>
          <p className={styles.woodNote}>Cijena po komadu · uljena završna obrada uključena.</p>
        </fieldset>
        <div className={styles.quantityRow}>
          <label htmlFor={`${id}-quantity`}>03 / Broj gazišta</label>
          <div className={styles.quantity}>
            <button type="button" aria-label="Smanjite količinu" disabled={!parsed.success || parsed.data.quantity <= TREAD_CATALOG.quantityRange[0]} onClick={() => setQuantity(String(selection.quantity - 1))}>−</button>
            <input id={`${id}-quantity`} type="number" inputMode="numeric" min={TREAD_CATALOG.quantityRange[0]} max={TREAD_CATALOG.quantityRange[1]} step="1" value={quantity} onChange={e => { setQuantity(e.target.value); setCopyState(''); }} aria-invalid={!parsed.success} aria-describedby={!parsed.success ? `${id}-error` : undefined} />
            <button type="button" aria-label="Povećajte količinu" disabled={!parsed.success || parsed.data.quantity >= TREAD_CATALOG.quantityRange[1]} onClick={() => setQuantity(String(selection.quantity + 1))}>+</button>
          </div>
        </div>
        {!parsed.success && <p id={`${id}-error`} role="alert" className={styles.error}>Upišite cijeli broj od {TREAD_CATALOG.quantityRange[0]} do {TREAD_CATALOG.quantityRange[1]}.</p>}
        <div className={styles.summary} aria-live="polite" aria-atomic="true" data-testid="tread-price">
          <span>Iznos gazišta<small>{parsed.success ? `${selection.quantity} kom. × ${formatKm(price.unit)}` : 'Provjerite količinu'}</small></span>
          <strong>{parsed.success ? formatKm(price.total) : '—'}</strong>
        </div>
        <details className={styles.note}>
          <summary>Druge mjere ili poseban zahtjev?</summary>
          <p>Obračun vrijedi za 100 × 30 cm. Za druge dimenzije upišite mjere; cijenu potvrđujemo zasebno.</p>
          <label htmlFor={`${id}-note`}>Napomena za radionicu</label>
          <textarea id={`${id}-note`} maxLength={500} rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Npr. druga širina, broj komada ili pitanje o izradi…" />
        </details>
        {parsed.success ? (
          <a href={whatsappLink(treadMessage(selection, origin, note))} target="_blank" rel="noopener" className={`btn ${styles.submit}`}><WhatsAppIcon className="btn__wa" /> Pošaljite izbor na WhatsApp <span aria-hidden="true">↗</span></a>
        ) : <button type="button" disabled className={`btn ${styles.submit}`}>Pošaljite izbor na WhatsApp</button>}
        <p className={styles.terms}>Šaljete upit za narudžbu. Rok, dostavu i mogućnost izrade potvrđujemo u razgovoru.</p>
        <button type="button" className={styles.share} disabled={!parsed.success} onClick={copyLink}>Kopirajte link izbora ↗</button>
        {copyState && <div className={styles.copyResult}><p role="status">{copyState}</p><input aria-label="Link vašeg izbora" value={share} readOnly onFocus={e => e.target.select()} /></div>}
      </div>
    </div>
  );
}
