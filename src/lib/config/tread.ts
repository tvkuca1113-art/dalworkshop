import { z } from 'zod';
import { TREAD_CATALOG, TREAD_WOOD_IDS, type TreadSelection } from '../catalog/treads';
import { WOOD_LOOK } from '../catalog/woods';
import { formatCm, formatKm } from './units';
export type { TreadSelection } from '../catalog/treads';

export const treadSelectionSchema = z.object({
  wood: z.enum(TREAD_WOOD_IDS),
  thickness: z.union(TREAD_CATALOG.variants.map(v => z.literal(v.thicknessMm))),
  quantity: z.number().int().min(TREAD_CATALOG.quantityRange[0]).max(TREAD_CATALOG.quantityRange[1]),
});

export const DEFAULT_TREAD: TreadSelection = { wood: 'oak', thickness: TREAD_CATALOG.variants[0].thicknessMm, quantity: 1 };

export function treadPrice(selection: TreadSelection) {
  const valid = treadSelectionSchema.parse(selection);
  const unit = TREAD_CATALOG.variants.find(v => v.thicknessMm === valid.thickness)!.priceFening;
  return { unit, total: unit * valid.quantity };
}
export function treadUrl(selection: TreadSelection) {
  const valid = treadSelectionSchema.parse(selection);
  return `/gazista?${new URLSearchParams({ drvo: valid.wood, debljina: String(valid.thickness), komada: String(valid.quantity) })}`;
}
export function readTreadSelection(params: Record<string, string | string[] | undefined>) {
  const candidate = {
    wood: params.drvo ?? DEFAULT_TREAD.wood,
    thickness: params.debljina === undefined ? DEFAULT_TREAD.thickness : Number(params.debljina),
    quantity: params.komada === undefined ? DEFAULT_TREAD.quantity : Number(params.komada),
  };
  // A duplicated query parameter is ambiguous, rather than a valid choice.
  const duplicate = ['drvo', 'debljina', 'komada'].some(k => Array.isArray(params[k]));
  const result = treadSelectionSchema.safeParse(candidate);
  return result.success && !duplicate ? { selection: result.data, reset: false } : { selection: DEFAULT_TREAD, reset: true };
}
export function treadMessage(selection: TreadSelection, origin: string, note = '') {
  const valid = treadSelectionSchema.parse(selection);
  const price = treadPrice(valid);
  return [
    'Pozdrav, zanima me narudžba DAL gazišta.',
    `Drvo: ${WOOD_LOOK[valid.wood].label}`,
    `Dimenzije: ${formatCm(TREAD_CATALOG.lengthMm)} × ${formatCm(TREAD_CATALOG.depthMm)} × ${formatCm(valid.thickness)} cm`,
    `Završna obrada: ${TREAD_CATALOG.finish}`,
    `Količina: ${valid.quantity} kom.`,
    `Cijena po komadu: ${formatKm(price.unit)}`,
    `Iznos gazišta: ${formatKm(price.total)}`,
    note.trim() ? `Napomena: ${note.trim().slice(0, 500)}` : '',
    `Moj izbor: ${origin}${treadUrl(valid)}`,
    'Molim potvrdu mogućnosti izrade, roka i dostave. Za druge dimenzije molim zasebnu ponudu.',
  ].filter(Boolean).join('\n');
}
