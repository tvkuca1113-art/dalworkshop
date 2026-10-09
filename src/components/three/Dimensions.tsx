'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { formatCm } from '@/lib/config/units';

/**
 * Thin dimension lines with labels rendered in the canvas (also visible in
 * exported renders). Labels are sprites drawn from a 2D canvas.
 */
export interface DimSpec {
  from: [number, number, number];
  to: [number, number, number];
  /** Value in mm. */
  valueMm: number;
  labelOffset: [number, number, number];
}

function labelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const font = `600 44px ${getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif'}`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 36;
  canvas.width = w;
  canvas.height = 72;
  ctx.font = font;
  ctx.fillStyle = 'rgba(241, 237, 229, 0.94)';
  ctx.strokeStyle = 'rgba(125, 82, 54, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, 68, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#6b4429';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, 38);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function DimLabel({ position, text, scale }: { position: THREE.Vector3; text: string; scale: number }) {
  const texture = useMemo(() => labelTexture(text), [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  const aspect = texture.image.width / texture.image.height;
  return (
    <sprite position={position} scale={[scale * aspect, scale, 1]} renderOrder={10}>
      <spriteMaterial map={texture} depthTest={false} transparent />
    </sprite>
  );
}

export function Dimensions({ dims, labelScale }: { dims: DimSpec[]; labelScale: number }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (const d of dims) {
      const a = new THREE.Vector3(...d.from);
      const b = new THREE.Vector3(...d.to);
      pts.push(...a.toArray(), ...b.toArray());
      // end ticks perpendicular-ish to the line
      const dir = b.clone().sub(a).normalize();
      const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const tick = up.multiplyScalar(labelScale * 0.25);
      for (const p of [a, b]) pts.push(...p.clone().sub(tick).toArray(), ...p.clone().add(tick).toArray());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [dims, labelScale]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group name="dimensions">
      <lineSegments geometry={geometry} renderOrder={9}>
        <lineBasicMaterial color="#7d5236" depthTest={false} transparent opacity={0.95} />
      </lineSegments>
      {dims.map((d, i) => {
        const mid = new THREE.Vector3(...d.from).add(new THREE.Vector3(...d.to)).multiplyScalar(0.5).add(new THREE.Vector3(...d.labelOffset));
        return <DimLabel key={i} position={mid} text={`${formatCm(d.valueMm)} cm`} scale={labelScale} />;
      })}
    </group>
  );
}
