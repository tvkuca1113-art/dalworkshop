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
        className={`btn btn--ghost-light btn--small ${styles.trigger}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Meni
      </button>
      <dialog
        ref={dialog}
        className={`${styles.dialog} on-dark`}
        aria-label="Meni"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <span className="eyebrow">DAL Workshop · Mostar</span>
            <button type="button" className="btn btn--ghost-light btn--small" onClick={() => setOpen(false)}>
              Zatvori
            </button>
          </div>
          <nav aria-label="Meni za mobitel">
            <ul className={styles.list}>
              <li>
                <Link href="/">Početna</Link>
              </li>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.ctas}>
            <Link href="/konfigurator/stol" className="btn btn--light">
              Kreirajte svoj stol
            </Link>
            <Link href="/konfigurator/daska" className="btn btn--ghost-light">
              Kreirajte svoju dasku
            </Link>
            <a href={whatsappLink()} className="btn btn--ghost-light" rel="noopener" target="_blank">
              <WhatsAppIcon className="btn__wa" /> WhatsApp {BRAND.phonePrimary}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
