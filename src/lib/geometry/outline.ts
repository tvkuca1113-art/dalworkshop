import type { Pt } from './polygon';
import { valueNoise1D } from './random';

/**
 * Plan-view outlines in millimetres. X = length, second coordinate = Z (width).
 * All outlines are counter-clockwise, centred on the origin and free of
 * self-intersections (verified in tests).
 */

function arc(cx: number, cz: number, r: number, from: number, to: number, segments: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = from + ((to - from) * i) / segments;
    pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
  return pts;
}

/** Rounded rectangle. r is clamped so that it never exceeds the half sizes. */
export function roundedRectOutline(halfL: number, halfW: number, radius: number, segments = 8): Pt[] {
  const r = Math.max(0, Math.min(radius, halfL - 0.5, halfW - 0.5));
  if (r < 0.5) {
    return [
      [-halfL, -halfW],
      [halfL, -halfW],
      [halfL, halfW],
      [-halfL, halfW],
    ];
  }
  const seg = Math.max(2, Math.round(segments * Math.min(1, r / 40) + 2));
  const H = Math.PI / 2;
  return [
    ...arc(halfL - r, -halfW + r, r, -H, 0, seg),
    ...arc(halfL - r, halfW - r, r, 0, H, seg),
    ...arc(-halfL + r, halfW - r, r, H, 2 * H, seg),
    ...arc(-halfL + r, -halfW + r, r, 2 * H, 3 * H, seg),
  ];
}

/** True ellipse with semi-axes a (X) and b (Z). */
export function ellipseOutline(a: number, b: number, segments = 160): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([a * Math.cos(t), b * Math.sin(t)]);
  }
  return pts;
}

export function circleOutline(r: number, segments = 160): Pt[] {
  return ellipseOutline(r, r, segments);
}

/**
 * Natural (live) edge: both long sides deviate inward by 0..maxDev following a
 * seeded, smooth noise. The short ends are straight sawn cuts. Because each
 * long side is a function of x, the outline cannot self-intersect.
 */
export function naturalEdgeDeviation(seed: number, side: 'front' | 'back'): (t: number) => number {
  const s = side === 'front' ? seed : seed ^ 0x9e3779b9;
  const coarse = valueNoise1D(s, 5);
  const fine = valueNoise1D(s + 17, 19);
  return (t: number) => {
    const n = 0.7 * coarse(t) + 0.3 * fine(t);
    // fade towards the sawn ends so the corners stay square-ish
    const edgeFade = Math.min(1, Math.min(t, 1 - t) * 12);
    return Math.min(1, Math.max(0, n)) * (0.35 + 0.65 * edgeFade);
  };
}

export function naturalEdgeOutline(halfL: number, halfW: number, maxDev: number, seed: number, samples = 96): Pt[] {
  const front = naturalEdgeDeviation(seed, 'front');
  const back = naturalEdgeDeviation(seed, 'back');
  const pts: Pt[] = [];
  // back side (z negative), x increasing
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    pts.push([-halfL + 2 * halfL * t, -halfW + maxDev * back(t)]);
  }
  // front side (z positive), x decreasing
  for (let i = samples; i >= 0; i--) {
    const t = i / samples;
    pts.push([-halfL + 2 * halfL * t, halfW - maxDev * front(t)]);
  }
  return pts;
}

/** Narrowest width of a natural edge top (mm) — shown to the customer as an estimate. */
export function naturalEdgeWidthRange(widthMm: number, maxDev: number, seed: number, samples = 200) {
  const front = naturalEdgeDeviation(seed, 'front');
  const back = naturalEdgeDeviation(seed, 'back');
  let min = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    min = Math.min(min, widthMm - maxDev * (front(t) + back(t)));
  }
  return { min: Math.round(min), max: widthMm };
}

/**
 * Paddle board: rounded board part with a handle tab on the +X end.
 * halfL is half of the TOTAL length (handle included).
 */
export function paddleOutline(
  halfL: number,
  halfW: number,
  handleLength: number,
  handleWidth: number,
  cornerRadius: number,
): Pt[] {
  const xb = halfL - handleLength;
  const hw = handleWidth / 2;
  const r = Math.min(cornerRadius, halfW - hw - 2, (xb + halfL) / 2 - 1);
  const f = Math.min(14, halfW - hw - r - 1);
  const H = Math.PI / 2;
  const seg = 8;
  const pts: Pt[] = [];
  pts.push(...arc(xb - r, -halfW + r, r, -H, 0, seg));
  if (f > 1) pts.push(...arc(xb + f, -hw - f, f, Math.PI, H, seg));
  else pts.push([xb, -hw]);
  pts.push(...arc(halfL - hw, 0, hw, -H, H, 16));
  if (f > 1) pts.push(...arc(xb + f, hw + f, f, -H, -Math.PI, seg));
  else pts.push([xb, hw]);
  pts.push(...arc(xb - r, halfW - r, r, 0, H, seg));
  pts.push(...arc(-halfL + r, halfW - r, r, H, 2 * H, seg));
  pts.push(...arc(-halfL + r, -halfW + r, r, 2 * H, 3 * H, seg));
  return dedupe(pts);
}

function dedupe(points: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(prev[0] - p[0], prev[1] - p[1]) > 1e-6) out.push(p);
  }
  const first = out[0]!;
  const last = out[out.length - 1]!;
  if (Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-6) out.pop();
  return out;
}

/** Hole polygon (clockwise) for hanging holes etc. */
export function circleHole(cx: number, cz: number, r: number, segments = 32): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < segments; i++) {
    const t = -(i / segments) * Math.PI * 2;
    pts.push([cx + r * Math.cos(t), cz + r * Math.sin(t)]);
  }
  return pts;
}

/**
 * Edge profile as (inset, drop) samples from the top face downwards — the
 * same quarter profile that the 3D bevel uses (three.js ExtrudeGeometry).
 * inset = horizontal distance from the outer edge, drop = distance below top.
 */
export function edgeProfile(profileMm: number, segments: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // ExtrudeGeometry: z = bevelThickness * cos(t·π/2), size = bevelSize * sin(t·π/2)
    const inset = profileMm - profileMm * Math.sin((t * Math.PI) / 2);
    const drop = profileMm - profileMm * Math.cos((t * Math.PI) / 2);
    pts.push([inset, drop]);
  }
  return pts;
}
