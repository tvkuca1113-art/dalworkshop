import { expect, test } from '@playwright/test';
import { diffRatio, waitForViewer } from './helpers';
test('prvi ekran je fotografija; 3D detalji učitavaju se kasnije', async ({ page }) => {
  const viewerRequests: string[] = [];
  page.on('request', (r) => { if (/ProductCanvas|ViewerShell/.test(r.url())) viewerRequests.push(r.url()); });
  await page.goto('/');
  await expect(page.getByTestId('hero-photo')).toBeVisible();
  await expect(page.getByTestId('viewer')).toHaveCount(0);
  await expect(page.getByTestId('hero-3d')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(viewerRequests).toEqual([]);
});

test('druga fotografija otvara kompaktan okrugli stol, a hero pravougaoni', async ({ page }) => {
  await page.goto('/');
  const round = page.getByRole('link', { name: 'Okrugli stol po vašoj mjeri — otvori konfigurator' });
  await expect(round.locator('img')).toHaveAttribute('src', /dal-stol-round/);
  await round.click();
  await waitForViewer(page);
  await expect(page).toHaveURL(/sh=circle/);
  await expect(page).toHaveURL(/d=1000/);
  await expect(page.locator('[data-key="shape"] dd').first()).toContainText('Okrugli');
  await expect(page.locator('[data-key="base"] dd').first()).toContainText('Centralno postolje');
});

test('detalj mijenja stvarnu 3D geometriju, zadnju stranu i prenosi izbor', async ({ page }) => {
  await page.goto('/');
  const stage = page.getByTestId('edge-stage');
  const experience = page.getByTestId('edge-experience');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-phase', 'ready', { timeout: 90_000 });
  await experience.getByRole('button', { name: 'Detalj ivice' }).click();
  await page.waitForTimeout(1500);
  const before = await stage.locator('canvas').screenshot();
  await experience.getByRole('button', { name: 'Zaobljena ivica' }).click();
  await expect.poll(() => page.evaluate(() => {
    const i = (window as unknown as { __dalViewer: { info(): { geometryKey: string } } }).__dalViewer.info();
    return JSON.parse(i.geometryKey).edgeId;
  })).toBe('rounded');
  await page.waitForTimeout(800);
  expect(await diffRatio(page, before, await stage.locator('canvas').screenshot())).toBeGreaterThan(.005);
  await experience.getByRole('button', { name: 'Druga strana' }).click();
  await expect.poll(() => page.evaluate(() => {
    const c = (window as unknown as { __dalViewer: { info(): { camera: { position: number[]; target: number[] } } } }).__dalViewer.info().camera;
    return c.position[2]! - c.target[2]!;
  }), { timeout: 15_000 }).toBeLessThan(0);
  await experience.getByRole('button', { name: 'Orah', exact: true }).click();
  await experience.getByRole('link', { name: 'Nastavite s ovim izborom' }).click();
  await waitForViewer(page);
  await expect(page.locator('[data-key="wood"] dd').first()).toContainText('Orah');
  await expect(page.locator('[data-key="edge"] dd').first()).toContainText('Zaobljena ivica');
});

test('cijeli stol i promjena ivice rade i bez WebGL-a', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (/^(webgl2?|experimental-webgl)$/.test(type)) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  const stage = page.getByTestId('edge-stage');
  const experience = page.getByTestId('edge-experience');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-phase', 'fallback');
  await experience.getByRole('button', { name: 'Detalj ivice' }).click();
  const before = await stage.screenshot();
  await experience.getByRole('button', { name: 'Zaobljena ivica' }).click();
  await expect(stage).toHaveAttribute('data-edge', 'rounded');
  expect(await diffRatio(page, before, await stage.screenshot())).toBeGreaterThan(.001);
  await experience.getByRole('button', { name: 'Druga strana' }).click();
  await expect(stage.locator('svg')).toBeVisible();
  expect(errors).toEqual([]);
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
