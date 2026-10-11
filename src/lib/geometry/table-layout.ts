import { baseOption, edgeOption, shapeOption, TABLE_RULES } from '../catalog/table';
import type { TableConfig } from '../config/types';
import { circleOutline, ellipseOutline, naturalEdgeOutline, roundedRectOutline } from './outline';
import { extentAtX, insetConvex, minHalfWidthBetween, type Pt } from './polygon';

/**
 * Pure table geometry in millimetres. Coordinate system: X = length,
 * Z = width, Y = height, floor at Y = 0. The 3D model, the 2D drawing,
 * dimension labels and the rule checks all read from this one layout.
 */

export type BasePart =
  | {
      kind: 'prism';
      role: 'frame' | 'leg' | 'rail';
      /** Polygon in the Z–Y plane, extruded along X around `x`. */
      polygon: Pt[];
      holes?: Pt[][];
      x: number;
      depth: number;
    }
  | {
      kind: 'plate';
      role: 'base_plate' | 'top_plate';
      /** Plan outline (X–Z). */
      outline: Pt[];
      y0: number;
      y1: number;
    }
  | { kind: 'column'; x: number; z: number; radius: number; y0: number; y1: number };

export interface LayoutIssue {
  code: string;
  message: string;
}

export interface TableLayout {
  /** Plan outline at full size. */
  outline: Pt[];
  /** Outline used for extrusion (inset by the edge profile). */
  extrudeOutline: Pt[];
  profileMm: number;
  profileSegments: number;
  topY: number;
  undersideY: number;
  thickness: number;
  lengthMm: number;
  widthMm: number;
  baseParts: BasePart[];
  /** X positions of frame pairs (empty for the pedestal). */
  frameXs: number[];
  /** Span of the frame along Z at the underside / at the floor. */
  frameTopSpan: number;
  frameBottomSpan: number;
  issues: LayoutIssue[];
}

export function tableOutline(config: TableConfig, inset = 0): Pt[] {
  const d = config.dimensionsMm;
  const shape = shapeOption(config.shapeId);
  switch (config.shapeId) {
    case 'circle':
      return circleOutline(d.diameter / 2 - inset);
    case 'oval':
      return ellipseOutline(d.length / 2 - inset, d.width / 2 - inset);
    case 'natural_edge':
      return naturalEdgeOutline(d.length / 2 - inset, d.width / 2 - inset, TABLE_RULES.naturalEdgeMaxDeviationMm, config.seed);
    case 'rectangle':
    case 'rounded_rectangle':
      return roundedRectOutline(d.length / 2 - inset, d.width / 2 - inset, Math.max(0, (shape.cornerRadiusMm ?? 0) - inset));
  }
}

export function tablePlanSize(config: TableConfig): { length: number; width: number } {
  const d = config.dimensionsMm;
  return config.shapeId === 'circle' ? { length: d.diameter, width: d.diameter } : { length: d.length, width: d.width };
}

export function frameInsetFromEnd(config: TableConfig): number {
  const { length } = tablePlanSize(config);
  if (config.shapeId === 'oval') return Math.round(length * 0.2);
  return Math.round(Math.min(250, Math.max(100, length * 0.1)));
}

