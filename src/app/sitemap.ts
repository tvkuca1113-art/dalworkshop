import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';

const ROUTES = ['/', '/stolovi', '/daske', '/gazista', '/konfigurator/stol', '/konfigurator/daska', '/radovi', '/odrzavanje', '/kontakt', '/privatnost'];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];
  return ROUTES.map((path) => ({ url: `${origin}${path === '/' ? '' : path}`, changeFrequency: 'monthly', priority: path === '/' ? 1 : 0.7 }));
}
