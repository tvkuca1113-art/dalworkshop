import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import './globals.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { BRAND } from '@/lib/catalog/brand';
import { deploymentOrigin, indexingEnabled, siteOrigin } from '@/lib/site';

const origin = siteOrigin();
const ogBase = deploymentOrigin();

export const metadata: Metadata = {
  ...(ogBase ? { metadataBase: new URL(ogBase) } : {}),
  title: {
    default: 'DAL Workshop — stolovi i daske po mjeri, Mostar',
    template: '%s · DAL Workshop',
  },
  description:
    'Stolovi od masivnog drveta i daske za rezanje i serviranje, ručna izrada po mjeri u Mostaru. Konfigurišite proizvod u 3D i zatražite ponudu.',
  applicationName: BRAND.name,
  robots: indexingEnabled() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    siteName: BRAND.name,
    images: [{ url: '/og/dal-og.jpg', width: 1200, height: 630, alt: 'Hrastov stol DAL Workshop u toplom enterijeru (vizualizacija ambijenta)' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#171816',
};

function OrganizationJsonLd() {
  // Only confirmed public facts: name, Mostar as area, public contacts.
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    ...(origin ? { url: origin, logo: `${origin}${BRAND.logo.src}` } : {}),
    areaServed: { '@type': 'City', name: BRAND.city },
    telephone: BRAND.phonePrimaryE164,
    email: BRAND.email,
    sameAs: [BRAND.instagram, BRAND.facebook],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload('/fonts/cormorant-garamond-latin-500-normal.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' });
  preload('/fonts/manrope-latin-wght-normal.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' });
  return (
    <html lang="bs" data-scroll-behavior="smooth">
      <body>
        <a href="#sadrzaj" className="skip-link">
          Preskoči na sadržaj
        </a>
        <SiteHeader />
        <main id="sadrzaj">{children}</main>
        <SiteFooter />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
