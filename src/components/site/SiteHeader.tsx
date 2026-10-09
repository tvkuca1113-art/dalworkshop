import Link from 'next/link';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NAV } from './nav';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={`site-header on-dark ${styles.header}`}>
      <div className={`wrap ${styles.inner}`}>
        <Logo priority />
        <nav aria-label="Glavna navigacija" className={styles.nav}>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <Link href="/kontakt#upit" className={`btn btn--light btn--small ${styles.cta}`}>
            Zatražite ponudu
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
