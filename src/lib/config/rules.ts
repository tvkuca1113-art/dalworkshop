import {
  baseOption,
  shapeOption,
  TABLE_BASES,
  TABLE_RANGES,
  TABLE_RULES,
  type Range,
  type TableBaseId,
  type TableShapeId,
} from '../catalog/table';
import {
  BOARD_CONSTRUCTIONS,
  BOARD_GROOVES,
  BOARD_HANDLES,
  BOARD_RANGES,
  BOARD_RULES,
  boardGroove,
  boardHandle,
  boardModel,
  construction,
  type BoardConstructionId,
  type BoardGrooveId,
  type BoardHandleId,
  type BoardModelId,
} from '../catalog/board';
import { FLAGS } from '../flags';
import { computeBoardLayout, handleSpacingFor } from '../geometry/board-layout';
import { computeTableLayout, tablePlanSize } from '../geometry/table-layout';
import { boardFromModel, cloneBoard, cloneTable } from './defaults';
import { formatCm, inRange } from './units';
import type { BoardConfig, BoardDimensionKey, TableConfig, TableDimensionKey, TableUncertainKey } from './types';

/**
 * Compatibility rules for the visual proposal. They keep the 3D result
 * meaningful; they are not a structural calculation or a load rating.
 * Every automatic adjustment returns a visible notice with an undo.
 */

export interface Notice<C> {
  id: string;
  message: string;
  undo?: C;
}

export interface Issue {
  code: string;
  field?: string;
  message: string;
}

export interface OptionState<Id extends string> {
  id: Id;
  disabled: boolean;
  reason?: string;
}

/* ------------------------------------------------------------------ table */

export function tableDimensionRange(shapeId: TableShapeId, key: TableDimensionKey): Range {
  switch (key) {
    case 'length':
      return shapeId === 'circle' ? TABLE_RANGES.length.rectangle : TABLE_RANGES.length[shapeId];
    case 'width':
      return shapeId === 'circle' ? TABLE_RANGES.width.rectangle : TABLE_RANGES.width[shapeId];
    case 'diameter':
      return TABLE_RANGES.diameter;
    case 'topThickness':
      return TABLE_RANGES.topThickness;
    case 'totalHeight':
      return TABLE_RANGES.totalHeight;
  }
}

export function tableDimensionKeys(shapeId: TableShapeId): TableDimensionKey[] {
  return shapeOption(shapeId).dims === 'diameter'
    ? ['diameter', 'topThickness', 'totalHeight']
    : ['length', 'width', 'topThickness', 'totalHeight'];
}

export function tableBaseStates(config: TableConfig): OptionState<TableBaseId>[] {
  const { length } = tablePlanSize(config);
  return TABLE_BASES.map((b) => {
    if (!b.shapes.includes(config.shapeId)) {
      return {
        id: b.id,
        disabled: true,
        reason:
          config.shapeId === 'circle'
            ? 'Par nosača na krajevima ne odgovara okrugloj ploči; za okrugli stol predlažemo centralno postolje.'
            : 'Centralno postolje nije predviđeno za prirodnu ivicu.',
      };
    }
    if (b.id === 'central_pedestal' && config.shapeId !== 'circle' && length > TABLE_RULES.pedestalMaxLengthMm) {
      return {
        id: b.id,
        disabled: true,
        reason: `Centralno postolje predlažemo za ploče do ${formatCm(TABLE_RULES.pedestalMaxLengthMm)} cm dužine.`,
      };
    }
    return { id: b.id, disabled: false };
  });
}

export function tableIssues(config: TableConfig): Issue[] {
  const issues: Issue[] = [];
  for (const key of tableDimensionKeys(config.shapeId)) {
    const range = tableDimensionRange(config.shapeId, key);
    if (!inRange(config.dimensionsMm[key], range)) {
      issues.push({
        code: 'range',
        field: key,
        message: `Vrijednost je izvan predloženog raspona (${formatCm(range[0])}–${formatCm(range[1])} cm).`,
      });
    }
  }
  for (const i of computeTableLayout(config).issues) issues.push({ code: i.code, message: i.message });
  return issues;
}

