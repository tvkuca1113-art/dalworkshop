import { boardModel } from '../catalog/board';
import { boardFromModel, DEFAULT_TABLE } from './defaults';
import { boardDimensionKeys, boardIssues, deriveTableModelId, tableDimensionKeys, tableIssues } from './rules';
import {
  boardConfigSchema,
  SCHEMA_VERSION,
  tableConfigSchema,
  type BoardConfig,
  type ProductType,
  type TableConfig,
} from './types';

/**
 * Permalinks. Only whitelisted short keys are accepted; values are parsed
 * strictly and the result is validated with the same schema and rules as
 * the UI. Nothing is evaluated and no asset URL is ever read from a link.
 *
 * Personal text (engraving text, note) is excluded unless the customer
 * explicitly opts in.
 */

export const MAX_QUERY_LENGTH = 1500;

const TABLE_KEYS = ['v', 'sh', 'w', 'l', 'wd', 'd', 't', 'h', 'e', 'b', 'f', 's', 'n', 'u'] as const;
const BOARD_KEYS = ['v', 'm', 'p', 'c', 'l', 'wd', 'd', 't', 'e', 'g', 'hd', 'f', 's', 'pe', 'px', 'pf', 'pp', 'pz', 'n'] as const;
/** Harmless tracking parameters some apps append; ignored, never applied. */
const IGNORED = /^(utm_[a-z]+|fbclid|gclid|igshid)$/;

export type DecodeResult<C> =
  | { status: 'empty' }
  | { status: 'ok'; config: C }
  | { status: 'error'; reason: 'too_long' | 'unknown_version' | 'unknown_param' | 'invalid'; message: string };

export interface EncodeOptions {
  /** Include engraving text and note (personal content). Default false. */
  includePersonalText?: boolean;
}

/* -------------------------------------------------------------- encoding */

export function encodeTable(c: TableConfig, opts: EncodeOptions = {}): string {
  const p = new URLSearchParams();
  p.set('v', String(c.schemaVersion));
  p.set('sh', c.shapeId);
  p.set('w', c.woodId);
  const d = c.dimensionsMm;
  for (const key of tableDimensionKeys(c.shapeId)) {
    const short = { length: 'l', width: 'wd', diameter: 'd', topThickness: 't', totalHeight: 'h' }[key];
    p.set(short, String(d[key]));
  }
  p.set('e', c.edgeId);
  p.set('b', c.baseId);
  p.set('f', c.finishId);
  p.set('s', String(c.seed));
  if (c.uncertain?.length) p.set('u', c.uncertain.join(','));
  if (opts.includePersonalText && c.note) p.set('n', c.note);
  return p.toString();
}

export function encodeBoard(c: BoardConfig, opts: EncodeOptions = {}): string {
  const p = new URLSearchParams();
  p.set('v', String(c.schemaVersion));
  p.set('m', c.modelId);
  p.set('p', c.purposeId);
  p.set('c', c.constructionId);
  const d = c.dimensionsMm;
  for (const key of boardDimensionKeys(c)) {
    const short = { length: 'l', width: 'wd', diameter: 'd', thickness: 't' }[key];
    p.set(short, String(d[key]));
  }
  p.set('e', c.edgeId);
  p.set('g', c.grooveId);
  p.set('hd', c.handleId);
  p.set('f', c.finishId);
  p.set('s', String(c.seed));
  const per = c.personalization;
  if (per.enabled) {
    p.set('pe', '1');
    p.set('pf', per.fontId);
    p.set('pp', per.placement);
    p.set('pz', String(per.sizeMm));
    if (opts.includePersonalText) p.set('px', per.text);
  }
  if (opts.includePersonalText && c.note) p.set('n', c.note);
  return p.toString();
}

export function encodeConfig(c: TableConfig | BoardConfig, opts: EncodeOptions = {}): string {
  return c.productType === 'table' ? encodeTable(c, opts) : encodeBoard(c, opts);
}

export function configPath(type: ProductType): string {
  return type === 'table' ? '/konfigurator/stol' : '/konfigurator/daska';
}

export function permalink(origin: string, c: TableConfig | BoardConfig, opts: EncodeOptions = {}): string {
  return `${origin}${configPath(c.productType)}?${encodeConfig(c, opts)}`;
}

/* -------------------------------------------------------------- decoding */

const INT = /^\d{1,6}$/;
const SEED = /^\d{1,10}$/;

function int(value: string | null, pattern = INT): number | undefined {
  if (value === null || !pattern.test(value)) return undefined;
  return Number(value);
}

function collect(params: URLSearchParams, allowed: readonly string[]): DecodeResult<never> | Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of params) {
    if (IGNORED.test(key)) continue;
    if (!allowed.includes(key)) {
      return { status: 'error', reason: 'unknown_param', message: 'Link sadrži nepoznate podatke pa nije primijenjen.' };
    }
    if (key in out) {
      return { status: 'error', reason: 'invalid', message: 'Link sadrži ponovljene podatke pa nije primijenjen.' };
    }
    out[key] = value;
  }
  return out;
}

function precheck(search: string): DecodeResult<never> | URLSearchParams {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (raw.length > MAX_QUERY_LENGTH) {
    return { status: 'error', reason: 'too_long', message: 'Link je predug pa nije primijenjen.' };
  }
  return new URLSearchParams(raw);
}

