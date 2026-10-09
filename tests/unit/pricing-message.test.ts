import { describe, expect, it } from 'vitest';
import { DEFAULT_BOARD, DEFAULT_TABLE, cloneBoard } from '@/lib/config/defaults';
import { calculatePrice, type PriceCatalog } from '@/lib/config/pricing';
import { inquiryText, whatsappInquiryHref } from '@/lib/config/message';
import { applyBoardPatch } from '@/lib/config/rules';

const confirmedCatalog: PriceCatalog = {
  version: 'test-2026-10',
  confirmed: true,
  rules: [
    {
      kind: 'base',
      productType: 'board',
      match: { modelId: 'dal-maple-beech-board', 'dimensionsMm.length': 450, 'dimensionsMm.width': 280, 'dimensionsMm.thickness': 40 },
      fening: 4550,
      confirmed: true,
    },
    { kind: 'addon', productType: 'board', match: { grooveId: 'end_slots' }, fening: 505, confirmed: true },
    { kind: 'addon', productType: 'board', match: { 'personalization.enabled': 'true' }, fening: 1000, confirmed: false },
  ],
};

describe('calculatePrice', () => {
  it('tables are quote-only and never 0 KM', () => {
    const r = calculatePrice(DEFAULT_TABLE, confirmedCatalog);
    expect(r).toMatchObject({ status: 'quote_required', fening: null });
  });

  it('the production catalog prices nothing (published prices are reference only)', () => {
    expect(calculatePrice(DEFAULT_BOARD)).toMatchObject({ status: 'quote_required', fening: null });
  });

  it('sums integer fenings and reports the price list version for confirmed rules', () => {
    const r = calculatePrice(DEFAULT_BOARD, confirmedCatalog);
    expect(r).toEqual({ status: 'priced', fening: 5055, priceListVersion: 'test-2026-10' });
  });

  it('an unconfirmed add-on yields quote_required, not a partial sum', () => {
    const c = applyBoardPatch(cloneBoard(DEFAULT_BOARD), {
      type: 'personalization',
      value: { enabled: true, text: 'Test' },
    }).config;
    expect(calculatePrice(c, confirmedCatalog)).toMatchObject({ status: 'quote_required', fening: null });
  });

  it('a variant without a confirmed base rule needs a quote', () => {
    const c = applyBoardPatch(cloneBoard(DEFAULT_BOARD), { type: 'dimension', key: 'length', value: 500 }).config;
    expect(calculatePrice(c, confirmedCatalog).status).toBe('quote_required');
  });
});

describe('WhatsApp inquiry', () => {
  it('encodes the exact validated selection and the permalink', () => {
    const c = applyBoardPatch(cloneBoard(DEFAULT_BOARD), {
      type: 'personalization',
      value: { enabled: true, text: 'Čaršija • Džemal', fontId: 'serif', placement: 'center', sizeMm: 12 },
    }).config;
    const link = 'https://primjer.ba/konfigurator/daska?v=1';
    const href = whatsappInquiryHref(c, link);
    expect(href.startsWith('https://wa.me/38762704560?text=')).toBe(true);
    const text = decodeURIComponent(href.split('?text=')[1]!);
    expect(text).toBe(inquiryText(c, link));
    expect(text).toContain('Pozdrav, zainteresovan/a sam za izradu po mjeri. Šaljem svoju konfiguraciju:');
    expect(text).toContain('„Čaršija • Džemal“');
    expect(text).toContain('45 × 28 cm, debljina 4 cm'.split(',')[0]!.replace('45 × 28 cm', 'Dužina: 45 cm'));
    expect(text).toContain('Molim potvrdu mogućnosti izrade, cijene i roka.');
    expect(text).toContain(link);
    expect(text).not.toMatch(/narudžba uspješno/i);
  });

  it('table message states the quote and the suggested height', () => {
    const text = inquiryText(DEFAULT_TABLE, null);
    expect(text).toContain('Drvo: Hrast');
    expect(text).toContain('Dužina: 150 cm');
    expect(text).toContain('Debljina ploče: 3,5 cm');
    expect(text).toContain('Ukupna visina: 75 cm');
    expect(text).toContain('Cijena: cijena prema odabranoj konfiguraciji');
    expect(text).not.toContain('0 KM');
  });
});
