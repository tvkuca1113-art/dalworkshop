import type { Metadata } from 'next';
import { TableConfigurator } from '@/components/configurator/TableConfigurator';
import { isQuoteFormEnabled } from '@/lib/quote/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Konfigurator stola',
  description: 'Podesite oblik, drvo, dimenzije, ivicu i postolje stola od masivnog drveta u 3D i pošaljite upit DAL Workshopu.',
  alternates: { canonical: '/konfigurator/stol' },
};

export default function TableConfiguratorPage() {
  return <TableConfigurator formEnabled={isQuoteFormEnabled()} />;
}
