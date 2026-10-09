'use client';

import { create } from 'zustand';
import { DEFAULT_BOARD, DEFAULT_TABLE } from '@/lib/config/defaults';
import { applyBoardPatch, applyTablePatch, type BoardPatch, type Notice, type TablePatch } from '@/lib/config/rules';
import type { BoardConfig, TableConfig } from '@/lib/config/types';

/**
 * One validated configuration per product. Everything (3D, 2D, summary,
 * WhatsApp text, print, permalink) derives from `config`; view/camera state
 * lives elsewhere. Notices explain automatic adjustments and carry an undo.
 */

interface Store<C, P> {
  config: C;
  notices: (Notice<C> & { key: number })[];
  apply: (patch: P) => void;
  replace: (config: C) => void;
  undo: (key: number) => void;
  dismiss: (key: number) => void;
  reset: () => void;
}

let noticeKey = 1;

function makeStore<C, P>(initial: C, applyPatch: (c: C, p: P) => { config: C; notices: Notice<C>[] }) {
  return create<Store<C, P>>((set, get) => ({
    config: initial,
    notices: [],
    apply: (patch) => {
      const { config, notices } = applyPatch(get().config, patch);
      if (config === get().config && notices.length === 0) return;
      set((s) => ({
        config,
        notices: notices.length ? [...notices.map((n) => ({ ...n, key: noticeKey++ })), ...s.notices].slice(0, 4) : s.notices,
      }));
    },
    replace: (config) => set({ config, notices: [] }),
    undo: (key) => {
      const n = get().notices.find((x) => x.key === key);
      if (n?.undo) set({ config: n.undo, notices: get().notices.filter((x) => x.key !== key) });
    },
    dismiss: (key) => set((s) => ({ notices: s.notices.filter((x) => x.key !== key) })),
    reset: () => set({ config: initial, notices: [] }),
  }));
}

export const useTableStore = makeStore<TableConfig, TablePatch>(DEFAULT_TABLE, applyTablePatch);
export const useBoardStore = makeStore<BoardConfig, BoardPatch>(DEFAULT_BOARD, applyBoardPatch);
