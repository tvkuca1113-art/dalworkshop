import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Pt } from '../geometry/polygon';

/**
 * Geometry builders (layout in mm → three.js geometry in metres).
 * Called only when the configuration changes — never per frame.
 */

export const MM = 0.001;

function shapeFrom(outline: readonly Pt[], holes: readonly (readonly Pt[])[] = []): THREE.Shape {
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x * MM, y * MM))));
  return shape;
}

/**
 * Wooden slab from a plan outline: real extrusion with an edge profile
 * (chamfer or round). bevelOffset = -profile keeps the outer size exact.
 * Result: bottom at topY - thickness, top at topY (metres).
 */
export function extrudePlan(
  outline: readonly Pt[],
  holes: readonly (readonly Pt[])[],
  thicknessMm: number,
  profileMm: number,
  segments: number,
  topYmm: number,
): THREE.BufferGeometry {
  const p = Math.max(0, profileMm) * MM;
  const t = thicknessMm * MM;
  const geom = new THREE.ExtrudeGeometry(shapeFrom(outline, holes), {
    depth: t - 2 * p,
    bevelEnabled: p > 0,
    bevelThickness: p,
    bevelSize: p,
    bevelOffset: -p,
    bevelSegments: Math.max(1, segments),
    curveSegments: 1,
    steps: 1,
  });
  // shape (x, y) → world (x, z); extrusion → world -y
  geom.rotateX(Math.PI / 2);
  geom.translate(0, topYmm * MM - p, 0);
  return geom;
}

export interface WoodMapping {
  /** Metres covered by one texture repeat across U (length) and V (width). */
  spanU: number;
  spanV: number;
  /** World X / Z where U = 0 / V = 0. */
  originX: number;
  originZ: number;
  topY: number;
  /** Metres of thickness covered by the end-grain texture (along its U). */
  endDepth: number;
}

/**
 * Splits triangles into face (top/bottom), long-side and end groups, writes
 * physically scaled UVs (grain runs along X, wraps over the long edges,
 * end grain on the short ends) and creased normals. Groups: 0 face, 1 side, 2 end.
 */
export function finalizeWoodGeometry(input: THREE.BufferGeometry, m: WoodMapping, creaseDeg = 35): THREE.BufferGeometry {
  const src = input.index ? input.toNonIndexed() : input;
  const pos = src.getAttribute('position') as THREE.BufferAttribute;
  const triCount = pos.count / 3;
  const buckets: number[][] = [[], [], []];
  const faceNormals = new Float32Array(triCount * 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    a.fromBufferAttribute(pos, t * 3);
    b.fromBufferAttribute(pos, t * 3 + 1);
    c.fromBufferAttribute(pos, t * 3 + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    if (!Number.isFinite(n.x)) n.set(0, 1, 0);
    faceNormals.set([n.x, n.y, n.z], t * 3);
    const cls = Math.abs(n.y) >= 0.6 ? 0 : Math.abs(n.x) > Math.abs(n.z) ? 2 : 1;
    buckets[cls]!.push(t);
  }

  const order = [...buckets[0]!, ...buckets[1]!, ...buckets[2]!];
  const outPos = new Float32Array(order.length * 9);
  const outUv = new Float32Array(order.length * 6);
  const outFaceN = new Float32Array(order.length * 3);
  order.forEach((t, k) => {
    const nx = faceNormals[t * 3]!;
    const ny = faceNormals[t * 3 + 1]!;
    const nz = faceNormals[t * 3 + 2]!;
    outFaceN.set([nx, ny, nz], k * 3);
    const cls = Math.abs(ny) >= 0.6 ? 0 : Math.abs(nx) > Math.abs(nz) ? 2 : 1;
    for (let v = 0; v < 3; v++) {
      const x = pos.getX(t * 3 + v);
      const y = pos.getY(t * 3 + v);
      const z = pos.getZ(t * 3 + v);
      outPos.set([x, y, z], k * 9 + v * 3);
      let u: number;
      let w: number;
      if (cls === 0) {
        u = (x - m.originX) / m.spanU;
        w = (z - m.originZ) / m.spanV;
      } else if (cls === 1) {
        u = (x - m.originX) / m.spanU;
        w = (z - m.originZ + Math.sign(nz) * (y - m.topY)) / m.spanV;
      } else {
        u = (m.topY - y) / m.endDepth;
        w = (z - m.originZ) / m.spanV;
      }
      outUv.set([u, w], k * 6 + v * 2);
    }
  });

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(outPos, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(outUv, 2));
  out.setAttribute('normal', new THREE.BufferAttribute(creasedNormals(outPos, outFaceN, creaseDeg), 3));
  let start = 0;
  buckets.forEach((bucket, i) => {
    if (bucket.length) out.addGroup(start * 3, bucket.length * 3, i);
    start += bucket.length;
  });
  out.computeBoundingBox();
  out.computeBoundingSphere();
  if (src !== input) src.dispose();
  return out;
}

/** Smooth normals across shallow angles (curves, rounded edges), sharp across creases. */
export function creasedNormals(positions: Float32Array, faceNormals: Float32Array, creaseDeg: number): Float32Array {
  const cos = Math.cos((creaseDeg * Math.PI) / 180);
  const q = 1e5;
  const map = new Map<string, number[]>();
  const vCount = positions.length / 3;
  for (let i = 0; i < vCount; i++) {
    const key = `${Math.round(positions[i * 3]! * q)},${Math.round(positions[i * 3 + 1]! * q)},${Math.round(positions[i * 3 + 2]! * q)}`;
    let list = map.get(key);
    if (!list) map.set(key, (list = []));
    list.push(i);
  }
  const normals = new Float32Array(positions.length);
  for (const list of map.values()) {
    for (const i of list) {
      const ti = Math.floor(i / 3);
      const nx = faceNormals[ti * 3]!;
      const ny = faceNormals[ti * 3 + 1]!;
      const nz = faceNormals[ti * 3 + 2]!;
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const j of list) {
        const tj = Math.floor(j / 3);
        const mx = faceNormals[tj * 3]!;
        const my = faceNormals[tj * 3 + 1]!;
        const mz = faceNormals[tj * 3 + 2]!;
        if (nx * mx + ny * my + nz * mz >= cos) {
          sx += mx;
          sy += my;
          sz += mz;
        }
      }
      const len = Math.hypot(sx, sy, sz) || 1;
      normals[i * 3] = sx / len;
      normals[i * 3 + 1] = sy / len;
      normals[i * 3 + 2] = sz / len;
    }
  }
  return normals;
}

