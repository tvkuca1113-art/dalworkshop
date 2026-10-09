import { expect, test, type Page } from '@playwright/test';
import { canvasShot, diffRatio, goToStep, setDimension, specRow, waitForViewer } from './helpers';

type Info = {
  camera: { position: number[] };
  engraving: null | { worldY: number; surfaceY: number; insideBoard: boolean; corners: number[][] };
};
const info = (page: Page) => page.evaluate(() => (window as unknown as { __dalViewer: { info(): Info } }).__dalViewer.info());

test.describe('Konfigurator daske', () => {
  test('početna → daska → dimenzije i detalji → „Čaršija • Džemal“ → rotacija → gravura ostaje na površini → pregled', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Kreirajte svoju dasku' }).first().click();
    await expect(page).toHaveURL(/\/konfigurator\/daska/);
    await waitForViewer(page);
    const before = await canvasShot(page);

    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-length', '52');
    await setDimension(page, 'dim-width', '30');
    await goToStep(page, /Detalji/);
    await page.getByLabel(/^Obodni kanal/).check();
    await page.getByLabel(/^Zaobljena ivica/).check();
    await page.waitForTimeout(1500);

    await goToStep(page, /Personalizacija/);
    await page.getByTestId('engrave-toggle').check();
    await page.getByTestId('engrave-text').fill('Čaršija • Džemal');
    await page.getByLabel(/^Sredina \(gore\)/).check();
    await expect(page.getByTestId('engrave-status')).toHaveAttribute('data-status', 'ok');
    await expect(page.getByTestId('engrave-text')).toHaveValue('Čaršija • Džemal');
    await page.waitForTimeout(800);

    const e1 = (await info(page)).engraving!;
    expect(e1, 'engraving mesh exists in the scene').not.toBeNull();
    expect(e1.insideBoard).toBe(true);
    expect(Math.abs(e1.worldY - e1.surfaceY)).toBeLessThan(0.0006);
    const withText = await canvasShot(page);

    // rotate the model with the mouse (orbit) — the engraving stays fixed to the board surface
    const canvas = page.locator('[data-testid="viewer"] canvas');
    const box = (await canvas.boundingBox())!;
    const cam1 = (await info(page)).camera.position;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2 + 40, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    const after = await info(page);
    expect(after.camera.position).not.toEqual(cam1);
    expect(after.engraving!.corners).toEqual(e1.corners);
    expect(Math.abs(after.engraving!.worldY - after.engraving!.surfaceY)).toBeLessThan(0.0006);
    const rotated = await canvasShot(page);
    expect(await diffRatio(page, withText, rotated)).toBeGreaterThan(0.03);
    expect(await diffRatio(page, before, withText)).toBeGreaterThan(0.03);

    await goToStep(page, /Pregled/);
    await expect(specRow(page, 'length')).toContainText('52 cm');
    await expect(specRow(page, 'groove')).toContainText('Obodni kanal');
    await expect(specRow(page, 'personalization')).toContainText('„Čaršija • Džemal“');
    const href = await page.getByTestId('whatsapp-cta').getAttribute('href');
    expect(decodeURIComponent(href!.split('?text=')[1]!)).toContain('„Čaršija • Džemal“');
  });

  test('prevelik natpis: jasan izbor umjesto tihog brisanja', async ({ page }) => {
    await page.goto('/konfigurator/daska');
    await waitForViewer(page);
    await goToStep(page, /Personalizacija/);
    await page.getByTestId('engrave-toggle').check();
    await page.getByTestId('engrave-text').fill('Porodica Hadžihafizbegović');
    await page.getByTestId('engrave-size').fill('30');
    await expect(page.getByTestId('engrave-status')).toHaveAttribute('data-status', 'too_large');
    await goToStep(page, /Pregled/);
    await expect(page.getByTestId('blocking-issue')).toBeVisible();
    await expect(page.getByRole('button', { name: /Pošaljite upit na WhatsApp/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Riješi personalizaciju' }).click();
    await page.getByRole('button', { name: /Smanji slova na/ }).click();
    await expect(page.getByTestId('engrave-status')).toHaveAttribute('data-status', 'ok');
    await expect(page.getByTestId('engrave-text')).toHaveValue('Porodica Hadžihafizbegović');
  });

  test('ručke i utori: konflikt se objašnjava i može poništiti', async ({ page }) => {
    await page.goto('/konfigurator/daska');
    await waitForViewer(page);
    await goToStep(page, /Detalji/);
    await page.getByLabel(/^Crne metalne ručke/).check();
    await expect(page.getByTestId('notices')).toContainText('Utori uz krajeve su uklonjeni');
    await expect(page.getByLabel(/^Bez utora/)).toBeChecked();
    await page.getByTestId('notices').getByRole('button', { name: 'Poništi' }).click();
    await expect(page.getByLabel(/^Utori uz krajeve/)).toBeChecked();
    await expect(page.getByLabel(/^Bez ručki/)).toBeChecked();
  });

  test('daska s drškom prikazuje korisnu plohu', async ({ page }) => {
    await page.goto('/konfigurator/daska');
    await waitForViewer(page);
    await page.getByLabel(/^Daska s drvenom drškom/).check();
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('usable-surface')).toContainText('Korisna ploha: 39 × 20 cm');
    await expect(page.getByText('Ukupna dužina (uključuje dršku)')).toBeVisible();
  });
});
