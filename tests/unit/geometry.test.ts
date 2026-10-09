import { describe, expect, it } from 'vitest';
import { DEFAULT_TABLE, boardFromModel, cloneTable } from '@/lib/config/defaults';
import { TABLE_BASES, TABLE_SHAPES } from '@/lib/catalog/table';
import { BOARD_MODELS } from '@/lib/catalog/board';
import {
  computeTableLayout,
  floorContactPoints,
  partYRange,
  topContactPoints,
} from '@/lib/geometry/table-layout';
import { computeBoardLayout, grooveDepthFor } from '@/lib/geometry/board-layout';
import { naturalEdgeOutline, roundedRectOutline, ellipseOutline, paddleOutline } from '@/lib/geometry/outline';
import { distanceToBoundary, pointInPolygon, polygonSelfIntersects } from '@/lib/geometry/polygon';
import type { TableConfig } from '@/lib/config/types';
import { applyTablePatch } from '@/lib/config/rules';

function table(patch: Partial<TableConfig> & { dims?: Partial<TableConfig['dimensionsMm']> } = {}): TableConfig {
  const c = cloneTable(DEFAULT_TABLE);
  Object.assign(c, patch);
  if (patch.dims) Object.assign(c.dimensionsMm, patch.dims);
  return c;
}

describe('outlines', () => {
  it('never self-intersect for any shape', () => {
    expect(polygonSelfIntersects(roundedRectOutline(750, 350, 6))).toBe(false);
    expect(polygonSelfIntersects(roundedRectOutline(600, 300, 90))).toBe(false);
    expect(polygonSelfIntersects(ellipseOutline(900, 450))).toBe(false);
    expect(polygonSelfIntersects(paddleOutline(250, 100, 110, 42, 25))).toBe(false);
    for (let seed = 0; seed < 200; seed++) {
      expect(polygonSelfIntersects(naturalEdgeOutline(900, 450, 45, seed * 7919))).toBe(false);
    }
  });

  it('detects a real self-intersection (bow-tie)', () => {
    expect(
      polygonSelfIntersects([
        [0, 0],
        [10, 10],
        [10, 0],
        [0, 10],
      ]),
    ).toBe(true);
  });

  it('natural edge is deterministic per seed and differs between seeds', () => {
    const a = naturalEdgeOutline(900, 450, 45, 42);
    const b = naturalEdgeOutline(900, 450, 45, 42);
    const c = naturalEdgeOutline(900, 450, 45, 43);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    // stays inside the nominal width
    for (const [, z] of a) expect(Math.abs(z)).toBeLessThanOrEqual(450 + 1e-9);
  });
});

describe('table layout', () => {
  const shapes = TABLE_SHAPES.map((s) => s.id);
  const cases: TableConfig[] = [];
  for (const shapeId of shapes) {
    for (const base of TABLE_BASES) {
      if (!base.shapes.includes(shapeId)) continue;
      for (const dims of [
        { length: 1200, width: 600, diameter: 800, topThickness: 25, totalHeight: 720 },
        { length: 1600, width: 900, diameter: 1500, topThickness: 50, totalHeight: 780 },
        { length: 2800, width: 1100, diameter: 1200, topThickness: 35, totalHeight: 750 },
      ]) {
        const c = table({ shapeId, baseId: base.id, dims });
        if (shapeId === 'oval') {
          c.dimensionsMm.length = Math.max(1400, Math.min(2600, c.dimensionsMm.length));
          c.dimensionsMm.width = Math.max(800, c.dimensionsMm.width);
        }
        if (base.id === 'central_pedestal' && shapeId !== 'circle' && c.dimensionsMm.length > 1600) continue;
        cases.push(c);
      }
    }
  }

  it.each(cases.map((c) => [`${c.shapeId}/${c.baseId}/${c.dimensionsMm.length}`, c]))(
    '%s: top at total height, supports on the floor and under the wood',
    (_name, c) => {
      const layout = computeTableLayout(c as TableConfig);
      const cfg = c as TableConfig;
      expect(layout.issues).toEqual([]);
      expect(layout.topY).toBe(cfg.dimensionsMm.totalHeight);
      expect(layout.undersideY).toBe(cfg.dimensionsMm.totalHeight - cfg.dimensionsMm.topThickness);
      const ys = layout.baseParts.map(partYRange);
      expect(Math.min(...ys.map((y) => y.min))).toBe(0);
      expect(Math.max(...ys.map((y) => y.max))).toBe(layout.undersideY);
      for (const y of ys) expect(y.max).toBeLessThanOrEqual(layout.undersideY);
      // supports touch the underside inside the top outline, with a margin
      const contacts = topContactPoints(layout);
      expect(contacts.length).toBeGreaterThan(0);
      for (const p of contacts) {
        expect(pointInPolygon(p, layout.outline)).toBe(true);
        expect(distanceToBoundary(p, layout.outline)).toBeGreaterThanOrEqual(5);
      }
      // feet stay under the footprint of the top
      for (const p of floorContactPoints(layout)) {
        expect(pointInPolygon(p, layout.outline)).toBe(true);
      }
    },
  );

  it('leg height follows total height and top thickness', () => {
    const a = computeTableLayout(table({ dims: { totalHeight: 720, topThickness: 25 } }));
    const b = computeTableLayout(table({ dims: { totalHeight: 780, topThickness: 50 } }));
    expect(a.undersideY).toBe(695);
    expect(b.undersideY).toBe(730);
  });

  it('edge profile stays below half the thickness', () => {
    for (const edgeId of ['straight', 'rounded'] as const) {
      const l = computeTableLayout(table({ edgeId, dims: { topThickness: 25 } }));
      expect(l.profileMm).toBeLessThan(25 / 2);
      expect(polygonSelfIntersects(l.extrudeOutline)).toBe(false);
    }
  });

  it('trapezoid frame is wider at the floor (as on the photo)', () => {
    const l = computeTableLayout(DEFAULT_TABLE);
    expect(l.frameBottomSpan).toBeGreaterThan(l.frameTopSpan);
    expect(l.frameTopSpan).toBeLessThan(700);
  });
});

