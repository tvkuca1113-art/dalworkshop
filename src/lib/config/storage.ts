import { boardIssues, tableIssues } from './rules';
import { boardConfigSchema, tableConfigSchema, type BoardConfig, type ProductType, type TableConfig } from './types';

/**
 * Explicit "Sačuvaj izbor" storage. Only the product configuration is kept
 * on the device — never name, phone, e-mail or the contact form message.
 * Blocked storage, private mode or corrupt data never break the app.
 */

const KEY = { table: 'dal:izbor:stol', board: 'dal:izbor:daska' } as const;
const MAX_BYTES = 8_000;

export interface SavedEnvelope<C> {
  savedAt: string;
  config: C;
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = window.localStorage;
    return s ?? null;
  } catch {
    return null;
  }
}

export function saveConfig(config: TableConfig | BoardConfig, now = new Date()): { ok: true } | { ok: false; message: string } {
  const s = storage();
  if (!s) return { ok: false, message: 'Preglednik ne dozvoljava spremanje na ovom uređaju (npr. privatni način rada).' };
  try {
    const payload = JSON.stringify({ savedAt: now.toISOString(), config });
    if (payload.length > MAX_BYTES) return { ok: false, message: 'Izbor je prevelik za spremanje.' };
    s.setItem(KEY[config.productType], payload);
    return { ok: true };
  } catch {
    return { ok: false, message: 'Spremanje nije uspjelo. Pohrana preglednika je možda puna ili blokirana.' };
  }
}

export function loadSaved(type: 'table'): SavedEnvelope<TableConfig> | null;
export function loadSaved(type: 'board'): SavedEnvelope<BoardConfig> | null;
export function loadSaved(type: ProductType): SavedEnvelope<TableConfig | BoardConfig> | null {
  const s = storage();
  if (!s) return null;
  let raw: string | null;
  try {
    raw = s.getItem(KEY[type]);
  } catch {
    return null;
  }
  if (!raw || raw.length > MAX_BYTES) return null;
  try {
    const data = JSON.parse(raw) as { savedAt?: unknown; config?: unknown };
    if (typeof data.savedAt !== 'string') return null;
    if (type === 'table') {
      const parsed = tableConfigSchema.safeParse(data.config);
      if (!parsed.success || tableIssues(parsed.data).length) return null;
      return { savedAt: data.savedAt, config: parsed.data };
    }
    const parsed = boardConfigSchema.safeParse(data.config);
    if (!parsed.success || boardIssues(parsed.data).length) return null;
    return { savedAt: data.savedAt, config: parsed.data };
  } catch {
    return null;
  }
}

export function clearSaved(type: ProductType): void {
  const s = storage();
  try {
    s?.removeItem(KEY[type]);
  } catch {
    /* ignore */
  }
}
