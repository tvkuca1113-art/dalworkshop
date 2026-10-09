import { computeTableLayout, type TableLayout } from '@/lib/geometry/table-layout';
import { computeBoardLayout, type BoardLayout } from '@/lib/geometry/board-layout';
import { finishOption, woodOption } from '@/lib/catalog/table';
import { construction } from '@/lib/catalog/board';
import { WOOD_LOOK } from '@/lib/catalog/woods';
import { plankStrips } from '@/lib/three/wood-texture';
import { formatCm } from '@/lib/config/units';
import { tableDimensionsText, boardDimensionsText } from '@/lib/config/summary';
import type { BoardConfig, TableConfig } from '@/lib/config/types';
import type { Pt } from '@/lib/geometry/polygon';
import type { Rect } from '@/lib/engraving/fit';
import { ENGRAVING_FONTS } from '@/lib/catalog/board';
import styles from './Plan2D.module.css';

/**
 * Parametric 2D drawing generated from the same layout as the 3D model:
 * plan view + elevations with dimensions. Used as the fast poster, as the
 * WebGL fallback and in the printed specification.
 */

const INK = '#1d1c1a';
const DIM = '#7d5236';

function path(points: readonly Pt[], sx: (x: number) => number, sy: (y: number) => number): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(' ') + ' Z';
}

function tint(hex: string, t: readonly [number, number, number] | null): string {
  if (!t) return hex;
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v, i) => Math.round(Math.min(255, v * Math.pow(t[i]!, 1 / 2.2))));
  return `rgb(${c.join(',')})`;
}

function DimLine({ x1, y1, x2, y2, label, offset = 0, vertical = false }: { x1: number; y1: number; x2: number; y2: number; label: string; offset?: number; vertical?: boolean }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className={styles.dim}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth={1} />
      {vertical ? (
        <>
          <line x1={x1 - 5} y1={y1} x2={x1 + 5} y2={y1} stroke={DIM} />
          <line x1={x2 - 5} y1={y2} x2={x2 + 5} y2={y2} stroke={DIM} />
          <text x={mx + 8 + offset} y={my} dominantBaseline="middle" fill={DIM} fontSize={13}>
            {label}
          </text>
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 5} stroke={DIM} />
          <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 5} stroke={DIM} />
          <text x={mx} y={my - 7 + offset} textAnchor="middle" fill={DIM} fontSize={13}>
            {label}
          </text>
        </>
      )}
    </g>
  );
}

