'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_TABLE } from '@/lib/config/defaults';
import { encodeTable } from '@/lib/config/url';
import { TABLE_EDGES, TABLE_WOODS, type TableEdgeId, type TableWoodId } from '@/lib/catalog/table';
import type { ViewerPhase, ViewPreset, ViewRequest } from '../three/types';
import { useWebgl2 } from '../useClient';
import { EdgeTableDrawing } from './EdgeTableDrawing';
import styles from './EdgeComparison.module.css';

const ProductCanvas = dynamic(() => import('../three/ProductCanvas'), { ssr: false, loading: () => null });
const VIEWS = [{ id: 'default', label: 'Cijeli stol' }, { id: 'back', label: 'Druga strana' }, { id: 'edge', label: 'Detalj ivice' }] as const;
const WOOD_COLOURS: Record<TableWoodId, string> = { oak: '#b98d5c', walnut: '#72533d', ash: '#d4bc96' };

class DetailBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function EdgeComparison() {
  const [edgeId, setEdge] = useState<TableEdgeId>('straight');
  const [woodId, setWood] = useState<TableWoodId>('oak');
  const [view, setView] = useState<ViewRequest>({ preset: 'default', nonce: 0 });
  const [rotate, setRotate] = useState(false);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<ViewerPhase | 'timeout'>('starting');
  const stage = useRef<HTMLDivElement>(null);
  const supported = useWebgl2();
  const config = useMemo(() => ({ ...DEFAULT_TABLE, modelId: 'custom' as const, edgeId, woodId }), [edgeId, woodId]);
  const failed = !supported || phase === 'error' || phase === 'lost' || phase === 'timeout';
  const ready = phase === 'ready' && !failed;
  const report = useCallback((p: ViewerPhase) => setPhase((old) => old === 'lost' || old === 'error' || old === 'timeout' ? old : p), []);
  const error = useCallback(() => setPhase('error'), []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '100px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !supported || ready || failed) return;
    const timer = window.setTimeout(() => setPhase((old) => old === 'ready' ? old : 'timeout'), 30_000);
    return () => window.clearTimeout(timer);
  }, [visible, supported, ready, failed]);

  const request = (preset: ViewPreset) => { setRotate(false); setView((old) => ({ preset, nonce: old.nonce + 1 })); };
  const edge = TABLE_EDGES.find((e) => e.id === edgeId)!;
  const wood = TABLE_WOODS.find((w) => w.id === woodId)!;

  return (
    <div className={styles.wrap} data-testid="edge-experience">
      <div className={styles.controls}>
        <div className={styles.toggle} role="group" aria-label="Izaberite ivicu stola">
          {TABLE_EDGES.map((e) => <button key={e.id} type="button" aria-pressed={edgeId === e.id} onClick={() => setEdge(e.id)} className={styles.btn}>{e.label}</button>)}
        </div>
        <div className={styles.woods} role="group" aria-label="Izaberite drvo za pregled">
          {TABLE_WOODS.map((w) => <button key={w.id} type="button" aria-pressed={woodId === w.id} onClick={() => setWood(w.id)} className={styles.wood}><span style={{ backgroundColor: WOOD_COLOURS[w.id] }} aria-hidden="true" />{w.label}</button>)}
        </div>
      </div>
      <div ref={stage} className={styles.stage} data-testid="edge-stage" data-phase={failed ? 'fallback' : phase} data-edge={edgeId} data-wood={woodId} data-view={view.preset} role="img" aria-label={`Cijeli stol: ${wood.label.toLowerCase()}, ${edge.label.toLowerCase()}; profil na svim ivicama ploče.`}>
        <div className={`${styles.drawing} ${ready ? styles.hidden : ''}`}><EdgeTableDrawing config={config} view={view.preset} /></div>
        {visible && supported && !failed ? (
          <div className={`${styles.canvas} ${ready ? '' : styles.hidden}`}>
            <DetailBoundary onError={error}>
              <ProductCanvas config={config} variant="detail" view={view} showDimensions={false} interactive={rotate} allowWheelZoom={rotate} quality="low" maxDpr={1.5} onPhase={report} />
            </DetailBoundary>
          </div>
        ) : null}
        <span className={styles.studio} aria-hidden="true">DAL / materijal &amp; oblik</span>
        {visible && !ready && !failed ? <span className={styles.loading} role="status">Pripremam interaktivni prikaz…</span> : null}
      </div>
      <div className={styles.views} role="group" aria-label="Pogled na stol">
        {VIEWS.map((v) => <button type="button" key={v.id} aria-pressed={view.preset === v.id && !rotate} onClick={() => request(v.id)}>{v.label}<span aria-hidden="true">{v.id === 'edge' ? '⌕' : '↗'}</span></button>)}
        {ready ? <button type="button" aria-pressed={rotate} onClick={() => setRotate((old) => !old)}>{rotate ? 'Završi rotaciju' : 'Rotirajte stol'}<span aria-hidden="true">↻</span></button> : null}
      </div>
      <div className={styles.description}>
        <div>
          <p className={styles.current} aria-live="polite">{wood.label} · {edge.label} · 150 × 70 cm · ploča 3,5 cm</p>
          <p className="note">{edge.description} Isti profil prati sve četiri strane ploče.</p>
          <p className={styles.disclaimer}>3D je vizuelni prijedlog. Drvo i mogućnost izrade potvrđujemo uz ponudu.</p>
          {failed ? <p className={styles.disclaimer}>Prikazana je prostorna ilustracija; 3D nije dostupan u ovom pregledniku.</p> : null}
        </div>
        <Link className={styles.continue} href={`/konfigurator/stol?${encodeTable(config)}`}>Nastavite s ovim izborom <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  );
}
