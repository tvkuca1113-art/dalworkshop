import { expect, test } from '@playwright/test';
import { waitForViewer } from './helpers';

const PAGES = ['/', '/stolovi', '/daske', '/radovi', '/odrzavanje', '/kontakt', '/privatnost'];

/** Known third-party deprecation warnings (library internals, not app errors). */
const KNOWN_WARNINGS = [/THREE\.Clock: This module has been deprecated/, /BVH: "maxLeafSize" option has been deprecated/];

test('bez runtime/hydration grešaka, 404 asseta i WebGL grešaka', async ({ page }) => {
  const problems: string[] = [];
  const warnings: string[] = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console.error: ${m.text()}`);
    if (m.type() === 'warning' && !KNOWN_WARNINGS.some((r) => r.test(m.text()))) warnings.push(m.text());
  });
  page.on('response', (r) => {
    const url = r.url();
    if (r.status() >= 400) problems.push(`${r.status()} ${url}`);
  });
  for (const p of PAGES) {
    await page.goto(p, { waitUntil: 'networkidle' });
  }
  for (const p of ['/konfigurator/stol', '/konfigurator/daska']) {
    await page.goto(p);
    await waitForViewer(page);
  }
  await page.goto('/');
  await expect(page.getByTestId('viewer')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(problems).toEqual([]);
  expect(warnings.filter((w) => /hydrat|WebGL|GL_INVALID/i.test(w))).toEqual([]);
});

test('nepostojeća stranica vraća 404 s korisnom porukom', async ({ page }) => {
  const res = await page.goto('/nepostojeca-stranica');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ova stranica ne postoji.');
});

test('SEO osnove: jedan H1, meta opis, noindex u demo načinu, JSON-LD samo s potvrđenim podacima', async ({ page }) => {
  for (const p of ['/', '/stolovi', '/daske', '/radovi', '/odrzavanje', '/kontakt', '/privatnost', '/konfigurator/stol', '/konfigurator/daska']) {
    await page.goto(p);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  await page.goto('/');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(ld.name).toBe('DAL Workshop');
  expect(ld.address).toBeUndefined();
  expect(ld.aggregateRating).toBeUndefined();
  expect(ld.openingHours).toBeUndefined();
  const robots = await (await page.request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /');
});
