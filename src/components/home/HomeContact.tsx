'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import { INQUIRY_PRODUCTS } from '@/lib/catalog/inquiries';
import { WhatsAppIcon } from '../site/WhatsAppIcon';
import styles from './HomeContact.module.css';

export function HomeContact() {
  const [product, setProduct] = useState<string>(INQUIRY_PRODUCTS[0]);
  const [message, setMessage] = useState('');
  const href = whatsappLink(`Pozdrav DAL Workshop, zanima me: ${product}.\n${message.trim() || 'Volio/voljela bih savjet oko izbora i ponudu.'}`);
  return (
    <section className={styles.contact} id="kontakt" aria-labelledby="kontakt-naslov">
      <div className={`wrap ${styles.layout}`}>
        <div className={styles.story}>
          <p className="eyebrow">Direktno s radionicom · Mostar</p>
          <h2 id="kontakt-naslov">Dobar komad počinje razgovorom.</h2>
          <p>Imate jasnu ideju, fotografiju koja vam se sviđa ili tek pitanje? Recite nam šta želite. Drvo, mjere i detalje možemo odabrati zajedno.</p>
          <div className={styles.links}>
            <a href={`tel:${BRAND.phonePrimaryE164}`}>{BRAND.phonePrimary} <span aria-hidden="true">↗</span></a>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email} <span aria-hidden="true">↗</span></a>
          </div>
          <p className={styles.small}>Ručna izrada u Mostaru. Cijenu, rok i isporuku dogovaramo za vaš komad.</p>
        </div>
        <div className={styles.inquiry}>
          <h3>Šta biste voljeli napraviti?</h3>
          <label htmlFor="home-product">Zanima me</label>
          <select id="home-product" value={product} onChange={(e) => setProduct(e.target.value)}>
            {INQUIRY_PRODUCTS.map((label) => <option key={label}>{label}</option>)}
          </select>
          <label htmlFor="home-message">Vaša ideja ili pitanje <span>(neobavezno)</span></label>
          <textarea id="home-message" rows={3} maxLength={600} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Npr. stol za šest osoba, imam fotografiju postolja…" />
          <a href={href} target="_blank" rel="noopener" className="btn btn--light"><WhatsAppIcon className="btn__wa" /> Razgovarajmo na WhatsAppu</a>
          <p className={styles.small}>Otvara poruku koju vi šaljete. Fotografiju možete dodati u razgovor.</p>
          <Link href="/konfigurator/stol" className={styles.configLink}>Želite prvo vidjeti svoj stol? Otvorite konfigurator ↗</Link>
        </div>
      </div>
    </section>
  );
}
