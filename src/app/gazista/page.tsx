import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { TREAD_CATALOG } from '@/lib/catalog/treads';
import { readTreadSelection } from '@/lib/config/tread';
import { formatCm, formatKm } from '@/lib/config/units';
import { TreadSelector } from '@/components/treads/TreadSelector';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Gazišta od hrasta, jasena i javora',
  description: 'Nauljena gazišta 100 × 30 cm od hrasta, jasena ili javora. Debljine 4, 6 i 8 cm od 110 KM po komadu. Izaberite drvo, pogledajte gazište i pošaljite upit.',
  alternates: { canonical: '/gazista' },
};
export default async function TreadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { selection, reset } = readTreadSelection(await searchParams);
  return (
    <div className={styles.page}>
      <section className={`wrap ${styles.hero}`}>
        <div className={styles.copy}>
          <p className="eyebrow">Gazišta od masivnog drveta</p>
          <h1>Prirodna ljepota u svakom koraku.</h1>
          <p className="lead">Hrast, jasen ili javor. Izaberite drvo koje povezuje vaše stepenice s ostatkom doma — i debljinu koja odgovara vašem projektu.</p>
          <p className={styles.startPrice}>Od {formatKm(TREAD_CATALOG.variants[0].priceFening)} <span>po komadu · nauljeno</span></p>
          <a href="#izbor-gazista" className="btn">Izaberite svoja gazišta <span aria-hidden="true">↓</span></a>
        </div>
        <figure className={styles.photo}>
          <Image src={TREAD_CATALOG.inspirationImage} alt="Nauljena drvena gazišta na kontinuiranim stepenicama u toplom enterijeru — vizualizacija ambijenta" fill sizes="(min-width: 900px) 50vw, 100vw" loading="eager" />
          <figcaption>Vizualizacija ambijenta</figcaption>
        </figure>
      </section>
      <section className={`wrap ${styles.choose}`} aria-labelledby="izbor-gazista">
        <div className={styles.heading}>
          <div><p className="eyebrow">Vaše stepenice. Vaš izbor.</p><h2 id="izbor-gazista">Pogledajte drvo.<br />Izaberite detalje.</h2></div>
          <p>Standardna dimenzija {formatCm(TREAD_CATALOG.lengthMm)} × {formatCm(TREAD_CATALOG.depthMm)} cm. Promijenite drvo i pogledajte razliku u šarama i nijansi, zatim odaberite debljinu i broj komada.</p>
        </div>
        <TreadSelector key={JSON.stringify(selection)} initial={selection} reset={reset} />
      </section>
      <section className={`wrap ${styles.info}`} aria-labelledby="prije-upita">
        <h2 id="prije-upita">Sve jasno prije upita.</h2>
        <div className={styles.infoGrid}>
          <div><h3>Šta cijena obuhvata?</h3><p>Jedno nauljeno gazište dimenzije 100 × 30 cm, u odabranoj debljini. Cjenovnik je isti za hrast, jasen i javor. Iznos u izboru je cijena gazišta za upisani broj komada.</p></div>
          <div><h3>Imate drugačije mjere?</h3><p>U napomenu upišite dimenzije i broj gazišta. Radionica provjerava mogućnost izrade i priprema zasebnu ponudu. Rok i dostavu dogovaramo pojedinačno.</p></div>
          <div><h3>Kakvo će biti moje drvo?</h3><p>Prikaz pokazuje karakter vrste drveta. Stvarne šare, nijansa i raspored spojeva zavise od odabranog materijala. Za izgled i detalje izvedbe razgovarajte s radionicom.</p><Link href="/odrzavanje" className="text-link">Održavanje drveta ↗</Link></div>
        </div>
      </section>
    </div>
  );
}
