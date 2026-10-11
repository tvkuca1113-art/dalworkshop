'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import type { BoardConfig, TableConfig } from '@/lib/config/types';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import { computeBoardLayout } from '@/lib/geometry/board-layout';
import { setMaxAnisotropy } from '@/lib/three/wood-materials';
import { TableModel } from './TableModel';
import { BoardModel } from './BoardModel';
import { CameraRig, type Framing } from './CameraRig';
import { Dimensions, type DimSpec } from './Dimensions';
import type { EngravingRender, TextureQualityLevel, ViewerDebugInfo, ViewerPhase, ViewRequest } from './types';

export interface ProductCanvasProps {
  config: TableConfig | BoardConfig;
  variant: 'configurator' | 'hero' | 'detail';
  view: ViewRequest;
  showDimensions: boolean;
  /** Orbit / pinch enabled (touch users opt in with "Rotirajte model"). */
  interactive: boolean;
  allowWheelZoom: boolean;
  quality: TextureQualityLevel;
  maxDpr: number;
  flipped?: boolean;
  engraving?: EngravingRender | null;
  onPhase: (phase: ViewerPhase, detail?: string) => void;
  captureRef?: MutableRefObject<(() => string | null) | null>;
}

const BG = { configurator: '#eee8de', hero: '#e6dfd4', detail: '#eee8de' } as const;
const FLOOR = { configurator: '#e7e1d7', hero: '#d1c8bb', detail: '#eee8de' } as const;

function framingFor(config: TableConfig | BoardConfig, variant: ProductCanvasProps['variant']): { framing: Framing; dims: DimSpec[]; labelScale: number; shadowExtent: number } {
  if (config.productType === 'table') {
    const l = computeTableLayout(config);
    const L = l.lengthMm / 1000;
    const W = l.widthMm / 1000;
    const H = l.topY / 1000;
    const T = l.thickness / 1000;
    const radius = Math.hypot(L / 2, W / 2, H / 2) * 1.04;
    const off = 0.14;
    const round = config.shapeId === 'circle';
    const dims: DimSpec[] = round
      ? [
          { from: [-L / 2, H + 0.04, W / 2 + off], to: [L / 2, H + 0.04, W / 2 + off], valueMm: l.lengthMm, labelOffset: [0, 0.07, 0] },
          { from: [L / 2 + off, 0, 0], to: [L / 2 + off, H, 0], valueMm: l.topY, labelOffset: [0.04, 0, 0] },
        ]
      : [
          { from: [-L / 2, 0.002, W / 2 + off], to: [L / 2, 0.002, W / 2 + off], valueMm: l.lengthMm, labelOffset: [0, 0.07, 0] },
          { from: [L / 2 + off, 0.002, -W / 2], to: [L / 2 + off, 0.002, W / 2], valueMm: l.widthMm, labelOffset: [0, 0.07, 0] },
          { from: [L / 2 + off, 0, W / 2 + off], to: [L / 2 + off, H, W / 2 + off], valueMm: l.topY, labelOffset: [0.04, 0, 0] },
        ];
    dims.push({ from: [-L / 2 - 0.06, H - T, W / 2], to: [-L / 2 - 0.06, H, W / 2], valueMm: l.thickness, labelOffset: [-0.1, 0, 0] });
    const edgePoint: [number, number, number] = round
      ? [(L / 2) * Math.SQRT1_2, H - T / 2, (W / 2) * Math.SQRT1_2]
      : config.shapeId === 'oval'
        ? [0, H - T / 2, W / 2]
        : [L / 2 - (variant === 'detail' ? 0.025 : 0.12), H - T / 2, W / 2];
    return {
      framing: {
        center: [0, H * 0.48, 0],
        radius,
        edgePoint,
        edgeDistance: Math.max(0.32, T * 9),
        defaultDir: variant === 'hero' ? [0.42, 0.3, 1] : [0.85, 0.62, 1.4],
        distanceScale: variant === 'hero' ? 0.74 : variant === 'detail' ? 0.85 : .93,
      },
      dims,
      labelScale: 0.07,
      shadowExtent: Math.max(L, W) * 0.75 + 0.4,
    };
  }
  const l = computeBoardLayout(config);
  const L = l.lengthMm / 1000;
  const W = l.widthMm / 1000;
  const T = l.thickness / 1000;
  const off = 0.04;
  const radius = Math.hypot(L / 2, W / 2, T) * 1.15;
  const round = l.shape === 'circle';
  const dims: DimSpec[] = round
    ? [{ from: [-L / 2, 0.001, W / 2 + off], to: [L / 2, 0.001, W / 2 + off], valueMm: l.lengthMm, labelOffset: [0, 0.02, 0] }]
    : [
        { from: [-L / 2, 0.001, W / 2 + off], to: [L / 2, 0.001, W / 2 + off], valueMm: l.lengthMm, labelOffset: [0, 0.02, 0] },
        { from: [L / 2 + off, 0.001, -W / 2], to: [L / 2 + off, 0.001, W / 2], valueMm: l.widthMm, labelOffset: [0, 0.02, 0] },
      ];
  dims.push({ from: [-L / 2 - 0.02, 0, W / 2], to: [-L / 2 - 0.02, T, W / 2], valueMm: l.thickness, labelOffset: [-0.035, 0.012, 0] });
  return {
    framing: {
      center: [0, T / 2, 0],
      radius,
      edgePoint: round ? [(L / 2) * Math.SQRT1_2, T / 2, (W / 2) * Math.SQRT1_2] : [L / 2 - 0.03, T / 2, W / 2],
      edgeDistance: Math.max(0.12, T * 4),
      defaultDir: [0.8, 0.9, 1.15],
    },
    dims,
    labelScale: 0.02,
    shadowExtent: Math.max(L, W) * 0.8 + 0.15,
  };
}

