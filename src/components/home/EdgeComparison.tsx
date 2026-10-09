'use client';

import { useState } from 'react';
import { edgeProfile } from '@/lib/geometry/outline';
import { TABLE_EDGES } from '@/lib/catalog/table';
import { formatCm } from '@/lib/config/units';
import styles from './EdgeComparison.module.css';

/**
 * Cross-section of the same 3,5 cm top with the two edge settings — drawn
 * from the exact profile function that shapes the 3D bevel.
 */
const THICKNESS = 35;
const SCALE = 5;

function profilePath(profileMm: number, segments: number): string {
  const pts = edgeProfile(profileMm, segments);
  const w = 60; // visible slice of the top (mm)
  const x0 = 10;
  const y0 = 12;
  const outerX = x0 + w;
  const top = pts.map(([inset, drop]) => [outerX - inset, drop] as const);
  const bottom = pts.map(([inset, drop]) => [outerX - inset, THICKNESS - drop] as const).reverse();
  const d = [
    `M${x0 * SCALE} ${y0 * SCALE}`,
    ...top.map(([x, y]) => `L${(x * SCALE).toFixed(1)} ${((y0 + y) * SCALE).toFixed(1)}`),
    ...bottom.map(([x, y]) => `L${(x * SCALE).toFixed(1)} ${((y0 + y) * SCALE).toFixed(1)}`),
    `L${x0 * SCALE} ${(y0 + THICKNESS) * SCALE}`,
    'Z',
  ];
  return d.join(' ');
}

export function EdgeComparison() {
  const [active, setActive] = useState<'straight' | 'rounded'>('straight');
  return (
    <div className={styles.wrap}>
      <div className={styles.toggle} role="group" aria-label="Pogledajte razliku">
        {TABLE_EDGES.map((e) => (
          <button key={e.id} type="button" aria-pressed={active === e.id} onClick={() => setActive(e.id)} className={styles.btn}>
            {e.label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 430 260" className={styles.svg} role="img" aria-label={`Presjek ploče debljine ${formatCm(THICKNESS)} cm: ${TABLE_EDGES.find((e) => e.id === active)!.label.toLowerCase()}`}>
        {TABLE_EDGES.map((e) => (
          <path
            key={e.id}
            d={profilePath(e.profileMm, e.segments)}
            className={e.id === active ? styles.active : styles.ghost}
          />
        ))}
        <line x1={355} x2={355} y1={60} y2={60 + THICKNESS * SCALE} className={styles.dim} />
        <text x={365} y={60 + (THICKNESS * SCALE) / 2} className={styles.label} dominantBaseline="middle">
          {formatCm(THICKNESS)} cm
        </text>
        <text x={50} y={40} className={styles.label}>
          Presjek iste ploče · razmjera 5 : 1
        </text>
      </svg>
      <p className="note">
        {active === 'straight'
          ? 'Ravna ivica: bok ostaje ravan, ivica je blago oborena (2 mm) — kao na objavljenom stolu.'
          : 'Zaobljena ivica: radijus 8 mm daje mekši dodir i hvat. Isti profil koristi 3D model.'}
      </p>
    </div>
  );
}
