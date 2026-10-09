import type { Metadata } from 'next';
import { BoardConfigurator } from '@/components/configurator/BoardConfigurator';
import { isQuoteFormEnabled } from '@/lib/quote/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Konfigurator daske',
  description: 'Izaberite model, drvo, dimenzije, utore, ručke i personalizaciju daske za rezanje i serviranje u 3D, pa pošaljite upit DAL Workshopu.',
  alternates: { canonical: '/konfigurator/daska' },
};

export default function BoardConfiguratorPage() {
  return <BoardConfigurator formEnabled={isQuoteFormEnabled()} />;
}
