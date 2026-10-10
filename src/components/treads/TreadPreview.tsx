'use client';

import { useEffect, useId, useState } from 'react';
import { TREAD_CATALOG, type TreadSelection } from '@/lib/catalog/treads';
import { WOOD_LOOK } from '@/lib/catalog/woods';
import { generateWoodPixels, plankStrips, type WoodPixels } from '@/lib/three/wood-texture';

interface TextureSet { face: string; front: string; end: string }
const textures = new Map<TreadSelection['wood'], Promise<TextureSet>>();
function textureData(p: WoodPixels) {
  const canvas = document.createElement('canvas');
  canvas.width = p.width; canvas.height = p.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2d texture unavailable');
  const rgba = new Uint8ClampedArray(p.color);
  context.putImageData(new ImageData(rgba, p.width, p.height), 0, 0);
  return canvas.toDataURL('image/png');
}
function woodTextures(wood: TreadSelection['wood']) {
  let entry = textures.get(wood);
  if (!entry) {
    const seed = 20261010;
    const widthM = TREAD_CATALOG.depthMm / 1000;
    entry = Promise.all([
      generateWoodPixels({ kind: 'face', spanU: 1, spanV: widthM, widthPx: 1024, heightPx: 308, strips: plankStrips(wood, widthM, seed), seed }),
      generateWoodPixels({ kind: 'face', spanU: 1, spanV: .08, widthPx: 1024, heightPx: 82, strips: [{ species: wood, v0: 0, v1: .08 }], seed }),
      generateWoodPixels({ kind: 'end', spanU: .08, spanV: widthM, widthPx: 82, heightPx: 308, strips: plankStrips(wood, widthM, seed), seed }),
    ]).then(([face, front, end]) => ({ face: textureData(face), front: textureData(front), end: textureData(end) }));
    textures.set(wood, entry);
    void entry.catch(() => textures.delete(wood));
  }
  return entry;
}

/** Exact 100×30 cm slab, projected from millimetres. Works without WebGL. */
export function TreadPreview({ selection, topView }: { selection: TreadSelection; topView: boolean }) {
  const id = useId().replaceAll(':', '');
  const [ready, setReady] = useState<{ wood: TreadSelection['wood']; texture: TextureSet } | null>(null);
  useEffect(() => {
    let cancelled = false;
    woodTextures(selection.wood).then(texture => {
      if (!cancelled) setReady({ wood: selection.wood, texture });
    }).catch(() => { /* Base species colours remain available if canvas is blocked. */ });
    return () => { cancelled = true; };
  }, [selection.wood]);
  const tex = ready?.wood === selection.wood ? ready.texture : null;
  const look = WOOD_LOOK[selection.wood];
  const T = selection.thickness;
  const drop = T * .65;
  return (
    <svg viewBox={topView ? '0 0 900 420' : '0 0 900 450'} role="img" aria-label={`Gazište ${look.label}, 100 × 30 × ${T / 10} cm, ${topView ? 'odozgo' : 'prostorni pogled'}`} data-testid="tread-preview" data-wood={selection.wood} data-thickness={T} data-texture-ready={!!tex}>
      <defs>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#403428" stopOpacity=".22" /><stop offset="1" stopColor="#403428" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-light`} x2="0" y2="1"><stop stopColor="#fffdf8" stopOpacity=".18" /><stop offset="1" stopColor="#fffdf8" stopOpacity="0" /></linearGradient>
      </defs>
      {topView ? (
        <>
          <ellipse cx="450" cy="255" rx="390" ry="145" fill={`url(#${id}-shadow)`} />
          <rect x="65" y="95" width="770" height="231" fill={look.base} />
          {tex && <image href={tex.face} x="65" y="95" width="770" height="231" preserveAspectRatio="none" />}
          <rect x="65" y="95" width="770" height="231" fill={`url(#${id}-light)`} stroke={look.early} />
          <text x="450" y="365" textAnchor="middle" fontSize="19" fill="#685844">100 × 30 cm · debljina {T / 10} cm</text>
        </>
      ) : (
        <>
          <ellipse cx="425" cy={310 + drop} rx="390" ry="95" fill={`url(#${id}-shadow)`} />
          <path d={`M780 190L640 330V${330 + drop}L780 ${190 + drop}Z`} fill={look.late} />
          {tex && <image href={tex.end} width={T} height="300" preserveAspectRatio="none" transform="matrix(0 .65 -.466667 .466667 780 190)" />}
          <path d={`M10 250L640 330V${330 + drop}L10 ${250 + drop}Z`} fill={look.base} />
          {tex && <image href={tex.front} width="1000" height={T} preserveAspectRatio="none" transform="matrix(.63 .08 0 .65 10 250)" />}
          <path d={`M10 250L640 330V${330 + drop}L10 ${250 + drop}Z`} fill="#362619" opacity=".1" />
          <path d="M150 110L780 190L640 330L10 250Z" fill={look.base} />
          {tex && <image href={tex.face} width="1000" height="300" preserveAspectRatio="none" transform="matrix(.63 .08 -.466667 .466667 150 110)" />}
          <path d="M150 110L780 190L640 330L10 250Z" fill={`url(#${id}-light)`} stroke={look.early} strokeWidth="1.3" />
          <g stroke="#8b765a" strokeWidth="1" fill="none"><path d="M20 325L640 405M20 318V332M640 398V412" /><path d={`M812 192V${192 + drop}M807 192H817M807 ${192 + drop}H817`} /></g>
          <g fill="#685844" fontSize="19"><text x="330" y="400" textAnchor="middle">100 cm</text><text x="830" y={202 + drop / 2}>{T / 10} cm</text><text x="745" y="300">30 cm</text></g>
        </>
      )}
    </svg>
  );
}
