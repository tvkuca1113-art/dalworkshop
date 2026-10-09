import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TableLayout } from '../geometry/table-layout';
import { columnGeometry, extrudePlan, finalizeWoodGeometry, plateXZ, prismZY, type WoodMapping } from './geometry';

/** Table top (wood) and the whole base merged into one metal geometry (one draw call). */
export function buildTableTop(layout: TableLayout, mapping: WoodMapping): THREE.BufferGeometry {
  const raw = extrudePlan(layout.outline, [], layout.thickness, layout.profileMm, layout.profileSegments, layout.topY);
  const geom = finalizeWoodGeometry(raw, mapping);
  raw.dispose();
  return geom;
}

export function buildTableBase(layout: TableLayout): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const part of layout.baseParts) {
    let g: THREE.BufferGeometry;
    switch (part.kind) {
      case 'prism':
        g = prismZY(part.polygon, part.holes, part.depth, part.x);
        break;
      case 'plate':
        g = plateXZ(part.outline, part.y0, part.y1);
        break;
      case 'column':
        g = columnGeometry(part.radius, part.y0, part.y1, part.x, part.z);
        break;
    }
    const flat: THREE.BufferGeometry = g.index ? g.toNonIndexed() : g;
    if (flat !== g) g.dispose();
    for (const name of Object.keys(flat.attributes)) if (name !== 'position' && name !== 'normal') flat.deleteAttribute(name);
    flat.clearGroups();
    parts.push(flat);
  }
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}
