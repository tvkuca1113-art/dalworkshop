import { expect, test } from '@playwright/test';
import { waitForViewer } from './helpers';

test('3D pregled u dijalogu se zatvara Escape tipkom i vraća fokus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByTestId('hero-3d');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '3D prikaz hrastovog stola' });
  await expect(dialog).toBeVisible();
  await waitForViewer(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('viewer')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('navigacija s početne prikazuje vrh stranice proizvoda', async ({ page }) => {
  await page.goto('/');
  await page.locator('#izbor').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-header')).toBeInViewport();
  await expect(page.locator('.site-header')).toHaveAttribute('data-scrolled', 'true');
  await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('link', { name: 'Stolovi', exact: true }).click();
  await expect(page).toHaveURL(/\/stolovi$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  await expect(page.locator('.site-header')).toHaveAttribute('data-home', 'false');
  await expect(page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('link', { name: 'Stolovi', exact: true })).toHaveAttribute('aria-current', 'page');
});
