/**
 * E-mail adapters. Resend is called over its REST API with a server-only key.
 * A provider timeout or error is never reported as success.
 */
export interface OutgoingMail {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export type SendResult = { ok: true; id: string } | { ok: false; kind: 'timeout' | 'error'; detail: string };

export interface Mailer {
  send(mail: OutgoingMail): Promise<SendResult>;
}

export function resendMailer(apiKey: string, fetchImpl: typeof fetch = fetch, timeoutMs = 8000): Mailer {
  return {
    async send(mail) {
      try {
        const res = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: mail.from,
            to: [mail.to],
            reply_to: mail.replyTo ? [mail.replyTo] : undefined,
            subject: mail.subject,
            text: mail.text,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) {
          return { ok: false, kind: 'error', detail: `HTTP ${res.status}` };
        }
        const data = (await res.json().catch(() => null)) as { id?: unknown } | null;
        if (!data || typeof data.id !== 'string') return { ok: false, kind: 'error', detail: 'missing id' };
        return { ok: true, id: data.id };
      } catch (err) {
        const name = (err as { name?: string }).name;
        if (name === 'TimeoutError' || name === 'AbortError') return { ok: false, kind: 'timeout', detail: name };
        return { ok: false, kind: 'error', detail: name ?? 'network' };
      }
    },
  };
}
