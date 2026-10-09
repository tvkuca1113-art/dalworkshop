import { BOARD_RULES, boardEdge, boardModel, type BoardShapeId } from '../catalog/board';
import type { BoardConfig } from '../config/types';
import { circleHole, circleOutline, paddleOutline, roundedRectOutline } from './outline';
import type { LayoutIssue } from './table-layout';
import type { Pt } from './polygon';

/**
 * Pure board geometry in millimetres. The board lies on the floor:
 * Y = 0 bottom, Y = thickness top. X = length (handle of a paddle at +X),
 * Z = width. Grooves are real cut volumes (see three/board-geometry.ts).
 */

export type Zone = { kind: 'rect'; x0: number; x1: number; z0: number; z1: number } | { kind: 'circle'; cx: number; cz: number; r: number };

export type GrooveFeature =
  | { kind: 'slot'; x: number; z0: number; z1: number; width: number; depth: number }
  | { kind: 'channel'; path: Pt[]; width: number; depth: number; closed: true };

export interface HandleFeature {
  x: number;
  /** Distance between the two mounting feet along Z. */
  spacing: number;
  clearance: number;
  barDiameter: number;
  footDiameter: number;
}

export interface BoardLayout {
  shape: BoardShapeId;
  outline: Pt[];
  holes: Pt[][];
  extrudeOutline: Pt[];
  extrudeHoles: Pt[][];
  profileMm: number;
  profileSegments: number;
  thickness: number;
  topY: number;
  lengthMm: number;
  widthMm: number;
  cornerRadiusMm: number;
  /** Usable cutting/serving surface (handle excluded on paddles). */
  usable: { length: number; width: number };
  /** X range of the usable surface. */
  usableX: [number, number];
  grooveDepthMm: number;
  grooves: GrooveFeature[];
  handles: HandleFeature[];
  hangingHole: { x: number; z: number; diameter: number } | null;
  engravingZones: { top: Zone | null; corner: Zone | null; back: Zone | null };
  issues: LayoutIssue[];
}

export function boardShape(config: BoardConfig): BoardShapeId {
  return boardModel(config.modelId).shape;
}

export function boardPlanSize(config: BoardConfig): { length: number; width: number } {
  const d = config.dimensionsMm;
  return boardShape(config) === 'circle' ? { length: d.diameter, width: d.diameter } : { length: d.length, width: d.width };
}

export function boardCornerRadius(shape: BoardShapeId): number {
  switch (shape) {
    case 'rectangle':
      return 3;
    case 'rounded_rectangle':
      return 35;
    case 'paddle':
      return 25;
    case 'circle':
      return 0;
  }
}

/** Groove depth leaves at least `minRemainingShare` of the thickness. */
export function grooveDepthFor(thickness: number): number {
  return Math.max(0, Math.min(BOARD_RULES.maxGrooveDepthMm, Math.floor(thickness * (1 - BOARD_RULES.minRemainingShare))));
}

/** Largest standard bow-handle spacing that leaves the side margins. */
export function handleSpacingFor(width: number): number | null {
  const fits = BOARD_RULES.handleSpacingsMm.filter((s) => s + 2 * BOARD_RULES.handleSideMarginMm <= width);
  return fits.length ? fits[fits.length - 1]! : null;
}

function outlineFor(shape: BoardShapeId, length: number, width: number, inset: number): { outline: Pt[]; holes: Pt[][] } {
  const r = boardCornerRadius(shape);
  switch (shape) {
    case 'circle':
      return { outline: circleOutline(length / 2 - inset, 128), holes: [] };
    case 'paddle': {
      const halfL = length / 2 - inset;
      const hw = BOARD_RULES.paddleHandleWidthMm - 2 * inset;
      const outline = paddleOutline(halfL, width / 2 - inset, BOARD_RULES.paddleHandleLengthMm - inset, hw, Math.max(1, r - inset));
      const holeX = length / 2 - BOARD_RULES.paddleHandleWidthMm / 2;
      const holes = [circleHole(holeX, 0, BOARD_RULES.paddleHoleDiameterMm / 2 + inset)];
      return { outline, holes };
    }
    case 'rectangle':
    case 'rounded_rectangle':
      return { outline: roundedRectOutline(length / 2 - inset, width / 2 - inset, Math.max(0, r - inset)), holes: [] };
  }
}

