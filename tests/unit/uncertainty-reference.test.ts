import { describe, expect, it } from 'vitest';
import { DEFAULT_TABLE } from '@/lib/config/defaults';
import { applyTablePatch } from '@/lib/config/rules';
import { decodeTable, encodeTable } from '@/lib/config/url';
import { inquiryText } from '@/lib/config/message';
import { referenceFileError } from '@/lib/config/references';
import { REFERENCE_LIMITS } from '@/lib/catalog/references';
import { TABLE_BASES } from '@/lib/catalog/table';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import { buildTableBase } from '@/lib/three/table-geometry';

describe('advice choices', () => {
  it('keeps a valid preview while preserving uncertainty through links and inquiry text', () => {
    let config = applyTablePatch(DEFAULT_TABLE, { type: 'uncertain', key: 'wood', value: true }).config;
    config = applyTablePatch(config, { type: 'uncertain', key: 'length', value: true }).config;
    expect(config.woodId).toBe('oak');
    expect(config.dimensionsMm.length).toBe(1500);
    const decoded = decodeTable(encodeTable(config));
    expect(decoded.status).toBe('ok');
    if (decoded.status !== 'ok') throw new Error('decode failed');
    expect(decoded.config.uncertain).toEqual(['wood', 'length']);
    const message = inquiryText(decoded.config, null);
    expect(message).toContain('Drvo: Nisam siguran — želim savjet (prikaz: Hrast)');
    expect(message).toContain('Dužina: Nisam siguran — želim savjet (prikaz: 150 cm)');
  });
  it('a concrete choice clears only its uncertainty, without mutating the previous configuration', () => {
    const previous = { ...DEFAULT_TABLE, uncertain: ['wood', 'base'] as const };
    const config = applyTablePatch({ ...previous, uncertain: [...previous.uncertain] }, { type: 'wood', value: 'walnut' }).config;
    expect(config.uncertain).toEqual(['base']);
    expect(previous.uncertain).toEqual(['wood', 'base']);
    const confirmed = applyTablePatch(config, { type: 'uncertain', key: 'base', value: false }).config;
    expect(confirmed.uncertain).toBeUndefined();
  });
  it('rejects unknown or repeated uncertain values from a shared link', () => {
    const good = encodeTable(DEFAULT_TABLE);
    for (const suffix of ['&u=price', '&u=wood,wood', '&u=']) expect(decodeTable(good + suffix).status).toBe('error');
    expect(decodeTable(good).status).toBe('ok');
  });
});

describe('reference file validation', () => {
  it('accepts supported photos and rejects unsupported, empty or oversized files', () => {
    expect(referenceFileError({ type: 'image/jpeg', size: 120_000 })).toBeNull();
    expect(referenceFileError({ type: 'image/svg+xml', size: 200 })).not.toBeNull();
    expect(referenceFileError({ type: 'image/png', size: 0 })).not.toBeNull();
    expect(referenceFileError({ type: 'image/webp', size: REFERENCE_LIMITS.bytes + 1 })).not.toBeNull();
  });
});

describe('wooden bases', () => {
  it('provides finite, varied grain coordinates on every wooden base', () => {
    for (const option of TABLE_BASES.filter((base) => base.material === 'wood')) {
      const geometry = buildTableBase(computeTableLayout({ ...DEFAULT_TABLE, baseId: option.id }), true);
      const uv = geometry.getAttribute('uv');
      expect(uv.count).toBe(geometry.getAttribute('position').count);
      expect([...uv.array].every(Number.isFinite)).toBe(true);
      expect(new Set(uv.array).size).toBeGreaterThan(10);
      geometry.dispose();
    }
  });
});