export function computeTableLayout(config: TableConfig): TableLayout {
  const d = config.dimensionsMm;
  const edge = edgeOption(config.edgeId);
  const base = baseOption(config.baseId);
  const { length, width } = tablePlanSize(config);
  const thickness = d.topThickness;
  const topY = d.totalHeight;
  const undersideY = topY - thickness;
  // The profile must stay well below half the thickness and the half sizes.
  const profileMm = Math.min(edge.profileMm, Math.floor(thickness / 2) - 2, Math.floor(width / 4));
  const outline = tableOutline(config);
  const extrudeOutline = tableOutline(config, profileMm);
  const issues: LayoutIssue[] = [];
  const parts: BasePart[] = [];
  const frameXs: number[] = [];
  let frameTopSpan = 0;
  let frameBottomSpan = 0;

  const legHeight = undersideY; // frames run from the floor to the underside
  const { face, depth } = base.profileMm;

  if (!base.shapes.includes(config.shapeId)) {
    issues.push({ code: 'base_shape', message: `${base.label} nije predviđeno za oblik „${shapeOption(config.shapeId).short}“.` });
  }

  if (config.baseId === 'central_pedestal') {
    if (config.shapeId !== 'circle' && length > TABLE_RULES.pedestalMaxLengthMm) {
      issues.push({
        code: 'pedestal_length',
        message: `Centralno postolje predlažemo za ploče do ${TABLE_RULES.pedestalMaxLengthMm / 10} cm dužine.`,
      });
    }
    const plateT = 12;
    const topPlateT = 10;
    const baseOutline =
      config.shapeId === 'circle'
        ? circleOutline(Math.round(Math.min(380, Math.max(220, d.diameter * 0.3))), 96)
        : roundedRectOutline(Math.round(length * 0.24), Math.round(width * 0.3), 30);
    const topPlateR = Math.round(Math.min(250, Math.max(120, Math.min(length, width) * 0.2)));
    parts.push({ kind: 'plate', role: 'base_plate', outline: baseOutline, y0: 0, y1: plateT });
    parts.push({ kind: 'column', x: 0, z: 0, radius: face / 2, y0: plateT, y1: undersideY - topPlateT });
    parts.push({ kind: 'plate', role: 'top_plate', outline: circleOutline(topPlateR, 64), y0: undersideY - topPlateT, y1: undersideY });
  } else {
    const inset = frameInsetFromEnd(config);
    const xFrame = length / 2 - inset - depth / 2;
    frameXs.push(-xFrame, xFrame);
    // Narrowest half-width of the top over the frame depth (plan view).
    const halfAvail = minHalfWidthBetween(outline, xFrame - depth / 2, xFrame + depth / 2);
    const margin = Math.max(TABLE_RULES.frameEdgeMarginMm, Math.round(width * 0.11));
    frameTopSpan = Math.round(2 * (halfAvail - margin));
    if (config.baseId === 'trapezoid_pair') {
      // Slightly trapezoidal: wider at the floor, feet still under the top.
      frameBottomSpan = Math.round(Math.min(frameTopSpan + 100, 2 * (halfAvail - 10)));
    } else {
      frameBottomSpan = frameTopSpan;
    }
    if (frameTopSpan < 300) {
      issues.push({ code: 'frame_width', message: 'Ploča je preuska na mjestu nosača za ovaj par okvira.' });
    }
    for (const x of frameXs) {
      parts.push(...framePartsAt(config.baseId, x, depth, face, frameTopSpan, frameBottomSpan, legHeight));
    }
  }

  return {
    outline,
    extrudeOutline,
    profileMm,
    profileSegments: edge.segments,
    topY,
    undersideY,
    thickness,
    lengthMm: length,
    widthMm: width,
    baseParts: parts,
    frameXs,
    frameTopSpan,
    frameBottomSpan,
    issues,
  };
}

