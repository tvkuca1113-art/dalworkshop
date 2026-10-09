import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap page-hero">
      <p className="eyebrow">Greška 404</p>
      <h1>Ova stranica ne postoji.</h1>
      <p className="lead">Možda je link promijenjen. Krenite s početne stranice ili otvorite konfigurator.</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/" className="btn">
          Početna
        </Link>
        <Link href="/konfigurator/stol" className="btn btn--ghost">
          Kreirajte svoj stol
        </Link>
      </div>
    </section>
  );
}