export function TablePlan2D({ config, compact = false }: { config: TableConfig; compact?: boolean }) {
  const layout: TableLayout = computeTableLayout(config);
  const L = layout.lengthMm;
  const W = layout.widthMm;
  const H = layout.topY;
  const wood = WOOD_LOOK[woodOption(config.woodId).species];
  const fill = tint(wood.base, finishOption(config.finishId).tint);
  // plan view box
  const VW = 640;
  const pad = 46;
  const scale = Math.min((VW - 2 * pad) / L, 260 / W);
  const planH = W * scale + 2 * pad;
  const sx = (x: number) => VW / 2 + x * scale;
  const sy = (z: number) => pad + (z + W / 2) * scale;
  const strips = plankStrips(woodOption(config.woodId).species, 1.6, 2026);
  // elevation box
  const eScale = Math.min((VW - 2 * pad) / L, 200 / H);
  const elevH = H * eScale + 2 * pad;
  const ex = (x: number) => VW / 2 + x * eScale;
  const ey = (y: number) => pad + (H - y) * eScale;
  const sideW = W * eScale;
  const sideX0 = VW - pad - sideW;

  const clipId = `tbl-clip-${config.shapeId}-${config.seed}`;

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VW} ${planH + elevH}`}
      role="img"
      aria-label={`Tlocrt i pogled sprijeda: ${tableDimensionsText(config)}`}
      data-testid="plan2d"
      data-shape={config.shapeId}
      data-base={config.baseId}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path(layout.outline, sx, sy)} />
        </clipPath>
      </defs>
      <text x={pad} y={24} className={styles.caption}>
        Tlocrt
      </text>
      <path d={path(layout.outline, sx, sy)} fill={fill} stroke={INK} strokeWidth={1.2} />
      <g clipPath={`url(#${clipId})`} opacity={0.35}>
        {strips.map((s, i) => {
          const z = -W / 2 + s.v1 * 1000;
          return z < W / 2 ? <line key={i} x1={sx(-L / 2)} x2={sx(L / 2)} y1={sy(z)} y2={sy(z)} stroke={INK} strokeWidth={0.6} /> : null;
        })}
      </g>
      {/* supports under the top (hidden lines) */}
      <g fill="none" stroke={INK} strokeDasharray="4 3" strokeWidth={0.9} opacity={0.75}>
        {layout.baseParts.map((p, i) => {
          if (p.kind === 'prism') {
            const zs = p.polygon.map(([z]) => z);
            const z0 = Math.min(...zs);
            const z1 = Math.max(...zs);
            return <rect key={i} x={sx(p.x - p.depth / 2)} y={sy(z0)} width={p.depth * scale} height={(z1 - z0) * scale} />;
          }
          if (p.kind === 'plate') return <path key={i} d={path(p.outline, sx, sy)} />;
          return <circle key={i} cx={sx(p.x)} cy={sy(p.z)} r={p.radius * scale} />;
        })}
      </g>
      {config.shapeId === 'circle' ? (
        <DimLine x1={sx(-L / 2)} y1={sy(W / 2) + 22} x2={sx(L / 2)} y2={sy(W / 2) + 22} label={`Ø ${formatCm(L)} cm`} offset={30} />
      ) : (
        <>
          <DimLine x1={sx(-L / 2)} y1={sy(-W / 2) - 14} x2={sx(L / 2)} y2={sy(-W / 2) - 14} label={`${formatCm(L)} cm`} />
          <DimLine x1={sx(L / 2) + 14} y1={sy(-W / 2)} x2={sx(L / 2) + 14} y2={sy(W / 2)} label={`${formatCm(W)} cm`} vertical />
        </>
      )}

      <g transform={`translate(0 ${planH})`}>
        <text x={pad} y={24} className={styles.caption}>
          {compact ? 'Pogled sprijeda' : 'Pogled sprijeda i sa strane'}
        </text>
        <line x1={pad - 20} x2={VW - pad + 20} y1={ey(0)} y2={ey(0)} stroke={INK} strokeWidth={0.6} opacity={0.5} />
        {/* base, front view */}
        <g fill="#1f201d">
          {layout.baseParts.map((p, i) => {
            if (p.kind === 'prism') {
              const ys = p.polygon.map(([, y]) => y);
              return <rect key={i} x={ex(p.x - p.depth / 2)} y={ey(Math.max(...ys))} width={p.depth * eScale} height={(Math.max(...ys) - Math.min(...ys)) * eScale} />;
            }
            if (p.kind === 'plate') {
              const xs = p.outline.map(([x]) => x);
              return <rect key={i} x={ex(Math.min(...xs))} y={ey(p.y1)} width={(Math.max(...xs) - Math.min(...xs)) * eScale} height={Math.max(1.5, (p.y1 - p.y0) * eScale)} />;
            }
            return <rect key={i} x={ex(p.x - p.radius)} y={ey(p.y1)} width={2 * p.radius * eScale} height={(p.y1 - p.y0) * eScale} />;
          })}
        </g>
        <rect x={ex(-L / 2)} y={ey(H)} width={L * eScale} height={layout.thickness * eScale} fill={fill} stroke={INK} strokeWidth={1} rx={config.edgeId === 'rounded' ? 2 : 0} />
        <DimLine x1={ex(-L / 2) - 16} y1={ey(0)} x2={ex(-L / 2) - 16} y2={ey(H)} label="" vertical />
        <text x={ex(-L / 2) - 22} y={ey(H / 2)} textAnchor="end" dominantBaseline="middle" fill={DIM} fontSize={13}>
          {formatCm(H)} cm
        </text>
        {!compact && layout.frameXs.length > 0 && (
          <g transform={`translate(${sideX0} 0)`}>
            {(() => {
              const part = layout.baseParts.find((p) => p.kind === 'prism' && p.x > 0);
              const parts = layout.baseParts.filter((p) => p.kind === 'prism' && part?.kind === 'prism' && p.x === part.x);
              const zx = (z: number) => sideW / 2 + z * eScale;
              return (
                <>
                  <rect x={0} y={ey(H)} width={sideW} height={layout.thickness * eScale} fill={fill} stroke={INK} strokeWidth={1} />
                  {parts.map((p, i) =>
                    p.kind === 'prism' ? (
                      <path
                        key={i}
                        d={[p.polygon, ...(p.holes ?? [])].map((poly) => path(poly, zx, ey)).join(' ')}
                        fill="#1f201d"
                        fillRule="evenodd"
                      />
                    ) : null,
                  )}
                </>
              );
            })()}
          </g>
        )}
      </g>
    </svg>
  );
}

