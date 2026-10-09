import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { DEFAULT_BOARD, DEFAULT_TABLE, boardFromModel, cloneTable } from '@/lib/config/defaults';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import { computeBoardLayout } from '@/lib/geometry/board-layout';
import { buildTableBase, buildTableTop } from '@/lib/three/table-geometry';
import { buildBoardBody, buildBoardHandles } from '@/lib/three/board-geometry';
import { applyBoardPatch, applyTablePatch } from '@/lib/config/rules';

const mapping = (topY: number) => ({ spanU: 2.9, spanV: 1.6, originX: -1.45, originZ: -0.8, topY, endDepth: 0.06 });

function box(g: THREE.BufferGeometry) {
  g.computeBoundingBox();
  return g.boundingBox!;
}

describe('3D table geometry', () => {
  it('top sits at the total height with the real thickness, base spans floor → underside', () => {
    const layout = computeTableLayout(DEFAULT_TABLE);
    const top = buildTableTop(layout, mapping(0.75));
    const base = buildTableBase(layout);
    const tb = box(top);
    const bb = box(base);
    expect(tb.max.y).toBeCloseTo(0.75, 6);
    expect(tb.min.y).toBeCloseTo(0.715, 6);
    expect(tb.max.x - tb.min.x).toBeCloseTo(1.5, 4);
    expect(tb.max.z - tb.min.z).toBeCloseTo(0.7, 4);
    expect(bb.min.y).toBeCloseTo(0, 6);
    expect(bb.max.y).toBeCloseTo(0.715, 6);
    // supports stay under the top footprint
    expect(bb.min.x).toBeGreaterThan(tb.min.x);
    expect(bb.max.x).toBeLessThan(tb.max.x);
    expect(bb.min.z).toBeGreaterThan(tb.min.z);
    expect(bb.max.z).toBeLessThan(tb.max.z);
    // three material groups: face, side, end
    expect(top.groups.map((g) => g.materialIndex)).toEqual([0, 1, 2]);
  });

  it('dimensions change geometry proportionally without scaling profiles', () => {
    let c = cloneTable(DEFAULT_TABLE);
    c = applyTablePatch(c, { type: 'dimension', key: 'length', value: 2400 }).config;
    c = applyTablePatch(c, { type: 'dimension', key: 'topThickness', value: 50 }).config;
    const layout = computeTableLayout(c);
    const tb = box(buildTableTop(layout, mapping(0.75)));
    expect(tb.max.x - tb.min.x).toBeCloseTo(2.4, 4);
    expect(tb.max.y - tb.min.y).toBeCloseTo(0.05, 5);
    // frame profile stays 60 mm deep along X
    const base = buildTableBase(layout);
    const pos = base.getAttribute('position');
    const xs = new Set<number>();
    for (let i = 0; i < pos.count; i++) if (pos.getX(i) > 0) xs.add(Math.round(pos.getX(i) * 10000));
    const max = Math.max(...xs) / 10000;
    const min = Math.min(...xs) / 10000;
    expect(max - min).toBeCloseTo(0.06, 3);
  });

  it('round table pedestal rests on the floor and under the top', () => {
    const c = applyTablePatch(DEFAULT_TABLE, { type: 'shape', value: 'circle' }).config;
    const bb = box(buildTableBase(computeTableLayout(c)));
    expect(bb.min.y).toBeCloseTo(0, 6);
    expect(bb.max.y).toBeCloseTo(0.715, 6);
  });
});

describe('3D board geometry', () => {
  it('end slots are cut into the board without going through', () => {
    const layout = computeBoardLayout(DEFAULT_BOARD);
    const body = buildBoardBody(layout, { spanU: 0.84, spanV: 0.28, originX: -0.42, originZ: -0.14, topY: 0.04, endDepth: 0.045 });
    const b = box(body);
    expect(b.min.y).toBeCloseTo(0, 6);
    expect(b.max.y).toBeCloseTo(0.04, 6);
    // there must be geometry at the groove bottom depth, inside the board
    const pos = body.getAttribute('position');
    const depth = layout.grooveDepthMm / 1000;
    let lowest = Infinity;
    const slot = layout.grooves[0]!;
    if (slot.kind !== 'slot') throw new Error('slot expected');
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) * 1000;
      const z = pos.getZ(i) * 1000;
      if (Math.abs(x - slot.x) < 7 && z > slot.z0 && z < slot.z1) lowest = Math.min(lowest, pos.getY(i));
    }
    expect(lowest).toBeCloseTo(0.04 - depth, 3);
    expect(lowest).toBeGreaterThan(0.04 * 0.6);
  });

  it('perimeter channel is a real cut', () => {
    const c = applyBoardPatch(DEFAULT_BOARD, { type: 'groove', value: 'perimeter_channel' }).config;
    const layout = computeBoardLayout(c);
    const body = buildBoardBody(layout, { spanU: 0.84, spanV: 0.28, originX: -0.42, originZ: -0.14, topY: 0.04, endDepth: 0.045 });
    const pos = body.getAttribute('position');
    let min = Infinity;
    for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0.02) min = Math.min(min, pos.getY(i));
    expect(min).toBeLessThan(0.04 - 0.003);
    expect(min).toBeGreaterThan(0.04 - 0.0061);
  });

  it('metal handles stand on the top face', () => {
    const layout = computeBoardLayout(boardFromModel('dal-handled-board'));
    const handles = buildBoardHandles(layout)!;
    const b = box(handles);
    expect(b.min.y).toBeCloseTo(layout.topY / 1000, 4);
    expect(b.max.y).toBeGreaterThan(layout.topY / 1000 + 0.025);
  });
});
