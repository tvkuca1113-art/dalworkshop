import {
  baseOption,
  edgeOption,
  finishOption,
  FINISH_DISCLAIMER,
  shapeOption,
  TABLE_RULES,
  woodOption,
} from '../catalog/table';
import {
  boardEdge,
  boardFinish,
  boardGroove,
  boardHandle,
  boardModel,
  boardPurpose,
  BOARD_RULES,
  construction,
  engravingFont,
  engravingPlacement,
  PERSONALIZATION,
} from '../catalog/board';
import { AVAILABILITY_LABEL, type Availability } from '../catalog/status';
import { naturalEdgeWidthRange } from '../geometry/outline';
import { computeBoardLayout } from '../geometry/board-layout';
import { formatCmUnit } from './units';
import type { BoardConfig, TableConfig } from './types';

/**
 * Human-readable specification derived from a validated configuration.
 * The same lines feed the summary panel, review, WhatsApp text, print view
 * and the e-mail sent by the server.
 */

export interface SpecLine {
  key: string;
  label: string;
  value: string;
  status?: Availability;
  note?: string;
}

export const GRAIN_NOTE = 'Prirodno drvo: šare, nijanse i obris konačnog komada razlikuju se od prikaza.';
export const PRICE_QUOTE_COPY = 'Cijena prema odabranoj konfiguraciji — šaljemo ponudu';

export function tableTitle(c: TableConfig): string {
  return c.modelId === 'dal-oak-table-150-70' && !c.uncertain?.length ? 'Stol po mjeri — polazni hrastov model' : 'Stol po mjeri';
}

export function tableDimensionsText(c: TableConfig): string {
  const d = c.dimensionsMm;
  const plan =
    c.shapeId === 'circle' ? `promjer ${formatCmUnit(d.diameter)}` : `${formatCmUnit(d.length).replace(' cm', '')} × ${formatCmUnit(d.width)}`;
  return `${plan}, ploča ${formatCmUnit(d.topThickness)}, ukupna visina ${formatCmUnit(d.totalHeight)}`;
}

export function tableSpec(c: TableConfig): SpecLine[] {
  const shape = shapeOption(c.shapeId);
  const wood = woodOption(c.woodId);
  const edge = edgeOption(c.edgeId);
  const base = baseOption(c.baseId);
  const finish = finishOption(c.finishId);
  const d = c.dimensionsMm;
  const lines: SpecLine[] = [
    { key: 'product', label: 'Proizvod', value: tableTitle(c) },
    { key: 'shape', label: 'Oblik', value: shape.label, status: shape.status },
    { key: 'wood', label: 'Drvo', value: wood.label, status: wood.status },
  ];
  if (c.shapeId === 'circle') {
    lines.push({ key: 'diameter', label: 'Promjer', value: formatCmUnit(d.diameter) });
  } else {
    lines.push({ key: 'length', label: 'Dužina', value: formatCmUnit(d.length) });
    if (c.shapeId === 'natural_edge') {
      const range = naturalEdgeWidthRange(d.width, TABLE_RULES.naturalEdgeMaxDeviationMm, c.seed);
      lines.push({
        key: 'width',
        label: 'Širina',
        value: `${formatCmUnit(d.width)} najšire`,
        note: `Procjena: oko ${formatCmUnit(range.min)} na najužem mjestu; prirodan rub varira duž stola.`,
      });
    } else {
      lines.push({ key: 'width', label: 'Širina', value: formatCmUnit(d.width) });
    }
  }
  lines.push(
    { key: 'topThickness', label: 'Debljina ploče', value: formatCmUnit(d.topThickness) },
    {
      key: 'totalHeight',
      label: 'Ukupna visina',
      value: formatCmUnit(d.totalHeight),
      note: d.totalHeight === TABLE_RULES.suggestedHeightMm ? 'Predložena visina za blagovaonički stol.' : undefined,
    },
    { key: 'edge', label: 'Ivica', value: edge.label, status: edge.status },
    { key: 'base', label: 'Postolje', value: base.label, status: base.status },
    { key: 'finish', label: 'Nijansa (vizuelni prijedlog)', value: finish.label, status: finish.status, note: FINISH_DISCLAIMER },
  );
  if (c.shapeId === 'natural_edge') {
    lines.push({ key: 'seed', label: 'Obris prirodne ivice', value: `varijanta ${c.seed}` });
  }
  if (c.note.trim()) lines.push({ key: 'note', label: 'Poseban zahtjev', value: c.note.trim() });
  return lines.map((line) => c.uncertain?.includes(line.key as NonNullable<TableConfig['uncertain']>[number])
    ? { ...line, value: `Nisam siguran — želim savjet (prikaz: ${line.value})`, status: undefined, note: undefined }
    : line);
}

