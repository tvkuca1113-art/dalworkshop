/**
 * Public site URL and indexing switch (deployment settings).
 * NEXT_PUBLIC_SITE_URL — canonical origin, e.g. https://dalworkshop.ba (not hardcoded).
 * SITE_INDEXING=on — allow search engines; anything else = noindex (demo/preview).
 */
export function siteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.origin;
  } catch {
    return null;
  }
}

export function indexingEnabled(): boolean {
  return process.env.SITE_INDEXING === 'on' && siteOrigin() !== null;
}

/**
 * Origin used only to resolve absolute Open Graph URLs: the configured site
 * URL, else the real deployment URL provided by Vercel. Never an invented domain.
 */
export function deploymentOrigin(): string | null {
  const configured = siteOrigin();
  if (configured) return configured;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : null;
}
