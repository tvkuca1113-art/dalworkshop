import * as THREE from 'three';
import { generateWoodPixels, plankStrips, type StripLayout, type WoodTextureRequest } from './wood-texture';
import type { WoodSpecies } from '../catalog/woods';


/**
 * Wood materials built from procedural pixels. Colour maps are sRGB, the
 * data map (height + roughness) has no colour space. Textures for table
 * species are cached and shared — callers must NOT dispose cached entries.
 */

export interface WoodTextureSet {
  map: THREE.DataTexture;
  data: THREE.DataTexture;
}

export interface WoodMaterialSet {
  face: THREE.MeshStandardMaterial;
  end: THREE.MeshStandardMaterial;
  /** Physical span covered by the face texture (metres). */
  spanU: number;
  spanV: number;
  /** Physical depth covered by the end texture (metres). */
  endDepth: number;
  dispose(): void;
}

let maxAnisotropy = 4;
export function setMaxAnisotropy(value: number) {
  maxAnisotropy = Math.max(1, Math.min(8, value));
}

export type TextureQuality = 'high' | 'low';

function toTextures(px: { color: Uint8Array; data: Uint8Array; width: number; height: number }, wrap: THREE.Wrapping): WoodTextureSet {
  const map = new THREE.DataTexture(px.color, px.width, px.height, THREE.RGBAFormat);
  const data = new THREE.DataTexture(px.data, px.width, px.height, THREE.RGBAFormat);
  for (const t of [map, data]) {
    t.wrapS = wrap;
    t.wrapT = wrap;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = maxAnisotropy;
    t.flipY = false;
    t.needsUpdate = true;
  }
  map.colorSpace = THREE.SRGBColorSpace;
  data.colorSpace = THREE.NoColorSpace;
  return { map, data };
}

async function textureSet(req: WoodTextureRequest, wrap: THREE.Wrapping): Promise<WoodTextureSet> {
  return toTextures(await generateWoodPixels(req), wrap);
}

function makeMaterial(set: WoodTextureSet, species: WoodSpecies, endGrain: boolean): THREE.MeshStandardMaterial {
  // roughnessMap (G channel) carries the satin roughness of the species; 1 keeps it unscaled.
  return new THREE.MeshStandardMaterial({
    map: set.map,
    roughnessMap: set.data,
    bumpMap: set.data,
    // Satin wood has fine pores rather than centimetre-deep ridges.
    bumpScale: endGrain ? 0.0008 : 0.0005,
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.7,
    color: new THREE.Color(1, 1, 1),
    name: `wood-${species}-${endGrain ? 'end' : 'face'}`,
  });
}

/* --------------------------------------------------------------- tables */

const TABLE_SPAN_U = 2.9;
const TABLE_SPAN_V = 1.6;
const TABLE_END_DEPTH = 0.06;

const tableCache = new Map<string, Promise<{ face: WoodTextureSet; end: WoodTextureSet }>>();

/** Shared, cached plank textures for a table species. */
export function tableTextures(species: WoodSpecies, seed: number, quality: TextureQuality) {
  const key = `${species}:${seed}:${quality}`;
  let entry = tableCache.get(key);
  if (!entry) {
    const strips = plankStrips(species, TABLE_SPAN_V, seed);
    const w = quality === 'high' ? 2048 : 1024;
    const h = Math.round((w * TABLE_SPAN_V) / TABLE_SPAN_U);
    entry = (async () => {
      const face = await textureSet(
        { kind: 'face', spanU: TABLE_SPAN_U, spanV: TABLE_SPAN_V, widthPx: w, heightPx: h, strips, seed },
        THREE.RepeatWrapping,
      );
      const end = await textureSet(
        { kind: 'end', spanU: TABLE_END_DEPTH, spanV: TABLE_SPAN_V, widthPx: 64, heightPx: h, strips, seed },
        THREE.RepeatWrapping,
      );
      return { face, end };
    })();
    tableCache.set(key, entry);
  }
  return entry;
}

/** Materials referencing the shared textures. Disposing them leaves the cache intact. */
export async function tableMaterials(species: WoodSpecies, seed: number, quality: TextureQuality): Promise<WoodMaterialSet> {
  const tex = await tableTextures(species, seed, quality);
  const face = makeMaterial(tex.face, species, false);
  const end = makeMaterial(tex.end, species, true);
  return {
    face,
    end,
    spanU: TABLE_SPAN_U,
    spanV: TABLE_SPAN_V,
    endDepth: TABLE_END_DEPTH,
    dispose() {
      face.dispose();
      end.dispose();
    },
  };
}

/* --------------------------------------------------------------- boards */

const BOARD_SPAN_U = 0.84;
const BOARD_END_DEPTH = 0.045;

/**
 * Board textures depend on the board width (strips keep their layout), so
 * each board owns its textures and disposes them on change.
 */
export async function boardMaterials(
  strips: readonly { species: WoodSpecies; share: number }[],
  widthM: number,
  seed: number,
  quality: TextureQuality,
  endGrainFace: boolean,
): Promise<WoodMaterialSet> {
  let v = 0;
  const layout: StripLayout[] = strips.map((s) => {
    const v0 = v;
    v += s.share * widthM;
    return { species: s.species, v0, v1: v };
  });
  layout[layout.length - 1]!.v1 = widthM;
  const pxPerM = quality === 'high' ? 1700 : 950;
  const w = Math.round(BOARD_SPAN_U * pxPerM);
  const h = Math.max(64, Math.round(widthM * pxPerM));
  const faceSet = await textureSet(
    {
      kind: 'face',
      spanU: BOARD_SPAN_U,
      spanV: widthM,
      widthPx: w,
      heightPx: h,
      strips: layout,
      seed,
      endGrainFace,
      blockLength: endGrainFace ? widthM / strips.length : undefined,
    },
    THREE.ClampToEdgeWrapping,
  );
  const endSet = await textureSet(
    { kind: 'end', spanU: BOARD_END_DEPTH, spanV: widthM, widthPx: 48, heightPx: h, strips: layout, seed },
    THREE.ClampToEdgeWrapping,
  );
  const species = strips[0]!.species;
  const face = makeMaterial(faceSet, species, endGrainFace);
  const end = makeMaterial(endSet, species, true);
  return {
    face,
    end,
    spanU: BOARD_SPAN_U,
    spanV: widthM,
    endDepth: BOARD_END_DEPTH,
    dispose() {
      face.dispose();
      end.dispose();
      for (const t of [faceSet.map, faceSet.data, endSet.map, endSet.data]) t.dispose();
    },
  };
}

/** Finish tint (visual proposal) applied as a linear multiplier. */
export function applyTint(set: WoodMaterialSet, tint: readonly [number, number, number] | null) {
  for (const m of [set.face, set.end]) {
    if (tint) m.color.setRGB(tint[0], tint[1], tint[2], THREE.LinearSRGBColorSpace);
    else m.color.setRGB(1, 1, 1, THREE.LinearSRGBColorSpace);
  }
}
