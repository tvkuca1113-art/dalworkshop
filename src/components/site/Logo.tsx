'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId } from 'react';
import styles from './Logo.module.css';
import { BRAND } from '@/lib/catalog/brand';

/**
 * Original DAL raster logo (Facebook profile image, 1254 × 1254 px).
 * The original lettering is the mask for a quiet, single-colour web mark.
 * A luminance cutoff removes the photographed background (including its texture),
 * without replacing the original letter shapes. The source raster stays intact.
 */
export function Logo({ size = 'header', eager = false, onNavigate }: { size?: 'header' | 'footer'; eager?: boolean; onNavigate?: () => void }) {
  const filterId = `dal-logo-${useId().replaceAll(':', '')}`;
  const pathname = usePathname();
  return (
    <Link href="/#vrh" className={`${styles.logo} ${styles[size]}`} aria-label={`${BRAND.name} — početna`}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        onNavigate?.();
        // A repeated link to the current route can preserve its scroll position.
        if (pathname === '/') {
          window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      }}>
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