/** Metal profile part: polygon in the Z–Y plane extruded along X, centred on x. */
export function prismZY(polygon: readonly Pt[], holes: readonly (readonly Pt[])[] | undefined, depthMm: number, xMm: number, bevelMm = 1.5): THREE.BufferGeometry {
  const bev = bevelMm * MM;
  const geom = new THREE.ExtrudeGeometry(shapeFrom(polygon, holes ?? []), {
    depth: depthMm * MM - 2 * bev,
    bevelEnabled: bev > 0,
    bevelThickness: bev,
    bevelSize: bev,
    bevelOffset: -bev,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geom.translate(0, 0, -(depthMm * MM) / 2 + bev);
  // shape x → world z, extrusion z → world x (a pure rotation, winding stays valid)
  geom.rotateY(-Math.PI / 2);
  geom.translate(xMm * MM, 0, 0);
  return geom;
}

/** Horizontal plate from a plan outline between y0 and y1 (mm). */
export function plateXZ(outline: readonly Pt[], y0: number, y1: number, bevelMm = 1.5): THREE.BufferGeometry {
  const bev = Math.min(bevelMm, (y1 - y0) / 3) * MM;
  const geom = new THREE.ExtrudeGeometry(shapeFrom(outline), {
    depth: (y1 - y0) * MM - 2 * bev,
    bevelEnabled: bev > 0,
    bevelThickness: bev,
    bevelSize: bev,
    bevelOffset: -bev,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geom.rotateX(Math.PI / 2);
  geom.translate(0, y1 * MM - bev, 0);
  return geom;
}

export function columnGeometry(radiusMm: number, y0: number, y1: number, xMm = 0, zMm = 0): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(radiusMm * MM, radiusMm * MM, (y1 - y0) * MM, 40, 1, false);
  geom.translate(xMm * MM, ((y0 + y1) / 2) * MM, zMm * MM);
  return geom;
}

/**
 * Bow handle standing on the top face: two round feet and an arched bar.
 * Feet rest exactly on y = topY; the bar leaves `clearance` for fingers.
 */
export function bowHandleGeometry(spacingMm: number, clearanceMm: number, barMm: number, footMm: number, topYmm: number, xMm: number): THREE.BufferGeometry {
  const r = (barMm / 2) * MM;
  const half = (spacingMm / 2) * MM;
  const top = (topYmm + clearanceMm + barMm / 2) * MM;
  const base = topYmm * MM;
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, base + 0.004, -half),
      new THREE.Vector3(0, top - 0.006, -half * 0.92),
      new THREE.Vector3(0, top, -half * 0.55),
      new THREE.Vector3(0, top, half * 0.55),
      new THREE.Vector3(0, top - 0.006, half * 0.92),
      new THREE.Vector3(0, base + 0.004, half),
    ],
    false,
    'centripetal',
  );
  const bar = new THREE.TubeGeometry(curve, 48, r, 14, false);
  const footH = 0.006;
  const footA = new THREE.CylinderGeometry((footMm / 2) * MM, (footMm / 2) * MM * 1.05, footH, 24);
  footA.translate(0, base + footH / 2, -half);
  const footB = footA.clone();
  footB.translate(0, 0, 2 * half);
  // tube ends sit inside the feet; nothing reaches below the top face
  const parts = [bar, footA, footB].map((g) => (g.index ? g.toNonIndexed() : g));
  for (const g of parts) {
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
  }
  const merged = mergeGeometries(parts, false)!;
  merged.translate(xMm * MM, 0, 0);
  for (const g of [bar, footA, footB, ...parts]) g.dispose();
  return merged;
}
