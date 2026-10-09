import { z } from 'zod';
import {
  TABLE_BASE_IDS,
  TABLE_EDGE_IDS,
  TABLE_FINISH_IDS,
  TABLE_MODEL_IDS,
  TABLE_SHAPE_IDS,
  TABLE_WOOD_IDS,
} from '../catalog/table';
import {
  BOARD_CONSTRUCTION_IDS,
  BOARD_EDGE_IDS,
  BOARD_FINISH_IDS,
  BOARD_GROOVE_IDS,
  BOARD_HANDLE_IDS,
  BOARD_MODEL_IDS,
  BOARD_PURPOSE_IDS,
  ENGRAVING_FONT_IDS,
  ENGRAVING_PLACEMENT_IDS,
} from '../catalog/board';

export const SCHEMA_VERSION = 1 as const;

/** Sanity limit for any dimension in mm (independent of catalog ranges). */
const MAX_MM = 10_000;

const mm = z.number().int().positive().max(MAX_MM);
const seed = z.number().int().min(0).max(0xffffffff);

/** Customer note / special request. Personal text: excluded from public links by default. */
export const NOTE_MAX = 300;

export const tableConfigSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    productType: z.literal('table'),
    modelId: z.enum(TABLE_MODEL_IDS),
    shapeId: z.enum(TABLE_SHAPE_IDS),
    woodId: z.enum(TABLE_WOOD_IDS),
    dimensionsMm: z
      .object({
        length: mm,
        width: mm,
        diameter: mm,
        topThickness: mm,
        totalHeight: mm,
      })
      .strict(),
    edgeId: z.enum(TABLE_EDGE_IDS),
    baseId: z.enum(TABLE_BASE_IDS),
    finishId: z.enum(TABLE_FINISH_IDS),
    seed,
    note: z.string().max(NOTE_MAX),
  })
  .strict();

export const personalizationSchema = z
  .object({
    enabled: z.boolean(),
    /** Kept exactly as typed (no silent corrections). "\n" separates lines. */
    text: z.string().max(80),
    fontId: z.enum(ENGRAVING_FONT_IDS),
    placement: z.enum(ENGRAVING_PLACEMENT_IDS),
    sizeMm: mm,
  })
  .strict();

export const boardConfigSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    productType: z.literal('board'),
    modelId: z.enum(BOARD_MODEL_IDS),
    purposeId: z.enum(BOARD_PURPOSE_IDS),
    constructionId: z.enum(BOARD_CONSTRUCTION_IDS),
    dimensionsMm: z
      .object({
        length: mm,
        width: mm,
        diameter: mm,
        thickness: mm,
      })
      .strict(),
    edgeId: z.enum(BOARD_EDGE_IDS),
    grooveId: z.enum(BOARD_GROOVE_IDS),
    handleId: z.enum(BOARD_HANDLE_IDS),
    finishId: z.enum(BOARD_FINISH_IDS),
    personalization: personalizationSchema,
    seed,
    note: z.string().max(NOTE_MAX),
  })
  .strict();

export type TableConfig = z.infer<typeof tableConfigSchema>;
export type BoardConfig = z.infer<typeof boardConfigSchema>;
export type Personalization = z.infer<typeof personalizationSchema>;
export type ProductConfig = TableConfig | BoardConfig;
export type ProductType = ProductConfig['productType'];

export type TableDimensionKey = keyof TableConfig['dimensionsMm'];
export type BoardDimensionKey = keyof BoardConfig['dimensionsMm'];

export const productConfigSchema = z.discriminatedUnion('productType', [tableConfigSchema, boardConfigSchema]);
