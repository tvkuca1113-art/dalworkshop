'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** window.location.origin after hydration ('' on the server and during hydration). */
export function useOrigin(): string {
  return useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => '',
  );
}

/** true only on the client after hydration (avoids locale/date mismatches). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** CSS media query as external store (no setState in effects, hydration-safe). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

let webgl2Cache: boolean | null = null;
/** WebGL2 support, checked once per page (assumed available during SSR/hydration). */
export function webgl2Supported(): boolean {
  if (webgl2Cache !== null) return webgl2Cache;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    webgl2Cache = Boolean(gl);
    // release the probe context right away (browsers limit live contexts)
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl2Cache = false;
  }
  return webgl2Cache;
}

export function useWebgl2(): boolean {
  return useSyncExternalStore(noop, webgl2Supported, () => true);
}
