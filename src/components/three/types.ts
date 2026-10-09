import type { Rect } from '@/lib/engraving/fit';
import type { MeasuredText } from '@/lib/engraving/measure';
import type { EngravingFontId, EngravingPlacementId } from '@/lib/catalog/board';

export type ViewPreset = 'default' | 'front' | 'top' | 'edge' | 'back';

export interface ViewRequest {
  preset: ViewPreset;
  /** Changes on every request so the same preset can be re-applied. */
  nonce: number;
}

export type ViewerPhase = 'starting' | 'materials' | 'ready' | 'lost' | 'error';

export interface EngravingRender {
  measured: MeasuredText;
  fontId: EngravingFontId;
  placement: EngravingPlacementId;
  sizeMm: number;
  rect: Rect;
  /** Changes when the font face finished loading. */
  fontKey: string;
}

export type TextureQualityLevel = 'high' | 'low';

export interface ViewerDebugInfo {
  phase: ViewerPhase;
  product: 'table' | 'board' | null;
  geometryKey: string;
  /** Triangles of visible meshes in the scene (one pass). */
  triangles: number;
  /** Draw calls of visible meshes in the main pass (shadow pass adds casters). */
  drawCalls: number;
  /** GPU resources currently held by the renderer. */
  memory: { geometries: number; textures: number };
  camera: { position: [number, number, number]; target: [number, number, number] };
  engraving: null | {
    placement: EngravingPlacementId;
    worldY: number;
    surfaceY: number;
    corners: [number, number, number][];
    insideBoard: boolean;
  };
}
