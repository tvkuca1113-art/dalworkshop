import type { MetadataRoute } from 'next';
import { indexingEnabled, siteOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  if (!indexingEnabled()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: origin ? `${origin}/sitemap.xml` : undefined,
  };
}
