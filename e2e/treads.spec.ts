import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('gazišta: stvarne teksture, debljina, cijena i tačan WhatsApp upit', async ({ page }) => {
  await page.goto('/gazista?drvo=ash&debljina=60&komada=12');
  const preview = page.getByTestId('tread-preview');
  await expect(preview).toHaveAttribute('data-texture-ready', 'true');
  await expect(page.getByRole('radio', { name: 'Jasen', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: '6 cm', exact: true })).toBeChecked();
  await expect(page.getByTestId('tread-price')).toContainText('1920,00 KM');
  const hashes = new Set<string>();
  for (const wood of ['Hrast', 'Jasen', 'Javor']) {
    await page.getByRole('radio', { name: wood, exact: true }).check();
    await expect(preview).toHaveAttribute('data-texture-ready', 'true');
    const texture = await preview.locator('image').last().getAttribute('href');
    hashes.add(createHash('sha256').update(texture!).digest('hex'));
  }
  expect(hashes.size).toBe(3);
  const thick = await preview.screenshot();
  await page.getByRole('radio', { name: '4 cm', exact: true }).check();
  await expect(preview).toHaveAttribute('data-thickness', '40');
  expect(await preview.screenshot()).not.toEqual(thick);
  await page.getByRole('radio', { name: '8 cm', exact: true }).check();
  await page.getByLabel('03 / Broj gazišta').fill('10');
  await expect(page.getByTestId('tread-price')).toContainText('2100,00 KM');
  await page.getByText('Druge mjere ili poseban zahtjev?', { exact: true }).click();
  await page.getByLabel('Napomena za radionicu').fill('Druga širina 90 cm.');
  const href = (await page.getByRole('link', { name: /Pošaljite izbor na WhatsApp/ }).getAttribute('href'))!;
  const message = new URL(href).searchParams.get('text')!;
  expect(message).toContain('Javor'); expect(message).toContain('100 × 30 × 8 cm');
  expect(message).toContain('10 kom.'); expect(message).toContain('2100,00 KM');
  expect(message).toContain('Druga širina 90 cm.'); expect(message).toContain('drvo=maple');
  await page.getByRole('button', { name: 'Odozgo', exact: true }).click();
  await expect(preview).toHaveAttribute('aria-label', /odozgo/);
  await page.getByLabel('03 / Broj gazišta').fill('1.5');
  await expect(page.getByRole('alert').filter({ hasText: 'Upišite cijeli broj od 1 do 100.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pošaljite izbor na WhatsApp' })).toBeDisabled();
  await page.getByLabel('03 / Broj gazišta').fill('100');
  await expect(page.getByRole('button', { name: 'Povećajte količinu' })).toBeDisabled();
});

test('gazišta: početna, navigacija i mobilni prikaz bez prelijevanja', async ({ page }) => {
  for (const size of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const g = page.getByRole('link', { name: 'Pogledajte gazišta od masivnog drveta', exact: true });
    await expect(g).toHaveAttribute('href', '/gazista');
    if (size.width <= 960) {
      await page.getByRole('button', { name: 'Meni', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Meni', exact: true });
      await expect(dialog.getByRole('link', { name: 'Gazišta', exact: true })).toBeVisible();
      if (size.width === 390) {
        await expect.poll(() => dialog.locator('img').evaluateAll(imgs => imgs.every(img => (img as HTMLImageElement).complete))).toBe(true);
        await dialog.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(a => a.finished)));
        await page.screenshot({ path: '/workspace/scratch/3c2aefd5e217/treads-qa/menu-390.png' });
      }
      await dialog.getByRole('link', { name: 'Gazišta', exact: true }).click();
    } else { await page.locator('.site-header').getByRole('link', { name: 'Gazišta', exact: true }).click(); }
    await expect(page).toHaveURL('/gazista');
    const preview = page.getByTestId('tread-preview');
    await expect(preview).toHaveAttribute('data-texture-ready', 'true');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `gazišta ${size.width}×${size.height}`).toBe(0);
    await page.getByRole('radio', { name: 'Jasen', exact: true }).check();
    await expect(preview).toHaveAttribute('data-wood', 'ash');
    await expect(preview).toHaveAttribute('data-texture-ready', 'true');
    await page.getByRole('radio', { name: '6 cm', exact: true }).check();
    if (size.width === 390) {
      await page.getByTestId('tread-selector').scrollIntoViewIfNeeded();
      await page.screenshot({ path: '/workspace/scratch/3c2aefd5e217/treads-qa/choice-390.png' });
      await page.screenshot({ path: '/workspace/scratch/3c2aefd5e217/treads-qa/full-390.png', fullPage: true });
    }
  }
});

test('gazišta: nesiguran link se resetuje i prikaz radi bez WebGL-a', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof get>) {
      if (String(args[0]).includes('webgl')) return null;
      return get.apply(this, args);
    } as typeof get;
  });
  await page.goto('/gazista?drvo=walnut&debljina=50&komada=-2');
  await expect(page.getByRole('status')).toContainText('nevažeći izbor');
  await expect(page.getByRole('radio', { name: 'Hrast', exact: true })).toBeChecked();
  await expect(page.getByTestId('tread-price')).toContainText('110,00 KM');
  await expect(page.getByTestId('tread-preview')).toHaveAttribute('data-texture-ready', 'true');
  await page.getByRole('radio', { name: 'Javor', exact: true }).check();
  await expect(page.getByTestId('tread-preview')).toHaveAttribute('data-texture-ready', 'true');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('radio', { name: '8 cm', exact: true }).check();
  await page.getByTestId('tread-selector').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/workspace/scratch/3c2aefd5e217/treads-qa/choice-1440.png' });
});
