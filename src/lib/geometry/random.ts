/** Deterministic PRNG (mulberry32). Same seed → same sequence, on every render. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1D value noise in [0, 1] sampled from a seeded lattice. */
export function valueNoise1D(seed: number, latticeCount = 32): (t: number) => number {
  const rnd = mulberry32(seed);
  const lattice = Array.from({ length: latticeCount + 1 }, () => rnd());
  return (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * latticeCount;
    const i = Math.min(Math.floor(x), latticeCount - 1);
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return lattice[i]! * (1 - s) + lattice[i + 1]! * s;
  };
}
