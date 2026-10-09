import { expect, test } from '@playwright/test';

test('početna prikazuje fotografiju bez 3D modula', async ({ page }) => {
  const viewerRequests: string[] = [];
  page.on('request', (r) => { if (/ProductCanvas|ViewerShell/.test(r.url())) viewerRequests.push(r.url()); });
  await page.goto('/');
  await expect(page.getByTestId('hero-photo')).toBeVisible();
  await expect(page.getByTestId('viewer')).toHaveCount(0);
  await expect(page.getByTestId('hero-3d')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(viewerRequests).toEqual([]);
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
