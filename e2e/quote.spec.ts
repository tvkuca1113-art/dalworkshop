import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { FORM_SERVER, goToStep, waitForViewer } from './helpers';
import { OUTBOX } from '../playwright.config';

function body(over: Record<string, unknown> = {}) {
  return {
    name: 'Test Kupac',
    phone: '+387 61 111 222',
    email: '',
    place: 'Mostar',
    message: 'Automatski test — ne odgovarati.',
    acknowledge: true,
    product: 'table',
    configQuery: 'v=1&sh=rectangle&w=oak&l=1500&wd=700&t=35&h=750&e=straight&b=trapezoid_pair&f=natural&s=20261009',
    website: '',
    submissionId: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...over,
  };
}

test.describe('Upit — server i obrazac', () => {
  test('bez e-mail varijabli: obrazac se ne nudi, odmah WhatsApp; server vraća 503', async ({ page, request }) => {
    await page.goto('/konfigurator/stol');
    await waitForViewer(page);
    await goToStep(page, /Pregled/);
    await expect(page.getByTestId('whatsapp-cta')).toHaveAttribute('href', /wa\.me\/38762704560/);
    await expect(page.getByRole('link', { name: 'Pošaljite upit na WhatsApp', exact: true })).toHaveCount(1);
    await expect(page.getByTestId('quote-form')).toHaveCount(0);
    const res = await request.post('/api/upit', { data: body() });
    expect(res.status()).toBe(503);
    expect((await res.json()).error).toBe('not_configured');
  });

  test('server validacija: neispravan zahtjev daje grešku s poljima', async ({ request }) => {
    const res = await request.post(`${FORM_SERVER}/api/upit`, { data: body({ name: 'A', phone: '', email: 'nije-email' }) });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.fields.name).toBeTruthy();
    expect(json.fields.email).toBeTruthy();
    const bad = await request.post(`${FORM_SERVER}/api/upit`, { data: body({ configQuery: 'v=1&sh=hexagon' }) });
    expect(bad.status()).toBe(400);
    const huge = await request.post(`${FORM_SERVER}/api/upit`, { data: body({ message: 'x'.repeat(20000) }) });
    expect(huge.status()).toBe(413);
  });

  test('greška i timeout providera daju grešku, nikad uspjeh', async ({ request }) => {
    const err = await request.post(`${FORM_SERVER}/api/upit`, { data: body({ message: 'test [[simuliraj-gresku]]' }) });
    expect(err.status()).toBe(502);
    expect((await err.json()).ok).toBe(false);
    const timeout = await request.post(`${FORM_SERVER}/api/upit`, { data: body({ message: 'test [[simuliraj-timeout]]' }) });
    expect(timeout.status()).toBe(504);
    expect((await timeout.json()).ok).toBe(false);
  });

  test('pravi put obrasca preko test adaptera: pending, stvaran uspjeh, poruka sa serverski provjerenom konfiguracijom', async ({ page }) => {
    fs.rmSync(OUTBOX, { recursive: true, force: true });
    await page.goto(`${FORM_SERVER}/konfigurator/daska`);
    await waitForViewer(page);
    await goToStep(page, /Pregled/);
    const form = page.getByTestId('quote-form');
    await form.getByRole('button', { name: 'Pošaljite upit' }).click();
    await expect(page.getByTestId('form-error')).toContainText('Provjerite označena polja');
    await expect(form.getByLabel('Ime i prezime')).toHaveAttribute('aria-invalid', 'true');
    await form.getByLabel('Ime i prezime').fill('Test Kupac');
    await form.getByLabel('E-mail').fill('test@example.com');
    await form.getByLabel(/Razumijem da šaljem upit/).check();
    await form.getByRole('button', { name: 'Pošaljite upit' }).click();
    await expect(page.getByTestId('form-success')).toContainText('Upit je poslan radionici');
    const files = fs.readdirSync(OUTBOX);
    expect(files.length).toBe(1);
    const mail = JSON.parse(fs.readFileSync(path.join(OUTBOX, files[0]!), 'utf8'));
    expect(mail.text).toContain('Konfiguracija (provjerena na serveru)');
    expect(mail.text).toContain('Javor i bukva, uzdužne trake');
    expect(mail.replyTo).toBe('test@example.com');
  });

  test('greška servera zadržava upisane podatke', async ({ page }) => {
    await page.route('**/api/upit', (route) => route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'provider_error', message: 'Slanje trenutno nije uspjelo. Pokušajte ponovo ili pošaljite upit na WhatsApp.' }) }));
    await page.goto(`${FORM_SERVER}/kontakt`);
    const form = page.getByTestId('quote-form');
    await form.getByLabel('Ime i prezime').fill('Amra');
    await form.getByLabel('Telefon').fill('061 222 333');
    await form.getByLabel(/Kratka poruka/).fill('Zanima me okrugli stol.');
    await form.getByLabel(/Razumijem da šaljem upit/).check();
    await form.getByRole('button', { name: 'Pošaljite upit' }).click();
    await expect(page.getByTestId('form-error')).toContainText('Slanje trenutno nije uspjelo');
    await expect(form.getByLabel('Ime i prezime')).toHaveValue('Amra');
    await expect(form.getByLabel(/Kratka poruka/)).toHaveValue('Zanima me okrugli stol.');
    await expect(page.getByTestId('form-success')).toHaveCount(0);
  });
});
