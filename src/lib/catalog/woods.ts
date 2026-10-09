/**
 * Wood species used by the procedural textures. The palette values are a
 * visual approximation (sRGB) tuned against the DAL photos; they are not a
 * colour promise for a specific board of wood.
 */
export const WOOD_SPECIES = ['oak', 'walnut', 'ash', 'maple', 'beech'] as const;
export type WoodSpecies = (typeof WOOD_SPECIES)[number];

export interface WoodLook {
  label: string;
  /** Base, earlywood and latewood colours (sRGB hex). */
  base: string;
  early: string;
  late: string;
  /** Ring-porous species show pronounced pores and latewood bands. */
  ringPorous: boolean;
  /** Approximate growth rings per metre of radius. */
  ringsPerM: number;
  /** Strength of rays / flecks (oak rays, beech flecks). */
  flecks: number;
  /** Plank-to-plank tone variation (0..1). */
  toneVariation: number;
  /** Satin finish roughness used for the wood material. */
  roughness: number;
}

export const WOOD_LOOK: Record<WoodSpecies, WoodLook> = {
  oak: {
    label: 'Hrast',
    base: '#b98d5c',
    early: '#c99d68',
    late: '#91673f',
    ringPorous: true,
    ringsPerM: 260,
    flecks: 0.35,
    toneVariation: 0.16,
    roughness: 0.58,
  },
  walnut: {
    label: 'Orah',
    base: '#6f4c35',
    early: '#7d5940',
    late: '#4d3222',
    ringPorous: false,
    ringsPerM: 220,
    flecks: 0.05,
    toneVariation: 0.2,
    roughness: 0.55,
  },
  ash: {
    label: 'Jasen',
    base: '#d6c09b',
    early: '#e1cda9',
    late: '#ae8f63',
    ringPorous: true,
    ringsPerM: 200,
    flecks: 0.05,
    toneVariation: 0.1,
    roughness: 0.6,
  },
  maple: {
    label: 'Javor',
    base: '#dcc59a',
    early: '#e0cba1',
    late: '#c4a676',
    ringPorous: false,
    ringsPerM: 300,
    flecks: 0.08,
    toneVariation: 0.07,
    roughness: 0.6,
  },
  beech: {
    label: 'Bukva',
    base: '#c3956a',
    early: '#c99c70',
    late: '#a8764d',
    ringPorous: false,
    ringsPerM: 280,
    flecks: 0.45,
    toneVariation: 0.08,
    roughness: 0.6,
  },
};
