'use client';

import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import type { TableConfig } from '@/lib/config/types';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import { buildTableBase, buildTableTop } from '@/lib/three/table-geometry';
import { applyTint, tableMaterials, type WoodMaterialSet } from '@/lib/three/wood-materials';
import { finishOption, woodOption } from '@/lib/catalog/table';
import { frameMaterial } from './materials';
import { useDisposable } from './useDisposable';
import type { TextureQualityLevel } from './types';

const TEXTURE_SEED = 2026;

export function TableModel({
  config,
  quality,
  onReady,
  onError,
}: {
  config: TableConfig;
  quality: TextureQualityLevel;
  onReady: () => void;
  onError: (err: unknown) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const layout = useMemo(() => computeTableLayout(config), [config]);
  const top = useMemo(
    () =>
      buildTableTop(layout, {
        spanU: 2.9,
        spanV: 1.6,
        originX: -layout.lengthMm / 2000,
        originZ: -layout.widthMm / 2000,
        topY: layout.topY / 1000,
        endDepth: 0.06,
      }),
    [layout],
  );
  const base = useMemo(() => buildTableBase(layout), [layout]);
  useEffect(() => () => top.dispose(), [top]);
  useEffect(() => () => base.dispose(), [base]);

  const species = woodOption(config.woodId).species;
  const mats = useDisposable<WoodMaterialSet>(() => tableMaterials(species, TEXTURE_SEED, quality), (m) => m.dispose(), [species, quality], onError);

  useEffect(() => {
    if (!mats) return;
    applyTint(mats, finishOption(config.finishId).tint);
    invalidate();
  }, [mats, config.finishId, invalidate]);

  useEffect(() => {
    if (mats) {
      invalidate();
      onReady();
    }
  }, [mats, top, base, invalidate, onReady]);

  if (!mats) return null;
  return (
    <group name="table">
      <mesh name="table-top" geometry={top} material={[mats.face, mats.face, mats.end]} castShadow receiveShadow />
      <mesh name="table-base" geometry={base} material={frameMaterial()} castShadow receiveShadow />
    </group>
  );
}
