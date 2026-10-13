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
import { ProductIntro } from '@/components/site/ProductIntro';
import { ServiceJsonLd } from '@/components/site/ServiceJsonLd';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: 'Drvene daske za rezanje i serviranje — Mostar',
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
      <ServiceJsonLd name="Izrada drvenih dasaka za rezanje i serviranje u Mostaru" description="Daske od masivnog drveta po dimenzijama i detaljima dogovorenim s DAL Workshop radionicom u Mostaru." path="/daske" />
      <ProductIntro eyebrow="Ručna izrada u Mostaru" title="Drvene daske za rezanje i serviranje." image="/images/dal-daska-ambijent.webp" alt="Daska od javora i bukve na kamenoj kuhinjskoj ploči — vizualizacija ambijenta" href="/konfigurator/daska" action="Kreirajte svoju dasku">
        <p>Daske od masivnog drveta iz DAL Workshop radionice u Mostaru, za male svakodnevne rituale. Izaberite model i dimenzije, dodajte detalje za lakše korištenje ili predložite personalizaciju za poseban poklon.</p>
      </ProductIntro>

      <section className="section section--stone" aria-labelledby="primjeri">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Iz naše radionice</p>
            <h2 id="primjeri">Tri ideje za vašu kuhinju.</h2>
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
                <Link href="/konfigurator/daska" className="text-link">Prilagodite svoju dasku</Link>
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
              , pregledano {reviewed}. Referentne cijene iz objave; cijenu vašeg modela, debljine i dodataka potvrđujemo uz ponudu.
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
              Prijedlozi dimenzija: dužina {formatCm(BOARD_RANGES.length[0])}–{formatCm(BOARD_RANGES.length[1])} cm, širina{' '}
              {formatCm(BOARD_RANGES.width[0])}–{formatCm(BOARD_RANGES.width[1])} cm, debljina {formatCm(BOARD_RANGES.thickness[0])}–
              {formatCm(BOARD_RANGES.thickness[1])} cm. Druga mjera ili poseban detalj? Opišite želju na kraju konfiguratora.
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