function versionCheck(v: string | undefined): DecodeResult<never> | null {
  if (v === undefined) return { status: 'error', reason: 'invalid', message: 'Linku nedostaje verzija konfiguracije.' };
  if (v !== String(SCHEMA_VERSION)) {
    // Migration hook: no older link versions exist yet. Unknown versions get a clear message.
    return {
      status: 'error',
      reason: 'unknown_version',
      message: 'Link je napravljen za drugu verziju konfiguratora. Prikazujemo početnu konfiguraciju.',
    };
  }
  return null;
}

const INVALID = { status: 'error', reason: 'invalid', message: 'Link sadrži neispravne vrijednosti pa nije primijenjen.' } as const;

export function decodeTable(search: string): DecodeResult<TableConfig> {
  const pre = precheck(search);
  if (!(pre instanceof URLSearchParams)) return pre;
  const meaningful = [...pre.keys()].filter((k) => !IGNORED.test(k));
  if (meaningful.length === 0) return { status: 'empty' };
  const raw = collect(pre, TABLE_KEYS);
  if ('status' in raw) return raw as DecodeResult<never>;
  const vErr = versionCheck(raw.v);
  if (vErr) return vErr;

  const base = DEFAULT_TABLE;
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    productType: 'table',
    modelId: 'custom',
    shapeId: raw.sh,
    woodId: raw.w,
    dimensionsMm: {
      length: raw.l !== undefined ? int(raw.l) : base.dimensionsMm.length,
      width: raw.wd !== undefined ? int(raw.wd) : base.dimensionsMm.width,
      diameter: raw.d !== undefined ? int(raw.d) : base.dimensionsMm.diameter,
      topThickness: int(raw.t ?? null),
      totalHeight: int(raw.h ?? null),
    },
    edgeId: raw.e,
    baseId: raw.b,
    finishId: raw.f,
    seed: int(raw.s ?? null, SEED),
    note: raw.n ?? '',
    ...(raw.u !== undefined ? { uncertain: raw.u.split(',') } : {}),
  };
  const parsed = tableConfigSchema.safeParse(candidate);
  if (!parsed.success) return INVALID;
  const config = parsed.data;
  // Fields required by the shape must be present in the link.
  const needs = tableDimensionKeys(config.shapeId).map((k) => ({ length: 'l', width: 'wd', diameter: 'd', topThickness: 't', totalHeight: 'h' })[k]);
  if (needs.some((k) => raw[k] === undefined)) return INVALID;
  if (tableIssues(config).length) return INVALID;
  config.modelId = deriveTableModelId(config);
  return { status: 'ok', config };
}

export function decodeBoard(search: string): DecodeResult<BoardConfig> {
  const pre = precheck(search);
  if (!(pre instanceof URLSearchParams)) return pre;
  const meaningful = [...pre.keys()].filter((k) => !IGNORED.test(k));
  if (meaningful.length === 0) return { status: 'empty' };
  const raw = collect(pre, BOARD_KEYS);
  if ('status' in raw) return raw as DecodeResult<never>;
  const vErr = versionCheck(raw.v);
  if (vErr) return vErr;

  const modelParse = boardConfigSchema.shape.modelId.safeParse(raw.m);
  if (!modelParse.success) return INVALID;
  const defaults = boardFromModel(modelParse.data);
  const enabled = raw.pe === '1';
  if (raw.pe !== undefined && raw.pe !== '1') return INVALID;
  const candidate = {
    schemaVersion: SCHEMA_VERSION,
    productType: 'board',
    modelId: modelParse.data,
    purposeId: raw.p,
    constructionId: raw.c,
    dimensionsMm: {
      length: raw.l !== undefined ? int(raw.l) : defaults.dimensionsMm.length,
      width: raw.wd !== undefined ? int(raw.wd) : defaults.dimensionsMm.width,
      diameter: raw.d !== undefined ? int(raw.d) : defaults.dimensionsMm.diameter,
      thickness: int(raw.t ?? null),
    },
    edgeId: raw.e,
    grooveId: raw.g,
    handleId: raw.hd,
    finishId: raw.f,
    personalization: {
      enabled,
      text: enabled ? (raw.px ?? '') : '',
      fontId: enabled ? raw.pf : defaults.personalization.fontId,
      placement: enabled ? raw.pp : defaults.personalization.placement,
      sizeMm: enabled ? int(raw.pz ?? null) : defaults.personalization.sizeMm,
    },
    seed: int(raw.s ?? null, SEED),
    note: raw.n ?? '',
  };
  const parsed = boardConfigSchema.safeParse(candidate);
  if (!parsed.success) return INVALID;
  const config = parsed.data;
  const shape = boardModel(config.modelId).shape;
  const needs = shape === 'circle' ? ['d', 't'] : ['l', 'wd', 't'];
  if (needs.some((k) => raw[k] === undefined)) return INVALID;
  if (boardIssues(config).length) return INVALID;
  return { status: 'ok', config };
}

export function decodeConfig(type: ProductType, search: string): DecodeResult<TableConfig | BoardConfig> {
  return type === 'table' ? decodeTable(search) : decodeBoard(search);
}
