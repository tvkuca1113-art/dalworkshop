import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`logo vraća na vrh: isti URL, podnožje i druga stranica (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#kontakt');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    const logo = (region: string) => page.locator(region).getByRole('link', { name: 'DAL Workshop — početna', exact: true });
    const atTop = async () => {
      await expect(page).toHaveURL('/#vrh');
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(2);
      await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
    };
    await logo('.site-header').click();
    await atTop();

    // Clicking the same hash again must work after scrolling back down.
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await logo('.site-footer').click();
    await atTop();

    if (width === 390) {
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Meni', exact: true }).click();
      const menu = page.getByRole('dialog', { name: 'Meni', exact: true });
      await menu.getByRole('link', { name: 'DAL Workshop — početna', exact: true }).click();
      await expect(menu).toBeHidden();
      await atTop();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await logo('.site-header').click();
      await atTop();
    }

    await page.goto('/stolovi');
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await logo('.site-footer').click();
    await atTop();
  });
}