export type TablePatch =
  | { type: 'shape'; value: TableShapeId }
  | { type: 'wood'; value: TableConfig['woodId'] }
  | { type: 'edge'; value: TableConfig['edgeId'] }
  | { type: 'base'; value: TableBaseId }
  | { type: 'finish'; value: TableConfig['finishId'] }
  | { type: 'dimension'; key: TableDimensionKey; value: number }
  | { type: 'reseed'; value: number }
  | { type: 'note'; value: string }
  | { type: 'uncertain'; key: TableUncertainKey; value: boolean };

export function deriveTableModelId(c: TableConfig): TableConfig['modelId'] {
  const d = c.dimensionsMm;
  const same =
    c.shapeId === 'rectangle' &&
    c.woodId === 'oak' &&
    d.length === 1500 &&
    d.width === 700 &&
    d.topThickness === 35 &&
    c.baseId === 'trapezoid_pair' &&
    c.edgeId === 'straight';
  return same ? 'dal-oak-table-150-70' : 'custom';
}

export function applyTablePatch(prev: TableConfig, patch: TablePatch): { config: TableConfig; notices: Notice<TableConfig>[] } {
  const next = cloneTable(prev);
  const notices: Notice<TableConfig>[] = [];
  switch (patch.type) {
    case 'shape':
      next.shapeId = patch.value;
      break;
    case 'wood':
      next.woodId = patch.value;
      break;
    case 'edge':
      next.edgeId = patch.value;
      break;
    case 'base':
      next.baseId = patch.value;
      break;
    case 'finish':
      next.finishId = patch.value;
      break;
    case 'dimension':
      next.dimensionsMm[patch.key] = patch.value;
      break;
    case 'reseed':
      next.seed = patch.value >>> 0;
      break;
    case 'note':
      next.note = patch.value;
      break;
    case 'uncertain':
      next.uncertain = patch.value
        ? [...new Set([...(next.uncertain ?? []), patch.key])]
        : (next.uncertain ?? []).filter((key) => key !== patch.key);
      break;
  }

  if (patch.type !== 'uncertain' && patch.type !== 'note' && patch.type !== 'reseed') {
    const key = patch.type === 'dimension' ? patch.key : patch.type;
    if (next.uncertain) next.uncertain = next.uncertain.filter((item) => item !== key);
  }
  if (next.uncertain?.length === 0) delete next.uncertain;

  // Keep dimensions inside the ranges of the (possibly new) shape.
  if (patch.type === 'shape') {
    for (const key of tableDimensionKeys(next.shapeId)) {
      const [min, max] = tableDimensionRange(next.shapeId, key);
      const v = next.dimensionsMm[key];
      if (v < min || v > max) {
        const fixed = v < min ? min : max;
        next.dimensionsMm[key] = fixed;
        notices.push({
          id: `dim-${key}`,
          message: `${dimensionLabel(key)} je prilagođena na ${formatCm(fixed)} cm — granicu predloženog raspona za ovaj oblik.`,
          undo: prev,
        });
      }
    }
  }

  // Base compatible with the shape and length.
  const states = tableBaseStates(next);
  const current = states.find((s) => s.id === next.baseId)!;
  if (current.disabled) {
    const fallback = states.find((s) => !s.disabled)!;
    const changedByUser = patch.type === 'base';
    if (changedByUser) {
      // A disabled base cannot be chosen; keep the previous one.
      return { config: prev, notices: [{ id: 'base-blocked', message: current.reason ?? 'Ova kombinacija nije predviđena.' }] };
    }
    next.baseId = fallback.id;
    notices.push({
      id: 'base-auto',
      message: `Postolje je promijenjeno u „${baseOption(fallback.id).label}“. ${current.reason ?? ''}`.trim(),
      undo: prev,
    });
  }

  next.modelId = deriveTableModelId(next);
  return { config: next, notices };
}

export function dimensionLabel(key: TableDimensionKey | BoardDimensionKey): string {
  switch (key) {
    case 'length':
      return 'Dužina';
    case 'width':
      return 'Širina';
    case 'diameter':
      return 'Promjer';
    case 'topThickness':
      return 'Debljina ploče';
    case 'totalHeight':
      return 'Ukupna visina';
    case 'thickness':
      return 'Debljina';
  }
}

