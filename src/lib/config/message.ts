import { whatsappLink } from '../catalog/brand';
import { calculatePrice } from './pricing';
import { formatKm } from './units';
import { GRAIN_NOTE, PRICE_QUOTE_COPY, specFor } from './summary';
import type { BoardConfig, TableConfig } from './types';

/**
 * Inquiry text built from the validated configuration. It contains no
 * contact data. Personalised text is included because the customer sends
 * this message themselves.
 */
export function inquiryText(config: TableConfig | BoardConfig, link: string | null): string {
  const lines: string[] = ['Pozdrav, zainteresovan/a sam za izradu po mjeri. Šaljem svoju konfiguraciju:', ''];
  for (const line of specFor(config)) {
    lines.push(`• ${line.label}: ${line.value}`);
  }
  const price = calculatePrice(config);
  lines.push(`• Cijena: ${price.status === 'priced' ? `${formatKm(price.fening)} (cjenovnik ${price.priceListVersion})` : PRICE_QUOTE_COPY.toLowerCase()}`);
  lines.push('');
  lines.push(`Napomena: ${GRAIN_NOTE}`);
  if (link) {
    lines.push('');
    lines.push(`Konfiguracija: ${link}`);
  }
  lines.push('');
  lines.push('Molim potvrdu mogućnosti izrade, cijene i roka.');
  return lines.join('\n');
}

export function whatsappInquiryHref(config: TableConfig | BoardConfig, link: string | null): string {
  return whatsappLink(inquiryText(config, link));
}
