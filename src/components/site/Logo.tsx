import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';
import { BRAND } from '@/lib/catalog/brand';

/**
 * Original DAL raster logo (Facebook profile image, 1254 × 1254 px).
 * Shown through a CSS frame on its own dark ground — no redrawing,
 * no recolouring, no stretching.
 */
export function Logo({ size = 'header', eager = false }: { size?: 'header' | 'footer'; eager?: boolean }) {
  return (
    <Link href="/" className={`${styles.logo} ${styles[size]}`} aria-label={`${BRAND.name} — početna`}>
      <span className={styles.frame}>
        <Image
          src={BRAND.logo.src}
          alt=""
          fill
          sizes={size === 'header' ? '128px' : '180px'}
          loading={eager ? 'eager' : 'lazy'}
          quality={80}
          className={styles.img}
        />
      </span>
    </Link>
  );
}