export function computeBoardLayout(config: BoardConfig): BoardLayout {
  const shape = boardShape(config);
  const { length, width } = boardPlanSize(config);
  const T = config.dimensionsMm.thickness;
  const edge = boardEdge(config.edgeId);
  const profileMm = Math.min(edge.profileMm, Math.floor(T / 2) - 2);
  const { outline, holes } = outlineFor(shape, length, width, 0);
  const extr = outlineFor(shape, length, width, profileMm);
  const issues: LayoutIssue[] = [];
  const cornerRadiusMm = boardCornerRadius(shape);
  const halfL = length / 2;
  const halfW = width / 2;

  // Usable surface (paddle: handle excluded).
  const handleLen = shape === 'paddle' ? BOARD_RULES.paddleHandleLengthMm : 0;
  const usableX: [number, number] = [-halfL, halfL - handleLen];
  const usable = { length: length - handleLen, width };
  if (shape === 'paddle' && usable.length < BOARD_RULES.paddleMinUsableMm) {
    issues.push({ code: 'paddle_usable', message: `Korisna ploha mora biti barem ${BOARD_RULES.paddleMinUsableMm / 10} cm duga.` });
  }

  const grooveDepthMm = grooveDepthFor(T);
  const grooves: GrooveFeature[] = [];
  if (config.grooveId !== 'none' && T < BOARD_RULES.minThicknessForGroovesMm) {
    issues.push({ code: 'groove_thickness', message: `Utori traže debljinu od najmanje ${BOARD_RULES.minThicknessForGroovesMm / 10} cm.` });
  }
  if (config.grooveId === 'end_slots') {
    if (shape !== 'rectangle' && shape !== 'rounded_rectangle') {
      issues.push({ code: 'groove_shape', message: 'Utori uz krajeve predviđeni su samo za pravougaone daske.' });
    } else {
      const len = Math.round(width * BOARD_RULES.slotLengthShare);
      const x = halfL - BOARD_RULES.slotEndInsetMm;
      const m = BOARD_RULES.slotSideMarginMm;
      grooves.push({ kind: 'slot', x: -x, z0: -halfW + m, z1: -halfW + m + len, width: BOARD_RULES.slotWidthMm, depth: grooveDepthMm });
      grooves.push({ kind: 'slot', x, z0: halfW - m - len, z1: halfW - m, width: BOARD_RULES.slotWidthMm, depth: grooveDepthMm });
    }
  } else if (config.grooveId === 'perimeter_channel') {
    const inset = BOARD_RULES.channelInsetMm + BOARD_RULES.channelWidthMm / 2;
    let path: Pt[];
    if (shape === 'circle') {
      path = circleOutline(halfL - inset, 128);
    } else {
      const xr0 = usableX[0] + inset;
      const xr1 = usableX[1] - inset;
      const cx = (xr0 + xr1) / 2;
      path = roundedRectOutline((xr1 - xr0) / 2, halfW - inset, Math.max(8, cornerRadiusMm - inset + 12)).map(
        ([x, z]) => [x + cx, z] as Pt,
      );
    }
    grooves.push({ kind: 'channel', path, width: BOARD_RULES.channelWidthMm, depth: Math.min(5, grooveDepthMm), closed: true });
  }

  const handles: HandleFeature[] = [];
  if (config.handleId === 'metal_pair') {
    const spacing = handleSpacingFor(width);
    if (shape !== 'rectangle' && shape !== 'rounded_rectangle') {
      issues.push({ code: 'handle_shape', message: 'Metalne ručke predviđene su za pravougaone daske.' });
    } else if (spacing === null) {
      issues.push({ code: 'handle_width', message: 'Daska je preuska za metalne ručke s prostorom za prste.' });
    } else {
      const x = halfL - BOARD_RULES.handleEndInsetMm;
      for (const hx of [-x, x]) {
        handles.push({
          x: hx,
          spacing,
          clearance: BOARD_RULES.handleClearanceMm,
          barDiameter: BOARD_RULES.handleBarDiameterMm,
          footDiameter: BOARD_RULES.handleFootDiameterMm,
        });
      }
    }
  }
  if (config.handleId === 'integrated' && shape !== 'paddle') {
    issues.push({ code: 'integrated_shape', message: 'Drvena drška dio je oblika daske s drškom.' });
  }
  if (config.handleId !== 'integrated' && shape === 'paddle') {
    issues.push({ code: 'paddle_handle', message: 'Daska s drškom uvijek ima drvenu dršku.' });
  }
  if (grooves.some((g) => g.kind === 'slot') && handles.length) {
    issues.push({ code: 'slots_handles', message: 'Utori uz krajeve i metalne ručke zauzimaju isto mjesto.' });
  }

  const hangingHole =
    shape === 'paddle'
      ? { x: halfL - BOARD_RULES.paddleHandleWidthMm / 2, z: 0, diameter: BOARD_RULES.paddleHoleDiameterMm }
      : null;

  return {
    shape,
    outline,
    holes,
    extrudeOutline: extr.outline,
    extrudeHoles: extr.holes,
    profileMm,
    profileSegments: edge.segments,
    thickness: T,
    topY: T,
    lengthMm: length,
    widthMm: width,
    cornerRadiusMm,
    usable,
    usableX,
    grooveDepthMm,
    grooves,
    handles,
    hangingHole,
    engravingZones: engravingZones(shape, usableX, halfW, cornerRadiusMm, grooves, handles),
    issues,
  };
}

