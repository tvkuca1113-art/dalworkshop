import type { BoardConfig, TableConfig } from './types';

/**
 * Pricing. Tables are quote-only; the published board prices are kept as a
 * reference and are NOT applied to the configurator. calculatePrice() is ready
 * for a future confirmed price list: it returns fenings only when every
 * selected item has a confirmed rule, otherwise a quote status and null.
 */

export interface PriceRule {
  /** What the rule prices: base product match or an add-on. */
  kind: 'base' | 'addon';
  productType: 'table' | 'board';
  /** All conditions must match (field path → value). */
  match: Record<string, string | number>;
  fening: number;
  confirmed: boolean;
}

export interface PriceCatalog {
  version: string | null;
  confirmed: boolean;
  rules: readonly PriceRule[];
}

/** Current production catalog: nothing confirmed → every configuration is on request. */
export const PRICE_CATALOG: PriceCatalog = { version: null, confirmed: false, rules: [] };

export type PriceResult =
  | { status: 'priced'; fening: number; priceListVersion: string }
  | { status: 'quote_required'; fening: null; reason: string };

function get(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

function matches(config: TableConfig | BoardConfig, rule: PriceRule): boolean {
  if (rule.productType !== config.productType) return false;
  return Object.entries(rule.match).every(([path, value]) => get(config, path) === value);
}

/** Add-ons that, when selected, must be priced by their own confirmed rule. */
export function selectedAddons(config: TableConfig | BoardConfig): Record<string, string>[] {
  if (config.productType === 'table') return [];
  const addons: Record<string, string>[] = [];
  if (config.grooveId !== 'none') addons.push({ grooveId: config.grooveId });
  if (config.handleId === 'metal_pair') addons.push({ handleId: config.handleId });
  if (config.personalization.enabled) addons.push({ 'personalization.enabled': 'true' });
  return addons;
}

export function calculatePrice(config: TableConfig | BoardConfig, catalog: PriceCatalog = PRICE_CATALOG): PriceResult {
  if (config.productType === 'table') {
    return { status: 'quote_required', fening: null, reason: 'Stolovi se rade isključivo po ponudi.' };
  }
  if (!catalog.confirmed || !catalog.version) {
    return { status: 'quote_required', fening: null, reason: 'Cjenovnik nije potvrđen.' };
  }
  const base = catalog.rules.find((r) => r.kind === 'base' && r.confirmed && matches(config, r));
  if (!base) return { status: 'quote_required', fening: null, reason: 'Za ovu varijantu nema potvrđene cijene.' };
  let total = base.fening;
  for (const addon of selectedAddons(config)) {
    const [path, value] = Object.entries(addon)[0]!;
    const rule = catalog.rules.find(
      (r) => r.kind === 'addon' && r.productType === 'board' && String(r.match[path]) === value,
    );
    if (!rule || !rule.confirmed) {
      return { status: 'quote_required', fening: null, reason: 'Odabrani dodatak nema potvrđenu cijenu — ponuda potrebna.' };
    }
    total += rule.fening;
  }
  if (!Number.isSafeInteger(total) || total <= 0) {
    return { status: 'quote_required', fening: null, reason: 'Cijena nije valjana.' };
  }
  return { status: 'priced', fening: total, priceListVersion: catalog.version };
}
