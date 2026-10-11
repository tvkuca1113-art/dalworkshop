import Image from 'next/image';
import Link from 'next/link';
import { HeroMedia } from '@/components/home/HeroMedia';
import { EdgeComparison } from '@/components/home/EdgeComparison';
import { Faq } from '@/components/home/Faq';
import { HomeContact } from '@/components/home/HomeContact';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import { WORKS } from '@/lib/catalog/works';
import { TREAD_CATALOG, TREAD_WOODS } from '@/lib/catalog/treads';
import { DEFAULT_TREAD, treadUrl } from '@/lib/config/tread';
import { formatKm } from '@/lib/config/units';
import { ROUND_INSPIRATION_TABLE } from '@/lib/config/defaults';
import { encodeTable } from '@/lib/config/url';
import styles from './home.module.css';

export const metadata = {
  alternates: { canonical: '/' },
};

const STEPS = [
  { title: 'Izaberite što vam se sviđa', text: 'Pogledajte svoj stol u 3D. Oblik, drvo i mjere birate vi; uz „Nisam siguran“ tražite naš prijedlog.' },
  { title: 'Pošaljite izbor ili inspiraciju', text: 'Pripremite upit s mjerama i linkom. Dodajte fotografiju stola ili postolja koje vam se sviđa.' },
  { title: 'Dogovorimo detalje', text: 'Radionica provjerava mogućnost izrade i šalje ponudu za vašu konfiguraciju.' },
  { title: 'Izrađujemo za vas', text: 'Ručna izrada od masivnog drveta, preuzimanje ili dostava prema dogovoru.' },
];

const FAQ = [
  {
    q: 'Zašto se moj komad razlikuje od prikaza?',
    a: (
      <p>
        Masivno drvo ima svoje šare, čvoriće i nijanse. 3D prikaz i fotografije pokazuju karakter materijala, ali svaka ploča je
        jedinstvena. Konačni izgled zavisi od komada drveta koji radionica izabere za vaš proizvod.
      </p>
    ),
  },
  {
    q: 'Kako da izaberem dimenzije?',
    a: (
      <>
        <p>
          Za stol je korisno izmjeriti prostor i ostaviti mjesta za izvlačenje stolica. Orijentaciono se računa oko 60 cm dužine po
          osobi; uobičajena visina blagovaoničkog stola je 72–78 cm.
        </p>
        <p>Za dasku razmislite o namjeni: za svakodnevno rezanje deblja i veća ploha, za serviranje lakša daska ili ručke.</p>
      </>
    ),
  },
  {
    q: 'Kako se dogovaraju cijena i rok?',
    a: (
      <p>
        Stolovi nemaju fiksnu cijenu na webu jer zavise od drveta, dimenzija i postolja. Pošaljite konfiguraciju, a radionica
        odgovara ponudom s cijenom i rokom. Objavljene cijene dasaka standardnih dimenzija navedene su na stranici{' '}
        <Link href="/daske" className="text-link">
          Daske
        </Link>{' '}
        uz napomenu da se potvrđuju uz ponudu.
      </p>
    ),
  },
  {
    q: 'Kako se održava drveni stol ili daska?',
    a: (
      <p>
        Daske perite ručno blagom vodom i odmah osušite; ne ostavljajte ih u vodi i ne stavljajte u mašinu za suđe. Praktične upute
        su na stranici{' '}
        <Link href="/odrzavanje" className="text-link">
          Održavanje
        </Link>
        ; njegu prilagodite završnoj obradi koju radionica potvrdi.
      </p>
    ),
  },
  {
    q: 'Mogu li poslati poseban zahtjev?',
    a: (
      <p>
        Da. U konfigurator dodajte fotografiju nogu, stola ili svog prostora. Za izbor koji još niste odlučili označite „Nisam siguran“. Tu je i polje „Poseban zahtjev“. Možete pisati direktno na
        WhatsApp {BRAND.phonePrimary} ili e-mail {BRAND.email}.
      </p>
    ),
  },
  {
    q: 'Gdje ste i kako ide isporuka?',
    a: <p>DAL Workshop radi u Mostaru. Preuzimanje i dostava dogovaraju se pojedinačno uz ponudu.</p>,
  },
];

