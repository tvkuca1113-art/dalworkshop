'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ViewerShell } from '../three/ViewerShell';
import { DEFAULT_TABLE } from '@/lib/config/defaults';
import styles from './HeroMedia.module.css';

const PHOTO = {
  src: '/images/dal-stol-ambijent.webp',
  width: 1672,
  height: 941,
  alt: 'Hrastov stol s dva crna trapezna metalna okvira u svijetloj blagovaonici (ilustracija ambijenta)',
};

function Photo({ priority }: { priority?: boolean }) {
  return (
    <Image
      src={PHOTO.src}
      alt={PHOTO.alt}
      width={PHOTO.width}
      height={PHOTO.height}
      priority={priority}
      fetchPriority={priority ? 'high' : undefined}
      quality={80}
      sizes="(min-width: 1440px) 1376px, calc(100vw - 2 * clamp(1rem, 4vw, 3rem))"
      className={styles.photo}
    />
  );
}

/**
 * Hero visual: fast photo first; "Pogledajte u 3D" loads the same starting
 * table the configurator uses and replaces the photo once the scene is ready.
 */
export function HeroMedia() {
  const [mode, setMode] = useState<'photo' | '3d'>('photo');
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        {mode === 'photo' ? (
          <Photo priority />
        ) : (
          <div className={styles.viewer}>
            <ViewerShell
              config={DEFAULT_TABLE}
              variant="hero"
              poster={<Photo />}
              label="3D prikaz polaznog hrastovog stola"
              onClose={() => setMode('photo')}
            />
          </div>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span className="note">
          {mode === 'photo'
            ? 'Ilustracija ambijenta prema stvarnom DAL stolu 150 × 70 cm. Nije fotografija radionice.'
            : '3D model polaznog stola: hrast, 150 × 70 × 3,5 cm, crni trapezni okviri. Visina 75 cm je prijedlog.'}
        </span>
        {mode === 'photo' && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setMode('3d')} data-testid="hero-3d">
            Pogledajte u 3D
          </button>
        )}
      </figcaption>
    </figure>
  );
}
