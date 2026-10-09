import { describe, expect, it } from 'vitest';
import { handleQuote, type QuoteDeps } from '@/lib/quote/handler';
import { memoryGuard, type Guard } from '@/lib/quote/ratelimit';
import { resendMailer, type Mailer, type OutgoingMail } from '@/lib/quote/mailer';
import { encodeTable } from '@/lib/config/url';
import { DEFAULT_TABLE } from '@/lib/config/defaults';

function body(over: Record<string, unknown> = {}) {
  return {
    name: 'Amra Hadžić',
    phone: '+387 61 000 000',
    email: '',
    place: 'Mostar',
    message: 'Zanima me rok.',
    acknowledge: true,
    product: 'table',
    configQuery: encodeTable(DEFAULT_TABLE),
    website: '',
    submissionId: `sub-${Math.random().toString(36).slice(2, 12)}`,
    ...over,
  };
}

function req(data: unknown, headers: Record<string, string> = {}) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return new Request('https://test.local/api/upit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...headers },
    body: text,
  });
}

function deps(mailer: Mailer, guard: Guard = memoryGuard()): QuoteDeps {
  return { mailer, guard, fromEmail: 'upiti@verified.example', toEmail: 'dalworkshop@hotmail.com', salt: 't', siteOrigin: 'https://test.local' };
}

const okMailer = (sent: OutgoingMail[] = []): Mailer => ({
  async send(m) {
    sent.push(m);
    return { ok: true, id: 're_123' };
  },
});

describe('quote endpoint', () => {
  it('sends a validated inquiry built from the server-side configuration', async () => {
    const sent: OutgoingMail[] = [];
    const r = await handleQuote(req(body()), deps(okMailer(sent)));
    expect(r).toEqual({ status: 200, body: { ok: true, id: 're_123' } });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.from).toBe('upiti@verified.example');
    expect(sent[0]!.text).toContain('Dužina: 150 cm');
    expect(sent[0]!.text).toContain('Cijena prema odabranoj konfiguraciji');
    expect(sent[0]!.text).toContain('Amra Hadžić');
  });

  it('rejects invalid requests with field errors', async () => {
    const r = await handleQuote(req(body({ phone: '', email: 'nije-email', name: 'A' })), deps(okMailer()));
    expect(r.status).toBe(400);
    expect(r.body.ok).toBe(false);
    if (!r.body.ok) {
      expect(r.body.fields?.email).toBeTruthy();
      expect(r.body.fields?.name).toBeTruthy();
    }
  });

  it('requires phone or e-mail and the acknowledgement', async () => {
    const r1 = await handleQuote(req(body({ phone: '', email: '' })), deps(okMailer()));
    expect(r1.status).toBe(400);
    const r2 = await handleQuote(req(body({ acknowledge: false })), deps(okMailer()));
    expect(r2.status).toBe(400);
  });

  it('re-validates the configuration on the server', async () => {
    const r = await handleQuote(req(body({ configQuery: encodeTable(DEFAULT_TABLE).replace('w=oak', 'w=teak') })), deps(okMailer()));
    expect(r.status).toBe(400);
    const r2 = await handleQuote(req(body({ price: 0 })), deps(okMailer()));
    expect(r2.status).toBe(400); // unknown field (client price) is rejected
  });

  it('rejects malformed JSON, oversized bodies and the honeypot', async () => {
    expect((await handleQuote(req('{oops'), deps(okMailer()))).status).toBe(400);
    expect((await handleQuote(req(body({ message: 'x'.repeat(20_000) })), deps(okMailer()))).status).toBe(413);
    const hp = await handleQuote(req(body({ website: 'http://spam' })), deps(okMailer()));
    expect(hp.status).toBe(400);
  });

  it('provider timeout and provider error are errors, never success', async () => {
    const timeout: Mailer = { send: async () => ({ ok: false, kind: 'timeout', detail: 't' }) };
    const error: Mailer = { send: async () => ({ ok: false, kind: 'error', detail: 'e' }) };
    const r1 = await handleQuote(req(body()), deps(timeout));
    const r2 = await handleQuote(req(body()), deps(error));
    expect(r1.status).toBe(504);
    expect(r1.body.ok).toBe(false);
    expect(r2.status).toBe(502);
    expect(r2.body.ok).toBe(false);
  });

  it('the Resend adapter maps a hanging request to a timeout', async () => {
    const hanging: typeof fetch = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'TimeoutError' })));
      });
    const mailer = resendMailer('re_test', hanging, 50);
    const r = await mailer.send({ from: 'a@b.c', to: 'd@e.f', subject: 's', text: 't' });
    expect(r).toMatchObject({ ok: false, kind: 'timeout' });
    const http500: typeof fetch = async () => new Response('fail', { status: 500 });
    expect(await resendMailer('re_test', http500).send({ from: 'a@b.c', to: 'd@e.f', subject: 's', text: 't' })).toMatchObject({
      ok: false,
      kind: 'error',
    });
  });

  it('is not configured without mailer or shared rate-limit store', async () => {
    const r = await handleQuote(req(body()), { ...deps(okMailer()), guard: null });
    expect(r.status).toBe(503);
    expect(r.body.ok === false && r.body.error).toBe('not_configured');
  });

  it('limits repeated requests and refuses duplicates', async () => {
    const guard = memoryGuard();
    const d = deps(okMailer(), guard);
    const same = body();
    expect((await handleQuote(req(same), d)).status).toBe(200);
    expect((await handleQuote(req(same), d)).status).toBe(409);
    for (let i = 0; i < 3; i++) await handleQuote(req(body()), d);
    expect((await handleQuote(req(body()), d)).status).toBe(429);
  });

  it('a failing rate-limit store does not produce success', async () => {
    const broken: Guard = { allow: async () => { throw new Error('down'); }, claimOnce: async () => true };
    const r = await handleQuote(req(body()), deps(okMailer(), broken));
    expect(r.status).toBe(502);
  });
});