/* ------------------------------------------------------------------ board */

export function isConstructionAvailable(id: BoardConstructionId): boolean {
  const c = construction(id);
  return c.featureFlag !== 'endGrain' || FLAGS.endGrain;
}

export function visibleConstructions() {
  return BOARD_CONSTRUCTIONS.filter((c) => isConstructionAvailable(c.id));
}

export function boardDimensionRange(config: BoardConfig, key: BoardDimensionKey): Range {
  const shape = boardModel(config.modelId).shape;
  switch (key) {
    case 'length':
      return shape === 'paddle'
        ? [BOARD_RULES.paddleMinUsableMm + BOARD_RULES.paddleHandleLengthMm, BOARD_RANGES.length[1]]
        : BOARD_RANGES.length;
    case 'width':
      return BOARD_RANGES.width;
    case 'diameter':
      return BOARD_RANGES.diameter;
    case 'thickness':
      return BOARD_RANGES.thickness;
  }
}

export function boardDimensionKeys(config: BoardConfig): BoardDimensionKey[] {
  return boardModel(config.modelId).shape === 'circle' ? ['diameter', 'thickness'] : ['length', 'width', 'thickness'];
}

export function boardGrooveStates(config: BoardConfig): OptionState<BoardGrooveId>[] {
  const shape = boardModel(config.modelId).shape;
  return BOARD_GROOVES.map((g) => {
    if (!g.shapes.includes(shape)) {
      return { id: g.id, disabled: true, reason: 'Nije predviđeno za ovaj oblik daske.' };
    }
    return { id: g.id, disabled: false };
  });
}

export function boardHandleStates(config: BoardConfig): OptionState<BoardHandleId>[] {
  const shape = boardModel(config.modelId).shape;
  return BOARD_HANDLES.map((h) => {
    if (!h.shapes.includes(shape)) {
      return {
        id: h.id,
        disabled: true,
        reason: shape === 'paddle' ? 'Daska s drškom ima drvenu dršku iz istog komada.' : 'Nije predviđeno za ovaj oblik daske.',
      };
    }
    return { id: h.id, disabled: false };
  });
}

export function boardIssues(config: BoardConfig): Issue[] {
  const issues: Issue[] = [];
  for (const key of boardDimensionKeys(config)) {
    const range = boardDimensionRange(config, key);
    if (!inRange(config.dimensionsMm[key], range)) {
      issues.push({
        code: 'range',
        field: key,
        message: `Vrijednost je izvan predloženog raspona (${formatCm(range[0])}–${formatCm(range[1])} cm).`,
      });
    }
  }
  if (!isConstructionAvailable(config.constructionId)) {
    issues.push({ code: 'construction_flag', message: 'Ova konstrukcija trenutno nije ponuđena.' });
  }
  for (const i of computeBoardLayout(config).issues) issues.push({ code: i.code, message: i.message });
  return issues;
}

export type BoardPatch =
  | { type: 'model'; value: BoardModelId }
  | { type: 'purpose'; value: BoardConfig['purposeId'] }
  | { type: 'construction'; value: BoardConstructionId }
  | { type: 'edge'; value: BoardConfig['edgeId'] }
  | { type: 'groove'; value: BoardGrooveId }
  | { type: 'handle'; value: BoardHandleId }
  | { type: 'finish'; value: BoardConfig['finishId'] }
  | { type: 'dimension'; key: BoardDimensionKey; value: number }
  | { type: 'personalization'; value: Partial<BoardConfig['personalization']> }
  | { type: 'note'; value: string };

const MIN_HANDLE_WIDTH = Math.ceil((BOARD_RULES.handleSpacingsMm[0]! + 2 * BOARD_RULES.handleSideMarginMm) / 10) * 10;
const GROOVE_SAFE_THICKNESS = Math.ceil(BOARD_RULES.minThicknessForGroovesMm / 5) * 5;

