import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Mailer } from './mailer';

/**
 * Test transport: writes each message to a local JSON file instead of
 * sending it. Enabled only via QUOTE_TEST_OUTBOX_DIR (local/e2e testing).
 */
export function outboxMailer(dir: string): Mailer {
  return {
    async send(mail) {
      if (mail.text.includes('[[simuliraj-gresku]]')) return { ok: false, kind: 'error', detail: 'simulated' };
      if (mail.text.includes('[[simuliraj-timeout]]')) return { ok: false, kind: 'timeout', detail: 'simulated' };
      await mkdir(dir, { recursive: true });
      const id = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await writeFile(path.join(dir, `${id}.json`), JSON.stringify(mail, null, 2), 'utf8');
      return { ok: true, id };
    },
  };
}
