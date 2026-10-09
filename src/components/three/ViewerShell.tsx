'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import type { BoardConfig, TableConfig } from '@/lib/config/types';
import { Plan2D, type EngravingDraw } from '../configurator/Plan2D';
import type { EngravingRender, ViewerPhase, ViewPreset, ViewRequest } from './types';
import { useMediaQuery, useMounted, useWebgl2 } from '../useClient';
import styles from './ViewerShell.module.css';

const ProductCanvas = dynamic(() => import('./ProductCanvas'), { ssr: false, loading: () => null });

type ShellPhase = 'module' | ViewerPhase | 'timeout' | 'unsupported';

const PHASE_TEXT: Record<'module' | 'starting' | 'materials', string> = {
  module: 'Učitavam 3D modul…',
  starting: 'Pokrećem 3D prikaz…',
  materials: 'Izrađujem materijale drveta…',
};

const TIMEOUT_MS = 30_000;

class CanvasBoundary extends Component<{ onError: (msg: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface ViewerShellProps {
  config: TableConfig | BoardConfig;
  variant: 'configurator' | 'hero';
  engraving?: EngravingRender | null;
  engravingDraw?: EngravingDraw | null;
  captureRef?: MutableRefObject<(() => string | null) | null>;
  /** Hero: shown until the 3D scene is ready (fast poster). */
  poster?: ReactNode;
  onReadyChange?: (ready: boolean) => void;
  onClose?: () => void;
  label: string;
}

export function ViewerShell({ config, variant, engraving, engravingDraw, captureRef, poster, onReadyChange, onClose, label }: ViewerShellProps) {
  const [rawPhase, setPhase] = useState<ShellPhase>('module');
  const [detail, setDetail] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState<ViewRequest>({ preset: 'default', nonce: 0 });
  const [showDims, setShowDims] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [rotateMode, setRotateMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandBtn = useRef<HTMLButtonElement>(null);
  const coarse = useMediaQuery('(pointer: coarse)');
  const small = useMediaQuery('(max-width: 767px)');
  const mounted = useMounted();
  const supported = useWebgl2();
  const phase: ShellPhase = supported ? rawPhase : 'unsupported';
  const env = useMemo(() => {
    if (!mounted) return null;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return { quality: (coarse || small || (mem !== undefined && mem <= 4) ? 'low' : 'high') as 'high' | 'low', maxDpr: coarse || small ? 1.5 : 2 };
  }, [mounted, coarse, small]);

  // Real timeout per attempt; the fallback stays functional meanwhile.
  useEffect(() => {
    if (phase === 'ready' || phase === 'unsupported' || phase === 'error' || phase === 'lost' || phase === 'timeout') return;
    const t = window.setTimeout(() => setPhase((p) => (p === 'ready' ? p : 'timeout')), TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [attempt, phase]);

  useEffect(() => {
    onReadyChange?.(phase === 'ready');
  }, [phase, onReadyChange]);

  const onPhase = useCallback((p: ViewerPhase, d?: string) => {
    setPhase((prev) => (prev === 'lost' || prev === 'error' || prev === 'timeout' ? prev : p));
    if (d) setDetail(d);
  }, []);

  const retry = () => {
    setDetail(undefined);
    setPhase('module');
    setAttempt((a) => a + 1);
  };

  const request = (preset: ViewPreset) => setView((v) => ({ preset, nonce: v.nonce + 1 }));

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = expandBtn.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      trigger?.focus();
    };
  }, [expanded]);

  const failed = phase === 'error' || phase === 'lost' || phase === 'timeout' || phase === 'unsupported';
  const loading = !failed && phase !== 'ready';
  const interactive = rotateMode || (!coarse && variant === 'configurator');
  const isBoard = config.productType === 'board';

  const failText = useMemo(() => {
    switch (phase) {
      case 'lost':
        return '3D prikaz je prekinut (preglednik je oslobodio grafičku memoriju). Vaš izbor je sačuvan.';
      case 'timeout':
        return '3D prikaz se učitava predugo. Prikazujemo 2D nacrt istog izbora.';
      case 'unsupported':
        return 'Ovaj preglednik ne podržava 3D prikaz (WebGL2). Prikazujemo 2D nacrt istog izbora.';
      default:
        return '3D prikaz se nije mogao pokrenuti. Prikazujemo 2D nacrt istog izbora.';
    }
  }, [phase]);

  return (
    <div
      className={`${styles.shell} ${styles[variant]} ${expanded ? styles.expanded : ''}`}
      data-testid="viewer"
      data-phase={phase}
      role="group"
      aria-label={label}
    >
      <div className={styles.stage}>
        {!failed && env && (
          <div className={`${styles.canvas} ${loading ? styles.hidden : ''}`}>
            <CanvasBoundary
              key={attempt}
              onError={(msg) => {
                setPhase('error');
                setDetail(msg);
              }}
            >
              <ProductCanvas
                config={config}
                variant={variant}
                view={view}
                showDimensions={showDims}
                interactive={interactive}
                allowWheelZoom={variant === 'configurator' ? !coarse || rotateMode : rotateMode}
                quality={env.quality}
                maxDpr={env.maxDpr}
                flipped={isBoard && flipped}
                engraving={engraving}
                onPhase={onPhase}
                captureRef={captureRef}
              />
            </CanvasBoundary>
          </div>
        )}
        {(loading || failed) && (
          <div className={styles.poster} data-testid={failed ? 'viewer-fallback' : 'viewer-poster'}>
            {variant === 'hero' && poster && !failed ? poster : <Plan2D config={config} engraving={engravingDraw} />}
          </div>
        )}
        {loading && (
          <p className={styles.status} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            {PHASE_TEXT[phase as 'module' | 'starting' | 'materials'] ?? PHASE_TEXT.module}
          </p>
        )}
        {failed && (
          <div className={styles.fail} role="alert">
            <p>{failText}</p>
            {phase !== 'unsupported' && (
              <button type="button" className="btn btn--small" onClick={retry}>
                Pokušajte ponovo
              </button>
            )}
            {detail && <span className="visually-hidden">Tehnički detalj: {detail}</span>}
          </div>
        )}
      </div>

      <div className={`${styles.toolbar} no-print`} role="toolbar" aria-label="Alati prikaza">
        {coarse && !failed && (
          <button type="button" className={styles.tool} aria-pressed={rotateMode} onClick={() => setRotateMode((v) => !v)} disabled={loading}>
            {rotateMode ? 'Završi rotaciju' : 'Rotirajte model'}
          </button>
        )}
        {variant === 'configurator' && (
          <>
            <button type="button" className={styles.tool} onClick={() => request('front')} disabled={loading || failed}>
              Sprijeda
            </button>
            <button type="button" className={styles.tool} onClick={() => request('top')} disabled={loading || failed}>
              Odozgo
            </button>
            <button type="button" className={styles.tool} onClick={() => request('edge')} disabled={loading || failed}>
              Detalj ivice
            </button>
            {isBoard && (
              <button type="button" className={styles.tool} aria-pressed={flipped} onClick={() => setFlipped((v) => !v)} disabled={loading || failed}>
                Poleđina
              </button>
            )}
            <button type="button" className={styles.tool} aria-pressed={showDims} onClick={() => setShowDims((v) => !v)} disabled={loading || failed}>
              Prikaži dimenzije
            </button>
          </>
        )}
        <button
          type="button"
          className={styles.tool}
          onClick={() => {
            setFlipped(false);
            request('default');
          }}
          disabled={loading || failed}
        >
          Vrati pogled
        </button>
        {variant === 'configurator' && (
          <button ref={expandBtn} type="button" className={`${styles.tool} ${styles.expandTool}`} aria-pressed={expanded} onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Zatvori prošireni prikaz' : 'Proširi prikaz'}
          </button>
        )}
        {onClose && (
          <button type="button" className={styles.tool} onClick={onClose}>
            Prikaži fotografiju
          </button>
        )}
      </div>
    </div>
  );
}
