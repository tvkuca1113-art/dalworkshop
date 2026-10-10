import { useId } from 'react';
import type { TableConfig } from '@/lib/config/types';
import { computeTableLayout } from '@/lib/geometry/table-layout';
import { edgeProfile } from '@/lib/geometry/outline';
import { insetConvex, type Pt } from '@/lib/geometry/polygon';
import type { ViewPreset } from '../three/types';

/** Spatial fallback from the same millimetre layout as WebGL. */
export function EdgeTableDrawing({ config, view }: { config: TableConfig; view: ViewPreset }) {
  const id = useId().replace(/:/g, '');
  const l = computeTableLayout(config);
  const sign = view === 'back' ? -1 : 1;
  const project = (x: number, y: number, z: number): Pt => [450 + sign * (.36 * x - .3 * z), 420 + sign * (.08 * x + .13 * z) - .38 * y];
  const path = (pts: Pt[]) => `${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')} Z`;
  // Offset the shared extrusion outline. All bevel rings retain matching vertices,
  // including when an 8 mm profile exceeds the plan's small corner radius.
  const outline = (inset: number) => insetConvex(l.extrudeOutline, inset - l.profileMm);
  const ring = (inset: number, drop: number) => outline(inset).map(([x, z]) => project(x, l.topY - drop, z));
  const outside = outline(0);
  const tone = config.woodId === 'walnut' ? ['#927052', '#644934', '#b49371'] : config.woodId === 'ash' ? ['#d3b68c', '#ac8a63', '#e8d6b3'] : ['#b98c56', '#916537', '#d6b486'];
  const profile = edgeProfile(l.profileMm, l.profileSegments);
  const topFace = ring(l.profileMm, 0);
  const outerTop = ring(0, l.profileMm);
  const outerBottom = ring(0, l.thickness - l.profileMm);
  const zoom = view === 'edge' ? 'translate(-1260 -260) scale(3.2)' : undefined;
  return (
    <svg viewBox="0 0 900 600" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-tone`} x2="1" y2="1"><stop stopColor={tone[2]} /><stop offset="1" stopColor={tone[0]} /></linearGradient>
        <pattern id={`${id}-wood`} width="180" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <rect width="180" height="48" fill={`url(#${id}-tone)`} />
          {[4, 12, 20, 32, 43].map((y) => <path key={y} d={`M-10 ${y} Q50 ${y - 7} 95 ${y + 2} T190 ${y}`} stroke={tone[1]} opacity=".3" fill="none" strokeWidth=".8" />)}
        </pattern>
        <radialGradient id={`${id}-shadow`}><stop stopColor="#423428" stopOpacity=".17" /><stop offset="1" stopColor="#423428" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={zoom}>
        <ellipse cx="450" cy="452" rx="360" ry="108" fill={`url(#${id}-shadow)`} />
        {[...l.baseParts].sort((a, b) => sign * ((a.kind === 'prism' ? a.x : 0) - (b.kind === 'prism' ? b.x : 0))).map((part, i) => part.kind === 'prism' ? (
          <path key={i} d={path(part.polygon.map(([z, y]) => project(part.x, y, z))) + (part.holes ?? []).map((h) => path(h.map(([z, y]) => project(part.x, y, z)))).join(' ')} fill="#282c28" fillRule="evenodd" stroke="#41453f" strokeWidth="2" />
        ) : null)}
        {outerTop.map((p, i) => {
          const j = (i + 1) % outerTop.length;
          const [x, z] = outside[i]!;
          const [nx, nz] = outside[j]!;
          return sign * ((nz - z) - (nx - x)) > 0 ? <path key={i} d={path([p, outerTop[j]!, outerBottom[j]!, outerBottom[i]!])} fill={`url(#${id}-wood)`} stroke={tone[1]} strokeWidth=".4" /> : null;
        })}
        <path d={path(topFace)} fill={`url(#${id}-wood)`} />
        {profile.slice(1).map(([inset, drop], k) => {
          const prev = profile[k]!;
          const a = ring(prev[0], prev[1]);
          const b = ring(inset, drop);
          return a.map((p, i) => {
            const j = (i + 1) % a.length;
            return <path key={`${k}-${i}`} d={path([p, a[j]!, b[j]!, b[i]!])} fill={tone[0]} stroke={tone[0]} strokeWidth=".25" opacity={.65 + k / profile.length * .3} />;
          });
        })}
        <path d={path(topFace)} fill="none" stroke={tone[2]} strokeWidth="1.2" />
      </g>
    </svg>
  );
}
