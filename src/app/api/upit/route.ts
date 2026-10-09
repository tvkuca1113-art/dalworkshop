import { NextResponse } from 'next/server';
import { readQuoteEnv } from '@/lib/quote/env';
import { handleQuote, type QuoteDeps } from '@/lib/quote/handler';
import { resendMailer } from '@/lib/quote/mailer';
import { memoryGuard, upstashGuard } from '@/lib/quote/ratelimit';
import { outboxMailer } from '@/lib/quote/outbox';
import { siteOrigin } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only used together with the local test transport (QUOTE_TEST_OUTBOX_DIR).
const testGuard = memoryGuard();

function deps(req: Request): QuoteDeps {
  const env = readQuoteEnv();
  const origin = siteOrigin() ?? new URL(req.url).origin;
  if (env.testOutboxDir) {
    return {
      mailer: outboxMailer(env.testOutboxDir),
      guard: testGuard,
      fromEmail: 'test-sender@localhost',
      toEmail: 'test-recipient@localhost',
      salt: env.rateLimitSalt,
      siteOrigin: origin,
    };
  }
  return {
    mailer: env.resendApiKey ? resendMailer(env.resendApiKey) : null,
    guard: env.upstashUrl && env.upstashToken ? upstashGuard(env.upstashUrl, env.upstashToken) : null,
    fromEmail: env.fromEmail,
    toEmail: env.toEmail,
    salt: env.rateLimitSalt,
    siteOrigin: origin,
  };
}

export async function POST(req: Request) {
  const result = await handleQuote(req, deps(req));
  return NextResponse.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
}