export interface EngravingDraw {
  rect: Rect;
  lines: string[];
  fontId: BoardConfig['personalization']['fontId'];
  placement: BoardConfig['personalization']['placement'];
}

export function BoardPlan2D({ config, engraving }: { config: BoardConfig; engraving?: EngravingDraw | null }) {
  const layout: BoardLayout = computeBoardLayout(config);
  const L = layout.lengthMm;
  const W = layout.widthMm;
  const T = layout.thickness;
  const cons = construction(config.constructionId);
  const VW = 640;
  const pad = 46;
  const scale = Math.min((VW - 2 * pad) / L, 300 / W);
  const planH = W * scale + 2 * pad;
  const sx = (x: number) => VW / 2 + x * scale;
  const sy = (z: number) => pad + (z + W / 2) * scale;
  const elevH = Math.max(60, T * scale) + 2 * pad;
  const ey = (y: number) => pad + (T - y) * scale;
  const clipId = `board-clip-${config.modelId}`;
  const strips = cons.strips.reduce<{ species: (typeof cons.strips)[number]['species']; z0: number; z1: number }[]>((acc, s) => {
    const z0 = acc.length ? acc[acc.length - 1]!.z1 : -W / 2;
    acc.push({ species: s.species, z0, z1: z0 + s.share * W });
    return acc;
  }, []);
  const font = ENGRAVING_FONTS.find((f) => f.id === engraving?.fontId);

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${VW} ${planH + elevH}`}
      role="img"
      aria-label={`Tlocrt daske: ${boardDimensionsText(config)}`}
      data-testid="plan2d"
      data-model={config.modelId}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path(layout.outline, sx, sy)} />
        </clipPath>
      </defs>
      <text x={pad} y={24} className={styles.caption}>
        Tlocrt
      </text>
      <g clipPath={`url(#${clipId})`}>
        {strips.map((s, i) => (
          <rect key={i} x={sx(-L / 2)} y={sy(s.z0)} width={L * scale} height={(s.z1 - s.z0) * scale} fill={WOOD_LOOK[s.species].base} />
        ))}
      </g>
      <path
        d={[layout.outline, ...layout.holes].map((p) => path(p, sx, sy)).join(' ')}
        fill="none"
        stroke={INK}
        strokeWidth={1.2}
      />
      {layout.holes.map((h, i) => (
        <path key={i} d={path(h, sx, sy)} fill="#f1ede5" stroke={INK} />
      ))}
      {layout.grooves.map((g, i) =>
        g.kind === 'slot' ? (
          <rect
            key={i}
            x={sx(g.x - g.width / 2)}
            y={sy(g.z0)}
            width={g.width * scale}
            height={(g.z1 - g.z0) * scale}
            rx={(g.width / 2) * scale}
            fill="rgba(29,28,26,0.28)"
            stroke={INK}
            strokeWidth={0.8}
          />
        ) : (
          <path key={i} d={path(g.path, sx, sy)} fill="none" stroke="rgba(29,28,26,0.45)" strokeWidth={g.width * scale} strokeLinejoin="round" />
        ),
      )}
      {layout.handles.map((h, i) => (
        <g key={i} stroke="#151514" strokeWidth={Math.max(2, h.barDiameter * scale)} strokeLinecap="round">
          <line x1={sx(h.x)} x2={sx(h.x)} y1={sy(-h.spacing / 2)} y2={sy(h.spacing / 2)} />
        </g>
      ))}
      {engraving && engraving.placement !== 'back' && (
        <text
          x={sx((engraving.rect.x0 + engraving.rect.x1) / 2)}
          y={sy((engraving.rect.z0 + engraving.rect.z1) / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#3a2414"
          fontSize={Math.max(6, ((engraving.rect.z1 - engraving.rect.z0) / Math.max(1, engraving.lines.length)) * scale * 0.82)}
          style={{ fontFamily: `var(${font?.cssVar ?? '--font-serif'})`, fontWeight: font?.weight ?? 600 }}
          data-testid="plan2d-engraving"
        >
          {engraving.lines.map((line, i) => (
            <tspan key={i} x={sx((engraving.rect.x0 + engraving.rect.x1) / 2)} dy={i === 0 ? `${-(engraving.lines.length - 1) * 0.6}em` : '1.2em'}>
              {line}
            </tspan>
          ))}
        </text>
      )}
      {layout.shape === 'circle' ? (
        <DimLine x1={sx(-L / 2)} y1={sy(W / 2) + 22} x2={sx(L / 2)} y2={sy(W / 2) + 22} label={`Ø ${formatCm(L)} cm`} offset={30} />
      ) : (
        <>
          <DimLine x1={sx(-L / 2)} y1={sy(-W / 2) - 14} x2={sx(L / 2)} y2={sy(-W / 2) - 14} label={`${formatCm(L)} cm${layout.shape === 'paddle' ? ' (s drškom)' : ''}`} />
          <DimLine x1={sx(L / 2) + 14} y1={sy(-W / 2)} x2={sx(L / 2) + 14} y2={sy(W / 2)} label={`${formatCm(W)} cm`} vertical />
        </>
      )}
      <g transform={`translate(0 ${planH})`}>
        <text x={pad} y={24} className={styles.caption}>
          Pogled sprijeda{engraving?.placement === 'back' ? ' · natpis na poleđini' : ''}
        </text>
        <rect x={sx(-L / 2)} y={ey(T)} width={L * scale} height={T * scale} fill={WOOD_LOOK[strips[strips.length - 1]!.species].base} stroke={INK} strokeWidth={1} />
        {layout.handles.map((h, i) => (
          <path
            key={i}
            d={`M${sx(h.x - 5)} ${ey(T)} L${sx(h.x - 5)} ${ey(T + h.clearance)} L${sx(h.x + 5)} ${ey(T + h.clearance)} L${sx(h.x + 5)} ${ey(T)}`}
            fill="none"
            stroke="#151514"
            strokeWidth={3}
          />
        ))}
        <text x={sx(L / 2) + 12} y={ey(T / 2)} dominantBaseline="middle" fill={DIM} fontSize={13}>
          {formatCm(T)} cm
        </text>
      </g>
    </svg>
  );
}

export function Plan2D({ config, engraving }: { config: TableConfig | BoardConfig; engraving?: EngravingDraw | null }) {
  return config.productType === 'table' ? <TablePlan2D config={config} /> : <BoardPlan2D config={config} engraving={engraving} />;
}
