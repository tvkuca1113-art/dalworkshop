import type { Availability } from './status';
import type { WoodSpecies } from './woods';

/**
 * Table catalog. All option ids, labels, statuses and development ranges live
 * here. Ranges are development proposals, NOT manufacturer-approved limits
 * (see docs/reference/CATALOG-SEED.json → developmentProposals).
 */

export const TABLE_SHAPE_IDS = ['rectangle', 'rounded_rectangle', 'oval', 'circle', 'natural_edge'] as const;
export type TableShapeId = (typeof TABLE_SHAPE_IDS)[number];

export const TABLE_WOOD_IDS = ['oak', 'walnut', 'ash'] as const;
export type TableWoodId = (typeof TABLE_WOOD_IDS)[number];

export const TABLE_EDGE_IDS = ['straight', 'rounded'] as const;
export type TableEdgeId = (typeof TABLE_EDGE_IDS)[number];

export const TABLE_BASE_IDS = ['trapezoid_pair', 'u_frame_pair', 'x_frame_pair', 'a_frame_pair', 'wood_tapered_four', 'wood_panel_pair', 'central_pedestal'] as const;
export type TableBaseId = (typeof TABLE_BASE_IDS)[number];

export const TABLE_FINISH_IDS = ['natural', 'lighter', 'warmer', 'darker'] as const;
export type TableFinishId = (typeof TABLE_FINISH_IDS)[number];

export const TABLE_MODEL_IDS = ['dal-oak-table-150-70', 'custom'] as const;
export type TableModelId = (typeof TABLE_MODEL_IDS)[number];

export type Range = readonly [min: number, max: number];

export interface ShapeOption {
  id: TableShapeId;
  label: string;
  short: string;
  status: Availability;
  description: string;
  /** Which dimension fields the shape uses. */
  dims: 'length_width' | 'diameter';
  /** Corner radius in the plan view (mm) for rectangular shapes. */
  cornerRadiusMm?: number;
}

export interface WoodOption {
  id: TableWoodId;
  species: WoodSpecies;
  label: string;
  status: Availability;
  description: string;
}

export interface EdgeOption {
  id: TableEdgeId;
  label: string;
  status: Availability;
  description: string;
  /** Edge profile radius / chamfer (mm). */
  profileMm: number;
  /** 1 = chamfer, >1 = rounded quarter profile. */
  segments: number;
}

export interface BaseOption {
  id: TableBaseId;
  label: string;
  status: Availability;
  description: string;
  /** Steel profile: in-plane face width × depth along the table (mm). */
  profileMm: { face: number; depth: number };
  shapes: readonly TableShapeId[];
  material?: 'wood' | 'metal';
}

export interface FinishOption {
  id: TableFinishId;
  label: string;
  status: Availability;
  /** Multiplier applied to the wood colour (linear RGB), null = natural. */
  tint: readonly [number, number, number] | null;
  swatch: string;
}

export const TABLE_SHAPES: readonly ShapeOption[] = [
  {
    id: 'rectangle',
    label: 'Pravougaoni',
    short: 'Pravougaoni',
    status: 'observed_example',
    description: 'Jasne linije i puna korisna ploha. Za svakodnevne obroke i okupljanja.',
    dims: 'length_width',
    cornerRadiusMm: 6,
  },
  {
    id: 'rounded_rectangle',
    label: 'Pravougaoni sa zaobljenim uglovima',
    short: 'Zaobljeni uglovi',
    status: 'proposed_custom',
    description: 'Poznati pravougaoni oblik s mekšim, zaobljenim uglovima.',
    dims: 'length_width',
    cornerRadiusMm: 90,
  },
  {
    id: 'oval',
    label: 'Ovalni (elipsa)',
    short: 'Ovalni',
    status: 'requires_confirmation',
    description: 'Meke linije i otvoreniji prolaz oko stola. Oblik dogovaramo prema prostoru.',
    dims: 'length_width',
  },
  {
    id: 'circle',
    label: 'Okrugli',
    short: 'Okrugli',
    status: 'requires_confirmation',
    description: 'Mjesto za razgovor licem u lice. Centralno postolje ostavlja otvoren rub ploče.',
    dims: 'diameter',
  },
  {
    id: 'natural_edge',
    label: 'Prirodna ivica',
    short: 'Prirodna ivica',
    status: 'requires_confirmation',
    description:
      'Duže strane prate prirodan rub drveta. Širina je procjena: rub varira duž stola, a konačni obris zavisi od izabranih komada drveta.',
    dims: 'length_width',
    cornerRadiusMm: 4,
  },
];

