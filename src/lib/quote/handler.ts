import { decodeConfig, permalink } from '../config/url';
import { specFor, PRICE_QUOTE_COPY, GRAIN_NOTE } from '../config/summary';
import { calculatePrice } from '../config/pricing';
import { formatKm } from '../config/units';
import type { BoardConfig, TableConfig } from '../config/types';
import type { Guard } from './ratelimit';
import type { Mailer } from './mailer';
import { fieldErrors, QUOTE_LIMITS, quoteRequestSchema, type QuoteRequest, type QuoteResponse } from './schema';

export interface QuoteDeps {
  mailer: Mailer | null;
  guard: Guard | null;
  fromEmail: string | null;
  toEmail: string | null;
  salt: string;
  siteOrigin: string;
}

export interface HandlerResult {
  status: number;
  body: QuoteResponse;
}

const RATE_LIMIT = { perHour: 5, windowSeconds: 3600 };

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function fail(status: number, error: Extract<QuoteResponse, { ok: false }>['error'], message: string, fields?: Extract<QuoteResponse, { ok: false }>['fields']): HandlerResult {
  return { status, body: { ok: false, error, message, fields } };
}

export function buildQuoteMail(data: QuoteRequest, config: TableConfig | BoardConfig | null, siteOrigin: string) {
  const lines: string[] = [];
  lines.push('Novi upit s web stranice DAL Workshop (upit za procjenu, ne narudžba).', '');
  lines.push(`Ime: ${data.name}`);
  if (data.phone) lines.push(`Telefon: ${data.phone}`);
  if (data.email) lines.push(`E-mail: ${data.email}`);
  if (data.place) lines.push(`Mjesto dostave: ${data.place}`);
  lines.push('');
  if (config) {
    lines.push('Konfiguracija (provjerena na serveru):');
    for (const l of specFor(config)) lines.push(`• ${l.label}: ${l.value}`);
    const price = calculatePrice(config);
    lines.push(`• Cijena: ${price.status === 'priced' ? formatKm(price.fening) : PRICE_QUOTE_COPY}`);
    lines.push(`• Link: ${permalink(siteOrigin, config, { includePersonalText: true })}`);
    lines.push('', `Napomena kupcu prikazana: ${GRAIN_NOTE}`, '');
  }
  if (data.message) lines.push('Poruka:', data.message, '');
  const what = config ? (config.productType === 'table' ? 'stol po mjeri' : 'daska') : 'opći upit';
  return {
    subject: `Upit s weba — ${what} — ${data.name}`.slice(0, 140),
    text: lines.join('\n'),
  };
}

export async function handleQuote(req: Request, deps: QuoteDeps): Promise<HandlerResult> {
  if (!deps.mailer || !deps.guard || !deps.fromEmail || !deps.toEmail) {
    return fail(503, 'not_configured', 'Slanje web obrasca trenutno nije podešeno. Pošaljite upit na WhatsApp.');
  }
  const type = req.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return fail(400, 'invalid', 'Neispravan zahtjev.');
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > QUOTE_LIMITS.bodyBytes) return fail(413, 'too_large', 'Upit je predug.');
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > QUOTE_LIMITS.bodyBytes) return fail(413, 'too_large', 'Upit je predug.');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, 'invalid', 'Neispravan zahtjev.');
  }
  const parsed = quoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, 'invalid', 'Provjerite označena polja.', fieldErrors(parsed.error));
  }
  const data = parsed.data;
  if (data.website) return fail(400, 'rejected', 'Upit nije prihvaćen.');

  let config: TableConfig | BoardConfig | null = null;
  if (data.product !== 'none') {
    const decoded = decodeConfig(data.product, data.configQuery);
    if (decoded.status !== 'ok') {
      return fail(400, 'invalid', 'Konfiguracija u upitu nije valjana. Osvježite konfigurator i pokušajte ponovo.', {
        configQuery: 'Konfiguracija nije valjana.',
      });
    }
    config = decoded.config;
  }

  try {
    const key = `dal:rl:${await sha256(`${deps.salt}:${clientIp(req)}`)}`;
    if (!(await deps.guard.allow(key, RATE_LIMIT.perHour, RATE_LIMIT.windowSeconds))) {
      return fail(429, 'rate_limited', 'Poslali ste više upita u kratkom vremenu. Pokušajte kasnije ili pišite na WhatsApp.');
    }
    if (!(await deps.guard.claimOnce(data.submissionId, 86_400))) {
      return fail(409, 'duplicate', 'Ovaj upit je već poslan.');
    }
  } catch {
    return fail(502, 'provider_error', 'Zaštita obrasca trenutno nije dostupna. Pokušajte ponovo ili pošaljite upit na WhatsApp.');
  }

  const mail = buildQuoteMail(data, config, deps.siteOrigin);
  const result = await deps.mailer.send({
    from: deps.fromEmail,
    to: deps.toEmail,
    replyTo: data.email || undefined,
    subject: mail.subject,
    text: mail.text,
  });
  if (!result.ok) {
    return result.kind === 'timeout'
      ? fail(504, 'provider_timeout', 'Slanje je trajalo predugo i nije potvrđeno. Pokušajte ponovo ili pošaljite upit na WhatsApp.')
      : fail(502, 'provider_error', 'Slanje trenutno nije uspjelo. Pokušajte ponovo ili pošaljite upit na WhatsApp.');
  }
  return { status: 200, body: { ok: true, id: result.id } };
}
