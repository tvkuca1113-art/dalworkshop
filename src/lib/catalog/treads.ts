import { WOOD_LOOK } from './woods';

/** User-supplied DAL cjenovnik, 10. 10. 2026. Prices include oiling. */
export const TREAD_CATALOG = {
  lengthMm: 1000,
  depthMm: 300,
  finish: 'Nauljeno',
  reviewedOn: '2026-10-10',
  source: 'Cjenovnik gazišta koji je dostavio DAL Workshop',
  inspirationImage: '/images/dal-gazista-ambijent.webp',
  quantityRange: [1, 100],
  variants: [
    { thicknessMm: 40, priceFening: 11000 },
    { thicknessMm: 60, priceFening: 16000 },
    { thicknessMm: 80, priceFening: 21000 },
  ],
} as const;
export const TREAD_WOOD_IDS = ['oak', 'ash', 'maple'] as const;
export const TREAD_WOODS = TREAD_WOOD_IDS.map(id => ({
  id, label: WOOD_LOOK[id].label, color: WOOD_LOOK[id].base,
  description: id === 'oak' ? 'Topao ton i izraženi godovi.' : id === 'ash' ? 'Svjetliji ton i jasno vidljive linije.' : 'Nježnije šare i miran, svijetao izgled.',
}));

export interface TreadSelection {
  wood: (typeof TREAD_WOOD_IDS)[number];
  thickness: (typeof TREAD_CATALOG.variants)[number]['thicknessMm'];
  quantity: number;
}
