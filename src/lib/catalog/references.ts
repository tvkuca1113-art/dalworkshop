/** Reference images stay local until the customer explicitly shares them. */
export const REFERENCE_KINDS = [
  { id: 'base', label: 'Noge / postolje' },
  { id: 'table', label: 'Cijeli stol' },
  { id: 'room', label: 'Moj prostor' },
] as const;
export type ReferenceKind = (typeof REFERENCE_KINDS)[number]['id'];
export const REFERENCE_LIMITS = { count: 3, bytes: 8 * 1024 * 1024, pixels: 32_000_000 } as const;
export const REFERENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
