'use client';

import { useEffect, useRef, useState } from 'react';
import { configPath, decodeConfig, encodeConfig } from '@/lib/config/url';
import { loadSaved } from '@/lib/config/storage';
import type { BoardConfig, ProductType, TableConfig } from '@/lib/config/types';

/**
 * Applies a permalink on load (validated; bad links show a message and the
 * valid default), then keeps the address bar in sync with the choice so that
 * refresh and back/forward restore it. Personal text never goes to the URL here.
 */
export function useConfigUrl<C extends TableConfig | BoardConfig>(type: ProductType, config: C, replace: (c: C) => void, defaults: C) {
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ savedAt: string; config: C } | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    // Reading the address bar and device storage is only possible after mount.
    const result = decodeConfig(type, window.location.search);
    if (result.status === 'ok') {
      replace(result.config as C);
    } else if (result.status === 'error') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of external state (URL)
      setMessage(result.message);
      replace(defaults);
    }
    const s = type === 'table' ? loadSaved('table') : loadSaved('board');
    if (s) setSaved(s as { savedAt: string; config: C });
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const t = window.setTimeout(() => {
      const query = encodeConfig(config);
      const next = `${configPath(type)}?${query}`;
      if (`${window.location.pathname}${window.location.search}` !== next) {
        window.history.replaceState(window.history.state, '', next);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [config, type]);

  return { message, dismissMessage: () => setMessage(null), saved, dismissSaved: () => setSaved(null) };
}

/** True while a text field has focus — sticky bars hide so they never cover the keyboard or inputs. */
export function useTyping(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && (el as HTMLInputElement).type !== 'checkbox' && (el as HTMLInputElement).type !== 'radio';
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}

/** The step bar belongs to the configurator, so it yields to the footer. */
export function useFooterVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return visible;
}