export const TABLE_WOODS: readonly WoodOption[] = [
  {
    id: 'oak',
    species: 'oak',
    label: 'Hrast',
    status: 'observed_example',
    description: 'Tople zlatne nijanse i izraženi godovi. Karakter našeg izvornog stola.',
  },
  {
    id: 'walnut',
    species: 'walnut',
    label: 'Orah',
    status: 'proposed_custom',
    description: 'Duboke smeđe nijanse i mirniji kontrast. Za izražajan, topao prostor.',
  },
  {
    id: 'ash',
    species: 'ash',
    label: 'Jasen',
    status: 'proposed_custom',
    description: 'Svijetle nijanse i jasna vlakna. Lagan vizuelni dojam u prostoru.',
  },
];

export const TABLE_EDGES: readonly EdgeOption[] = [
  {
    id: 'straight',
    label: 'Ravna ivica',
    status: 'observed_example',
    description: 'Čista linija ploče, s blago oborenim rubom. Naglašava debljinu drveta.',
    profileMm: 2,
    segments: 1,
  },
  {
    id: 'rounded',
    label: 'Zaobljena ivica',
    status: 'proposed_custom',
    description: 'Mekši prelaz plohe u rub. Detalj koji ćete osjetiti pod rukom.',
    profileMm: 8,
    segments: 6,
  },
];

