import 'server-only';
import { BRAND } from '@/lib/catalog/brand';
import { siteOrigin } from '@/lib/site';

/** Describe the published offer using confirmed facts; no invented address or reviews. */
export function ServiceJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  const origin = siteOrigin();
  if (!origin) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${origin}${path}#service`,
    name,
    description,
    serviceType: name,
    url: `${origin}${path}`,
    provider: { '@id': `${origin}#organization` },
    areaServed: { '@type': 'City', name: BRAND.city },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
