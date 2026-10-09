'use client';

import { getImageProps } from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ViewerShell } from '../three/ViewerShell';
import { DEFAULT_TABLE } from '@/lib/config/defaults';
import styles from './HeroMedia.module.css';

function Photo() {
  const common = { alt: 'Hrastov stol DAL s crnim trapeznim postoljem u toploj blagovaonici — vizualizacija ambijenta', sizes: '100vw', quality: 80, loading: 'eager' as const, fetchPriority: 'high' as const };
  const { props: desktop } = getImageProps({ ...common, src: '/images/dal-hero-desktop.webp', width: 1536, height: 1024 });
  const { props: mobile } = getImageProps({ ...common, src: '/images/dal-hero-mobile-close.webp', width: 1024, height: 1536 });
  return (
    <picture>
      <source media="(max-width: 700px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
      {/* Next's documented art-direction pattern selects one image per viewport. */}
      <img {...desktop} alt={common.alt} className={styles.photo} />
    </picture>
  );
}

export function HeroMedia({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
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
  return (
    <section className={`${styles.hero} on-dark`} aria-labelledby="hero-title">
      <Photo />
      <div className={styles.shade} aria-hidden="true" />
      {children}
      <button ref={trigger} type="button" className={`btn btn--ghost-light btn--small ${styles.preview}`} onClick={() => setOpen(true)} data-testid="hero-3d" aria-haspopup="dialog">
        Pogledajte stol u 3D
      </button>
      <dialog ref={dialog} className={styles.dialog} aria-label="3D prikaz hrastovog stola" onClose={() => { setOpen(false); trigger.current?.focus(); }}>
        <div className={styles.dialogHead}>
          <p>Hrast · 150 × 70 cm · crno metalno postolje</p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setOpen(false)}>Zatvori prikaz</button>
        </div>
        {open && <div className={styles.viewer}><ViewerShell config={DEFAULT_TABLE} variant="hero" poster={<Photo />} label="3D prikaz polaznog hrastovog stola" onClose={() => setOpen(false)} /></div>}
      </dialog>
    </section>
  );
}
