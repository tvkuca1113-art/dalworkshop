import type { Availability } from './status';
import type { WoodSpecies } from './woods';
import type { Range } from './table';

/**
 * Cutting / serving board catalog. A separate model with its own rules —
 * not a scaled-down table.
 */

export const BOARD_MODEL_IDS = [
  'dal-maple-beech-board',
  'dal-handled-board',
  'dal-two-wood-board',
  'custom-rounded',
  'custom-round',
  'custom-paddle',
] as const;
export type BoardModelId = (typeof BOARD_MODEL_IDS)[number];

export const BOARD_SHAPE_IDS = ['rectangle', 'rounded_rectangle', 'circle', 'paddle'] as const;
export type BoardShapeId = (typeof BOARD_SHAPE_IDS)[number];

export const BOARD_PURPOSE_IDS = ['cutting', 'serving', 'both'] as const;
export type BoardPurposeId = (typeof BOARD_PURPOSE_IDS)[number];

export const BOARD_CONSTRUCTION_IDS = [
  'maple_beech_strips',
  'walnut_ash',
  'oak',
  'walnut',
  'ash',
  'end_grain_checker',
] as const;
export type BoardConstructionId = (typeof BOARD_CONSTRUCTION_IDS)[number];

export const BOARD_EDGE_IDS = ['eased', 'rounded'] as const;
export type BoardEdgeId = (typeof BOARD_EDGE_IDS)[number];

export const BOARD_GROOVE_IDS = ['none', 'end_slots', 'perimeter_channel'] as const;
export type BoardGrooveId = (typeof BOARD_GROOVE_IDS)[number];

export const BOARD_HANDLE_IDS = ['none', 'metal_pair', 'integrated'] as const;
export type BoardHandleId = (typeof BOARD_HANDLE_IDS)[number];

export const BOARD_FINISH_IDS = ['workshop', 'oil_wax', 'mineral_oil'] as const;
export type BoardFinishId = (typeof BOARD_FINISH_IDS)[number];

export const ENGRAVING_FONT_IDS = ['serif', 'sans', 'script'] as const;
export type EngravingFontId = (typeof ENGRAVING_FONT_IDS)[number];

export const ENGRAVING_PLACEMENT_IDS = ['corner', 'center', 'back'] as const;
export type EngravingPlacementId = (typeof ENGRAVING_PLACEMENT_IDS)[number];

export interface BoardModelOption {
  id: BoardModelId;
  label: string;
  status: Availability;
  shape: BoardShapeId;
  description: string;
  photo?: string;
  source?: string;
  /** Dimensions of observed boards were not published; defaults are estimates. */
  dimensionsEstimated: boolean;
  defaults: {
    constructionId: BoardConstructionId;
    grooveId: BoardGrooveId;
    handleId: BoardHandleId;
    edgeId: BoardEdgeId;
    purposeId: BoardPurposeId;
    lengthMm: number;
    widthMm: number;
    thicknessMm: number;
  };
}

export interface StripSpec {
  species: WoodSpecies;
  /** Relative width (all strips of a construction sum to 1). */
  share: number;
}

export interface ConstructionOption {
  id: BoardConstructionId;
  label: string;
  status: Availability;
  description: string;
  /** Long-grain strips across the width (from back edge to front edge). */
  strips: readonly StripSpec[];
  /** End-grain blocks instead of long-grain strips. */
  endGrain?: boolean;
  /** Hidden unless the feature flag is enabled. */
  featureFlag?: 'endGrain';
}

export interface SimpleOption<Id extends string> {
  id: Id;
  label: string;
  status: Availability;
  description: string;
}

