'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { drawEngraving } from '@/lib/engraving/measure';
import type { EngravingRender } from './types';

/**
 * Personalised text as a decal plane lying on the board surface (0,2 mm
 * above it), parented to the board — it rotates with the model and is
 * part of the canvas render, never a floating HTML label.
 */
export function EngravingMesh({ engraving, thicknessMm }: { engraving: EngravingRender; thicknessMm: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const { measured, fontId, sizeMm, rect, placement, fontKey } = engraving;

  const { texture, widthM, heightM } = useMemo(() => {
    const pxPerMm = 10;
    const { canvas, padMm } = drawEngraving(measured, fontId, sizeMm, pxPerMm);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return {
      texture: tex,
      widthM: (rect.x1 - rect.x0 + 2 * padMm) / 1000,
      heightM: (rect.z1 - rect.z0 + 2 * padMm) / 1000,
    };
    // fontKey: redraw once the font file finished loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured, fontId, sizeMm, rect, fontKey]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        roughness: 0.9,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        name: 'engraving',
      }),
    [texture],
  );
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(widthM, heightM);
    if (placement === 'back') g.rotateX(Math.PI / 2);
    else g.rotateX(-Math.PI / 2);
    return g;
  }, [widthM, heightM, placement]);

  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    invalidate();
  }, [texture, geometry, invalidate]);

  const cx = (rect.x0 + rect.x1) / 2000;
  const cz = (rect.z0 + rect.z1) / 2000;
  const y = placement === 'back' ? -0.0002 : thicknessMm / 1000 + 0.0002;
  // On the underside the text reads correctly once the board is turned over its long axis.
  const z = placement === 'back' ? -cz : cz;
  return <mesh name="engraving" geometry={geometry} material={material} position={[cx, y, z]} renderOrder={2} />;
}
