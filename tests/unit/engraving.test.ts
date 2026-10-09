import { describe, expect, it } from 'vitest';
import { DEFAULT_BOARD, boardFromModel, cloneBoard } from '@/lib/config/defaults';
import { computeBoardLayout } from '@/lib/geometry/board-layout';
import { evaluateEngraving, maxSizeInZone, validateEngravingText, countChars } from '@/lib/engraving/fit';
import { applyBoardPatch } from '@/lib/config/rules';
import type { Personalization } from '@/lib/config/types';

const p = (over: Partial<Personalization> = {}): Personalization => ({
  enabled: true,
  text: 'Čaršija • Džemal',
  fontId: 'serif',
  placement: 'center',
  sizeMm: 12,
  ...over,
});

// Measured shape of "Čaršija • Džemal" in a serif at 100 units (ink box incl. diacritics).
const metrics = { width: 690, height: 118 };

function inside(rect: { x0: number; x1: number; z0: number; z1: number }, zone: { x0: number; x1: number; z0: number; z1: number }) {
  return rect.x0 >= zone.x0 - 1e-9 && rect.x1 <= zone.x1 + 1e-9 && rect.z0 >= zone.z0 - 1e-9 && rect.z1 <= zone.z1 + 1e-9;
}

describe('engraving text', () => {
  it('keeps text exactly as typed and counts Bosnian letters as one character', () => {
    expect(validateEngravingText('Čaršija • Džemal')).toEqual({ ok: true, lines: ['Čaršija • Džemal'] });
    expect(countChars('ĐŽĆČŠđžćčš')).toBe(10);
  });
  it('limits length, lines and unsupported glyphs', () => {
    expect(validateEngravingText('a'.repeat(41)).ok).toBe(false);
    expect(validateEngravingText('a\nb\nc').ok).toBe(false);
    expect(validateEngravingText('Ime 😀').ok).toBe(false);
    expect(validateEngravingText('   ').ok).toBe(false);
  });
});

describe('engraving fit', () => {
  it('stays inside the safe zone and clear of the end grooves', () => {
    const layout = computeBoardLayout(DEFAULT_BOARD);
    const r = evaluateEngraving(layout, p(), metrics);
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      const zone = layout.engravingZones.top!;
      if (zone.kind !== 'rect') throw new Error('rect expected');
      expect(inside(r.rect, zone)).toBe(true);
      for (const g of layout.grooves) {
        if (g.kind !== 'slot') continue;
        // horizontal clearance from the slot (half width + 10 mm)
        const clearance = Math.min(Math.abs(r.rect.x0 - g.x), Math.abs(r.rect.x1 - g.x));
        expect(clearance).toBeGreaterThanOrEqual(g.width / 2 + 10);
      }
    }
  });

  it('suggests a smaller size or another place when the text is too large', () => {
    const layout = computeBoardLayout(DEFAULT_BOARD);
    const r = evaluateEngraving(layout, p({ placement: 'corner', sizeMm: 30 }), metrics);
    expect(r.status).toBe('too_large');
    if (r.status === 'too_large') {
      expect(r.maxSizeHere).toBeLessThan(30);
      expect(r.alternatives.length).toBeGreaterThan(0);
      const fitsAt = evaluateEngraving(layout, p({ placement: 'corner', sizeMm: r.maxSizeHere }), metrics);
      expect(fitsAt.status).toBe('ok');
    }
  });

  it('keeps clear of metal handles and their screws', () => {
    const layout = computeBoardLayout(boardFromModel('dal-handled-board'));
    const zone = layout.engravingZones.top;
    const back = layout.engravingZones.back;
    if (zone?.kind !== 'rect' || back?.kind !== 'rect') throw new Error('rect zones expected');
    const h = layout.handles[0]!;
    expect(zone.x1).toBeLessThan(Math.abs(h.x) - h.footDiameter / 2 - 20);
    expect(back.x1).toBeLessThan(Math.abs(h.x) - h.footDiameter / 2);
  });

  it('round boards have no corner placement', () => {
    const layout = computeBoardLayout(boardFromModel('custom-round'));
    const r = evaluateEngraving(layout, p({ placement: 'corner' }), metrics);
    expect(r.status).toBe('placement_unavailable');
    expect(maxSizeInZone(layout.engravingZones.top!, metrics)).toBeGreaterThan(10);
  });

  it('changing the model keeps the personalised text', () => {
    let c = applyBoardPatch(cloneBoard(DEFAULT_BOARD), { type: 'personalization', value: p() }).config;
    c = applyBoardPatch(c, { type: 'model', value: 'custom-round' }).config;
    expect(c.personalization.text).toBe('Čaršija • Džemal');
    expect(c.personalization.enabled).toBe(true);
  });
});