export const BOARD_MODELS: readonly BoardModelOption[] = [
  {
    id: 'dal-maple-beech-board',
    label: 'Javor i bukva s utorima',
    status: 'observed_example',
    shape: 'rectangle',
    description: 'Uzdužne trake javora i bukve, zasebni utori uz kraće strane.',
    photo: '/originals/daska-javor-bukva.jpg',
    source: 'https://www.instagram.com/p/DQ4n6NAjKE4/',
    dimensionsEstimated: true,
    defaults: {
      constructionId: 'maple_beech_strips',
      grooveId: 'end_slots',
      handleId: 'none',
      edgeId: 'eased',
      purposeId: 'cutting',
      lengthMm: 450,
      widthMm: 280,
      thicknessMm: 40,
    },
  },
  {
    id: 'dal-handled-board',
    label: 'Daska s crnim ručkama',
    status: 'observed_example',
    shape: 'rectangle',
    description: 'Pravougaona daska s dvije crne metalne ručke na gornjoj strani.',
    photo: '/originals/daske-rucni-rad.jpg',
    source: 'https://www.instagram.com/p/DQ5NcRXDKRH/',
    dimensionsEstimated: true,
    defaults: {
      constructionId: 'oak',
      grooveId: 'none',
      handleId: 'metal_pair',
      edgeId: 'eased',
      purposeId: 'serving',
      lengthMm: 480,
      widthMm: 250,
      thicknessMm: 25,
    },
  },
  {
    id: 'dal-two-wood-board',
    label: 'Daska od dvije vrste drveta',
    status: 'observed_example',
    shape: 'rectangle',
    description: 'Jednostavna pravougaona daska sa svijetlim i tamnim trakama.',
    photo: '/originals/daske-orah-jasen.jpg',
    source: 'https://www.instagram.com/p/DRSbYiljPqC/',
    dimensionsEstimated: true,
    defaults: {
      constructionId: 'walnut_ash',
      grooveId: 'none',
      handleId: 'none',
      edgeId: 'eased',
      purposeId: 'both',
      lengthMm: 400,
      widthMm: 310,
      thicknessMm: 25,
    },
  },
  {
    id: 'custom-rounded',
    label: 'Zaobljeni uglovi',
    status: 'proposed_custom',
    shape: 'rounded_rectangle',
    description: 'Pravougaona daska sa zaobljenim uglovima.',
    dimensionsEstimated: false,
    defaults: {
      constructionId: 'oak',
      grooveId: 'none',
      handleId: 'none',
      edgeId: 'rounded',
      purposeId: 'serving',
      lengthMm: 450,
      widthMm: 250,
      thicknessMm: 25,
    },
  },
  {
    id: 'custom-round',
    label: 'Okrugla daska',
    status: 'proposed_custom',
    shape: 'circle',
    description: 'Okrugla daska za serviranje.',
    dimensionsEstimated: false,
    defaults: {
      constructionId: 'walnut',
      grooveId: 'none',
      handleId: 'none',
      edgeId: 'rounded',
      purposeId: 'serving',
      lengthMm: 320,
      widthMm: 320,
      thicknessMm: 25,
    },
  },
  {
    id: 'custom-paddle',
    label: 'Daska s drvenom drškom',
    status: 'proposed_custom',
    shape: 'paddle',
    description: 'Daska s drškom iz istog komada i rupom za vješanje.',
    dimensionsEstimated: false,
    defaults: {
      constructionId: 'oak',
      grooveId: 'none',
      handleId: 'integrated',
      edgeId: 'rounded',
      purposeId: 'serving',
      lengthMm: 500,
      widthMm: 200,
      thicknessMm: 20,
    },
  },
];

export const BOARD_CONSTRUCTIONS: readonly ConstructionOption[] = [
  {
    id: 'maple_beech_strips',
    label: 'Javor i bukva, uzdužne trake',
    status: 'observed_example',
    description: 'Svijetle uzdužne trake i prirodan kontrast. Kombinacija našeg izvornog modela.',
    strips: [
      { species: 'maple', share: 0.164 },
      { species: 'beech', share: 0.079 },
      { species: 'maple', share: 0.157 },
      { species: 'beech', share: 0.093 },
      { species: 'maple', share: 0.207 },
      { species: 'beech', share: 0.107 },
      { species: 'maple', share: 0.193 },
    ],
  },
  {
    id: 'walnut_ash',
    label: 'Orah i jasen',
    status: 'requires_confirmation',
    description: 'Kontrast tamnijih i svjetlijih traka. Predloženi sastav dogovaramo s radionicom.',
    strips: [
      { species: 'ash', share: 0.135 },
      { species: 'ash', share: 0.135 },
      { species: 'walnut', share: 0.18 },
      { species: 'walnut', share: 0.18 },
      { species: 'walnut', share: 0.19 },
      { species: 'walnut', share: 0.18 },
    ],
  },
  {
    id: 'oak',
    label: 'Hrast',
    status: 'proposed_custom',
    description: 'Topla nijansa i izražena vlakna. Hrast je prijedlog za vaš model.',
    strips: [
      { species: 'oak', share: 0.34 },
      { species: 'oak', share: 0.33 },
      { species: 'oak', share: 0.33 },
    ],
  },
  {
    id: 'walnut',
    label: 'Orah',
    status: 'proposed_custom',
    description: 'Puno drvo oraha, tamnije nijanse.',
    strips: [
      { species: 'walnut', share: 0.5 },
      { species: 'walnut', share: 0.5 },
    ],
  },
  {
    id: 'ash',
    label: 'Jasen',
    status: 'proposed_custom',
    description: 'Svijetlo drvo s izraženim šarama.',
    strips: [
      { species: 'ash', share: 0.5 },
      { species: 'ash', share: 0.5 },
    ],
  },
  {
    id: 'end_grain_checker',
    label: 'Kockasti end-grain',
    status: 'requires_confirmation',
    description: 'Poprečno vlakno u kockama. Nije postojeći DAL proizvod — potrebna potvrda.',
    strips: [
      { species: 'walnut', share: 0.5 },
      { species: 'maple', share: 0.5 },
    ],
    endGrain: true,
    featureFlag: 'endGrain',
  },
];

