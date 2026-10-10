import { describe, expect, it } from 'vitest';
import { TREAD_WOOD_IDS } from '@/lib/catalog/treads';
import { DEFAULT_TREAD, readTreadSelection, treadMessage, treadPrice, treadSelectionSchema, treadUrl } from '@/lib/config/tread';

describe('DAL cjenovnik gazišta i siguran izbor', () => {
  it.each(TREAD_WOOD_IDS)('primjenjuje objavljene cijene bez doplate za %s', wood => {
    for (const [thickness, unit] of [[40, 11000], [60, 16000], [80, 21000]] as const) {
      expect(treadPrice({ wood, thickness, quantity: 12 })).toEqual({ unit, total: unit * 12 });
    }
  });
  it.each([0, -1, 1.5, 101, NaN, Infinity])('odbija nevažeću količinu %s', quantity => {
    expect(treadSelectionSchema.safeParse({ ...DEFAULT_TREAD, quantity }).success).toBe(false);
  });
  it('odbija nepostojeće drvo i debljinu; ne izmišlja cijenu', () => {
    expect(treadSelectionSchema.safeParse({ ...DEFAULT_TREAD, wood: 'walnut' }).success).toBe(false);
    expect(treadSelectionSchema.safeParse({ ...DEFAULT_TREAD, thickness: 50 }).success).toBe(false);
  });
  it('obnavlja link izbora i resetuje nevažeće i duplirane parametre', () => {
    const selection = { wood: 'ash', thickness: 60, quantity: 12 } as const;
    const query = Object.fromEntries(new URL(treadUrl(selection), 'https://example.com').searchParams);
    expect(readTreadSelection(query)).toEqual({ selection, reset: false });
    for (const p of [{ drvo: 'invalid' }, { debljina: '50' }, { komada: '2.5' }, { drvo: ['oak', 'ash'] }, { komada: '0' }]) {
      expect(readTreadSelection(p)).toEqual({ selection: DEFAULT_TREAD, reset: true });
    }
  });
  it('poruka sadrži tačne specifikacije, iznos i obnovljiv link', () => {
    const text = treadMessage({ wood: 'maple', thickness: 80, quantity: 10 }, 'https://example.com', 'Druga širina 90 cm.');
    expect(text).toContain('Drvo: Javor');
    expect(text).toContain('100 × 30 × 8 cm');
    expect(text).toContain('210,00 KM');
    expect(text).toContain('2100,00 KM');
    expect(text).toContain('Završna obrada: Nauljeno');
    expect(text).toContain('komada=10');
    expect(text).toContain('Druga širina 90 cm.');
    expect(text).toContain('zasebnu ponudu');
  });
});
