import { useId } from 'react';
import { baseOption, finishOption } from '@/lib/catalog/table';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import type { Pt } from '@/lib/geometry/polygon';
import type { TableConfig } from '@/lib/config/types';
import { tableDimensionsText } from '@/lib/config/summary';

/** An orthographic spatial drawing of the shared layout, including solid supports. */
export function SpatialTableDrawing({ config, preview = false }: { config: TableConfig; preview?: boolean }) {
  const id = useId().replace(/:/g, '');
  const l = computeTableLayout(config);
  const project = (x: number, y: number, z: number): Pt => [450 + .36 * x - .3 * z, 430 + .08 * x + .13 * z - .38 * y];
  const path = (pts: readonly Pt[]) => `${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')} Z`;
  const ring = (y: number) => l.outline.map(([x, z]) => project(x, y, z));
  const upper = ring(l.topY);
  const lower = ring(l.undersideY);
  const all = [...upper, ...ring(0)];
  const xs = all.map(([x]) => x), ys = all.map(([, y]) => y);
  const x0 = Math.min(...xs) - 65, y0 = Math.min(...ys) - 65;
  const w = Math.max(...xs) - x0 + 65, h = Math.max(...ys) - y0 + 65;
  const woodBase = baseOption(config.baseId).material === 'wood';
  const side = config.woodId === 'walnut' ? '#735039' : config.woodId === 'ash' ? '#bba17a' : '#a77c4d';
  const finish = finishOption(config.finishId);
  const tint = finish.tint;
  const [textureX, textureY] = project(-l.lengthMm / 2, l.topY, -l.widthMm / 2);
  return (
    <svg viewBox={`${x0} ${y0} ${w} ${h}`} role={preview ? undefined : 'img'} aria-hidden={preview || undefined} aria-label={preview ? undefined : `Prostorni prikaz stola: ${tableDimensionsText(config)}`} data-testid={preview ? undefined : 'spatial-table'} data-base={config.baseId}>
      <defs>
        <pattern id={`${id}-grain`} width="1024" height="565" patternUnits="userSpaceOnUse" patternTransform={`matrix(${.36 * 2900 / 1024} ${.08 * 2900 / 1024} ${-.3 * 1600 / 565} ${.13 * 1600 / 565} ${textureX} ${textureY})`}>
          <image href={`/materials/${config.woodId}.webp`} width="1024" height="565" />
        </pattern>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#45382e" stopOpacity=".23" /><stop offset="1" stopColor="#45382e" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-steel`} x2="1" y2="1"><stop stopColor="#56574f" /><stop offset=".35" stopColor="#30332f" /><stop offset="1" stopColor="#171b18" /></linearGradient>
        {tint && <filter id={`${id}-finish`}><feColorMatrix type="matrix" values={`${tint[0]} 0 0 0 0 0 ${tint[1]} 0 0 0 0 0 ${tint[2]} 0 0 0 0 0 1 0`} /></filter>}
      </defs>
      <ellipse cx="450" cy="435" rx={w * .48} ry={Math.min(120, l.widthMm * .17)} fill={`url(#${id}-shadow)`} />
      {[...l.baseParts].sort((a, b) => (a.kind === 'prism' ? a.x : 0) - (b.kind === 'prism' ? b.x : 0)).map((part, i) => {
        const fill = woodBase ? side : `url(#${id}-steel)`;
        if (part.kind === 'prism') {
          const a = part.polygon.map(([z, y]) => project(part.x - part.depth / 2, y, z));
          const b = part.polygon.map(([z, y]) => project(part.x + part.depth / 2, y, z));
          return <g key={i}>
            {a.map((p, k) => <path key={k} d={path([p, a[(k + 1) % a.length]!, b[(k + 1) % b.length]!, b[k]!])} fill={fill} stroke={woodBase ? '#896749' : '#30342e'} strokeWidth=".5" />)}
            <path d={path(b) + (part.holes ?? []).map((hole) => path(hole.map(([z, y]) => project(part.x + part.depth / 2, y, z)))).join(' ')} fill={fill} fillRule="evenodd" stroke={woodBase ? '#896749' : '#41483e'} strokeWidth=".8" />
          </g>;
        }
        if (part.kind === 'plate') {
          const a = part.outline.map(([x, z]) => project(x, part.y0, z));
          const b = part.outline.map(([x, z]) => project(x, part.y1, z));
          return <g key={i}>{a.map((p, k) => <path key={k} d={path([p, a[(k + 1) % a.length]!, b[(k + 1) % b.length]!, b[k]!])} fill="#232823" />)}<path d={path(b)} fill={fill} /></g>;
        }
        const points = Array.from({ length: 32 }, (_, k) => { const angle = k / 32 * Math.PI * 2; return [part.x + Math.cos(angle) * part.radius, part.z + Math.sin(angle) * part.radius] as Pt; });
        return <g key={i}>{points.map(([x, z], k) => { const [nx, nz] = points[(k + 1) % points.length]!; return <path key={k} d={path([project(x, part.y0, z), project(nx, part.y0, nz), project(nx, part.y1, nz), project(x, part.y1, z)])} fill={k < 16 ? '#343a32' : '#20251f'} />; })}</g>;
      })}
      <g filter={tint ? `url(#${id}-finish)` : undefined}>
        {upper.map((p, i) => { const j = (i + 1) % upper.length; return <path key={i} d={path([p, upper[j]!, lower[j]!, lower[i]!])} fill={side} stroke={side} strokeWidth=".5" />; })}
        <path d={path(upper)} fill={`url(#${id}-grain)`} stroke={side} strokeWidth="1" strokeLinejoin={config.edgeId === 'rounded' ? 'round' : 'miter'} />
        <path d={path(upper)} fill="none" stroke="#fff3d5" strokeOpacity={config.edgeId === 'rounded' ? '.5' : '.25'} strokeWidth={config.edgeId === 'rounded' ? '2.5' : '1'} />
      </g>
    </svg>
  );
}