/**
 * Safe zones for personalised text. They keep a margin from edges and a
 * clearance from grooves, handles and screw positions.
 */
function engravingZones(
  shape: BoardShapeId,
  usableX: [number, number],
  halfW: number,
  cornerRadius: number,
  grooves: GrooveFeature[],
  handles: HandleFeature[],
): BoardLayout['engravingZones'] {
  const m = BOARD_RULES.engravingEdgeMarginMm;
  const clr = BOARD_RULES.engravingFeatureClearanceMm;
  const hasChannel = grooves.some((g) => g.kind === 'channel');
  const hasSlots = grooves.some((g) => g.kind === 'slot');
  const channelInset = BOARD_RULES.channelInsetMm + BOARD_RULES.channelWidthMm + clr;

  if (shape === 'circle') {
    const r = halfW;
    return {
      top: { kind: 'circle', cx: 0, cz: 0, r: r - (hasChannel ? channelInset : m) },
      corner: null,
      back: { kind: 'circle', cx: 0, cz: 0, r: r - m },
    };
  }

  const roundExtra = Math.round(cornerRadius * 0.3);
  let x0 = usableX[0] + m + roundExtra;
  let x1 = usableX[1] - m - roundExtra;
  let z0 = -halfW + m;
  let z1 = halfW - m;
  if (hasChannel) {
    x0 = usableX[0] + channelInset;
    x1 = usableX[1] - channelInset;
    z0 = -halfW + channelInset;
    z1 = halfW - channelInset;
  }
  if (hasSlots) {
    const slotInner = Math.abs(usableX[0]) - BOARD_RULES.slotEndInsetMm - BOARD_RULES.slotWidthMm / 2 - clr;
    x0 = Math.max(x0, -slotInner);
    x1 = Math.min(x1, slotInner);
  }
  let bx0 = usableX[0] + m;
  let bx1 = usableX[1] - m;
  if (handles.length) {
    const hx = Math.abs(handles[0]!.x);
    const foot = handles[0]!.footDiameter / 2;
    // finger space next to the handle on top; screw heads underneath
    const fingerSpace = 25;
    x0 = Math.max(x0, -(hx - foot - fingerSpace));
    x1 = Math.min(x1, hx - foot - fingerSpace);
    bx0 = Math.max(bx0, -(hx - foot - clr));
    bx1 = Math.min(bx1, hx - foot - clr);
  }
  const top: Zone = { kind: 'rect', x0, x1, z0, z1 };
  const corner: Zone = { kind: 'rect', x0: (x0 + x1) / 2, x1, z0: (z0 + z1) / 2, z1 };
  const back: Zone = { kind: 'rect', x0: bx0, x1: bx1, z0: -halfW + m, z1: halfW - m };
  return { top, corner, back };
}
