import Link from 'next/link';
import { Logo } from './Logo';
import { NAV } from './nav';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={`site-footer on-dark ${styles.footer}`}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo size="footer" />
          <p className="note">Stolovi, daske i gazišta od masivnog drveta, ručna izrada po mjeri. {BRAND.city}, BiH.</p>
        </div>
        <nav aria-label="Podnožje">
          <ul className={styles.links}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/konfigurator/stol">Konfigurator stola</Link>
            </li>
            <li>
              <Link href="/konfigurator/daska">Konfigurator daske</Link>
            </li>
          </ul>
        </nav>
        <address className={styles.contact}>
          <a href={whatsappLink()} target="_blank" rel="noopener">
            WhatsApp {BRAND.phonePrimary}
          </a>
          <a href={`tel:${BRAND.phonePrimaryE164}`}>Telefon {BRAND.phonePrimary}</a>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          <a href={BRAND.instagram} target="_blank" rel="noopener">
            Instagram {BRAND.instagramHandle}
          </a>
          <a href={BRAND.facebook} target="_blank" rel="noopener">
            Facebook
          </a>
        </address>
      </div>
      <div className={`wrap ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <Link href="/privatnost">Privatnost</Link>
      </div>
    </footer>
  );
}