export function boardTitle(c: BoardConfig): string {
  return `Daska — ${boardModel(c.modelId).label}`;
}

export function boardDimensionsText(c: BoardConfig): string {
  const d = c.dimensionsMm;
  const shape = boardModel(c.modelId).shape;
  if (shape === 'circle') return `promjer ${formatCmUnit(d.diameter)}, debljina ${formatCmUnit(d.thickness)}`;
  return `${formatCmUnit(d.length).replace(' cm', '')} × ${formatCmUnit(d.width)}, debljina ${formatCmUnit(d.thickness)}`;
}

export function boardSpec(c: BoardConfig): SpecLine[] {
  const model = boardModel(c.modelId);
  const cons = construction(c.constructionId);
  const d = c.dimensionsMm;
  const layout = computeBoardLayout(c);
  const lines: SpecLine[] = [
    { key: 'product', label: 'Proizvod', value: 'Daska za rezanje i serviranje' },
    {
      key: 'model',
      label: 'Polazni model',
      value: model.label,
      status: model.status,
      note: model.dimensionsEstimated ? 'Polazne dimenzije su procjena prema fotografiji.' : undefined,
    },
    { key: 'purpose', label: 'Namjena', value: boardPurpose(c.purposeId).label },
    { key: 'construction', label: 'Drvo', value: cons.label, status: cons.status },
  ];
  if (model.shape === 'circle') {
    lines.push({ key: 'diameter', label: 'Promjer', value: formatCmUnit(d.diameter) });
  } else if (model.shape === 'paddle') {
    lines.push({
      key: 'length',
      label: 'Ukupna dužina (s drškom)',
      value: formatCmUnit(d.length),
      note: `Drška ${formatCmUnit(BOARD_RULES.paddleHandleLengthMm)} uključena u ukupnu dužinu.`,
    });
    lines.push({ key: 'width', label: 'Širina', value: formatCmUnit(d.width) });
    lines.push({
      key: 'usable',
      label: 'Korisna ploha',
      value: `${formatCmUnit(layout.usable.length).replace(' cm', '')} × ${formatCmUnit(layout.usable.width)}`,
    });
  } else {
    lines.push({ key: 'length', label: 'Dužina', value: formatCmUnit(d.length) });
    lines.push({ key: 'width', label: 'Širina', value: formatCmUnit(d.width) });
  }
  lines.push({ key: 'thickness', label: 'Debljina', value: formatCmUnit(d.thickness) });
  const edge = boardEdge(c.edgeId);
  const groove = boardGroove(c.grooveId);
  const handle = boardHandle(c.handleId);
  const finish = boardFinish(c.finishId);
  lines.push(
    { key: 'edge', label: 'Ivica', value: edge.label, status: edge.status },
    {
      key: 'groove',
      label: 'Utori',
      value: c.grooveId === 'none' ? groove.label : `${groove.label} (dubina oko ${formatCmUnit(layout.grooveDepthMm)})`,
      status: groove.status,
    },
    { key: 'handle', label: 'Ručke', value: handle.label, status: handle.status },
    { key: 'finish', label: 'Završna obrada', value: finish.label, status: finish.status, note: finish.description },
  );
  const p = c.personalization;
  if (p.enabled && p.text.trim()) {
    lines.push({
      key: 'personalization',
      label: PERSONALIZATION.title,
      value: `„${p.text.replace(/\n/g, ' / ')}“ — ${engravingFont(p.fontId).label}, ${engravingPlacement(p.placement).label.toLowerCase()}, visina slova oko ${p.sizeMm} mm`,
      status: PERSONALIZATION.availability,
      note: 'Želja kupca; mjesto i način izrade potvrđuje radionica.',
    });
  }
  if (c.note.trim()) lines.push({ key: 'note', label: 'Poseban zahtjev', value: c.note.trim() });
  return lines;
}

export function specFor(c: TableConfig | BoardConfig): SpecLine[] {
  return c.productType === 'table' ? tableSpec(c) : boardSpec(c);
}

export function statusText(status: Availability | undefined): string {
  return status ? AVAILABILITY_LABEL[status] : '';
}