export const BOARD_EDGES: readonly (SimpleOption<BoardEdgeId> & { profileMm: number; segments: number })[] = [
  { id: 'eased', label: 'Blago oborena ivica', status: 'observed_example', description: 'Čista linija s blagim prelazom na rub.', profileMm: 2, segments: 1 },
  { id: 'rounded', label: 'Zaobljena ivica', status: 'proposed_custom', description: 'Mekši rub, radijus 5 mm.', profileMm: 5, segments: 5 },
];

export const BOARD_GROOVES: readonly (SimpleOption<BoardGrooveId> & { shapes: readonly BoardShapeId[] })[] = [
  { id: 'none', label: 'Bez utora', status: 'observed_example', description: 'Ravna gornja ploha.', shapes: ['rectangle', 'rounded_rectangle', 'circle', 'paddle'] },
  {
    id: 'end_slots',
    label: 'Utori uz krajeve',
    status: 'observed_example',
    description: 'Dva zasebna utora uz kraće strane, kao na dasci od javora i bukve.',
    shapes: ['rectangle', 'rounded_rectangle'],
  },
  {
    id: 'perimeter_channel',
    label: 'Obodni kanal',
    status: 'proposed_custom',
    description: 'Kanal za sokove oko cijele plohe. Prijedlog, nije viđen na DAL dasci.',
    shapes: ['rectangle', 'rounded_rectangle', 'circle', 'paddle'],
  },
];

export const BOARD_HANDLES: readonly (SimpleOption<BoardHandleId> & { shapes: readonly BoardShapeId[] })[] = [
  { id: 'none', label: 'Bez ručki', status: 'observed_example', description: 'Čista ploha bez dodataka.', shapes: ['rectangle', 'rounded_rectangle', 'circle'] },
  {
    id: 'metal_pair',
    label: 'Crne metalne ručke',
    status: 'observed_example',
    description: 'Dvije ručke pričvršćene na gornju stranu uz krajeve, s prostorom za prste.',
    shapes: ['rectangle', 'rounded_rectangle'],
  },
  {
    id: 'integrated',
    label: 'Drvena drška iz istog komada',
    status: 'proposed_custom',
    description: 'Dio oblika daske s drškom; ne može se kombinovati s drugim oblicima.',
    shapes: ['paddle'],
  },
];

export const BOARD_FINISHES: readonly SimpleOption<BoardFinishId>[] = [
  {
    id: 'workshop',
    label: 'Prema preporuci radionice',
    status: 'requires_confirmation',
    description: 'Radionica predlaže završnu obradu uz ponudu.',
  },
  {
    id: 'oil_wax',
    label: 'Ulje i vosak',
    status: 'observed_example',
    description: 'Spomenuto u opisu daske od javora i bukve. Tačan proizvod nije naveden.',
  },
  {
    id: 'mineral_oil',
    label: 'Mineralno ulje',
    status: 'observed_example',
    description: 'Izbor premaza dogovaramo prema namjeni daske.',
  },
];

export const BOARD_PURPOSES: readonly { id: BoardPurposeId; label: string; description: string }[] = [
  { id: 'cutting', label: 'Rezanje', description: 'Svakodnevni rad nožem.' },
  { id: 'serving', label: 'Serviranje', description: 'Sirevi, meze, kruh.' },
  { id: 'both', label: 'Rezanje i serviranje', description: 'Jedna daska za oboje.' },
];

export const ENGRAVING_FONTS: readonly { id: EngravingFontId; label: string; cssVar: string; weight: number }[] = [
  { id: 'serif', label: 'Klasični serif', cssVar: '--font-serif', weight: 600 },
  { id: 'sans', label: 'Jednostavni sans', cssVar: '--font-sans', weight: 600 },
  { id: 'script', label: 'Rukopis', cssVar: '--font-script', weight: 400 },
];

