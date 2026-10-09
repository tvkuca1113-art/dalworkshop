'use client';

import { useCallback, useState, type MutableRefObject } from 'react';

/**
 * "Ispiši / sačuvaj PDF": a dedicated render of the current 3D view is read
 * once (no permanent preserveDrawingBuffer), then window.print() opens the
 * browser dialog where the customer can save a PDF.
 */
export function usePrint(captureRef: MutableRefObject<(() => string | null) | null>) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const print = useCallback(() => {
    const img = captureRef.current?.() ?? null;
    setSnapshot(img);
    window.setTimeout(() => {
      const el = document.querySelector<HTMLImageElement>('[data-print-snapshot]');
      if (el && !el.complete) {
        el.addEventListener('load', () => window.print(), { once: true });
        el.addEventListener('error', () => window.print(), { once: true });
      } else {
        window.print();
      }
    }, 80);
  }, [captureRef]);
  return { snapshot, print };
}
