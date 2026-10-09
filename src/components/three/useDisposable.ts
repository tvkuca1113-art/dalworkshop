'use client';

import { useEffect, useRef, useState, type DependencyList } from 'react';

/**
 * Async resource with an explicit lifecycle: the previous value stays
 * visible until the next one is ready, then it is disposed. Values created
 * after unmount are disposed immediately. Nothing leaks on 100 changes.
 */
export function useDisposable<T>(create: () => Promise<T>, dispose: (value: T) => void, deps: DependencyList, onError?: (err: unknown) => void): T | null {
  const [value, setValue] = useState<T | null>(null);
  const current = useRef<T | null>(null);
  useEffect(() => {
    let alive = true;
    create().then(
      (v) => {
        if (!alive) {
          dispose(v);
          return;
        }
        const prev = current.current;
        current.current = v;
        setValue(v);
        if (prev && prev !== v) {
          // dispose after React committed the new value
          requestAnimationFrame(() => dispose(prev));
        }
      },
      (err) => {
        if (alive) onError?.(err);
      },
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(
    () => () => {
      if (current.current) dispose(current.current);
      current.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return value;
}

/** Value that follows `value` after it stopped changing for `ms` (expensive rebuilds). */
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
