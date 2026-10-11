import { expect, test } from '@playwright/test';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

test('novi izbor i kontakt su pregledni na mobitelu', async ({ page }) => {
  const dir = path.join(__dirname, '../docs/screenshots');
  await page.goto('/');
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(dir, 'redesign-kontakt-390.png') });
  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  await page.screenshot({ path: path.join(dir, 'redesign-oblici-390.png') });
  await goToStep(page, /Ivica i postolje/);
  await page.getByLabel(/^Četiri drvene noge/).check();
  await page.getByTestId('viewer').screenshot({ path: path.join(dir, 'redesign-drvene-noge-390.png') });
  await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, '../public/originals/stol-hrast.jpg'));
  await expect(page.getByRole('button', { name: 'Ukloni fotografiju stol-hrast.jpg' })).toBeVisible();
  await page.screenshot({ path: path.join(dir, 'redesign-inspiracija-390.png') });
  await goToStep(page, /Pregled/);
  await expect(page.getByRole('button', { name: 'Podijelite upit s fotografijama (1)' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('fotografije modela dasaka su cijele i dovoljno velike na mobitelu', async ({ page }) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/konfigurator/daska');
    const models = page.getByRole('group', { name: 'Polazni model', exact: true });
    const photos = models.locator('label > img');
    await expect(photos).toHaveCount(3);
    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const bounds = await photo.boundingBox();
      expect(bounds!.width).toBeGreaterThan(width * .65);
      expect(bounds!.height).toBeGreaterThanOrEqual(140);
      await expect(photo).toHaveCSS('object-fit', 'contain');
    }
    await page.getByRole('radio', { name: /^Daska s crnim ručkama/ }).check();
    await expect(page.getByRole('radio', { name: /^Daska s crnim ručkama/ })).toBeChecked();
    if (width === 390) {
      await page.getByRole('radio', { name: /^Daska s crnim ručkama/ }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(__dirname, '../docs/screenshots/daska-modeli-ispravka-390.png') });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});