describe('table rules', () => {
  it('switching to a round top moves to the central pedestal with a visible notice and undo', () => {
    const { config, notices } = applyTablePatch(DEFAULT_TABLE, { type: 'shape', value: 'circle' });
    expect(config.baseId).toBe('central_pedestal');
    expect(notices.some((n) => n.id === 'base-auto' && n.undo)).toBe(true);
  });

  it('long tops cannot keep the central pedestal', () => {
    const short = applyTablePatch(table({ dims: { length: 1400 } }), { type: 'base', value: 'central_pedestal' }).config;
    expect(short.baseId).toBe('central_pedestal');
    const { config, notices } = applyTablePatch(short, { type: 'dimension', key: 'length', value: 2000 });
    expect(config.baseId).toBe('trapezoid_pair');
    expect(notices[0]?.message).toMatch(/Postolje je promijenjeno/);
  });

  it('a disabled base cannot be selected directly', () => {
    const round = applyTablePatch(DEFAULT_TABLE, { type: 'shape', value: 'circle' }).config;
    const { config, notices } = applyTablePatch(round, { type: 'base', value: 'trapezoid_pair' });
    expect(config.baseId).toBe('central_pedestal');
    expect(notices[0]?.id).toBe('base-blocked');
  });

  it('oval clamps dimensions to its own range and says so', () => {
    const c = table({ dims: { length: 1200, width: 600 } });
    const { config, notices } = applyTablePatch(c, { type: 'shape', value: 'oval' });
    expect(config.dimensionsMm.length).toBe(1400);
    expect(config.dimensionsMm.width).toBe(800);
    expect(notices.length).toBe(2);
  });

  it('marks the published example and custom variants', () => {
    expect(applyTablePatch(DEFAULT_TABLE, { type: 'wood', value: 'oak' }).config.modelId).toBe('dal-oak-table-150-70');
    expect(applyTablePatch(DEFAULT_TABLE, { type: 'wood', value: 'walnut' }).config.modelId).toBe('custom');
  });
});

describe('board layout', () => {
  it('grooves never cut through and leave enough material', () => {
    for (let t = 15; t <= 40; t++) {
      const depth = grooveDepthFor(t);
      expect(depth).toBeLessThan(t);
      expect(t - depth).toBeGreaterThanOrEqual(t * 0.65);
    }
  });

  it.each(BOARD_MODELS.map((m) => [m.id]))('%s: features stay inside the outline with margins', (id) => {
    const c = boardFromModel(id as (typeof BOARD_MODELS)[number]['id']);
    const layout = computeBoardLayout(c);
    expect(layout.issues).toEqual([]);
    expect(polygonSelfIntersects(layout.outline)).toBe(false);
    for (const g of layout.grooves) {
      if (g.kind === 'slot') {
        for (const z of [g.z0, g.z1]) {
          for (const dx of [-g.width / 2, g.width / 2]) {
            const p = [g.x + dx, z] as const;
            expect(pointInPolygon(p, layout.outline)).toBe(true);
            expect(distanceToBoundary(p, layout.outline)).toBeGreaterThanOrEqual(15);
          }
        }
      } else {
        for (const p of g.path) expect(distanceToBoundary(p, layout.outline)).toBeGreaterThanOrEqual(g.width);
      }
    }
    for (const h of layout.handles) {
      for (const z of [-h.spacing / 2, h.spacing / 2]) {
        expect(pointInPolygon([h.x, z], layout.outline)).toBe(true);
        expect(distanceToBoundary([h.x, z], layout.outline)).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it('paddle reports usable surface without the handle', () => {
    const l = computeBoardLayout(boardFromModel('custom-paddle'));
    expect(l.usable.length).toBe(500 - 110);
    expect(l.hangingHole).not.toBeNull();
  });
});
