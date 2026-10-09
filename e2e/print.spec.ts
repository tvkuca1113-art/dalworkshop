import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

test('ispis / PDF sadrži render, mjere i č ć ž š đ', async ({ page }) => {
  await page.goto('/konfigurator/daska?v=1&m=dal-maple-beech-board&p=cutting&c=maple_beech_strips&l=450&wd=280&t=40&e=eased&g=end_slots&hd=none&f=oil_wax&s=1305');
  await waitForViewer(page);
  await goToStep(page, /Personalizacija/);
  await page.getByTestId('engrave-toggle').check();
  await page.getByTestId('engrave-text').fill('Čaršija • Džemal');
  await expect(page.getByTestId('engrave-status')).toHaveAttribute('data-status', 'ok');
  await goToStep(page, /Pregled/);
  await page.getByLabel(/Poseban zahtjev/).fill('Ćirilični natpis nije potreban; dostava u Đulić.');
  await page.evaluate(() => {
    window.print = () => {
      (window as unknown as { __printed: boolean }).__printed = true;
    };
  });
  await page.getByTestId('print').click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __printed?: boolean }).__printed)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  const sheet = page.getByTestId('print-sheet');
  await expect(sheet).toBeVisible();
  await expect(page.locator('[data-testid="viewer"] canvas')).toBeHidden();
  const img = sheet.locator('img[data-print-snapshot]');
  await expect(img).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
  const natural = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
  expect(natural).toBeGreaterThan(100);
  const text = await sheet.innerText();
  for (const part of ['Dužina', '45 cm', 'Širina', '28 cm', 'Debljina', '4 cm', '„Čaršija • Džemal“', 'Ćirilični', 'Đulić', 'Završna obrada']) {
    expect(text).toContain(part);
  }
  for (const ch of ['č', 'ć', 'ž', 'š', 'đ']) expect(text.toLowerCase()).toContain(ch);
  const dir = path.join(__dirname, '..', 'docs', 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  await page.pdf({ path: path.join(dir, 'ispis-daska.pdf'), format: 'A4', printBackground: true });
  expect(fs.statSync(path.join(dir, 'ispis-daska.pdf')).size).toBeGreaterThan(20_000);
});
