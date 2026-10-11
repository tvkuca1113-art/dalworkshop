import type { BoardConfig, TableConfig } from '@/lib/config/types';
import type { SpecLine } from '@/lib/config/summary';
import { GRAIN_NOTE, PRICE_QUOTE_COPY, statusText } from '@/lib/config/summary';
import { calculatePrice } from '@/lib/config/pricing';
import { formatKm } from '@/lib/config/units';
import { BRAND } from '@/lib/catalog/brand';
import { Plan2D, type EngravingDraw } from './Plan2D';
import styles from './PrintSheet.module.css';
import type { ReferenceImage } from './ReferenceUpload';
import { REFERENCE_KINDS } from '@/lib/catalog/references';

/** Printed specification (window.print → "Sačuvaj kao PDF"). */
export function PrintSheet({
  config,
  lines,
  snapshot,
  link,
  engravingDraw,
  references,
}: {
  config: TableConfig | BoardConfig;
  lines: readonly SpecLine[];
  snapshot: string | null;
  link: string;
  engravingDraw?: EngravingDraw | null;
  references?: readonly ReferenceImage[];
}) {
  const price = calculatePrice(config);
  return (
    <div className={`print-only ${styles.sheet}`} data-testid="print-sheet">
      <header className={styles.head}>
        <div>
          <p className={styles.brand}>{BRAND.name} · {BRAND.city}</p>
          <h2 className={styles.title}>Specifikacija upita</h2>
          <p className={styles.sub}>Upit za procjenu, nije narudžba. Datum: {new Date().toLocaleDateString('bs-BA')}</p>
        </div>
      </header>
      <div className={styles.visuals}>
        {snapshot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={snapshot} alt="3D prikaz izabrane konfiguracije" className={styles.snapshot} data-print-snapshot />
        )}
        <div className={styles.plan}>
          <Plan2D config={config} engraving={engravingDraw} />
        </div>
      </div>
      <table className={styles.table}>
        <tbody>
          {lines.map((l) => (
            <tr key={l.key}>
              <th scope="row">{l.label}</th>
              <td>
                {l.value}
                {l.status && <span className={styles.status}> — {statusText(l.status)}</span>}
                {l.note && <span className={styles.note}>{l.note}</span>}
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row">Cijena</th>
            <td>{price.status === 'priced' ? formatKm(price.fening) : PRICE_QUOTE_COPY}</td>
          </tr>
        </tbody>
      </table>
      {references && references.length > 0 && <section className={styles.references}>
        <h3>Fotografije inspiracije</h3>
        <div>{references.map((item) => <figure key={item.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={`Inspiracija: ${item.file.name}`} />
          <figcaption>{REFERENCE_KINDS.find((kind) => kind.id === item.kind)!.label} · {item.file.name}</figcaption>
        </figure>)}</div>
      </section>}
      <p className={styles.note}>{GRAIN_NOTE} Mogućnost izrade, cijenu i rok potvrđuje radionica uz ponudu.</p>
      <p className={styles.link}>Konfiguracija: {link}</p>
      <p className={styles.contact}>
        WhatsApp / telefon {BRAND.phonePrimary} · {BRAND.email} · Instagram {BRAND.instagramHandle}
      </p>
    </div>
  );
}
