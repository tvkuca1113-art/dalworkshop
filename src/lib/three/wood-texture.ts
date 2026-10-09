import { WOOD_LOOK, type WoodSpecies } from '../catalog/woods';
import { mulberry32 } from '../geometry/random';

/**
 * Procedural wood textures, generated locally (no downloaded assets).
 * Face grain follows a cone model of growth rings: rings cut by the board
 * surface give the long lines and cathedral arches of flat-sawn boards;
 * end grain shows the ring arcs of each strip. Output is raw RGBA data
 * (colour in sRGB; data texture with R = height, G = roughness).
 */

export interface StripLayout {
  species: WoodSpecies;
  /** Start / end of the strip across the texture height, in metres. */
  v0: number;
  v1: number;
}

export interface WoodTextureRequest {
  kind: 'face' | 'end';
  /** Physical size covered by the texture (metres): u along the grain (face) or across (end). */
  spanU: number;
  spanV: number;
  widthPx: number;
  heightPx: number;
  strips: StripLayout[];
  seed: number;
  /** End-grain blocks (checker) instead of long grain on the face. */
  endGrainFace?: boolean;
  blockLength?: number;
}

export interface WoodPixels {
  color: Uint8Array;
  data: Uint8Array;
  width: number;
  height: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Fast hashed 2D value noise in [0, 1]. */
function makeNoise(seed: number) {
  const perm = new Uint8Array(512);
  const rnd = mulberry32(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j]!, p[i]!];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!;
  const values = new Float32Array(256);
  for (let i = 0; i < 256; i++) values[i] = rnd();
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const a = values[perm[perm[X]! + Y]!]!;
    const b = values[perm[perm[X + 1]! + Y]!]!;
    const c = values[perm[perm[X]! + Y + 1]!]!;
    const d = values[perm[perm[X + 1]! + Y + 1]!]!;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

interface StripParams {
  species: WoodSpecies;
  v0: number;
  v1: number;
  pithW: number;
  pithDepth: number;
  taper: number;
  tone: number;
  phase: number;
  ringScale: number;
  early: [number, number, number];
  late: [number, number, number];
}

function stripParams(strips: StripLayout[], seed: number): StripParams[] {
  const rnd = mulberry32(seed);
  return strips.map((s) => {
    const look = WOOD_LOOK[s.species];
    const width = s.v1 - s.v0;
    const flat = rnd() < 0.7;
    return {
      species: s.species,
      v0: s.v0,
      v1: s.v1,
      pithW: flat ? width * (0.2 + rnd() * 0.6) : width * (rnd() < 0.5 ? -1.5 : 2.5),
      pithDepth: flat ? 0.02 + rnd() * 0.07 : 0.12 + rnd() * 0.2,
      taper: (rnd() - 0.5) * 0.012,
      tone: (rnd() - 0.5) * 2 * look.toneVariation,
      phase: rnd() * 10,
      ringScale: 0.8 + rnd() * 0.45,
      early: hexToRgb(look.early),
      late: hexToRgb(look.late),
    };
  });
}

function stripAt(params: StripParams[], v: number): StripParams {
  for (const s of params) if (v < s.v1) return s;
  return params[params.length - 1]!;
}

/**
 * Generates texture pixels. `yieldEvery` rows the generator awaits a macrotask
 * so the page stays responsive on slower phones.
 */
export async function generateWoodPixels(req: WoodTextureRequest, yieldEvery = 48): Promise<WoodPixels> {
  const { widthPx: W, heightPx: H } = req;
  const color = new Uint8Array(W * H * 4);
  const data = new Uint8Array(W * H * 4);
  const params = stripParams(req.strips, req.seed);
  const n1 = makeNoise(req.seed + 1);
  const n2 = makeNoise(req.seed + 2);
  const n3 = makeNoise(req.seed + 3);
  const du = req.spanU / W;
  const dv = req.spanV / H;

  for (let py = 0; py < H; py++) {
    const v = (py + 0.5) * dv;
    const s = stripAt(params, v);
    const look = WOOD_LOOK[s.species];
    const local = v - s.v0;
    const stripW = s.v1 - s.v0;
    const nearSeam = Math.min(local, stripW - local) < dv * 0.9 && params.length > 1;
    for (let px = 0; px < W; px++) {
      const u = (px + 0.5) * du;
      let ring: number;
      let figure: number;
      let blockTone = 0;
      if (req.kind === 'end' || req.endGrainFace) {
        // Cross-section: rings around the pith below/above the strip.
        let bu = u;
        let bv = local;
        if (req.endGrainFace && req.blockLength) {
          const bi = Math.floor(u / req.blockLength);
          bu = u - bi * req.blockLength;
          blockTone = ((bi * 7 + Math.floor(local * 97)) % 5) * 0.012;
          bv = local;
          const cx = req.blockLength * (0.3 + 0.4 * ((bi * 13) % 7) / 7);
          const r = Math.hypot(bu - cx, bv + s.pithDepth * 0.6);
          ring = r * look.ringsPerM * s.ringScale + n1(bu * 90, bv * 90) * 0.6;
        } else {
          const depthBelow = u; // u runs down the thickness for end faces
          const r = Math.hypot(bv - s.pithW, depthBelow + s.pithDepth);
          ring = r * look.ringsPerM * s.ringScale + n1(bv * 60, depthBelow * 60) * 0.5;
        }
        figure = n2(bu * 120, bv * 120);
      } else {
        const warp = (n1(u * 1.6 + s.phase, local * 9) - 0.5) * 0.014 + (n2(u * 7, local * 40) - 0.5) * 0.0025;
        const r = Math.hypot(local - s.pithW + warp, s.pithDepth) - s.taper * u;
        ring = r * look.ringsPerM * s.ringScale + s.phase;
        figure = n3(u * 3.5, local * 22);
      }
      const f = ring - Math.floor(ring);
      let late: number;
      if (look.ringPorous) {
        late = smooth(0.5, 0.78, f) * (1 - smooth(0.9, 1, f));
      } else {
        late = 0.5 + 0.5 * Math.sin(f * Math.PI * 2);
        late = late * late * 0.7;
      }
      const isEnd = req.kind === 'end' || req.endGrainFace;
      // Fine streaks along the grain (pores at this scale).
      const streak = isEnd ? n2(u * 900, local * 900) : n2(u * 22, local * 1100);
      const pore = look.ringPorous ? Math.max(0, streak - 0.62) * 1.6 * (1 - late) : Math.max(0, streak - 0.75) * 0.6;
      // Rays / flecks.
      let fleck = 0;
      if (look.flecks > 0 && !isEnd) {
        const fl = n3(u * 55 + 3.1, local * 380);
        fleck = Math.max(0, fl - 0.82) * 5 * look.flecks;
      }
      const tone = 1 + s.tone + (figure - 0.5) * 0.1 - blockTone - (isEnd ? 0.16 : 0);
      const mixLate = late * (look.ringPorous ? 0.85 : 0.55);
      let r = (s.early[0] + (s.late[0] - s.early[0]) * mixLate) * tone;
      let g = (s.early[1] + (s.late[1] - s.early[1]) * mixLate) * tone;
      let b = (s.early[2] + (s.late[2] - s.early[2]) * mixLate) * tone;
      const dark = 1 - pore * 0.28 - (nearSeam ? 0.22 : 0);
      const light = s.species === 'oak' ? 1 + fleck * 0.18 : 1 - fleck * 0.2;
      r *= dark * light;
      g *= dark * light;
      b *= dark * light;
      const i = (py * W + px) * 4;
      color[i] = clamp255(r);
      color[i + 1] = clamp255(g);
      color[i + 2] = clamp255(b);
      color[i + 3] = 255;
      // R: height (latewood and pores slightly lower), G: roughness.
      const height = 0.62 - late * 0.12 - pore * 0.35 - (nearSeam ? 0.2 : 0);
      const rough = look.roughness + pore * 0.25 + (isEnd ? 0.12 : 0) - late * 0.04;
      data[i] = clamp255(height * 255);
      data[i + 1] = clamp255(rough * 255);
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    if (yieldEvery > 0 && py % yieldEvery === yieldEvery - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  return { color, data, width: W, height: H };
}

function smooth(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/** Plank layout across a table top: widths 8–14 cm, deterministic per seed. */
export function plankStrips(species: WoodSpecies, spanV: number, seed: number): StripLayout[] {
  const rnd = mulberry32(seed ^ 0x51ed);
  const strips: StripLayout[] = [];
  let v = 0;
  while (v < spanV - 1e-6) {
    const w = 0.08 + rnd() * 0.06;
    const v1 = Math.min(spanV, v + w);
    strips.push({ species, v0: v, v1 });
    v = v1;
  }
  return strips;
}
