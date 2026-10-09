import { test } from '@playwright/test';
import path from 'node:path';
import { goToStep, waitForViewer } from './helpers';

const DIR = path.join(__dirname, '..', 'docs', 'screenshots');

test('snimke provjere: početna, oba konfiguratora i pregled', async ({ page }, info) => {
  const w = page.viewportSize()!.width;
  const tag = `${w}`;
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(DIR, `pocetna-${tag}.png`) });
  await page.getByTestId('hero-3d').click();
  await waitForViewer(page);
  await page.getByTestId('viewer').screenshot({ path: path.join(DIR, `pocetna-3d-${tag}.png`) });

  await page.goto('/konfigurator/stol');
  await waitForViewer(page);
  await page.screenshot({ path: path.join(DIR, `konfigurator-stol-${tag}.png`) });
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