export const TABLE_BASES: readonly BaseOption[] = [
  {
    id: 'trapezoid_pair',
    label: 'Crni trapezni okviri',
    status: 'observed_example',
    description: 'Blago kosi okviri i čista crna linija. Postolje izvornog DAL stola.',
    profileMm: { face: 40, depth: 60 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'u_frame_pair',
    label: 'U metalni nosači',
    status: 'proposed_custom',
    description: 'Dva okvira u obliku obrnutog slova U, s ravnim nogama.',
    profileMm: { face: 40, depth: 80 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'x_frame_pair',
    label: 'X metalni nosači',
    status: 'proposed_custom',
    description: 'Dva ukrštena X nosača s gornjom montažnom šinom.',
    profileMm: { face: 40, depth: 40 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'a_frame_pair',
    label: 'A metalni nosači',
    status: 'proposed_custom',
    description: 'Kose noge s poprečnom vezom. Naglašen, arhitektonski izgled.',
    profileMm: { face: 40, depth: 60 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'wood_tapered_four',
    label: 'Četiri drvene noge',
    status: 'proposed_custom',
    description: 'Blago sužene noge u drvetu ploče. Topao, miran izgled.',
    material: 'wood',
    profileMm: { face: 65, depth: 65 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'wood_panel_pair',
    label: 'Puni drveni nosači',
    status: 'proposed_custom',
    description: 'Dvije pune drvene plohe. Skulpturalan karakter masivnog drveta.',
    material: 'wood',
    profileMm: { face: 55, depth: 55 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'natural_edge'],
  },
  {
    id: 'central_pedestal',
    label: 'Centralno postolje',
    status: 'requires_confirmation',
    description: 'Jedan stub s pločom na podu. Za okrugle i kraće ploče.',
    profileMm: { face: 90, depth: 90 },
    shapes: ['rectangle', 'rounded_rectangle', 'oval', 'circle'],
  },
];

/** A displayed proposal stays valid while the customer asks the workshop to advise. */
export const TABLE_UNCERTAIN_KEYS = ['shape', 'wood', 'length', 'width', 'diameter', 'topThickness', 'totalHeight', 'edge', 'base', 'finish'] as const;

export const TABLE_FINISHES: readonly FinishOption[] = [
  { id: 'natural', label: 'Prirodan izgled', status: 'requires_confirmation', tint: null, swatch: '#b98d5c' },
  { id: 'lighter', label: 'Svjetlija nijansa', status: 'requires_confirmation', tint: [1.12, 1.1, 1.06], swatch: '#cfab7f' },
  { id: 'warmer', label: 'Toplija nijansa', status: 'requires_confirmation', tint: [1.04, 0.9, 0.74], swatch: '#b27f4f' },
  { id: 'darker', label: 'Tamnija nijansa', status: 'requires_confirmation', tint: [0.68, 0.6, 0.54], swatch: '#7f5d3e' },
];

export const FINISH_DISCLAIMER =
  'Nijansa je vizuelni prijedlog. Vrstu premaza i završnu obradu stola potvrđuje radionica uz ponudu.';

/** Development ranges in mm. Centralised; never hardcode in components. */
export const TABLE_RANGES = {
  length: { rectangle: [1200, 2800], rounded_rectangle: [1200, 2800], natural_edge: [1200, 2800], oval: [1400, 2600] },
  width: { rectangle: [600, 1100], rounded_rectangle: [600, 1100], natural_edge: [600, 1100], oval: [800, 1100] },
  diameter: [800, 1500] as Range,
  topThickness: [25, 50] as Range,
  totalHeight: [720, 780] as Range,
} as const satisfies {
  length: Record<Exclude<TableShapeId, 'circle'>, Range>;
  width: Record<Exclude<TableShapeId, 'circle'>, Range>;
  diameter: Range;
  topThickness: Range;
  totalHeight: Range;
};

/** Step used by the +/- controls (mm). */
export const TABLE_STEPS = { length: 50, width: 50, diameter: 50, topThickness: 5, totalHeight: 10 } as const;

/** Construction rules for the visual proposal. Not a structural calculation. */
export const TABLE_RULES = {
  /** Central pedestal is proposed only for shorter tops. */
  pedestalMaxLengthMm: 1600,
  /** Minimal distance between a frame and the edge of the top (plan view). */
  frameEdgeMarginMm: 50,
  /** Natural edge: maximal inward deviation of each long side (mm). */
  naturalEdgeMaxDeviationMm: 45,
  /** Height suggested for the published table (not confirmed by DAL). */
  suggestedHeightMm: 750,
} as const;

export const OBSERVED_TABLE = {
  id: 'dal-oak-table-150-70',
  title: 'Hrastov stol 150 × 70 cm',
  source: 'https://www.instagram.com/p/DdZfSIajC34/',
  photos: ['/originals/stol-hrast.jpg', '/originals/stol-hrast-02.jpg', '/originals/stol-hrast-03.jpg'],
  facts: [
    'Hrast, pravougaona ploča 150 × 70 cm',
    'Debljina ploče 3,5 cm',
    'Dva crna metalna okvira blago trapeznog oblika',
  ],
  note: 'Opis spominje „blagu nijansu brijesta“ — to je opis nijanse, ne potvrda druge vrste drveta. Visina stola nije objavljena.',
} as const;

export function shapeOption(id: TableShapeId): ShapeOption {
  return TABLE_SHAPES.find((s) => s.id === id)!;
}
export function woodOption(id: TableWoodId): WoodOption {
  return TABLE_WOODS.find((s) => s.id === id)!;
}
export function edgeOption(id: TableEdgeId): EdgeOption {
  return TABLE_EDGES.find((s) => s.id === id)!;
}
export function baseOption(id: TableBaseId): BaseOption {
  return TABLE_BASES.find((s) => s.id === id)!;
}
export function finishOption(id: TableFinishId): FinishOption {
  return TABLE_FINISHES.find((s) => s.id === id)!;
}
