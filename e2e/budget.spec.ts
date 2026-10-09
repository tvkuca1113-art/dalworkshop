import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { waitForViewer } from './helpers';

type Info = { triangles: number; drawCalls: number };

const CASES = [
  ['stol polazni', '/konfigurator/stol'],
  ['stol prirodna ivica X', '/konfigurator/stol?v=1&sh=natural_edge&w=walnut&l=2800&wd=1100&t=50&h=780&e=rounded&b=x_frame_pair&f=natural&s=99'],
  ['stol okrugli', '/konfigurator/stol?v=1&sh=circle&w=ash&d=1500&t=40&h=750&e=rounded&b=central_pedestal&f=natural&s=1'],
  ['daska utori', '/konfigurator/daska'],
  ['daska obodni kanal', '/konfigurator/daska?v=1&m=dal-maple-beech-board&p=cutting&c=maple_beech_strips&l=800&wd=400&t=40&e=rounded&g=perimeter_channel&hd=none&f=workshop&s=1305'],
  ['daska ručke', '/konfigurator/daska?v=1&m=dal-handled-board&p=serving&c=oak&l=480&wd=250&t=25&e=eased&g=none&hd=metal_pair&f=workshop&s=1305'],
] as const;

test('vizuelni budžet: trokuti i draw callovi po sceni', async ({ page }) => {
  const rows: (Info & { name: string })[] = [];
  for (const [name, url] of CASES) {
    await page.goto(url);
    await waitForViewer(page);
    const info = await page.evaluate(() => (window as unknown as { __dalViewer: { info(): Info } }).__dalViewer.info());
    rows.push({ name, triangles: info.triangles, drawCalls: info.drawCalls });
    expect(info.triangles).toBeLessThan(100_000);
    expect(info.drawCalls).toBeLessThan(100);
  }
  fs.mkdirSync(path.join(__dirname, '..', 'test-results'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'test-results', 'budget.json'), JSON.stringify(rows, null, 2));
});

test('100 promjena dimenzija ne gomila geometrije ni teksture', async ({ page }) => {
  test.setTimeout(600_000);
  type Mem = { memory: { geometries: number; textures: number } };
  const mem = () => page.evaluate(() => (window as unknown as { __dalViewer: { info(): Mem } }).__dalViewer.info().memory);
  for (const [url, testId, stepLabel] of [
    ['/konfigurator/stol', 'dim-length', 'Dužina'],
    ['/konfigurator/daska', 'dim-width', 'Širina'],
  ] as const) {
    await page.goto(url);
    await waitForViewer(page);
    await page.getByRole('navigation', { name: 'Koraci konfiguracije' }).getByRole('button', { name: /Drvo i dimenzije/ }).click();
    const plus = page.getByTestId(testId).getByRole('button', { name: new RegExp(`${stepLabel}: povećaj`) });
    const minus = page.getByTestId(testId).getByRole('button', { name: new RegExp(`${stepLabel}: smanji`) });
    // warm-up change so lazily created resources exist before the baseline
    await plus.click();
    await minus.click();
    await page.waitForTimeout(2500);
    const before = await mem();
    for (let i = 0; i < 50; i++) {
      await plus.click();
      await minus.click();
    }
    await page.waitForTimeout(3000);
    await page.mouse.move(10, 10);
    const after = await mem();
    expect(after.geometries, `${url} geometries ${before.geometries} → ${after.geometries}`).toBeLessThanOrEqual(before.geometries + 2);
    expect(after.textures, `${url} textures ${before.textures} → ${after.textures}`).toBeLessThanOrEqual(before.textures + 2);
  }
});
