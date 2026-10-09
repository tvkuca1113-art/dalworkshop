import 'server-only';

/**
 * Server-only configuration. None of these are NEXT_PUBLIC_*.
 * The web form is enabled only when a verified sender, a recipient, the
 * e-mail provider key and a shared rate-limit store are all configured.
 */
export interface QuoteEnv {
  resendApiKey: string | null;
  fromEmail: string | null;
  toEmail: string | null;
  upstashUrl: string | null;
  upstashToken: string | null;
  rateLimitSalt: string;
  /** Test transport (writes to a local outbox). Never enable in production. */
  testOutboxDir: string | null;
}

function v(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export function readQuoteEnv(): QuoteEnv {
  return {
    resendApiKey: v('RESEND_API_KEY'),
    fromEmail: v('QUOTE_FROM_EMAIL'),
    toEmail: v('QUOTE_TO_EMAIL'),
    upstashUrl: v('UPSTASH_REDIS_REST_URL'),
    upstashToken: v('UPSTASH_REDIS_REST_TOKEN'),
    rateLimitSalt: v('RATE_LIMIT_SALT') ?? 'dal-workshop',
    testOutboxDir: v('QUOTE_TEST_OUTBOX_DIR'),
  };
}

export function isQuoteFormEnabled(env: QuoteEnv = readQuoteEnv()): boolean {
  if (env.testOutboxDir) return true;
  return Boolean(env.resendApiKey && env.fromEmail && env.toEmail && env.upstashUrl && env.upstashToken);
}