/**
 * Soft ambient-occlusion patch under the product (a static gradient texture):
 * grounds the model without an extra render pass.
 */
function GroundShade({ width, depth, opacity }: { width: number; depth: number; opacity: number }) {
  // Scale a fixed unit plane; rapid edits must not queue new floor/shadow geometries.
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.0008, 0]} scale={[width, depth, 1]} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#3b3025" alphaMap={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function ContextWatch({ onPhase }: { onPhase: (p: ViewerPhase, d?: string) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onPhase('lost', 'webglcontextlost');
    };
    el.addEventListener('webglcontextlost', lost);
    setMaxAnisotropy(gl.capabilities.getMaxAnisotropy());
    return () => el.removeEventListener('webglcontextlost', lost);
  }, [gl, onPhase]);
  return null;
}

function Capture({ captureRef }: { captureRef?: MutableRefObject<(() => string | null) | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!captureRef) return;
    captureRef.current = () => {
      try {
        // Dedicated render right before reading the buffer — no preserveDrawingBuffer needed.
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/jpeg', 0.9);
      } catch {
        return null;
      }
    };
    return () => {
      captureRef.current = null;
    };
  }, [captureRef, gl, scene, camera]);
  return null;
}

function DebugBridge({ product, phase, geometryKey }: { product: 'table' | 'board'; phase: ViewerPhase; geometryKey: string }) {
  const { gl, scene, camera, controls } = useThree();
  useEffect(() => {
    const api = {
      info(): ViewerDebugInfo {
        let engraving: ViewerDebugInfo['engraving'] = null;
        const mesh = scene.getObjectByName('engraving') as THREE.Mesh | undefined;
        const board = scene.getObjectByName('board-body') as THREE.Mesh | undefined;
        if (mesh && board) {
          mesh.updateWorldMatrix(true, false);
          board.geometry.computeBoundingBox();
          const bb = board.geometry.boundingBox!.clone().applyMatrix4(board.matrixWorld);
          const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
          const corners: [number, number, number][] = [];
          const v = new THREE.Vector3();
          for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
            corners.push([v.x, v.y, v.z]);
          }
          const back = mesh.position.y < 0;
          const surfaceY = back ? bb.min.y : bb.max.y;
          const inside = corners.every(([x, , z]) => x > bb.min.x && x < bb.max.x && z > bb.min.z && z < bb.max.z);
          engraving = {
            placement: back ? 'back' : 'center',
            worldY: corners[0]![1],
            surfaceY,
            corners,
            insideBoard: inside,
          };
        }
        const ctl = controls as unknown as { target?: THREE.Vector3 } | null;
        let triangles = 0;
        let drawCalls = 0;
        scene.traverseVisible((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh || !m.geometry) return;
          const g = m.geometry;
          const count = g.index ? g.index.count : (g.getAttribute('position')?.count ?? 0);
          triangles += count / 3;
          drawCalls += Array.isArray(m.material) ? Math.max(1, g.groups.length) : 1;
        });
        return {
          phase,
          product,
          geometryKey,
          triangles: Math.round(triangles),
          drawCalls,
          memory: { geometries: gl.info.memory.geometries, textures: gl.info.memory.textures },
          camera: {
            position: camera.position.toArray() as [number, number, number],
            target: (ctl?.target?.toArray() ?? [0, 0, 0]) as [number, number, number],
          },
          engraving,
        };
      },
      loseContext() {
        gl.getContext().getExtension('WEBGL_lose_context')?.loseContext();
      },
    };
    (window as unknown as { __dalViewer?: typeof api }).__dalViewer = api;
    return () => {
      const w = window as unknown as { __dalViewer?: typeof api };
      if (w.__dalViewer === api) delete w.__dalViewer;
    };
  }, [gl, scene, camera, controls, product, phase, geometryKey]);
  return null;
}