export default function HomePage() {
  const table = WORKS[0]!;
  const roundTableHref = `/konfigurator/stol?${encodeTable(ROUND_INSPIRATION_TABLE)}`;
  return (
    <div className={styles.home}>
      <HeroMedia>
        <div className={`wrap ${styles.heroText}`}>
          <p className="eyebrow">Ručno izrađeno u Mostaru</p>
          <h1 id="hero-title" className={styles.h1}>Stol koji pripada vašem prostoru.</h1>
          <p className={styles.heroLead}>Masivno drvo. Vaše mjere.<br />Mjesto za vašu svakodnevicu.</p>
          <div className={styles.ctas}>
            <Link href="/konfigurator/stol" className={`btn ${styles.heroPrimary}`}>Kreirajte svoj stol <span aria-hidden="true">↗</span></Link>
            <Link href="/daske" className={styles.heroLink}>Pogledajte daske <span aria-hidden="true">↗</span></Link>
          </div>
          <p className={styles.heroNote}>150 × 70 cm · Prilagodite svom prostoru.</p>
        </div>
        <a href="#izbor" className={styles.heroExplore}>Stolovi · Daske · Gazišta od masivnog drveta</a>
      </HeroMedia>
      <div className={styles.story}>
      <div className={styles.promise}>
        <div className={`wrap ${styles.promiseInner}`}>
          <span>Masivno drvo · Ručna izrada</span><span>Vaše mjere, vaš komad</span><a href="#kontakt">Imate pitanje? Razgovarajmo ↗</a>
        </div>
      </div>

      <section className={`section ${styles.choiceSection}`} aria-labelledby="izbor">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow"><span className={styles.chapter}>01 /</span> Za vaš dom</p>
            <h2 id="izbor">Komadi koji ostaju dio svakodnevice.</h2>
          </div>
          <div className={styles.choice}>
            <article className={styles.choiceItem}>
              <Link href={roundTableHref} className={styles.choiceMedia} aria-label="Okrugli stol po vašoj mjeri — otvori konfigurator">
                <Image src="/images/dal-stol-round.webp" alt="Mali okrugli stol od oraha s jednim centralnim metalnim postoljem — vizuelni prijedlog po mjeri" fill sizes="(min-width: 900px) 56vw, 100vw" className={styles.cover} />
              </Link>
              <div className={styles.choiceText}>
                <h3>Stol po vašoj mjeri</h3>
                <p>Okrugli za manje prostore ili izdužen za velika okupljanja. Počnite oblikom, a drvo, mjere i detalje prilagodite sebi.</p>
                <p className={styles.inspirationNote}>Vizuelni prijedlog · mogućnost izrade potvrđujemo uz ponudu.</p>
                <Link href={roundTableHref} className={styles.editorialLink}>
                  Kreirajte svoj stol <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
            <article className={styles.choiceItem}>
              <Link href="/konfigurator/daska" className={styles.choiceMedia} aria-label="Daska za svaki dan — otvori konfigurator">
                <Image
                  src="/images/dal-daska-ambijent.webp"
                  alt="Daska od javora i bukve s utorima na kuhinjskoj ploči (ilustracija ambijenta)"
                  fill
                  sizes="(min-width: 900px) 46vw, 100vw"
                  className={styles.cover}
                />
              </Link>
              <div className={styles.choiceText}>
                <h3>Daska za svaki dan</h3>
                <p>Daske za rezanje i serviranje od uzdužnih traka drveta, s utorima, ručkama ili personalizacijom po dogovoru.</p>
                <Link href="/konfigurator/daska" className={styles.editorialLink}>
                  Kreirajte svoju dasku <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.craftSection} aria-labelledby="karakter-drveta">
        <div className={styles.craftScene}>
          <Image src="/images/dal-detalj-hrasta.webp" alt="Detalj vlakana i obrađene ivice hrastove ploče — ilustracija karaktera drveta" fill sizes="100vw" className={styles.cover} />
          <div className={styles.craftShade} />
          <div className={`wrap ${styles.craftCopy}`}>
            <p className="eyebrow">Masivno drvo. Blisko pod rukom.</p>
            <h2 id="karakter-drveta">Vidite godove.<br />Osjetite karakter.</h2>
            <p>Toplina ploče. Linija ivice. Šara koja se ne ponavlja. Od tih detalja gradimo komad koji ćete koristiti svaki dan.</p>
            <Link href="/konfigurator/stol" className="btn btn--light">Pronađite svoj karakter drveta <span aria-hidden="true">↗</span></Link>
            <small>Ilustracija materijala · svaki komad drveta ima svoje šare.</small>
          </div>
        </div>
      </section>

      <section className={`section ${styles.treadsSection}`} aria-labelledby="gazista-title">
        <div className={`wrap ${styles.treadsStory}`}>
          <Link href="/gazista" className={styles.treadsPhoto} aria-label="Pogledajte gazišta od masivnog drveta">
            <Image src={TREAD_CATALOG.inspirationImage} alt="Drvena gazišta koja unose toplinu u stepenice — vizualizacija ambijenta" fill sizes="(min-width: 900px) 55vw, 100vw" className={styles.cover} />
            <span>Vizualizacija ambijenta</span>
          </Link>
          <div className={styles.treadsCopy}>
            <p className="eyebrow"><span className={styles.chapter}>02 /</span> I za vaše stepenice</p>
            <h2 id="gazista-title">Toplina doma.<br />U svakom koraku.</h2>
            <p>Gazišta od masivnog drveta, nauljena i spremna za vaš izbor. Hrast, jasen ili javor — povežite stepenice s ostatkom prostora.</p>
            <p className={styles.treadPrice}>Od {formatKm(TREAD_CATALOG.variants[0].priceFening)} <span>po komadu · 100 × 30 cm</span></p>
            <div className={styles.treadWoods} aria-label="Izaberite drvo za gazišta">
              {TREAD_WOODS.map(w => <Link key={w.id} href={treadUrl({ ...DEFAULT_TREAD, wood: w.id })}><span style={{ backgroundColor: w.color }} aria-hidden="true" />{w.label} ↗</Link>)}
            </div>
            <Link href="/gazista#izbor-gazista" className={styles.editorialLink}>Prilagodite svoja gazišta <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className={`section ${styles.materialSection}`} aria-labelledby="materijal">
        <div className="wrap">
          <div className={styles.materialIntro}>
            <div className={styles.materialText}>
            <p className="eyebrow"><span className={styles.chapter}>03 /</span> Materijal i detalj</p>
            <h2 id="materijal">Ljepota je u detaljima.</h2>
            </div>
            <p className="lead">
              Odaberite ivicu i pogledajte kako se mijenja cijela ploča — s prednje, bočne i zadnje strane. Približite detalj koji ćete svaki dan osjetiti pod rukom.
            </p>
          </div>
          <EdgeComparison />
        </div>
      </section>

      <section className={`section ${styles.processSection}`} aria-labelledby="proces">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow"><span className={styles.chapter}>04 /</span> Kako nastaje vaš komad</p>
            <h2 id="proces">Vaša ideja. Naša izrada.</h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`section ${styles.worksSection}`} aria-labelledby="proizvodi">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow"><span className={styles.chapter}>05 /</span> Iz radionice</p>
            <h2 id="proizvodi">Upoznajte naše radove.</h2>
            <p className="lead">Hrastov stol i daske iz naše radionice. Pogledajte izradu, površine i detalje na originalnim fotografijama.</p>
          </div>
          <div className={styles.works}>
            <article className={styles.workFeature}>
              <div className={styles.workPhotos}>
                {table.photos.map((ph, i) => (
                  <div key={ph.src} className={i === 0 ? styles.workMain : styles.workThumb}>
                    <Image src={ph.src} alt={ph.alt} fill sizes={i === 0 ? '(min-width: 900px) 34vw, 100vw' : '(min-width: 900px) 17vw, 50vw'} className={styles.cover} />
                  </div>
                ))}
              </div>
              <div className={styles.workText}>
                <h3>{table.title}</h3>
                <ul>
                  {table.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="note">Hrastova ploča 150 × 70 cm, debljine 3,5 cm.</p>
                <Link href="/konfigurator/stol" className="text-link">
                  Kreirajte svoju varijantu
                </Link>
              </div>
            </article>
            {WORKS.slice(1).map((w) => (
              <article key={w.id} className={styles.workCard}>
                <div className={styles.workCardImg}>
                  <Image src={w.photos[0]!.src} alt={w.photos[0]!.alt} fill sizes="(min-width: 900px) 30vw, 100vw" className={styles.cover} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.facts.join(' · ')}</p>
              </article>
            ))}
          </div>
          <p className={styles.more}>
            <Link href="/radovi" className="btn btn--ghost">
              Svi radovi
            </Link>
          </p>
        </div>
      </section>

      <HomeContact />

      <section className="section" aria-labelledby="pitanja">
        <div className={`wrap ${styles.faq}`}>
          <div className="section-head">
            <p className="eyebrow">Pitanja</p>
            <h2 id="pitanja">Dobro je znati.</h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>
      </div>

      <section className={`section on-dark ${styles.closing}`} aria-labelledby="ideja">
        <div className={`wrap ${styles.final}`}>
          <p className="eyebrow">Od ideje do vašeg doma</p>
          <h2 id="ideja">Napravimo prostor za vaše priče.</h2>
          <div className={styles.finalCtas}>
            <Link href="/konfigurator/stol" className="btn btn--light">
              Kreirajte svoj stol
            </Link>
            <Link href="/konfigurator/daska" className="btn btn--ghost-light">
              Kreirajte svoju dasku
            </Link>
            <a href={whatsappLink()} className="btn btn--ghost-light" target="_blank" rel="noopener">
              <WhatsAppIcon className="btn__wa" /> Zatražite ponudu na WhatsApp
            </a>
          </div>
          <p className="note">
            Telefon i WhatsApp {BRAND.phonePrimary} · {BRAND.email} · Instagram {BRAND.instagramHandle}
          </p>
        </div>
      </section>
    </div>
  );
}
