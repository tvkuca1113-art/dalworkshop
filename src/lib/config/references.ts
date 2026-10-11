import { REFERENCE_LIMITS, REFERENCE_TYPES } from '../catalog/references';

export function referenceFileError(file: Pick<File, 'size' | 'type'>): string | null {
  if (!(REFERENCE_TYPES as readonly string[]).includes(file.type)) return 'Izaberite JPG, PNG ili WebP fotografiju.';
  if (file.size === 0 || file.size > REFERENCE_LIMITS.bytes) return 'Fotografija treba biti manja od 8 MB i ne smije biti prazna.';
  return null;
}
