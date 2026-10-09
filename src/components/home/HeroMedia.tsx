import { getImageProps } from 'next/image';
import type { ReactNode } from 'react';
import styles from './HeroMedia.module.css';

function Photo() {
  const common = { alt: 'Hrastov stol DAL s crnim trapeznim postoljem u toploj blagovaonici — vizualizacija ambijenta', sizes: '100vw', quality: 80, loading: 'eager' as const, fetchPriority: 'high' as const };
  const { props: desktop } = getImageProps({ ...common, src: '/images/dal-hero-desktop.webp', width: 1536, height: 1024 });
  const { props: mobile } = getImageProps({ ...common, src: '/images/dal-hero-mobile-close.webp', width: 1024, height: 1536 });
  return (
    <picture className={styles.media} data-testid="hero-photo">
      <source media="(max-width: 700px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
      {/* Next's documented art-direction pattern selects one image per viewport. */}
      <img {...desktop} alt={common.alt} className={styles.photo} />
    </picture>
  );
}

export function HeroMedia({ children }: { children: ReactNode }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Photo />
      <div className={styles.shade} aria-hidden="true" />
      {children}
    </section>
  );
}
