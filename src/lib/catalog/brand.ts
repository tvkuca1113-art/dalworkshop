/**
 * Verified public facts (reviewed 9. 10. 2026, see docs/reference/ISTRAZIVANJE.md).
 * Do not add address, opening hours, team, ratings or lead times here
 * until DAL Workshop confirms them.
 */
export const BRAND = {
  name: 'DAL Workshop',
  city: 'Mostar',
  country: 'Bosna i Hercegovina',
  countryCode: 'BA',
  instagram: 'https://www.instagram.com/dalworkshop.ba/',
  instagramHandle: '@dalworkshop.ba',
  facebook: 'https://www.facebook.com/p/DAL-Workshop-61583287752988/',
  phonePrimary: '+387 62 704 560',
  phonePrimaryE164: '+38762704560',
  whatsappNumber: '38762704560',
  /** Mentioned in one Instagram post; never used as the WhatsApp number. */
  phoneSecondary: '+387 63 810 946',
  phoneSecondaryE164: '+38763810946',
  email: 'dalworkshop@hotmail.com',
  logo: {
    src: '/brand/dal-logo-original.jpg',
    width: 1254,
    height: 1254,
    /** Raster downloaded from the public Facebook profile; not a vector original. */
    vectorOriginal: false,
  },
  sourcesReviewedOn: '2026-10-09',
} as const;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${BRAND.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
