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


test('fotografija pokriva prvi ekran; naslov i dugmad ostavljaju stol vidljivim', async ({ page }) => {
  for (const size of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 390, height: 938 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const photo = (await page.getByTestId('hero-photo').boundingBox())!;
    expect(photo.y).toBe(0);
    expect(photo.width).toBe(size.width);
    expect(photo.height).toBeGreaterThanOrEqual(size.height);
    const title = (await page.locator('#hero-title').boundingBox())!;
    expect(title.y + title.height).toBeLessThan(photo.height * .46);
    for (const el of [page.getByRole('link', { name: /^Kreirajte svoj stol/ }).first(), page.getByRole('link', { name: /^Pogledajte daske/ }).first()]) {
      const box = (await el.boundingBox())!;
      expect(box.y).toBeGreaterThan(photo.height * .78);
      expect(box.y + box.height).toBeLessThanOrEqual(photo.height);
    }
    await expect(page.locator('canvas')).toHaveCount(0);
  }
});

test('traka koraka se povlači pred podnožjem i vraća u konfiguratoru', async ({ page }) => {
  for (const product of ['stol', 'daska']) {
    await page.goto(`/konfigurator/${product}`);
    await waitForViewer(page);
    const bar = page.locator('[data-hidden]').filter({ hasText: 'Korak' });
    await expect(bar).toHaveAttribute('data-hidden', 'false');
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute('data-hidden', 'true');
    await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute('data-hidden', 'false');
  }
});

test('odabir trenutne stranice u meniju ga zatvara i vraća skrolanje', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Meni', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Meni', exact: true });
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await dialog.getByRole('link', { name: 'Početna', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('početna: listanje preko stola i rotacija na izričit zahtjev', async ({ page }) => {
  await page.goto('/');
  const stage = page.getByTestId('edge-stage');
  const experience = page.getByTestId('edge-experience');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-phase', 'ready', { timeout: 90_000 });
  const touchActions = () => page.evaluate(() => {
    const actions: string[] = [];
    let el: HTMLElement | null = document.querySelector('[data-testid="edge-stage"] canvas');
    while (el && el.dataset.testid !== 'edge-stage') {
      actions.push(getComputedStyle(el).touchAction);
      el = el.parentElement;
    }
    return actions;
  });
  expect(await touchActions()).toContain('pan-y');
  expect(await touchActions()).not.toContain('none');
  await experience.getByRole('button', { name: 'Rotirajte stol' }).click();
  await expect.poll(touchActions).toContain('none');
  await experience.getByRole('button', { name: 'Cijeli stol' }).click();
  await expect.poll(touchActions).not.toContain('none');
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(190, 420);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
});
