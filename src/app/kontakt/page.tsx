import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from '@/components/site/WhatsAppIcon';
import { QuoteForm } from '@/components/configurator/QuoteForm';
import { isQuoteFormEnabled } from '@/lib/quote/env';
import styles from '../content.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kontakt i upit',
  description: 'Kontakt DAL Workshop, Mostar: WhatsApp i telefon +387 62 704 560, e-mail dalworkshop@hotmail.com. Pošaljite upit za stol, dasku ili gazišta.',
  alternates: { canonical: '/kontakt' },
};

export default function ContactPage() {
  const formEnabled = isQuoteFormEnabled();
  return (
    <>
      <section className="wrap page-hero">
        <p className="eyebrow">Kontakt</p>
        <h1>Recite nam šta imate na umu.</h1>
        <p className="lead">
          Pošaljite ideju, mjere ili fotografiju prostora na WhatsApp. Za pregled svog izbora otvorite{' '}
          <Link href="/konfigurator/stol" className="text-link">
            konfigurator stola
          </Link>{' '}
          ili{' '}
          <Link href="/konfigurator/daska" className="text-link">
            daske
          </Link>{' '}
          — dobit ćete pripremljenu poruku sa specifikacijom. Za stepenice otvorite <Link href="/gazista" className="text-link">izbor gazišta</Link>.
        </p>
      </section>
      <section className="wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <div className={styles.split}>
          <div className={styles.stack}>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.label}>WhatsApp (upiti)</span>
                <a href={whatsappLink('Pozdrav, zanima me izrada po mjeri.')} target="_blank" rel="noopener">
                  <WhatsAppIcon className="btn__wa" /> {BRAND.phonePrimary}
                </a>
              </li>
              <li>
                <span className={styles.label}>Telefon</span>
                <a href={`tel:${BRAND.phonePrimaryE164}`}>{BRAND.phonePrimary}</a>

              </li>
              <li>
                <span className={styles.label}>E-mail</span>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </li>
              <li>
                <span className={styles.label}>Društvene mreže</span>
                <a href={BRAND.instagram} target="_blank" rel="noopener">
                  Instagram {BRAND.instagramHandle}
                </a>
                <a href={BRAND.facebook} target="_blank" rel="noopener">
                  Facebook DAL Workshop
                </a>
              </li>
              <li>
                <span className={styles.label}>Lokacija</span>
                <span>{BRAND.city}, Bosna i Hercegovina. Preuzimanje i dostava po dogovoru.</span>
              </li>
            </ul>
          </div>
          <div id="upit" className={styles.stack}>
            <QuoteForm enabled={formEnabled} product="none" configQuery="" title="Pošaljite nam svoj upit" />
          </div>
        </div>
      </section>
    </>
  );
}
