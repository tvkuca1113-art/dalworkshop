import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../content.module.css';

export const metadata: Metadata = {
  title: 'Održavanje drvenih proizvoda',
  description: 'Praktične upute za njegu drvenih dasaka za rezanje i stolova od masivnog drveta: pranje, sušenje, ulje i čuvanje.',
  alternates: { canonical: '/odrzavanje' },
};

export default function CarePage() {
  return (
    <>
      <section className="wrap page-hero">
        <p className="eyebrow">Održavanje</p>
        <h1>Kako da drvo dugo ostane lijepo</h1>
        <p className="lead">
          Kratke, praktične upute. To su opći savjeti za masivno drvo, ne garancija za konkretan proizvod — njegu uvijek prilagodite
          završnoj obradi koju radionica potvrdi za vaš komad.
        </p>
      </section>
      <section className="wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <div className={styles.split}>
          <div className="prose">
            <h2>Daske za rezanje i serviranje</h2>
            <ul>
              <li>Nakon upotrebe operite dasku ručno toplom vodom i blagim deterdžentom, s obje strane.</li>
              <li>Isperite i odmah obrišite; ostavite je da se osuši uspravno, da zrak dopire do obje strane.</li>
              <li>Ne ostavljajte dasku da stoji u vodi i ne stavljajte je u mašinu za suđe — lijepljene daske od traka mogu se izviti ili pucati.</li>
              <li>Ne sušite je na grijaču, šporetu ili na direktnom suncu.</li>
              <li>Za sirovo meso je korisno imati zasebnu dasku ili je odmah temeljito oprati.</li>
              <li>Kad drvo djeluje suho ili posvijetli, nanesite tanak sloj ulja za drvo koje je pogodno za kontakt s hranom, ostavite da upije, pa višak obrišite. Biljna ulja iz kuhinje mogu užegnuti.</li>
              <li>Mrlje i mirise možete ublažiti krupnom solju i limunom, zatim dasku isperite i osušite.</li>
            </ul>
            <p className="note">
              DAL je u objavama naveo da su daske premazane uljem i voskom pogodnim za hranu, odnosno mineralnim uljem. Tačan proizvod
              za vašu dasku i preporučeni razmak između premaza potvrđuje radionica.
            </p>

            <h2>Stolovi od masivnog drveta</h2>
            <ul>
              <li>Prolivenu tečnost obrišite odmah; vlažna krpa, pa suha.</li>
              <li>Ispod vrućih posuda koristite podmetače; ne stavljajte vruće direktno na ploču.</li>
              <li>Izbjegavajte jaka sredstva za čišćenje, alkohol i abrazivne spužve.</li>
              <li>Drvo „radi“ s vlagom i temperaturom: držite stol dalje od radijatora i dugotrajnog direktnog sunca.</li>
              <li>Obnovu završne obrade (ulje, vosak ili lak) radite samo prema uputi radionice za premaz koji je na vašem stolu.</li>
            </ul>
            <p className="note">
              Vrsta premaza za stolove nije javno navedena; pitajte radionicu prije bilo kakve obnove površine.
            </p>
          </div>
          <aside className={styles.stack} aria-labelledby="izvori">
            <h2 id="izvori" style={{ fontSize: '1.6rem' }}>
              Izvori
            </h2>
            <ol className={styles.sources}>
              <li>
                <a className="text-link" href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/cutting-boards" target="_blank" rel="noopener">
                  USDA FSIS — Cutting Boards
                </a>{' '}
                (pranje toplom vodom s deterdžentom; lijepljene daske mogu pucati u mašini za suđe).
              </li>
              <li>
                <a className="text-link" href="https://robinson-center.mgcafe.uky.edu/cutting-board-care" target="_blank" rel="noopener">
                  University of Kentucky, Robinson Center — Cutting board care
                </a>{' '}
                (pranje, sušenje uspravno, ulje pogodno za hranu, uklanjanje mrlja).
              </li>
              <li>
                DAL objave:{' '}
                <a className="text-link" href="https://www.instagram.com/p/DQ4n6NAjKE4/" target="_blank" rel="noopener">
                  daska od javora i bukve
                </a>{' '}
                i{' '}
                <a className="text-link" href="https://www.instagram.com/p/DdYy3NSsTMl/" target="_blank" rel="noopener">
                  cjenovnik dasaka
                </a>{' '}
                (spominju ulje i vosak, odnosno mineralno ulje).
              </li>
            </ol>
            <p className="note">Pregledano 9. 10. 2026.</p>
            <p className="todo">
              Imate pitanje o svom komadu?{' '}
              <Link href="/kontakt" className="text-link">
                Pišite radionici
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
