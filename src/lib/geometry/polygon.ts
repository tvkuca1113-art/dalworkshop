/** 2D helpers. Points are [x, z] in millimetres (plan view) unless noted. */
export type Pt = readonly [number, number];

export function polygonArea(points: readonly Pt[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[(i + 1) % points.length]!;
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function orientation(a: Pt, b: Pt, c: Pt): number {
  const v = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (Math.abs(v) < 1e-9) return 0;
  return v > 0 ? 1 : 2;
}

function onSegment(a: Pt, b: Pt, c: Pt): boolean {
  return (
    b[0] <= Math.max(a[0], c[0]) + 1e-9 &&
    b[0] >= Math.min(a[0], c[0]) - 1e-9 &&
    b[1] <= Math.max(a[1], c[1]) + 1e-9 &&
    b[1] >= Math.min(a[1], c[1]) - 1e-9
  );
}

export function segmentsIntersect(p1: Pt, q1: Pt, p2: Pt, q2: Pt): boolean {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

/** True when any two non-adjacent edges of the closed polygon intersect. */
export function polygonSelfIntersects(points: readonly Pt[]): boolean {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a1 = points[i]!;
    const a2 = points[(i + 1) % n]!;
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // adjacent through the closing edge
      const b1 = points[j]!;
      const b2 = points[(j + 1) % n]!;
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

export function pointInPolygon(point: Pt, polygon: readonly Pt[]): boolean {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Distance from a point to the polygon boundary. */
export function distanceToBoundary(point: Pt, polygon: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % polygon.length]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / len2));
    const px = a[0] + t * dx - point[0];
    const py = a[1] + t * dy - point[1];
    best = Math.min(best, Math.hypot(px, py));
  }
  return best;
}

/**
 * The z-extent of the polygon along the vertical line x (plan view).
 * Returns null when the line misses the polygon.
 */
export function extentAtX(polygon: readonly Pt[], x: number): { min: number; max: number } | null {
  const hits: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const [x1, z1] = polygon[i]!;
    const [x2, z2] = polygon[(i + 1) % polygon.length]!;
    if ((x1 <= x && x2 >= x) || (x2 <= x && x1 >= x)) {
      if (x1 === x2) {
        hits.push(z1, z2);
      } else {
        const t = (x - x1) / (x2 - x1);
        hits.push(z1 + t * (z2 - z1));
      }
    }
  }
  if (hits.length < 2) return null;
  return { min: Math.min(...hits), max: Math.max(...hits) };
}

/** Narrowest half-width (symmetric around z=0) over [x0, x1], sampled. */
export function minHalfWidthBetween(polygon: readonly Pt[], x0: number, x1: number, samples = 12): number {
  let best = Infinity;
  for (let i = 0; i <= samples; i++) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const e = extentAtX(polygon, x);
    if (!e) return 0;
    best = Math.min(best, -e.min, e.max);
  }
  return best;
}

export function bounds(points: readonly Pt[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY };
}

/** Offset a convex polygon inward by d (edges moved along their inner normal). */
export function insetConvex(points: readonly Pt[], d: number): Pt[] {
  const ccw = polygonArea(points) > 0;
  const n = points.length;
  const lines = points.map((p, i) => {
    const q = points[(i + 1) % n]!;
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    // inner normal: left of edge for CCW polygons
    const nx = ccw ? -dy / len : dy / len;
    const ny = ccw ? dx / len : -dx / len;
    return { p: [p[0] + nx * d, p[1] + ny * d] as Pt, dir: [dx, dy] as Pt };
  });
  return lines.map((line, i) => {
    const prev = lines[(i - 1 + n) % n]!;
    return intersectLines(prev.p, prev.dir, line.p, line.dir);
  });
}

function intersectLines(p: Pt, r: Pt, q: Pt, s: Pt): Pt {
  const cross = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(cross) < 1e-12) return q;
  const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / cross;
  return [p[0] + t * r[0], p[1] + t * r[1]];
}
