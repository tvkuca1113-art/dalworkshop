/**
 * Build-time feature flags (public, non-secret). Documented in .env.example.
 */
export const FLAGS = {
  /** End-grain checker construction is hidden until DAL confirms it. */
  endGrain: process.env.NEXT_PUBLIC_FEATURE_END_GRAIN === '1',
  /** Personalization editor; set to "off" if the workshop excludes it. */
  personalization: process.env.NEXT_PUBLIC_PERSONALIZATION !== 'off',
} as const;
