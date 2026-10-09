'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV } from './nav';
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
    if (open && !d.open) d.showModal();
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
        className={styles.dialog}
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
            <span className="eyebrow">DAL Workshop · Mostar</span>
            <button type="button" className={styles.close} onClick={() => setOpen(false)}>
              Zatvori <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav aria-label="Meni za mobitel" onClick={() => setOpen(false)}>
            <ul className={styles.list}>
              <li>
                <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Početna</Link>
              </li>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}<span aria-hidden="true">↗</span></Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.ctas} onClick={() => setOpen(false)}>
            <p className="eyebrow">Vaše mjere. Vaš komad.</p>
            <Link href="/konfigurator/stol" className="btn">
              Kreirajte svoj stol
            </Link>
            <Link href="/konfigurator/daska" className="btn btn--ghost">
              Kreirajte svoju dasku
            </Link>
            <a href={whatsappLink()} className={styles.whatsapp} rel="noopener" target="_blank">
              <WhatsAppIcon className="btn__wa" /> WhatsApp {BRAND.phonePrimary}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
