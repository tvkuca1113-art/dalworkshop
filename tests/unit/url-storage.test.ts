import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BOARD, DEFAULT_TABLE, boardFromModel, cloneBoard, cloneTable } from '@/lib/config/defaults';
import { decodeBoard, decodeTable, encodeBoard, encodeTable, MAX_QUERY_LENGTH } from '@/lib/config/url';
import { applyBoardPatch, applyTablePatch } from '@/lib/config/rules';
import { loadSaved, saveConfig } from '@/lib/config/storage';

describe('table permalink', () => {
  it('round-trips the exact state including the procedural seed', () => {
    let c = applyTablePatch(DEFAULT_TABLE, { type: 'shape', value: 'natural_edge' }).config;
    c = applyTablePatch(c, { type: 'reseed', value: 987654 }).config;
    c = applyTablePatch(c, { type: 'dimension', key: 'length', value: 2200 }).config;
    c = applyTablePatch(c, { type: 'dimension', key: 'topThickness', value: 45 }).config;
    c = applyTablePatch(c, { type: 'wood', value: 'walnut' }).config;
    c = applyTablePatch(c, { type: 'base', value: 'x_frame_pair' }).config;
    const decoded = decodeTable(encodeTable(c));
    expect(decoded.status).toBe('ok');
    if (decoded.status === 'ok') {
      expect(decoded.config.seed).toBe(987654);
      expect(encodeTable(decoded.config)).toBe(encodeTable(c));
      expect(decoded.config.dimensionsMm.length).toBe(2200);
      expect(decoded.config.dimensionsMm.topThickness).toBe(45);
    }
  });

  it('round-trips a round table (diameter only)', () => {
    const c = applyTablePatch(DEFAULT_TABLE, { type: 'shape', value: 'circle' }).config;
    const q = encodeTable(c);
    expect(q).not.toMatch(/(^|&)l=/);
    const d = decodeTable(q);
    expect(d.status).toBe('ok');
    if (d.status === 'ok') expect(d.config.baseId).toBe('central_pedestal');
  });

  it('keeps the note out of the link unless the customer opts in', () => {
    const c = cloneTable(DEFAULT_TABLE);
    c.note = 'Dužina 300 cm, za salu';
    expect(encodeTable(c)).not.toContain('n=');
    const withText = encodeTable(c, { includePersonalText: true });
    const d = decodeTable(withText);
    expect(d.status === 'ok' && d.config.note).toBe('Dužina 300 cm, za salu');
  });

  it('does not apply permissive or malformed links', () => {
    const good = encodeTable(DEFAULT_TABLE);
    const bad = [
      good.replace('w=oak', 'w=teak'), // unknown enum
      good.replace('l=1500', 'l=NaN'),
      good.replace('l=1500', 'l=-1500'),
      good.replace('l=1500', 'l=Infinity'),
      good.replace('l=1500', 'l=1500.5'),
      good.replace('l=1500', 'l=99999'), // outside development range
      good.replace('l=1500', 'l=1e3'),
      good + '&evil=1', // unknown parameter
      good + '&l=1600', // duplicate
      good.replace('sh=rectangle', 'sh=circle&b=trapezoid_pair').replace('b=trapezoid_pair&', ''), // incompatible
      'v=1&sh=rectangle', // incomplete
    ];
    for (const q of bad) {
      const r = decodeTable(q);
      expect(r.status, q).toBe('error');
    }
  });

  it('rejects unknown versions with a readable message', () => {
    const r = decodeTable(encodeTable(DEFAULT_TABLE).replace('v=1', 'v=7'));
    expect(r.status).toBe('error');
    if (r.status === 'error') {
      expect(r.reason).toBe('unknown_version');
      expect(r.message).toMatch(/drugu verziju/);
    }
  });

  it('rejects oversized payloads before parsing', () => {
    const r = decodeTable('v=1&n=' + 'a'.repeat(MAX_QUERY_LENGTH));
    expect(r.status === 'error' && r.reason).toBe('too_long');
  });

  it('ignores tracking parameters but nothing else', () => {
    expect(decodeTable(encodeTable(DEFAULT_TABLE) + '&utm_source=ig&fbclid=x').status).toBe('ok');
    expect(decodeTable('utm_source=ig').status).toBe('empty');
  });
});

describe('board permalink', () => {
  it('round-trips models, details and personalization settings', () => {
    let c = cloneBoard(DEFAULT_BOARD);
    c = applyBoardPatch(c, { type: 'dimension', key: 'length', value: 520 }).config;
    c = applyBoardPatch(c, {
      type: 'personalization',
      value: { enabled: true, text: 'Čaršija • Džemal', fontId: 'script', placement: 'center', sizeMm: 14 },
    }).config;
    const publicLink = encodeBoard(c);
    expect(publicLink).not.toContain('px=');
    const d1 = decodeBoard(publicLink);
    expect(d1.status).toBe('ok');
    if (d1.status === 'ok') {
      expect(d1.config.personalization.text).toBe('');
      expect(d1.config.personalization.fontId).toBe('script');
    }
    const privateLink = encodeBoard(c, { includePersonalText: true });
    const d2 = decodeBoard(privateLink);
    expect(d2.status).toBe('ok');
    if (d2.status === 'ok') {
      expect(d2.config.personalization.text).toBe('Čaršija • Džemal');
      expect(encodeBoard(d2.config, { includePersonalText: true })).toBe(privateLink);
    }
  });

  it('round-trips every starting model', () => {
    for (const id of ['dal-maple-beech-board', 'dal-handled-board', 'dal-two-wood-board', 'custom-rounded', 'custom-round', 'custom-paddle'] as const) {
      const c = boardFromModel(id);
      const d = decodeBoard(encodeBoard(c));
      expect(d.status, id).toBe('ok');
      if (d.status === 'ok') expect(encodeBoard(d.config)).toBe(encodeBoard(c));
    }
  });

  it('rejects incompatible combinations from a link', () => {
    const q = encodeBoard(DEFAULT_BOARD).replace('hd=none', 'hd=metal_pair'); // slots + handles
    expect(decodeBoard(q).status).toBe('error');
    const q2 = encodeBoard(boardFromModel('custom-round')).replace('hd=none', 'hd=integrated');
    expect(decodeBoard(q2).status).toBe('error');
  });

  it('hides the end-grain construction behind its flag', () => {
    const q = encodeBoard(DEFAULT_BOARD).replace('c=maple_beech_strips', 'c=end_grain_checker');
    expect(decodeBoard(q).status).toBe('error');
  });
});

describe('device storage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('saves and restores only the configuration', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });
    expect(saveConfig(DEFAULT_TABLE).ok).toBe(true);
    const raw = JSON.parse([...store.values()][0]!);
    expect(Object.keys(raw).sort()).toEqual(['config', 'savedAt']);
    expect(Object.keys(raw.config)).not.toEqual(expect.arrayContaining(['name', 'phone', 'email', 'message']));
    expect(loadSaved('table')?.config).toEqual(DEFAULT_TABLE);
  });

  it('survives blocked storage and corrupt data', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('SecurityError');
      },
    });
    expect(saveConfig(DEFAULT_TABLE).ok).toBe(false);
    expect(loadSaved('table')).toBeNull();
    vi.stubGlobal('window', {
      localStorage: { getItem: () => '{"savedAt":"x","config":{"productType":"table","schemaVersion":99}}', setItem() {}, removeItem() {} },
    });
    expect(loadSaved('table')).toBeNull();
    vi.stubGlobal('window', { localStorage: { getItem: () => '{not json', setItem() {}, removeItem() {} } });
    expect(loadSaved('board')).toBeNull();
  });
});