export function applyBoardPatch(prev: BoardConfig, patch: BoardPatch): { config: BoardConfig; notices: Notice<BoardConfig>[] } {
  let next = cloneBoard(prev);
  const notices: Notice<BoardConfig>[] = [];
  switch (patch.type) {
    case 'model': {
      next = boardFromModel(patch.value, {
        personalization: prev.personalization,
        finishId: prev.finishId,
        seed: prev.seed,
        note: prev.note,
      });
      const m = boardModel(patch.value);
      notices.push({
        id: 'model',
        message: `Polazni model „${m.label}“: postavljene su njegove polazne dimenzije i detalji.${
          prev.personalization.enabled ? ' Tekst personalizacije je sačuvan.' : ''
        }`,
        undo: prev,
      });
      break;
    }
    case 'purpose':
      next.purposeId = patch.value;
      break;
    case 'construction':
      if (!isConstructionAvailable(patch.value)) return { config: prev, notices: [] };
      next.constructionId = patch.value;
      break;
    case 'edge':
      next.edgeId = patch.value;
      break;
    case 'groove': {
      const state = boardGrooveStates(next).find((s) => s.id === patch.value)!;
      if (state.disabled) return { config: prev, notices: [{ id: 'groove-blocked', message: state.reason! }] };
      next.grooveId = patch.value;
      if (patch.value === 'end_slots' && next.handleId === 'metal_pair') {
        next.handleId = 'none';
        notices.push({ id: 'handles-removed', message: 'Metalne ručke su uklonjene jer bi se preklapale s utorima uz krajeve.', undo: prev });
      }
      if (patch.value !== 'none' && next.dimensionsMm.thickness < BOARD_RULES.minThicknessForGroovesMm) {
        next.dimensionsMm.thickness = GROOVE_SAFE_THICKNESS;
        notices.push({
          id: 'thickness-raised',
          message: `Debljina je povećana na ${formatCm(GROOVE_SAFE_THICKNESS)} cm kako bi ispod utora ostalo dovoljno drveta.`,
          undo: prev,
        });
      }
      break;
    }
    case 'handle': {
      const state = boardHandleStates(next).find((s) => s.id === patch.value)!;
      if (state.disabled) return { config: prev, notices: [{ id: 'handle-blocked', message: state.reason! }] };
      next.handleId = patch.value;
      if (patch.value === 'metal_pair' && next.grooveId === 'end_slots') {
        next.grooveId = 'none';
        notices.push({ id: 'slots-removed', message: 'Utori uz krajeve su uklonjeni jer bi se preklapali s ručkama.', undo: prev });
      }
      if (patch.value === 'metal_pair' && handleSpacingFor(next.dimensionsMm.width) === null) {
        next.dimensionsMm.width = MIN_HANDLE_WIDTH;
        notices.push({
          id: 'width-raised',
          message: `Širina je povećana na ${formatCm(MIN_HANDLE_WIDTH)} cm kako bi ručke imale prostor za prste.`,
          undo: prev,
        });
      }
      break;
    }
    case 'finish':
      next.finishId = patch.value;
      break;
    case 'dimension':
      next.dimensionsMm[patch.key] = patch.value;
      if (patch.key === 'thickness' && next.grooveId !== 'none' && patch.value < BOARD_RULES.minThicknessForGroovesMm) {
        const label = boardGroove(next.grooveId).label;
        next.grooveId = 'none';
        notices.push({ id: 'groove-removed', message: `„${label}“ uklonjeno: tanja daska nema dovoljno materijala ispod utora.`, undo: prev });
      }
      if (patch.key === 'width' && next.handleId === 'metal_pair' && handleSpacingFor(patch.value) === null) {
        next.handleId = 'none';
        notices.push({
          id: 'handles-removed-width',
          message: `„${boardHandle('metal_pair').label}“ uklonjene: pri ovoj širini nema prostora za prste.`,
          undo: prev,
        });
      }
      break;
    case 'personalization':
      next.personalization = { ...next.personalization, ...patch.value };
      break;
    case 'note':
      next.note = patch.value;
      break;
  }
  return { config: next, notices };
}
