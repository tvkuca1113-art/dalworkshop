import { PERSONALIZATION, type EngravingPlacementId } from '../catalog/board';
import type { BoardLayout, Zone } from '../geometry/board-layout';
import type { Personalization } from '../config/types';

/**
 * Personalised text fitting. Text metrics are measured in the browser with
 * the real font (canvas actualBoundingBox*, so č ć ž š đ Đ and descenders
 * count) at a reference size of 100 units; everything here scales linearly.
 */

export const REFERENCE_SIZE = 100;

export interface TextMetrics100 {
  /** Ink box at reference size (font size = 100 units). */
  width: number;
  height: number;
}

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export type TextValidation = { ok: true; lines: string[] } | { ok: false; message: string };

/** Glyph ranges covered by the three bundled fonts (Latin + Latin Extended + punctuation). */
function supportedChar(ch: string): boolean {
  const c = ch.codePointAt(0)!;
  return (
    (c >= 0x20 && c <= 0x7e) ||
    (c >= 0xa0 && c <= 0x24f) ||
    (c >= 0x2000 && c <= 0x206f) ||
    c === 0x20ac
  );
}

/** Validates text exactly as typed — nothing is corrected or trimmed silently. */
export function validateEngravingText(text: string): TextValidation {
  const lines = text.split('\n');
  if (lines.length > PERSONALIZATION.maxLines) {
    return { ok: false, message: `Najviše ${PERSONALIZATION.maxLines} reda teksta.` };
  }
  const chars = Array.from(lines.join(''));
  if (chars.length === 0 || lines.every((l) => l.trim() === '')) {
    return { ok: false, message: 'Upišite tekst za personalizaciju.' };
  }
  if (chars.length > PERSONALIZATION.maxChars) {
    return { ok: false, message: `Najviše ${PERSONALIZATION.maxChars} znakova (sada ${chars.length}).` };
  }
  if (lines.length === 2 && lines.some((l) => l.trim() === '')) {
    return { ok: false, message: 'Drugi red je prazan — obrišite prelazak u novi red ili dopišite tekst.' };
  }
  const bad = chars.find((ch) => !supportedChar(ch));
  if (bad) {
    return { ok: false, message: `Znak „${bad}“ nije podržan u fontovima za personalizaciju.` };
  }
  return { ok: true, lines };
}

export function countChars(text: string): number {
  return Array.from(text.replace(/\n/g, '')).length;
}

export function boxAt(metrics: TextMetrics100, sizeMm: number): { w: number; h: number } {
  const k = sizeMm / REFERENCE_SIZE;
  return { w: metrics.width * k, h: metrics.height * k };
}

/** Position a box inside a zone. Corner anchoring uses the +X/+Z corner. */
export function placeBox(zone: Zone, box: { w: number; h: number }, anchor: 'center' | 'corner'): { fits: boolean; rect: Rect } {
  if (zone.kind === 'circle') {
    const rect = { x0: zone.cx - box.w / 2, x1: zone.cx + box.w / 2, z0: zone.cz - box.h / 2, z1: zone.cz + box.h / 2 };
    const fits = Math.hypot(box.w / 2, box.h / 2) <= zone.r + 1e-9;
    return { fits, rect };
  }
  const zw = zone.x1 - zone.x0;
  const zh = zone.z1 - zone.z0;
  const fits = box.w <= zw + 1e-9 && box.h <= zh + 1e-9 && zw > 0 && zh > 0;
  if (anchor === 'corner') {
    return { fits, rect: { x0: zone.x1 - box.w, x1: zone.x1, z0: zone.z1 - box.h, z1: zone.z1 } };
  }
  const cx = (zone.x0 + zone.x1) / 2;
  const cz = (zone.z0 + zone.z1) / 2;
  return { fits, rect: { x0: cx - box.w / 2, x1: cx + box.w / 2, z0: cz - box.h / 2, z1: cz + box.h / 2 } };
}

/** Largest whole-millimetre text size that fits the zone. */
export function maxSizeInZone(zone: Zone, metrics: TextMetrics100): number {
  if (metrics.width <= 0 || metrics.height <= 0) return 0;
  let k: number;
  if (zone.kind === 'circle') {
    k = zone.r / Math.hypot(metrics.width / 2, metrics.height / 2);
  } else {
    const zw = zone.x1 - zone.x0;
    const zh = zone.z1 - zone.z0;
    if (zw <= 0 || zh <= 0) return 0;
    k = Math.min(zw / metrics.width, zh / metrics.height);
  }
  return Math.floor(k * REFERENCE_SIZE + 1e-9);
}

export function zoneFor(layout: BoardLayout, placement: EngravingPlacementId): Zone | null {
  switch (placement) {
    case 'corner':
      return layout.engravingZones.corner;
    case 'center':
      return layout.engravingZones.top;
    case 'back':
      return layout.engravingZones.back;
  }
}

export type EngravingEvaluation =
  | { status: 'disabled' }
  | { status: 'invalid_text'; message: string }
  | { status: 'placement_unavailable'; message: string; alternatives: Alternative[] }
  | { status: 'too_large'; message: string; maxSizeHere: number; alternatives: Alternative[] }
  | { status: 'ok'; rect: Rect; placement: EngravingPlacementId; sizeMm: number };

export interface Alternative {
  placement: EngravingPlacementId;
  /** Largest size that fits at that placement (mm). */
  maxSize: number;
  /** Whether the current size already fits there. */
  fitsCurrent: boolean;
}

export function evaluateEngraving(
  layout: BoardLayout,
  p: Personalization,
  metrics: TextMetrics100 | null,
): EngravingEvaluation | { status: 'measuring' } {
  if (!p.enabled) return { status: 'disabled' };
  const v = validateEngravingText(p.text);
  if (!v.ok) return { status: 'invalid_text', message: v.message };
  if (!metrics) return { status: 'measuring' };

  const placements: EngravingPlacementId[] = ['corner', 'center', 'back'];
  const minSize = PERSONALIZATION.sizeRangeMm[0];
  const alternatives: Alternative[] = placements
    .filter((pl) => pl !== p.placement)
    .map((pl) => {
      const zone = zoneFor(layout, pl);
      if (!zone) return null;
      const maxSize = Math.min(PERSONALIZATION.sizeRangeMm[1], maxSizeInZone(zone, metrics));
      return { placement: pl, maxSize, fitsCurrent: maxSize >= p.sizeMm };
    })
    .filter((a): a is Alternative => a !== null && a.maxSize >= minSize);

  const zone = zoneFor(layout, p.placement);
  if (!zone) {
    return {
      status: 'placement_unavailable',
      message: 'Ovaj položaj nije moguć za izabrani oblik daske.',
      alternatives,
    };
  }
  const placed = placeBox(zone, boxAt(metrics, p.sizeMm), p.placement === 'corner' ? 'corner' : 'center');
  if (!placed.fits) {
    const maxSizeHere = maxSizeInZone(zone, metrics);
    return {
      status: 'too_large',
      message:
        maxSizeHere >= minSize
          ? `Natpis je prevelik za ovo mjesto. Najveća veličina ovdje je ${maxSizeHere} mm.`
          : 'Natpis ne stane na ovo mjesto ni u najmanjoj veličini.',
      maxSizeHere,
      alternatives,
    };
  }
  return { status: 'ok', rect: placed.rect, placement: p.placement, sizeMm: p.sizeMm };
}
