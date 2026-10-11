import type { Metadata } from 'next';
import { BRAND } from '@/lib/catalog/brand';

export const metadata: Metadata = {
  title: 'Privatnost',
  description: 'Koje podatke prikuplja web stranica DAL Workshop, zašto i koji servisi se koriste.',
  alternates: { canonical: '/privatnost' },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="wrap page-hero">
        <p className="eyebrow">Privatnost</p>
        <h1>Politika privatnosti</h1>
        <p className="lead">Kratko i konkretno: šta ova stranica stvarno prikuplja, zašto i gdje podaci završavaju.</p>
      </section>
      <section className="wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <div className="prose">
          <h2>Ko obrađuje podatke</h2>
          <p>
            {BRAND.name}, {BRAND.city}. Kontakt za pitanja o podacima: <a className="text-link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
          </p>

          <h2>Pregled stranice i konfiguratora</h2>
          <ul>
            <li>Stranica ne koristi kolačiće za praćenje, analitiku ni oglase.</li>
            <li>Fontovi, slike i 3D modeli učitavaju se s ove stranice, ne s vanjskih servisa.</li>
            <li>Konfigurator radi u vašem pregledniku. Izbor se upisuje u adresu stranice kako bi osvježavanje i link vraćali isti izbor; tekst personalizacije i poseban zahtjev ulaze u link samo ako to izričito izaberete.</li>
            <li>Server hostinga može voditi tehničke zapise pristupa (npr. IP adresa, vrijeme, preglednik) radi sigurnosti i rada stranice.</li>
          </ul>

          <h2>„Sačuvaj izbor“</h2>
          <p>
            Klikom na „Sačuvaj izbor“ konfiguracija proizvoda sprema se u lokalnu pohranu vašeg preglednika (localStorage). Ne sprema
            se ime, telefon ni e-mail. Poseban zahtjev i tekst personalizacije, ako su upisani u konfigurator, spremaju se s izborom. Podatak ostaje samo na vašem uređaju; obrišete ga brisanjem podataka stranice u
            pregledniku.
          </p>

          <h2>Fotografije inspiracije</h2>
          <p>Odabrane fotografije prikazuju se lokalno u otvorenom konfiguratoru. Stranica ih ne šalje na server i ne uključuje ih u sačuvani izbor ili javni link. Dostupne su dok je stranica otvorena; nakon osvježavanja dodajte ih ponovo.</p>
          <p>Klikom na dijeljenje možete ih predati aplikaciji koju sami odaberete. WhatsApp link prenosi tekst upita; fotografije dodajte u razgovor ili koristite sistemski izbornik dijeljenja. Ispis upita uključuje odabrane fotografije.</p>

          <h2>Upit putem WhatsAppa</h2>
          <p>
            Dugme „Pošaljite upit na WhatsApp“ otvara WhatsApp s pripremljenom porukom. Poruka se šalje tek kad je vi pošaljete u
            WhatsAppu; za tu komunikaciju vrijede uslovi i politika privatnosti servisa WhatsApp (Meta).
          </p>

          <h2>Upit putem web obrasca</h2>
          <p>Kad je web obrazac uključen, obrađujemo:</p>
          <ul>
            <li>ime, telefon i/ili e-mail, mjesto dostave (neobavezno), poruku i konfiguraciju proizvoda;</li>
            <li>svrha: odgovor na vaš upit i priprema ponude;</li>
            <li>poruka se šalje e-mailom radionici preko e-mail servisa Resend; ne čuva se u bazi podataka ove stranice;</li>
            <li>radi zaštite od zloupotrebe, servis Upstash (Redis) kratko čuva šifrirani otisak IP adrese (najviše 1 sat) i oznaku upita (najviše 24 sata).</li>
          </ul>
          <p>Podatke iz upita radionica čuva u svom e-mail sandučiću onoliko koliko je potrebno za dogovor i ponudu.</p>

          <h2>Vaša prava</h2>
          <p>
            Možete zatražiti uvid, ispravku ili brisanje podataka iz svog upita pisanjem na{' '}
            <a className="text-link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
          </p>
          <p className="note">Posljednja izmjena: 11. 10. 2026. Nacrt politike pripremljen uz izradu stranice.</p>
        </div>
      </section>
    </>
  );
}
