import { expect, test } from '@playwright/test';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

const DIR = path.join(__dirname, '..', 'docs', 'screenshots');

test('snimke provjere: početna, oba konfiguratora i pregled', async ({ page }, info) => {
  test.setTimeout(240_000); // several material loads and camera views on software WebGL
  const w = page.viewportSize()!.width;
  const tag = `${w}`;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(DIR, `pocetna-${tag}.png`) });
  // Match the selected design's content area for visual comparison (without device frames).
  const viewport = page.viewportSize()!;
  await page.setViewportSize(info.project.name.startsWith('mobile') ? { width: 390, height: 938 } : { width: 1172, height: 768 });
  await page.screenshot({ path: path.join(DIR, `pocetna-reference-${tag}.png`) });
  await page.setViewportSize(viewport);
  await page.getByTestId('edge-stage').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('edge-stage')).toHaveAttribute('data-phase', 'ready', { timeout: 90_000 });
  await page.locator('section[aria-labelledby="materijal"]').evaluate((el) => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - header - 24);
  });
  await page.locator('section[aria-labelledby="materijal"]').screenshot({ path: path.join(DIR, `detalji-cijeli-stol-${tag}.png`) });
  await page.getByTestId('edge-experience').getByRole('button', { name: 'Detalj ivice' }).click();
  await page.waitForTimeout(1500);
  await page.getByTestId('edge-stage').screenshot({ path: path.join(DIR, `detalji-ravna-${tag}.png`) });
  await page.getByTestId('edge-experience').getByRole('button', { name: 'Zaobljena ivica' }).click();
  await page.waitForTimeout(800);
  await page.getByTestId('edge-stage').screenshot({ path: path.join(DIR, `detalji-zaobljena-${tag}.png`) });
  await page.getByTestId('edge-experience').getByRole('button', { name: 'Cijeli stol' }).click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(DIR, `pocetna-cijela-${tag}.jpg`), fullPage: true, quality: 85 });
  if (info.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Meni', exact: true }).click();
    await page.screenshot({ path: path.join(DIR, `meni-${tag}.png`) });
    await page.keyboard.press('Escape');
  }

  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  if (info.project.name.startsWith('mobile')) await page.getByRole('button', { name: 'Rotirajte model' }).waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(DIR, `konfigurator-stol-${tag}.png`) });
  if (info.project.name.startsWith('mobile')) {
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(DIR, `podnozje-konfigurator-${tag}.png`) });
  }
  await page.goto('/konfigurator/stol?v=1&sh=natural_edge&w=walnut&l=2200&wd=950&t=45&h=760&e=rounded&b=x_frame_pair&f=natural&s=424242');
  await waitForViewer(page);
  await page.getByRole('button', { name: 'Prikaži dimenzije' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(DIR, `konfigurator-stol-orah-${tag}.png`) });
  await page.getByRole('button', { name: 'Detalj ivice' }).click();
  await page.waitForTimeout(1000);
  await page.getByTestId('viewer').screenshot({ path: path.join(DIR, `stol-detalj-ivice-${tag}.png`) });
  await goToStep(page, /Pregled/);
  await page.screenshot({ path: path.join(DIR, `pregled-stol-${tag}.png`), fullPage: info.project.name.startsWith('mobile') });

  await page.goto('/konfigurator/daska?v=1&m=dal-handled-board&p=serving&c=oak&l=480&wd=250&t=25&e=eased&g=none&hd=metal_pair&f=workshop&s=1305');
  await waitForViewer(page);
  await page.screenshot({ path: path.join(DIR, `konfigurator-daska-${tag}.png`) });
  await page.goto('/konfigurator/daska');
  await waitForViewer(page);
  await goToStep(page, /Personalizacija/);
  await page.getByTestId('engrave-toggle').check();
  await page.getByTestId('engrave-text').fill('Čaršija • Džemal');
  await page.getByLabel(/^Sredina \(gore\)/).check();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Odozgo' }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(DIR, `daska-gravura-${tag}.png`) });
  await goToStep(page, /Pregled/);
  await page.screenshot({ path: path.join(DIR, `pregled-daska-${tag}.png`), fullPage: info.project.name.startsWith('mobile') });
});
