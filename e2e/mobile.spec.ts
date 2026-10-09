import { expect, test } from '@playwright/test';
import { goToStep, waitForViewer } from './helpers';

const PAGES = ['/', '/stolovi', '/daske', '/radovi', '/odrzavanje', '/kontakt', '/privatnost', '/konfigurator/stol', '/konfigurator/daska'];

test('bez horizontalnog prelijevanja (portret i pejzaž)', async ({ page }) => {
  for (const size of [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    for (const p of PAGES) {
      await page.goto(p);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${p} @ ${size.width}×${size.height}`).toBeLessThanOrEqual(0);
    }
  }
});

test('mobilni konfigurator: scena ~40 %, stranica se normalno skrola, rotacija tek na zahtjev', async ({ page }) => {
  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  const vh = page.viewportSize()!.height;
  const canvasBox = (await page.locator('[data-testid="viewer"] canvas').boundingBox())!;
  expect(canvasBox.height / vh).toBeGreaterThan(0.3);
  expect(canvasBox.height / vh).toBeLessThan(0.5);
  // touch-action that applies to the canvas (it and its ancestors inside the viewer)
  const touchActions = () =>
    page.evaluate(() => {
      const out: string[] = [];
      let el: HTMLElement | null = document.querySelector('[data-testid="viewer"] canvas');
      while (el && el.dataset.testid !== 'viewer') {
        out.push(getComputedStyle(el).touchAction);
        el = el.parentElement;
      }
      return out;
    });
  // vertical panning passes through until the user opts in
  expect(await touchActions()).toContain('pan-y');
  expect(await touchActions()).not.toContain('none');
  const rotate = page.getByRole('button', { name: 'Rotirajte model' });
  await expect(rotate).toBeVisible();
  await rotate.click();
  await expect(page.getByRole('button', { name: 'Završi rotaciju' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(touchActions).toContain('none');
  await page.getByRole('button', { name: 'Završi rotaciju' }).click();
  // page still scrolls
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
});

test('ljepljiva traka ne prekriva polja kad je tastatura otvorena', async ({ page }) => {
  await page.goto('/konfigurator/daska');
  await waitForViewer(page);
  await goToStep(page, /Drvo i dimenzije/);
  const bar = page.locator('[data-hidden]').filter({ hasText: 'Korak' });
  await expect(bar).toHaveAttribute('data-hidden', 'false');
  await page.getByTestId('dim-length').locator('input').focus();
  await expect(bar).toHaveAttribute('data-hidden', 'true');
  await page.getByTestId('dim-length').locator('input').blur();
  await expect(bar).toHaveAttribute('data-hidden', 'false');
});

test('prošireni 3D prikaz ima jasan izlaz (Escape)', async ({ page }) => {
  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  await page.getByRole('button', { name: 'Proširi prikaz' }).click();
  const viewer = page.getByTestId('viewer');
  const box = (await viewer.boundingBox())!;
  expect(box.height).toBeGreaterThan(page.viewportSize()!.height * 0.95);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Proširi prikaz' })).toBeFocused();
});

test('meni radi tastaturom i vraća fokus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Meni' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Meni' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
