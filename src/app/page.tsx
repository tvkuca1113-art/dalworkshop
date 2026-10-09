import Image from 'next/image';
import Link from 'next/link';
import { HeroMedia } from '@/components/home/HeroMedia';
import { EdgeComparison } from '@/components/home/EdgeComparison';
import { Faq } from '@/components/home/Faq';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import { WORKS } from '@/lib/catalog/works';
import styles from './home.module.css';

export const metadata = {
  alternates: { canonical: '/' },
};

const STEPS = [
  { title: 'Birate proizvod i detalje', text: 'U konfiguratoru podesite oblik, drvo, dimenzije i detalje te pogledajte rezultat u 3D.' },
  { title: 'Šaljete konfiguraciju', text: 'Jednim klikom pripremite poruku za WhatsApp sa svim mjerama i linkom na vaš izbor.' },
  { title: 'Dogovaramo izradu, cijenu i rok', text: 'Radionica provjerava mogućnost izrade i šalje ponudu za vašu konfiguraciju.' },
  { title: 'Izrada i dogovorena isporuka', text: 'Ručna izrada od masivnog drveta, preuzimanje ili dostava prema dogovoru.' },
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
        Da. Na kraju konfiguratora postoji polje „Poseban zahtjev“ za drugu mjeru, oblik ili ideju. Možete pisati i direktno na
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
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`wrap ${styles.heroText}`}>
          <p className="eyebrow">DAL Workshop · Mostar</p>
          <div className={styles.heroGrid}>
            <h1 id="hero-title" className={styles.h1}>
              Drvo s karakterom. Izrađeno po vašoj mjeri.
            </h1>
            <div className={styles.heroSide}>
              <p className="lead">Stolovi od masivnog drveta i daske za rezanje i serviranje, oblikovani prema vašim željama.</p>
              <div className={styles.ctas}>
                <Link href="/konfigurator/stol" className="btn">
                  Kreirajte svoj stol
                </Link>
                <Link href="/konfigurator/daska" className="btn btn--ghost">
                  Kreirajte svoju dasku
                </Link>
              </div>
              <ul className={styles.categories} aria-label="Kategorije">
                <li>
                  <Link href="/stolovi">Stolovi po mjeri</Link>
                </li>
                <li>
                  <Link href="/daske">Daske za rezanje i serviranje</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="wrap">
          <HeroMedia />
        </div>
      </section>

      <section className="section" aria-labelledby="izbor">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Dvije kategorije</p>
            <h2 id="izbor">Šta pravimo</h2>
          </div>
          <div className={styles.choice}>
            <article className={styles.choiceItem}>
              <Link href="/konfigurator/stol" className={styles.choiceMedia} aria-label="Stol po vašoj mjeri — otvori konfigurator">
                <Image src="/originals/stol-hrast-02.jpg" alt="Hrastov stol DAL, pogled duž ploče" fill sizes="(min-width: 900px) 46vw, 100vw" className={styles.cover} />
              </Link>
              <div className={styles.choiceText}>
                <h3>Stol po vašoj mjeri</h3>
                <p>Masivna ploča u dimenziji koja odgovara vašem prostoru, s izborom drveta, ivice i metalnog postolja.</p>
                <Link href="/konfigurator/stol" className="btn">
                  Kreirajte svoj stol
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
                <Link href="/konfigurator/daska" className="btn">
                  Kreirajte svoju dasku
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--dark on-dark" aria-labelledby="materijal">
        <div className={`wrap ${styles.material}`}>
          <div className={styles.materialMedia}>
            <Image
              src="/images/dal-detalj-hrasta.webp"
              alt="Detalj ugla hrastove ploče i crnog metalnog okvira (stilizirana ilustracija)"
              width={1536}
              height={1024}
              sizes="(min-width: 900px) 55vw, 100vw"
              className={styles.materialImg}
            />
          </div>
          <div className={styles.materialText}>
            <p className="eyebrow">Materijal i detalj</p>
            <h2 id="materijal">Svaka ploča ima svoj crtež.</h2>
            <p className="lead">
              Šare, nijanse i godovi ne ponavljaju se. Masivno drvo zadržava toplinu i težinu materijala — zato je svaki komad pomalo
              drugačiji od prikaza.
            </p>
            <h3 className={styles.small}>Pogledajte razliku: ravna ili zaobljena ivica</h3>
            <EdgeComparison />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="proces">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Kako nastaje vaš komad</p>
            <h2 id="proces">Od izbora do izrade, u četiri koraka.</h2>
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

      <section className="section section--stone" aria-labelledby="proizvodi">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Stvarni proizvodi</p>
            <h2 id="proizvodi">Iz radionice, kako su objavljeni.</h2>
            <p className="lead">Čiste fotografije stvarnih DAL proizvoda s Instagrama. Ništa izmišljeno, ništa iz kataloga drugih.</p>
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
                <p className="note">Tri fotografije istog stola. {table.note}</p>
                <Link href="/konfigurator/stol" className="text-link">
                  Ovaj stol je polazni model konfiguratora
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
                {w.note && <p className="note">{w.note}</p>}
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

      <section className="section" aria-labelledby="pitanja">
        <div className={`wrap ${styles.faq}`}>
          <div className="section-head">
            <p className="eyebrow">Pitanja</p>
            <h2 id="pitanja">Prije nego što pošaljete upit</h2>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="section section--dark on-dark" aria-labelledby="ideja">
        <div className={`wrap ${styles.final}`}>
          <h2 id="ideja">Imate svoju ideju? Pretvorimo je u komad od drveta.</h2>
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
    </>
  );
}
