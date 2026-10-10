import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';
import styles from './Logo.module.css';
import { BRAND } from '@/lib/catalog/brand';

/**
 * Original DAL raster logo (Facebook profile image, 1254 × 1254 px).
 * The original lettering is the mask for a quiet, single-colour web mark.
 * A luminance cutoff removes the photographed background (including its texture),
 * without replacing the original letter shapes. The source raster stays intact.
 */
export function Logo({ size = 'header', eager = false }: { size?: 'header' | 'footer'; eager?: boolean }) {
  const filterId = `dal-logo-${useId().replaceAll(':', '')}`;
  return (
    <Link href="/" className={`${styles.logo} ${styles[size]}`} aria-label={`${BRAND.name} — početna`}>
      <svg width="0" height="0" className={styles.filters} aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .2126 .7152 .0722 0 0" />
            <feComponentTransfer result="letterMask">
              <feFuncA type="table" tableValues="0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1" />
            </feComponentTransfer>
            <feFlood floodColor="#f4efe5" />
            <feComposite operator="in" in2="letterMask" />
          </filter>
        </defs>
      </svg>
      <span className={styles.frame} style={{ filter: `url(#${filterId})` }}>
        <Image
          src={BRAND.logo.src}
          alt=""
          fill
          sizes={size === 'header' ? '160px' : '180px'}
          loading={eager ? 'eager' : 'lazy'}
          quality={80}
          className={styles.img}
        />
      </span>
    </Link>
  );
}