export const ENGRAVING_PLACEMENTS: readonly { id: EngravingPlacementId; label: string; description: string }[] = [
  { id: 'corner', label: 'Ugao (gore)', description: 'Donji desni ugao gornje plohe.' },
  { id: 'center', label: 'Sredina (gore)', description: 'Sredina gornje plohe.' },
  { id: 'back', label: 'Poleđina', description: 'Sredina donje strane — ne smeta pri rezanju.' },
];

export const PERSONALIZATION = {
  availability: 'requires_confirmation' as Availability,
  title: 'Personalizacija po dogovoru',
  maxChars: 40,
  maxLines: 2,
  sizeRangeMm: [6, 30] as Range,
  defaultSizeMm: 12,
  copy: 'Personalizacija je želja kupca, ne potvrđena usluga. Finalno mjesto i način izrade (gravura ili drugo) potvrđuje radionica uz ponudu.',
} as const;

export const BOARD_RANGES = {
  length: [250, 800] as Range,
  width: [150, 400] as Range,
  diameter: [200, 400] as Range,
  thickness: [15, 40] as Range,
} as const;

export const BOARD_STEPS = { length: 10, width: 10, diameter: 10, thickness: 5 } as const;

/** Development geometry rules (not production tolerances). */
export const BOARD_RULES = {
  /** Integrated paddle handle length included in the total length (mm). */
  paddleHandleLengthMm: 110,
  paddleHandleWidthMm: 42,
  paddleHoleDiameterMm: 14,
  /** Minimal usable surface length on a paddle board (mm). */
  paddleMinUsableMm: 190,
  /** Groove geometry. */
  slotWidthMm: 12,
  slotEndInsetMm: 32,
  slotSideMarginMm: 30,
  slotLengthShare: 0.62,
  channelInsetMm: 20,
  channelWidthMm: 10,
  /** At least this share of the thickness must remain under a groove. */
  minRemainingShare: 0.65,
  maxGrooveDepthMm: 6,
  minThicknessForGroovesMm: 18,
  /** Metal handles. */
  handleEndInsetMm: 38,
  handleBarDiameterMm: 10,
  handleClearanceMm: 30,
  handleFootDiameterMm: 16,
  /** Standard hole spacings for bow handles (mm). */
  handleSpacingsMm: [128, 160, 192] as readonly number[],
  handleSideMarginMm: 40,
  /** Engraving keeps this distance from edges and features (mm). */
  engravingEdgeMarginMm: 15,
  engravingFeatureClearanceMm: 10,
} as const;

export const PUBLISHED_BOARD_PRICES = {
  source: 'https://www.instagram.com/p/DdYy3NSsTMl/',
  reviewedOn: '2026-10-09',
  validNowConfirmed: false,
  exactModelConfirmed: false,
  thicknessConfirmed: false,
  extrasConfirmed: false,
  appliesToConfigurator: false,
  prices: [
    { lengthMm: 500, widthMm: 200, fening: 2500 },
    { lengthMm: 600, widthMm: 200, fening: 3500 },
    { lengthMm: 800, widthMm: 200, fening: 5000 },
  ],
} as const;

export function boardModel(id: BoardModelId): BoardModelOption {
  return BOARD_MODELS.find((m) => m.id === id)!;
}
export function construction(id: BoardConstructionId): ConstructionOption {
  return BOARD_CONSTRUCTIONS.find((c) => c.id === id)!;
}
export function boardEdge(id: BoardEdgeId) {
  return BOARD_EDGES.find((c) => c.id === id)!;
}
export function boardGroove(id: BoardGrooveId) {
  return BOARD_GROOVES.find((c) => c.id === id)!;
}
export function boardHandle(id: BoardHandleId) {
  return BOARD_HANDLES.find((c) => c.id === id)!;
}
export function boardFinish(id: BoardFinishId) {
  return BOARD_FINISHES.find((c) => c.id === id)!;
}
export function boardPurpose(id: BoardPurposeId) {
  return BOARD_PURPOSES.find((c) => c.id === id)!;
}
export function engravingFont(id: EngravingFontId) {
  return ENGRAVING_FONTS.find((c) => c.id === id)!;
}
export function engravingPlacement(id: EngravingPlacementId) {
  return ENGRAVING_PLACEMENTS.find((c) => c.id === id)!;
}
