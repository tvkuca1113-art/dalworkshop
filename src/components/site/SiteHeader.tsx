'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { NAV } from './nav';
import styles from './SiteHeader.module.css';

function subscribeScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}
const scrollSnapshot = () => window.scrollY > 32;
const serverScrollSnapshot = () => false;

export function SiteHeader() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeScroll, scrollSnapshot, serverScrollSnapshot);
  return (
    <header className={`site-header on-dark ${styles.header}`} data-home={pathname === '/'} data-scrolled={scrolled}>
      <div className={`wrap ${styles.inner}`}>
        <Logo eager />
        <nav aria-label="Glavna navigacija" className={styles.nav}>
          <ul>
            {NAV.filter((item) => item.href !== '/odrzavanje').map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <Link href="/kontakt" className={`btn btn--ghost-light btn--small ${styles.cta}`}>
            Zatražite ponudu
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
