'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from './Logo';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV } from './nav';
import { TREAD_CATALOG } from '@/lib/catalog/treads';
import { BRAND, whatsappLink } from '@/lib/catalog/brand';
import { WhatsAppIcon } from './WhatsAppIcon';
import styles from './MobileMenu.module.css';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    }
    if (!open && d.open) d.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  // Close the menu after navigation.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true"><path d="M1 5H23M1 13H17" stroke="currentColor" strokeWidth="1.5" /></svg>
        Meni
      </button>
      <dialog
        ref={dialog}
        className={`${styles.dialog} on-dark`}
        aria-label="Meni"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <div className={styles.brand}>
              <Logo />
              <span>Mostar · Ručna izrada</span>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)}>
              <span>Zatvori</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
          <div className={styles.intro}>
            <p className={styles.kicker}>Masivno drvo. Vaše mjere.</p>
            <p className={styles.title}>Pronađite svoj komad.</p>
          </div>
          <nav aria-label="Meni za mobitel" onClick={() => setOpen(false)}>
            <ul className={styles.products}>
              {NAV.filter((item) => item.href === '/stolovi' || item.href === '/daske' || item.href === '/gazista').map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-label={item.label} aria-current={pathname === item.href ? 'page' : undefined}>
                    <span className={styles.productPhoto}>
                      <Image src={item.href === '/stolovi' ? '/images/dal-stol-round.webp' : item.href === '/gazista' ? TREAD_CATALOG.inspirationImage : '/images/dal-daska-ambijent.webp'} alt="" fill sizes="180px" />
                    </span>
                    <span className={styles.productLabel}>{item.label}<span aria-hidden="true">↗</span></span>
                    <span className={styles.productHint}>{item.href === '/stolovi' ? 'Za vaš prostor' : item.href === '/gazista' ? 'Za svaki korak' : 'Za svaki dan'}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className={styles.list}>
              <li><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Početna</Link></li>
              {NAV.filter((item) => item.href !== '/stolovi' && item.href !== '/daske' && item.href !== '/gazista').map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}<span aria-hidden="true">↗</span></Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.ctas} onClick={() => setOpen(false)}>
            <Link href="/konfigurator/stol" className={styles.primary}>
              Kreirajte svoj stol <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/konfigurator/daska" className={styles.secondary}>
              Kreirajte svoju dasku <span aria-hidden="true">↗</span>
            </Link>
            <a href={whatsappLink()} className={styles.whatsapp} rel="noopener" target="_blank">
              <WhatsAppIcon className="btn__wa" /> <span>Razgovarajmo o vašoj ideji<small>WhatsApp {BRAND.phonePrimary}</small></span><span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