export default function ProductCanvas(props: ProductCanvasProps) {
  const { config, variant, view, showDimensions, interactive, allowWheelZoom, quality, maxDpr, flipped, engraving, onPhase, captureRef } = props;
  const [dpr, setDpr] = useState(Math.min(maxDpr, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
  const [phase, setPhase] = useState<ViewerPhase>('starting');
  const reducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const { framing, dims, labelScale, shadowExtent } = useMemo(() => framingFor(config, variant), [config, variant]);
  const geometryKey = useMemo(() => JSON.stringify({ ...config, note: undefined, personalization: undefined }), [config]);

  const report = useCallback(
    (p: ViewerPhase, d?: string) => {
      setPhase(p);
      onPhase(p, d);
    },
    [onPhase],
  );
  const readyOnce = useRef(false);
  const onReady = useCallback(() => {
    // wait for the frame with the finished model before reporting ready
    requestAnimationFrame(() => {
      readyOnce.current = true;
      report('ready');
    });
  }, [report]);
  const onError = useCallback((err: unknown) => report('error', err instanceof Error ? err.message : 'material'), [report]);

  const isTable = config.productType === 'table';
  const T = isTable ? 0 : config.dimensionsMm.thickness / 1000;
  const shade = useMemo(() => {
    const r = framing.radius;
    return isTable ? { w: r * 2.0, d: r * 1.3, o: 0.28 } : { w: r * 2.1, d: r * 1.7, o: 0.35 };
  }, [framing.radius, isTable]);

  return (
    <Canvas
      frameloop="demand"
      shadows={{ enabled: true, type: THREE.VSMShadowMap }}
      dpr={dpr}
      camera={{ fov: 32, near: 0.01, far: 60, position: [3, 2, 4] }}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false, alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 0.94;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        if (!readyOnce.current) report('materials');
      }}
      style={interactive ? undefined : { touchAction: 'pan-y' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(maxDpr, window.devicePixelRatio || 1))} />
      <color attach="background" args={[BG[variant]]} />
      <fog attach="fog" args={[BG[variant], framing.radius * 5, framing.radius * 12]} />
      <hemisphereLight args={['#fffdf8', '#c5bbae', 0.7]} />
      <directionalLight
        castShadow
        position={[framing.radius * 1.2, framing.radius * 4, framing.radius * 1.5]}
        intensity={1.65}
        color="#fffaf2"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-radius={6}
        shadow-blurSamples={8}
        shadow-intensity={0.45}
        shadow-normalBias={0.015}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.1}
        shadow-camera-far={framing.radius * 10}
      />
      <directionalLight position={[-framing.radius * 2, framing.radius, -framing.radius]} intensity={0.45} color="#eef0ff" />
      <Environment resolution={256} frames={1} background={false}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#fff7ec" />
        <Lightformer form="rect" intensity={1.1} position={[-6, 2.5, 3]} rotation-y={Math.PI / 2.5} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.5} position={[6, 1.5, -3]} rotation-y={-Math.PI / 2.5} scale={[6, 2, 1]} color="#f3e6d6" />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.0005, 0]} scale={framing.radius * 14}>
        <circleGeometry args={[1, 64]} />
        {variant === 'detail' ? <meshBasicMaterial color={FLOOR.detail} toneMapped={false} /> : <meshStandardMaterial color={FLOOR[variant]} roughness={0.95} metalness={0} envMapIntensity={0.35} />}
      </mesh>
      <GroundShade width={shade.w} depth={shade.d} opacity={shade.o} />
      <group rotation-x={flipped ? Math.PI : 0} position={[0, flipped ? T : 0, 0]}>
        {isTable ? (
          <TableModel config={config} quality={quality} onReady={onReady} onError={onError} />
        ) : (
          <BoardModel config={config} quality={quality} engraving={engraving ?? null} onReady={onReady} onError={onError} />
        )}
      </group>
      {showDimensions && !flipped && <Dimensions dims={dims} labelScale={labelScale} />}
      <CameraRig framing={framing} view={view} enabled={interactive} allowZoom={allowWheelZoom} reducedMotion={reducedMotion} />
      <ContextWatch onPhase={report} />
      <Capture captureRef={captureRef} />
      <DebugBridge product={config.productType} phase={phase} geometryKey={geometryKey} />
    </Canvas>
  );
}
