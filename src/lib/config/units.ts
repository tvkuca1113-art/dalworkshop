/**
 * Unit handling. The UI talks centimetres; state keeps whole millimetres.
 * Conversion happens exactly once, at the input boundary.
 */

export type ParseResult = { ok: true; mm: number } | { ok: false; error: string };

const CM_PATTERN = /^\d{1,4}(?:[.,]\d)?$/;

/** Parse a centimetre input such as "3,5", "3.5" or "150" into whole millimetres. */
export function parseCmToMm(raw: string): ParseResult {
  const value = raw.trim().replace(/\s+/g, '');
  if (value === '') return { ok: false, error: 'Upišite vrijednost u centimetrima.' };
  if (value.startsWith('-')) return { ok: false, error: 'Dimenzija mora biti pozitivna.' };
  if (/^\d+[.,]\d{2,}$/.test(value)) {
    return { ok: false, error: 'Upišite najviše jednu decimalu (milimetar).' };
  }
  if (!CM_PATTERN.test(value)) return { ok: false, error: 'Upišite broj, npr. 3,5 ili 150.' };
  const [whole, fraction = '0'] = value.split(/[.,]/) as [string, string?];
  const mm = Number(whole) * 10 + Number(fraction);
  if (!Number.isFinite(mm) || mm <= 0) return { ok: false, error: 'Dimenzija mora biti veća od nule.' };
  return { ok: true, mm };
}

/** Format whole millimetres as centimetres with a decimal comma: 35 → "3,5", 1500 → "150". */
export function formatCm(mm: number): string {
  const whole = Math.trunc(mm / 10);
  const tenth = Math.abs(mm % 10);
  return tenth === 0 ? String(whole) : `${whole},${tenth}`;
}

export function formatCmUnit(mm: number): string {
  return `${formatCm(mm)} cm`;
}

export function isWholeMm(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value) && value > 0;
}

export function inRange(mm: number, [min, max]: readonly [number, number]): boolean {
  return mm >= min && mm <= max;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Money is kept in fenings (integer). 2500 → "25,00 KM". */
export function formatKm(fening: number): string {
  const km = Math.trunc(fening / 100);
  const rest = String(Math.abs(fening % 100)).padStart(2, '0');
  return `${km},${rest} KM`;
}
