import { z } from 'zod';

/**
 * Quote request — validated identically on the client and on the server.
 * At least one of phone or e-mail is required.
 */
export const QUOTE_LIMITS = {
  name: 80,
  phone: 30,
  email: 120,
  place: 80,
  message: 1000,
  configQuery: 1500,
  bodyBytes: 12_000,
} as const;

const phonePattern = /^[+()\d\s/-]{6,30}$/;

export const quoteRequestSchema = z
  .object({
    name: z.string().trim().min(2, 'Upišite ime (najmanje 2 znaka).').max(QUOTE_LIMITS.name, 'Ime je predugo.'),
    phone: z
      .string()
      .trim()
      .max(QUOTE_LIMITS.phone, 'Broj je predug.')
      .refine((v) => v === '' || phonePattern.test(v), 'Upišite ispravan broj telefona.'),
    email: z
      .string()
      .trim()
      .max(QUOTE_LIMITS.email, 'E-mail je predug.')
      .refine((v) => v === '' || z.email().safeParse(v).success, 'Upišite ispravnu e-mail adresu.'),
    place: z.string().trim().max(QUOTE_LIMITS.place, 'Mjesto je predugo.'),
    message: z.string().trim().max(QUOTE_LIMITS.message, `Poruka može imati najviše ${QUOTE_LIMITS.message} znakova.`),
    acknowledge: z.literal(true, { error: 'Potvrdite da šaljete upit za procjenu, a ne narudžbu.' }),
    /** Configuration as a permalink query; re-validated on the server. */
    product: z.enum(['table', 'board', 'none']),
    configQuery: z.string().max(QUOTE_LIMITS.configQuery),
    /** Honeypot — must stay empty. */
    website: z.string().max(200),
    /** Client-generated id; the server uses it to refuse duplicates. */
    submissionId: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/, 'Neispravan zahtjev.'),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (!v.phone && !v.email) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Upišite telefon ili e-mail (barem jedno).' });
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Upišite telefon ili e-mail (barem jedno).' });
    }
    if (v.product === 'none' && !v.message) {
      ctx.addIssue({ code: 'custom', path: ['message'], message: 'Opišite ukratko šta želite.' });
    }
    if (v.product !== 'none' && !v.configQuery) {
      ctx.addIssue({ code: 'custom', path: ['configQuery'], message: 'Nedostaje konfiguracija.' });
    }
  });

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type QuoteFieldErrors = Partial<Record<keyof QuoteRequest, string>>;

export function fieldErrors(error: z.ZodError): QuoteFieldErrors {
  const out: QuoteFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof QuoteRequest | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export type QuoteResponse =
  | { ok: true; id: string }
  | {
      ok: false;
      error: 'invalid' | 'too_large' | 'rate_limited' | 'duplicate' | 'not_configured' | 'provider_timeout' | 'provider_error' | 'rejected';
      message: string;
      fields?: QuoteFieldErrors;
    };
