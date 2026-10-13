import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { OBSERVED_TABLE, TABLE_BASES, TABLE_EDGES, TABLE_SHAPES, TABLE_WOODS, TABLE_RANGES } from '@/lib/catalog/table';
import { AVAILABILITY_LABEL } from '@/lib/catalog/status';
import { WORKS } from '@/lib/catalog/works';
import { formatCm } from '@/lib/config/units';
import { ProductIntro } from '@/components/site/ProductIntro';
import { ServiceJsonLd } from '@/components/site/ServiceJsonLd';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: 'Izrada stolova po mjeri u Mostaru',
  description: 'DAL Workshop: izrada stolova po mjeri u Mostaru od masivnog drveta. Izaberite oblik, dimenzije i postolje u 3D konfiguratoru i zatražite ponudu radionice.',
  alternates: { canonical: '/stolovi' },
};

function Status({ s }: { s: keyof typeof AVAILABILITY_LABEL }) {
  return <span className={`status status--${s}`}>{AVAILABILITY_LABEL[s]}</span>;
}

export default function TablesPage() {
  const table = WORKS[0]!;
  const r = TABLE_RANGES;
  return (
    <>
      <ServiceJsonLd name="Izrada stolova po mjeri u Mostaru" description="Ručna izrada stolova od masivnog drveta po mjeri, uz izbor dimenzija, oblika, ivice i postolja te dogovor s radionicom u Mostaru." path="/stolovi" />
      <ProductIntro eyebrow="Masivno drvo · Ručna izrada" title="Stolovi po mjeri iz Mostara." image="/images/dal-hero-desktop.webp" alt="Hrastov stol s crnim metalnim postoljem u toploj blagovaonici — vizualizacija ambijenta" href="/konfigurator/stol" action="Kreirajte svoj stol">
        <p>U DAL Workshop radionici u Mostaru izrađujemo stolove od masivnog drveta po vašoj mjeri. Izaberite oblik, drvo, dimenzije i postolje — za jutarnju kafu, zajednički ručak i razgovore koji potraju.</p>
      </ProductIntro>

      <section className="section section--stone" aria-labelledby="primjer">
        <div className={`wrap ${styles.split}`}>
          <div className={styles.gallery}>
            {table.photos.map((p, i) => (
              <div key={p.src} className={i === 0 ? styles.galleryMain : styles.galleryThumb}>
                <Image src={p.src} alt={p.alt} fill sizes={i === 0 ? '(min-width: 900px) 36vw, 66vw' : '(min-width: 900px) 18vw, 33vw'} className={styles.cover} />
              </div>
            ))}
          </div>
          <div className={styles.stack}>
            <p className="eyebrow">Iz naše radionice</p>
            <h2 id="primjer">{OBSERVED_TABLE.title}</h2>
            <table className="spec-table">
              <tbody>
                <tr>
                  <th scope="row">Drvo</th>
                  <td>Hrast</td>
                </tr>
                <tr>
                  <th scope="row">Ploča</th>
                  <td className="tabular">150 × 70 cm, debljina 3,5 cm</td>
                </tr>
                <tr>
                  <th scope="row">Postolje</th>
                  <td>Dva crna metalna okvira blago trapeznog oblika</td>
                </tr>
              </tbody>
            </table>
            <Link href="/konfigurator/stol" className="btn">Prilagodite ovaj stol</Link>
            <p className="note">
              Izvor:{' '}
              <a href={OBSERVED_TABLE.source} className="text-link" target="_blank" rel="noopener">
                DAL objava na Instagramu
              </a>
              . Tri fotografije prikazuju isti stol iz različitih uglova.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="opcije">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Šta možete podesiti</p>
            <h2 id="opcije">Oblikujte ga po svom</h2>
            <p className="lead">
              Počnite od oblika ploče, zatim izaberite drvo, ivicu i postolje. U 3D prikazu pratite svoj izbor; mogućnost izrade potvrđujemo uz ponudu.
            </p>
          </div>
          <div className={styles.options}>
            <div className={styles.optionGroup}>
              <h3>Oblik</h3>
              <ul>
                {TABLE_SHAPES.map((s) => (
                  <li key={s.id}>
                    <strong>{s.label}</strong>
                    <Status s={s.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.optionGroup}>
              <h3>Drvo</h3>
              <ul>
                {TABLE_WOODS.map((s) => (
                  <li key={s.id}>
                    <strong>{s.label}</strong>
                    <Status s={s.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.optionGroup}>
              <h3>Ivica</h3>
              <ul>
                {TABLE_EDGES.map((s) => (
                  <li key={s.id}>
                    <strong>{s.label}</strong>
                    <Status s={s.status} />
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.optionGroup}>
              <h3>Postolje</h3>
              <ul>
                {TABLE_BASES.map((s) => (
                  <li key={s.id}>
                    <strong>{s.label}</strong>
                    <Status s={s.status} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="note" style={{ marginTop: '2rem', maxWidth: '44rem' }}>
            Prijedlozi dimenzija: pravougaoni {formatCm(r.length.rectangle[0])}–{formatCm(r.length.rectangle[1])} ×{' '}
            {formatCm(r.width.rectangle[0])}–{formatCm(r.width.rectangle[1])} cm, okrugli promjer {formatCm(r.diameter[0])}–
            {formatCm(r.diameter[1])} cm, ploča {formatCm(r.topThickness[0])}–{formatCm(r.topThickness[1])} cm, visina{' '}
            {formatCm(r.totalHeight[0])}–{formatCm(r.totalHeight[1])} cm. Trebate drugu mjeru? Dodajte je u poseban zahtjev. Izradu i cijenu potvrđujemo uz ponudu.
          </p>
          <div className={styles.ctaRow} style={{ marginTop: '1.5rem' }}>
            <Link href="/konfigurator/stol" className="btn">
              Kreirajte svoj stol
            </Link>
          </div>
        </div>
      </section>
      <section className="section section--stone" aria-labelledby="izrada-mostar">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Od mjere do ponude</p>
            <h2 id="izrada-mostar">Kako naručiti stol po mjeri u Mostaru?</h2>
            <p className="lead">Pošaljite izbor iz konfiguratora ili fotografiju stola koji vam se sviđa. Mjere i detalje dogovarate direktno s DAL Workshop radionicom.</p>
          </div>
          <div className={styles.options}>
            <div><h3>Koje mjere trebam poslati?</h3><p>Navedite dužinu i širinu ploče ili promjer okruglog stola. Ako niste sigurni, opišite prostor i broj mjesta; u konfiguratoru možete zatražiti naš prijedlog.</p></div>
            <div><h3>Koliko košta izrada stola?</h3><p>Cijena zavisi od dimenzija, drveta, ploče i postolja. Radionica provjerava vaš izbor i priprema ponudu prije dogovora o izradi.</p></div>
            <div><h3>Kako dogovaramo preuzimanje?</h3><p>Radionica je u Mostaru. Rok izrade, mogućnost preuzimanja i dostavu dogovaramo pojedinačno, uz vašu ponudu.</p></div>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/radovi" className="text-link">Pogledajte stolove i daske iz radionice ↗</Link>
            <Link href="/kontakt" className="text-link">Kontaktirajte DAL Workshop u Mostaru ↗</Link>
          </div>
        </div>
      </section>
    </>
  );
}
