import type { Metadata } from 'next';
import Link from 'next/link';
import { Gallery } from '@/components/site/Gallery';
import { WORKS } from '@/lib/catalog/works';

export const metadata: Metadata = {
  title: 'Radovi',
  description: 'Stvarni radovi DAL Workshopa iz Mostara: hrastov stol 150 × 70 cm i daske za rezanje i serviranje, kako su objavljeni na Instagramu.',
  alternates: { canonical: '/radovi' },
};

export default function WorksPage() {
  return (
    <>
      <section className="wrap page-hero">
        <p className="eyebrow">Radovi</p>
        <h1>Drvo, oblikovano s pažnjom.</h1>
        <p className="lead">
          Pogledajte stolove i daske iz naše radionice na originalnim fotografijama. Svaki komad može biti početak ideje za vaš dom.
        </p>
      </section>
      <section className="wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
        <Gallery works={WORKS} />
        <p className="note" style={{ marginTop: '1.5rem' }}>
          Imate sličnu ideju?{' '}
          <Link href="/konfigurator/stol" className="text-link">
            Kreirajte svoj stol
          </Link>{' '}
          ili{' '}
          <Link href="/konfigurator/daska" className="text-link">
            svoju dasku
          </Link>
          .
        </p>
      </section>
    </>
  );
}
