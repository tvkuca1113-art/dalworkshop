import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BOARD_GROOVES,
  BOARD_HANDLES,
  BOARD_MODELS,
  BOARD_RANGES,
  PERSONALIZATION,
  PUBLISHED_BOARD_PRICES,
} from '@/lib/catalog/board';
import { AVAILABILITY_LABEL } from '@/lib/catalog/status';
import { WORKS } from '@/lib/catalog/works';
import { formatCm, formatKm } from '@/lib/config/units';
import { visibleConstructions } from '@/lib/config/rules';
import { whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: 'Daske za rezanje i serviranje',
  description: 'Daske za rezanje i serviranje od masivnog drveta iz Mostara: javor i bukva, crne metalne ručke, kombinacije drveta. Konfigurišite dasku u 3D.',
  alternates: { canonical: '/daske' },
};

function Status({ s }: { s: keyof typeof AVAILABILITY_LABEL }) {
  return <span className={`status status--${s}`}>{AVAILABILITY_LABEL[s]}</span>;
}

export default function BoardsPage() {
  const boards = WORKS.filter((w) => w.category === 'daska');
  const reviewed = new Date(PUBLISHED_BOARD_PRICES.reviewedOn).toLocaleDateString('bs-BA', { timeZone: 'UTC' });
  return (
    <>
      <section className="wrap page-hero">
        <p className="eyebrow">Daske za rezanje i serviranje</p>
        <h1>Daska za svaki dan — od rezanja do serviranja.</h1>
        <p className="lead">
          Uzdužne trake masivnog drveta, utori za sokove, ručke za nošenje. Izaberite polazni model, dimenzije i detalje, a
          personalizaciju dogovaramo uz ponudu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/konfigurator/daska" className="btn">
            Kreirajte svoju dasku
          </Link>
          <a href={whatsappLink()} className="btn btn--ghost" target="_blank" rel="noopener">
            <WhatsAppIcon className="btn__wa" /> Zatražite ponudu
          </a>
        </div>
      </section>

      <section className="section section--stone" aria-labelledby="primjeri">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Stvarni primjeri</p>
            <h2 id="primjeri">Daske iz objava radionice</h2>
          </div>
          <div className={styles.cards}>
            {boards.map((w) => (
              <article key={w.id} className={styles.card}>
                <div className={styles.cardImg}>
                  <Image src={w.photos[0]!.src} alt={w.photos[0]!.alt} fill sizes="(min-width: 900px) 30vw, 100vw" className={styles.cover} />
                </div>
                <h3>{w.title}</h3>
                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                  {w.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {w.note && <p className="note">{w.note}</p>}
                <a href={w.source} className="text-link" target="_blank" rel="noopener">
                  Objava na Instagramu
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cijene">
        <div className={`wrap ${styles.split}`}>
          <div className={styles.priceBox}>
            <h2 id="cijene">Objavljene cijene standardnih dimenzija</h2>
            <ul className={styles.priceList}>
              {PUBLISHED_BOARD_PRICES.prices.map((p) => (
                <li key={p.lengthMm}>
                  <span>
                    {formatCm(p.lengthMm)} × {formatCm(p.widthMm)} cm
                  </span>
                  <span>{formatKm(p.fening)}</span>
                </li>
              ))}
            </ul>
            <p className="note">
              Izvor:{' '}
              <a href={PUBLISHED_BOARD_PRICES.source} className="text-link" target="_blank" rel="noopener">
                objava cjenovnika na Instagramu
              </a>
              , pregledano {reviewed}. Objava ne navodi debljinu, tačnu varijantu ni dodatke (ručke, utore, graviranje), pa ove cijene
              ne primjenjujemo automatski u konfiguratoru. Varijantu i cijenu radionica potvrđuje uz ponudu.
            </p>
          </div>
          <div className={styles.stack}>
            <p className="eyebrow">Opcije u konfiguratoru</p>
            <h2>Šta možete izabrati</h2>
            <div className={styles.optionGroup}>
              <h3>Polazni model</h3>
              <ul>
                {BOARD_MODELS.map((m) => (
                  <li key={m.id}>
                    <strong>{m.label}</strong>
                    <Status s={m.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.optionGroup}>
              <h3>Drvo</h3>
              <ul>
                {visibleConstructions().map((c) => (
                  <li key={c.id}>
                    <strong>{c.label}</strong>
                    <Status s={c.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.optionGroup}>
              <h3>Utori i ručke</h3>
              <ul>
                {[...BOARD_GROOVES.filter((g) => g.id !== 'none'), ...BOARD_HANDLES.filter((h) => h.id !== 'none')].map((o) => (
                  <li key={o.id}>
                    <strong>{o.label}</strong>
                    <Status s={o.status} />
                  </li>
                ))}
                <li>
                  <strong>{PERSONALIZATION.title}</strong>
                  <Status s={PERSONALIZATION.availability} />
                </li>
              </ul>
            </div>
            <p className="note">
              Razvojni rasponi: dužina {formatCm(BOARD_RANGES.length[0])}–{formatCm(BOARD_RANGES.length[1])} cm, širina{' '}
              {formatCm(BOARD_RANGES.width[0])}–{formatCm(BOARD_RANGES.width[1])} cm, debljina {formatCm(BOARD_RANGES.thickness[0])}–
              {formatCm(BOARD_RANGES.thickness[1])} cm. Nisu katalog radionice.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/konfigurator/daska" className="btn">
                Kreirajte svoju dasku
              </Link>
              <Link href="/odrzavanje" className="btn btn--ghost">
                Kako održavati dasku
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
