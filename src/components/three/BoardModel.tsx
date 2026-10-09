'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { BoardConfig } from '@/lib/config/types';
import { computeBoardLayout } from '@/lib/geometry/board-layout';
import { buildBoardBody, buildBoardHandles } from '@/lib/three/board-geometry';
import { boardMaterials, type WoodMaterialSet } from '@/lib/three/wood-materials';
import { construction } from '@/lib/catalog/board';
import { handleMaterial } from './materials';
import { useDebouncedValue, useDisposable } from './useDisposable';
import { EngravingMesh } from './EngravingMesh';
import type { EngravingRender, TextureQualityLevel } from './types';

export function BoardModel({
  config,
  quality,
  engraving,
  onReady,
  onError,
}: {
  config: BoardConfig;
  quality: TextureQualityLevel;
  engraving: EngravingRender | null;
  onReady: () => void;
  onError: (err: unknown) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const layout = useMemo(() => computeBoardLayout(config), [config]);
  const widthM = layout.widthMm / 1000;
  const geometryKey = [config.modelId, config.dimensionsMm.length, config.dimensionsMm.width, config.dimensionsMm.diameter, config.dimensionsMm.thickness, config.edgeId, config.grooveId].join('|');

  // CSG body: recomputed only when the shape-relevant fields change (debounced).
  const [body, setBody] = useState<THREE.BufferGeometry | null>(null);
  const bodyRef = useRef<THREE.BufferGeometry | null>(null);
  const layoutRef = useRef(layout);
  // declared before the CSG effect so that it always reads the latest layout
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);
  useEffect(() => {
    const delay = bodyRef.current ? 120 : 0;
    const timer = window.setTimeout(() => {
      try {
        const l = layoutRef.current;
        const g = buildBoardBody(l, {
          spanU: 0.84,
          spanV: l.widthMm / 1000,
          originX: -l.lengthMm / 2000,
          originZ: -l.widthMm / 2000,
          topY: l.topY / 1000,
          endDepth: 0.045,
        });
        const prev = bodyRef.current;
        bodyRef.current = g;
        setBody(g);
        if (prev) requestAnimationFrame(() => prev.dispose());
      } catch (err) {
        onError(err);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [geometryKey, onError]);
  useEffect(() => () => bodyRef.current?.dispose(), []);

  const handles = useMemo(() => buildBoardHandles(layout), [layout]);
  useEffect(() => () => handles?.dispose(), [handles]);

  const cons = construction(config.constructionId);
  // textures follow the width (strips keep their layout) — regenerate once the value settles
  const widthKey = useDebouncedValue(Math.round(widthM * 1000), 350);
  const mats = useDisposable<WoodMaterialSet>(
    () => boardMaterials(cons.strips, widthKey / 1000, config.seed, quality, Boolean(cons.endGrain)),
    (m) => m.dispose(),
    [cons.id, widthKey, config.seed, quality],
    onError,
  );

  useEffect(() => {
    if (mats && body) {
      invalidate();
      onReady();
    }
  }, [mats, body, invalidate, onReady]);

  if (!mats || !body) return null;
  return (
    <group name="board">
      <mesh name="board-body" geometry={body} material={[mats.face, mats.face, mats.end]} castShadow receiveShadow />
      {handles && <mesh name="board-handles" geometry={handles} material={handleMaterial()} castShadow />}
      {engraving && <EngravingMesh engraving={engraving} thicknessMm={layout.thickness} />}
    </group>
  );
}
