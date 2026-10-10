import { boardModel, PERSONALIZATION, type BoardModelId } from '../catalog/board';
import { TABLE_RULES } from '../catalog/table';
import { SCHEMA_VERSION, type BoardConfig, type TableConfig } from './types';

/**
 * Starting table: the published DAL oak table, 150 × 70 cm, 3,5 cm top,
 * black trapezoidal frames. Height 75 cm is a suggestion (not published).
 */
export const DEFAULT_TABLE: TableConfig = Object.freeze({
  schemaVersion: SCHEMA_VERSION,
  productType: 'table',
  modelId: 'dal-oak-table-150-70',
  shapeId: 'rectangle',
  woodId: 'oak',
  dimensionsMm: Object.freeze({
    length: 1500,
    width: 700,
    diameter: 1100,
    topThickness: 35,
    totalHeight: TABLE_RULES.suggestedHeightMm,
  }),
  edgeId: 'straight',
  baseId: 'trapezoid_pair',
  finishId: 'natural',
  seed: 20261009,
  note: '',
}) as TableConfig;

/** Compact round inspiration; its availability is confirmed by the workshop. */
export const ROUND_INSPIRATION_TABLE: TableConfig = {
  ...DEFAULT_TABLE,
  modelId: 'custom',
  shapeId: 'circle',
  woodId: 'walnut',
  edgeId: 'rounded',
  baseId: 'central_pedestal',
  dimensionsMm: { ...DEFAULT_TABLE.dimensionsMm, diameter: 1000 },
};

export function boardFromModel(modelId: BoardModelId, keep?: Partial<Pick<BoardConfig, 'personalization' | 'finishId' | 'seed' | 'note'>>): BoardConfig {
  const model = boardModel(modelId);
  const d = model.defaults;
  return {
    schemaVersion: SCHEMA_VERSION,
    productType: 'board',
    modelId,
    purposeId: d.purposeId,
    constructionId: d.constructionId,
    dimensionsMm: {
      length: d.lengthMm,
      width: d.widthMm,
      diameter: model.shape === 'circle' ? d.lengthMm : 320,
      thickness: d.thicknessMm,
    },
    edgeId: d.edgeId,
    grooveId: d.grooveId,
    handleId: d.handleId,
    finishId: keep?.finishId ?? 'workshop',
    personalization: keep?.personalization ?? {
      enabled: false,
      text: '',
      fontId: 'serif',
      placement: 'corner',
      sizeMm: PERSONALIZATION.defaultSizeMm,
    },
    seed: keep?.seed ?? 1305,
    note: keep?.note ?? '',
  };
}

export const DEFAULT_BOARD: BoardConfig = boardFromModel('dal-maple-beech-board');

export function cloneTable(config: TableConfig): TableConfig {
  return { ...config, dimensionsMm: { ...config.dimensionsMm } };
}

export function cloneBoard(config: BoardConfig): BoardConfig {
  return { ...config, dimensionsMm: { ...config.dimensionsMm }, personalization: { ...config.personalization } };
}
