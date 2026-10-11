import { expect, test } from '@playwright/test';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

test('neodlučeni izbor i fotografije ostaju kroz korake i ulaze u upit', async ({ page }) => {
  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  await page.locator('#oblik-unsure').check();
  await goToStep(page, /Drvo i dimenzije/);
  await page.locator('#drvo-unsure').check();
  await page.getByTestId('dim-length').getByRole('checkbox', { name: /Nisam siguran/ }).check();
  await page.getByTestId('dim-length').getByRole('textbox').focus();
  await page.getByTestId('dim-length').getByRole('textbox').blur();
  await expect(page.getByTestId('dim-length').getByRole('checkbox')).toBeChecked();
  await goToStep(page, /Ivica i postolje/);
  await page.getByLabel(/^Četiri drvene noge/).check();
  await page.locator('#postolje-unsure').check();
  const upload = page.locator('input[type="file"]');
  await upload.setInputFiles(path.join(__dirname, '../public/originals/stol-hrast.jpg'));
  await expect(page.getByRole('button', { name: 'Ukloni fotografiju stol-hrast.jpg' })).toBeVisible();
  await goToStep(page, /Pregled/);
  await expect(page.getByRole('button', { name: 'Ukloni fotografiju stol-hrast.jpg' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Podijelite upit s fotografijama (1)' })).toBeVisible();
  await expect(page.locator('[data-testid="spec"] [data-key="wood"] dd').first()).toContainText('Nisam siguran');
  const href = await page.getByTestId('whatsapp-cta').getAttribute('href');
  const message = new URL(href!).searchParams.get('text')!;
  expect(message).toContain('Postolje: Nisam siguran');
  expect(message).toContain('Noge / postolje: stol-hrast.jpg');
  await expect(page.getByTestId('print-sheet').locator('figure img')).toHaveCount(1);
  await page.getByTestId('copy-link').click();
  // The address reflects advice choices, but no file names or image data.
  await expect(page).toHaveURL(/u=/);
  expect(page.url()).not.toContain('stol-hrast');
  await goToStep(page, /Drvo i dimenzije/);
  await page.getByLabel(/^Orah/).check();
  await expect(page.locator('#drvo-unsure')).not.toBeChecked();
  await expect(page.getByTestId('dim-length').getByRole('checkbox')).toBeChecked();
});

test('neispravna fotografija prikazuje grešku; uklanjanje ne briše izbor stola', async ({ page }) => {
  await page.goto('/konfigurator/stol');
  await goToStep(page, /Ivica i postolje/);
  await page.locator('input[type="file"]').setInputFiles({ name: 'nije-fotografija.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('alert').filter({ hasText: 'fotografiju nije moguće otvoriti' })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, '../public/originals/stol-hrast.jpg'));
  await page.getByRole('button', { name: 'Ukloni fotografiju stol-hrast.jpg' }).click();
  await expect(page.getByRole('img', { name: 'Vaša inspiracija: stol-hrast.jpg' })).toHaveCount(0);
  await expect(page.getByLabel(/^Crni trapezni okviri/)).toBeChecked();
});

test('kontakt je na početnoj i priprema poruku iz kupčeve ideje', async ({ page }) => {
  await page.goto('/');
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Dobar komad počinje razgovorom.' })).toBeVisible();
  await page.getByLabel('Zanima me', { exact: true }).selectOption('Gazišta');
  await page.getByLabel('Vaša ideja ili pitanje').fill('Treba mi 12 hrastovih gazišta.');
  const href = await page.getByRole('link', { name: 'Razgovarajmo na WhatsAppu' }).getAttribute('href');
  const message = new URL(href!).searchParams.get('text')!;
  expect(message).toContain('Gazišta');
  expect(message).toContain('Treba mi 12 hrastovih gazišta.');
});