function framePartsAt(
  baseId: TableConfig['baseId'],
  x: number,
  depth: number,
  face: number,
  topSpan: number,
  bottomSpan: number,
  h: number,
): BasePart[] {
  const st = topSpan / 2;
  const sb = bottomSpan / 2;
  switch (baseId) {
    case 'trapezoid_pair': {
      const outer: Pt[] = [
        [-sb, 0],
        [sb, 0],
        [st, h],
        [-st, h],
      ];
      const inner = insetConvex(outer, face).reverse();
      return [{ kind: 'prism', role: 'frame', polygon: outer, holes: [inner], x, depth }];
    }
    case 'u_frame_pair': {
      const t = face;
      const polygon: Pt[] = [
        [-st, 0],
        [-st + t, 0],
        [-st + t, h - t],
        [st - t, h - t],
        [st - t, 0],
        [st, 0],
        [st, h],
        [-st, h],
      ];
      return [{ kind: 'prism', role: 'frame', polygon, x, depth }];
    }
    case 'wood_panel_pair':
      return [{ kind: 'prism', role: 'frame', polygon: [[-st, 0], [st, 0], [st, h], [-st, h]], x, depth }];
    case 'wood_tapered_four': {
      const t = face;
      return [
        { kind: 'prism', role: 'leg', polygon: [[-st, 0], [-st + t * .6, 0], [-st + t, h], [-st, h]], x, depth },
        { kind: 'prism', role: 'leg', polygon: [[st - t * .6, 0], [st, 0], [st, h], [st - t, h]], x, depth },
        { kind: 'prism', role: 'rail', polygon: [[-st, h - t], [st, h - t], [st, h], [-st, h]], x, depth },
      ];
    }
    case 'a_frame_pair': {
      const t = face;
      const neck = st * .55;
      const tieY = h * .32;
      return [
        { kind: 'prism', role: 'leg', polygon: [[-st, 0], [-st + t, 0], [-neck + t, h - t], [-neck, h - t]], x, depth },
        { kind: 'prism', role: 'leg', polygon: [[st - t, 0], [st, 0], [neck, h - t], [neck - t, h - t]], x, depth },
        { kind: 'prism', role: 'rail', polygon: [[-st, h - t], [st, h - t], [st, h], [-st, h]], x, depth },
        { kind: 'prism', role: 'rail', polygon: [[-st * .82, tieY], [st * .82, tieY], [st * .82, tieY + t], [-st * .82, tieY + t]], x, depth },
      ];
    }
    case 'x_frame_pair': {
      const railH = face;
      const yTop = h - railH;
      const rail: Pt[] = [
        [-st, yTop],
        [st, yTop],
        [st, h],
        [-st, h],
      ];
      const bar = (zBottom: number, zTop: number): Pt[] => {
        const angle = Math.atan2(Math.abs(zTop - zBottom), yTop);
        const hw = face / 2 / Math.cos(angle);
        return [
          [zBottom - hw, 0],
          [zBottom + hw, 0],
          [zTop + hw, yTop],
          [zTop - hw, yTop],
        ];
      };
      const reach = st - face;
      return [
        { kind: 'prism', role: 'rail', polygon: rail, x, depth },
        { kind: 'prism', role: 'leg', polygon: bar(-reach, reach), x, depth },
        { kind: 'prism', role: 'leg', polygon: bar(reach, -reach), x, depth },
      ];
    }
    case 'central_pedestal':
      return [];
  }
}

/** Vertical extent of a base part (mm). */
export function partYRange(part: BasePart): { min: number; max: number } {
  switch (part.kind) {
    case 'prism': {
      const ys = part.polygon.map((p) => p[1]);
      return { min: Math.min(...ys), max: Math.max(...ys) };
    }
    case 'plate':
      return { min: part.y0, max: part.y1 };
    case 'column':
      return { min: part.y0, max: part.y1 };
  }
}

/**
 * Points where the base touches the underside of the top, in plan (X–Z).
 * Used to verify that supports sit under the wood, not outside it.
 */
export function topContactPoints(layout: TableLayout): Pt[] {
  const pts: Pt[] = [];
  for (const part of layout.baseParts) {
    if (part.kind === 'prism') {
      const atTop = part.polygon.filter((p) => Math.abs(p[1] - layout.undersideY) < 1e-6);
      for (const [z] of atTop) {
        pts.push([part.x - part.depth / 2, z], [part.x + part.depth / 2, z]);
      }
    } else if (part.kind === 'plate' && part.role === 'top_plate') {
      pts.push(...part.outline);
    }
  }
  return pts;
}

/** Floor contact points in plan (X–Z). */
export function floorContactPoints(layout: TableLayout): Pt[] {
  const pts: Pt[] = [];
  for (const part of layout.baseParts) {
    if (part.kind === 'prism') {
      for (const [z, y] of part.polygon) {
        if (Math.abs(y) < 1e-6) pts.push([part.x - part.depth / 2, z], [part.x + part.depth / 2, z]);
      }
    } else if (part.kind === 'plate' && part.role === 'base_plate') {
      pts.push(...part.outline);
    }
  }
  return pts;
}

/** Width of the top at a given X (useful for checks and the 2D drawing). */
export function topWidthAt(layout: TableLayout, x: number): number {
  const e = extentAtX(layout.outline, x);
  return e ? e.max - e.min : 0;
}
