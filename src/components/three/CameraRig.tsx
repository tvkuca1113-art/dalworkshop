'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ViewRequest } from './types';

export interface Framing {
  /** Centre of the product (metres). */
  center: [number, number, number];
  /** Bounding-sphere radius (metres). */
  radius: number;
  /** Point of the edge detail view and the distance to it. */
  edgePoint: [number, number, number];
  edgeDistance: number;
  /** Default viewing direction. */
  defaultDir: [number, number, number];
  /** <1 frames the product tighter (hero). */
  distanceScale?: number;
}

const DIRS: Record<'front' | 'top', [number, number, number]> = {
  front: [0, 0.2, 1],
  top: [0, 1, 0.0001],
};

export function CameraRig({
  framing,
  view,
  enabled,
  allowZoom,
  reducedMotion,
  onCamera,
}: {
  framing: Framing;
  view: ViewRequest;
  enabled: boolean;
  allowZoom: boolean;
  reducedMotion: boolean;
  onCamera?: (pos: THREE.Vector3, target: THREE.Vector3) => void;
}) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);
  const tween = useRef<{ fromPos: THREE.Vector3; toPos: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number } | null>(null);
  const framingRef = useRef(framing);
  useEffect(() => {
    framingRef.current = framing;
  }, [framing]);

  const fitDistance = useMemo(
    () => (radius: number) => {
      const vfov = (camera.fov * Math.PI) / 180;
      const aspect = size.width / Math.max(1, size.height);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      return (radius / Math.sin(Math.min(vfov, hfov) / 2)) * 1.02;
    },
    [camera, size.width, size.height],
  );

  function targetFor(preset: ViewRequest['preset']) {
    const f = framingRef.current;
    const center = new THREE.Vector3(...f.center);
    if (preset === 'edge') {
      const p = new THREE.Vector3(...f.edgePoint);
      const dir = new THREE.Vector3(0.75, 0.42, 1).normalize();
      return { pos: p.clone().add(dir.multiplyScalar(f.edgeDistance)), target: p };
    }
    const dir = new THREE.Vector3(...(preset === 'front' ? DIRS.front : preset === 'top' ? DIRS.top : f.defaultDir)).normalize();
    return { pos: center.clone().add(dir.multiplyScalar(fitDistance(f.radius) * (f.distanceScale ?? 1))), target: center };
  }

  // First frame: place the camera without animation.
  const placed = useRef(false);
  useEffect(() => {
    if (placed.current) return;
    placed.current = true;
    const { pos, target } = targetFor('default');
    camera.position.copy(pos);
    camera.lookAt(target);
    controls.current?.target.copy(target);
    controls.current?.update();
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view.nonce === 0) return;
    const { pos, target } = targetFor(view.preset);
    const ctl = controls.current;
    if (!ctl) return;
    if (reducedMotion) {
      camera.position.copy(pos);
      ctl.target.copy(target);
      ctl.update();
      invalidate();
      return;
    }
    tween.current = { fromPos: camera.position.clone(), toPos: pos, fromT: ctl.target.clone(), toT: target, t: 0 };
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.nonce]);

  useFrame((_, delta) => {
    const tw = tween.current;
    const ctl = controls.current;
    if (!tw || !ctl) return;
    tw.t = Math.min(1, tw.t + delta / 0.65);
    const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
    camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
    ctl.target.lerpVectors(tw.fromT, tw.toT, e);
    ctl.update();
    if (tw.t >= 1) tween.current = null;
    invalidate();
  });

  // OrbitControls writes `touch-action: none` on the element it listens to. While the
  // customer has not opted into rotation, it listens to a detached element so the
  // page keeps scrolling normally over the canvas (touch and wheel).
  const detached = useMemo(() => (typeof document === 'undefined' ? undefined : document.createElement('div')), []);
  const f = framing;
  return (
    <OrbitControls
      domElement={enabled ? undefined : detached}
      ref={(c) => {
        controls.current = c as unknown as OrbitControlsImpl | null;
      }}
      makeDefault
      enabled={enabled}
      enableZoom={allowZoom && enabled}
      enablePan={false}
      enableDamping={false}
      minDistance={Math.max(0.08, f.radius * 0.25)}
      maxDistance={f.radius * 6}
      maxPolarAngle={Math.PI * 0.49}
      target={f.center}
      onChange={() => {
        if (controls.current && onCamera) onCamera(camera.position, controls.current.target);
      }}
    />
  );
}
