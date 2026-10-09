import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import type { BoardLayout, GrooveFeature } from '../geometry/board-layout';
import { bowHandleGeometry, extrudePlan, finalizeWoodGeometry, MM, type WoodMapping } from './geometry';

/**
 * Board body with grooves cut as real volumes (CSG subtraction). The cut
 * is evaluated only when the configuration changes (debounced by the caller).
 */

function cutterFor(g: GrooveFeature, topYmm: number): THREE.BufferGeometry {
  const r = (g.width / 2) * MM;
  const depth = g.depth * MM;
  const centreY = topYmm * MM + r - depth;
  if (g.kind === 'slot') {
    const length = Math.max(0.001, (g.z1 - g.z0) * MM - 2 * r);
    const geom = new THREE.CapsuleGeometry(r, length, 8, 16);
    geom.rotateX(Math.PI / 2);
    geom.translate(g.x * MM, centreY, ((g.z0 + g.z1) / 2) * MM);
    return geom;
  }
  const points = g.path.map(([x, z]) => new THREE.Vector3(x * MM, centreY, z * MM));
  const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0);
  return new THREE.TubeGeometry(curve, Math.max(64, points.length * 2), r, 12, true);
}

export function buildBoardBody(layout: BoardLayout, mapping: WoodMapping): THREE.BufferGeometry {
  let geom: THREE.BufferGeometry = extrudePlan(
    layout.outline,
    layout.holes,
    layout.thickness,
    layout.profileMm,
    layout.profileSegments,
    layout.topY,
  );
  if (layout.grooves.length) {
    const evaluator = new Evaluator();
    evaluator.attributes = ['position', 'normal'];
    evaluator.useGroups = false;
    geom.clearGroups();
    let result = new Brush(geom);
    result.updateMatrixWorld();
    for (const g of layout.grooves) {
      const cutterGeom = cutterFor(g, layout.topY);
      const cutter = new Brush(cutterGeom);
      cutter.updateMatrixWorld();
      const next = evaluator.evaluate(result, cutter, SUBTRACTION);
      if (result.geometry !== geom) result.geometry.dispose();
      cutterGeom.dispose();
      result = next;
    }
    geom.dispose();
    geom = result.geometry;
  }
  const finished = finalizeWoodGeometry(geom, mapping);
  geom.dispose();
  return finished;
}

export function buildBoardHandles(layout: BoardLayout): THREE.BufferGeometry | null {
  if (!layout.handles.length) return null;
  const parts = layout.handles.map((h) => bowHandleGeometry(h.spacing, h.clearance, h.barDiameter, h.footDiameter, layout.topY, h.x));
  if (parts.length === 1) return parts[0]!;
  const merged = mergeTwo(parts[0]!, parts[1]!);
  parts.forEach((p) => p.dispose());
  return merged;
}

function mergeTwo(a: THREE.BufferGeometry, b: THREE.BufferGeometry): THREE.BufferGeometry {
  const pa = a.getAttribute('position') as THREE.BufferAttribute;
  const pb = b.getAttribute('position') as THREE.BufferAttribute;
  const na = a.getAttribute('normal') as THREE.BufferAttribute;
  const nb = b.getAttribute('normal') as THREE.BufferAttribute;
  const pos = new Float32Array(pa.count * 3 + pb.count * 3);
  pos.set(pa.array as Float32Array, 0);
  pos.set(pb.array as Float32Array, pa.count * 3);
  const nor = new Float32Array(pos.length);
  nor.set(na.array as Float32Array, 0);
  nor.set(nb.array as Float32Array, pa.count * 3);
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.computeBoundingSphere();
  return out;
}
