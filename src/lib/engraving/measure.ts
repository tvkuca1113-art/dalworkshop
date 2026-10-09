'use client';

import { engravingFont, type EngravingFontId } from '../catalog/board';
import { REFERENCE_SIZE, type TextMetrics100 } from './fit';

/**
 * Browser-side text measurement with the real, locally hosted fonts.
 * Uses canvas actualBoundingBox* so diacritics (Č Ć Ž Š Đ) and descenders
 * are part of the box.
 */

export const LINE_ADVANCE = 1.22;

export function fontFamilyFor(fontId: EngravingFontId): string {
  const font = engravingFont(fontId);
  if (typeof window === 'undefined') return 'serif';
  const value = getComputedStyle(document.documentElement).getPropertyValue(font.cssVar).trim();
  return value || 'serif';
}

export function fontString(fontId: EngravingFontId, px: number): string {
  const font = engravingFont(fontId);
  return `${font.weight} ${px}px ${fontFamilyFor(fontId)}`;
}

export async function ensureFont(fontId: EngravingFontId, text: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await document.fonts.load(fontString(fontId, REFERENCE_SIZE), text || 'ČĆŽŠĐ');
  } catch {
    /* measuring with a fallback font is still better than nothing */
  }
}

export interface LineBox {
  text: string;
  left: number;
  right: number;
  ascent: number;
  descent: number;
}

export interface MeasuredText extends TextMetrics100 {
  lines: LineBox[];
  /** Offset of the first baseline from the top of the ink box (units at size 100). */
  top: number;
}

let scratch: HTMLCanvasElement | null = null;

export function measureLines(lines: string[], fontId: EngravingFontId): MeasuredText {
  scratch ??= document.createElement('canvas');
  const ctx = scratch.getContext('2d')!;
  ctx.font = fontString(fontId, REFERENCE_SIZE);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const boxes: LineBox[] = lines.map((text) => {
    const m = ctx.measureText(text);
    return {
      text,
      left: m.actualBoundingBoxLeft,
      right: m.actualBoundingBoxRight,
      ascent: m.actualBoundingBoxAscent,
      descent: m.actualBoundingBoxDescent,
    };
  });
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  boxes.forEach((b, i) => {
    const baseline = i * LINE_ADVANCE * REFERENCE_SIZE;
    minX = Math.min(minX, -b.left);
    maxX = Math.max(maxX, b.right);
    minY = Math.min(minY, baseline - b.ascent);
    maxY = Math.max(maxY, baseline + b.descent);
  });
  // symmetric width around the centre so centred lines stay centred
  const half = Math.max(Math.abs(minX), Math.abs(maxX));
  return { width: 2 * half, height: maxY - minY, lines: boxes, top: -minY };
}

/**
 * Draws the text into a canvas exactly filling the ink box (plus padding).
 * Returns the canvas and the padding in mm so the caller can size the plane.
 */
export function drawEngraving(
  measured: MeasuredText,
  fontId: EngravingFontId,
  sizeMm: number,
  pxPerMm: number,
  colour = 'rgba(46, 28, 16, 0.92)',
): { canvas: HTMLCanvasElement; padMm: number } {
  const padMm = 1;
  const k = (sizeMm / REFERENCE_SIZE) * pxPerMm;
  const wPx = Math.ceil(measured.width * k + 2 * padMm * pxPerMm);
  const hPx = Math.ceil(measured.height * k + 2 * padMm * pxPerMm);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(8, Math.min(2048, wPx));
  canvas.height = Math.max(8, Math.min(1024, hPx));
  const ctx = canvas.getContext('2d')!;
  const fit = Math.min(canvas.width / wPx, canvas.height / hPx, 1);
  ctx.scale(fit, fit);
  ctx.font = fontString(fontId, REFERENCE_SIZE * k);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = wPx / 2;
  const top = padMm * pxPerMm + measured.top * k;
  // a soft darker halo imitates burnt wood around a laser/hot engraving
  ctx.shadowColor = 'rgba(60, 35, 18, 0.45)';
  ctx.shadowBlur = Math.max(1, pxPerMm * 0.35);
  ctx.fillStyle = colour;
  measured.lines.forEach((line, i) => {
    ctx.fillText(line.text, cx, top + i * LINE_ADVANCE * REFERENCE_SIZE * k);
  });
  return { canvas, padMm };
}
