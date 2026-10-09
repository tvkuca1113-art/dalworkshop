import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';
import { BRAND } from '@/lib/catalog/brand';

/**
 * Original DAL raster logo (Facebook profile image, 1254 × 1254 px).
 * Shown through a CSS frame blended into the dark header — no redrawing,
 * no recolouring, no stretching.
 */
export function Logo({ size = 'header', eager = false }: { size?: 'header' | 'footer'; eager?: boolean }) {
  const filterId = `dal-logo-${size}`;
  return (
    <Link href="/" className={`${styles.logo} ${styles[size]}`} aria-label={`${BRAND.name} — početna`}>
      <svg width="0" height="0" className={styles.filters} aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 2 2 0 -0.4" />
          </filter>
        </defs>
      </svg>
      <span className={styles.frame} style={{ filter: `url(#${filterId})` }}>
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
