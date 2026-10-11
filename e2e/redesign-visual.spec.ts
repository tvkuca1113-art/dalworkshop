import { expect, test } from '@playwright/test';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

const DIR = path.join(__dirname, '..', 'docs', 'screenshots');

test('novi dizajn: drvo, kontakt, postolja i fotografije', async ({ page }) => {
  await page.goto('/');
  await page.locator('[aria-labelledby="karakter-drveta"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(DIR, 'redesign-materijal-1440.png') });
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(DIR, 'redesign-kontakt-1440.png') });
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(DIR, 'redesign-pocetna-dno-1440.png') });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: path.join(DIR, 'redesign-pocetna-cijela-1440.jpg'), fullPage: true, quality: 85 });
  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  await page.screenshot({ path: path.join(DIR, 'redesign-oblici-1440.png') });
  await goToStep(page, /Ivica i postolje/);
  await page.getByLabel(/^Četiri drvene noge/).check();
  await waitForViewer(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(DIR, 'redesign-drvene-noge-1440.png') });
  await page.getByTestId('viewer').screenshot({ path: path.join(DIR, 'redesign-model-drvene-noge.png') });
  await page.getByLabel(/^A metalni nosači/).check();
  await page.getByTestId('viewer').screenshot({ path: path.join(DIR, 'redesign-model-a-noge.png') });
  await page.getByLabel(/^Puni drveni nosači/).check();
  await page.getByTestId('viewer').screenshot({ path: path.join(DIR, 'redesign-model-panel-noge.png') });
  await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, '../public/originals/stol-hrast.jpg'));
  await expect(page.getByRole('button', { name: 'Ukloni fotografiju stol-hrast.jpg' })).toBeVisible();
  await goToStep(page, /Pregled/);
  await page.screenshot({ path: path.join(DIR, 'redesign-upit-fotografija-1440.png'), fullPage: true });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(DIR, 'redesign-upit-fotografija.pdf'), printBackground: true });
});

test('prostorni prikaz i nacrt na uređaju bez 3D podrške', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl2' || type === 'webgl') return null;
      return (original as (...args: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
  await page.goto('/konfigurator/stol');
  await expect(page.getByTestId('spatial-table')).toBeVisible();
  await page.screenshot({ path: path.join(DIR, 'redesign-prostorni-prikaz-1440.png') });
  await page.getByRole('button', { name: 'Nacrt s mjerama' }).click();
  await page.screenshot({ path: path.join(DIR, 'redesign-nacrt-1440.png') });
});
