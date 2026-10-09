import { expect, test } from '@playwright/test';
import { goToStep, setDimension, specRow, waitForViewer } from './helpers';

test.describe('Oporavak i rubni slučajevi', () => {
  test('WebGL ne može startati → promjenjiv 2D prikaz istog izbora', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      // simulate a device without WebGL
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') return null;
        return (orig as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof orig;
    });
    await page.goto('/konfigurator/stol');
    await expect(page.getByTestId('viewer')).toHaveAttribute('data-phase', 'unsupported');
    const plan = page.getByTestId('viewer-fallback').getByTestId('plan2d');
    await expect(plan).toHaveAttribute('data-shape', 'rectangle');
    await expect(page.getByRole('alert').filter({ hasText: '2D nacrt' })).toBeVisible();
    await page.getByLabel(/^Okrugli/).check();
    await expect(plan).toHaveAttribute('data-shape', 'circle');
    await expect(plan).toHaveAttribute('data-base', 'central_pedestal');
    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-diameter', '130');
    await expect(plan).toHaveAttribute('aria-label', /promjer 130 cm/);
    await goToStep(page, /Pregled/);
    await expect(specRow(page, 'diameter')).toContainText('130 cm');
  });

  test('izgubljen WebGL kontekst → 2D prikaz → oporavak bez gubitka izbora i teksta', async ({ page }) => {
    await page.goto('/konfigurator/daska');
    await waitForViewer(page);
    await goToStep(page, /Personalizacija/);
    await page.getByTestId('engrave-toggle').check();
    await page.getByTestId('engrave-text').fill('Đurđa & Ćamil');
    await expect(page.getByTestId('engrave-status')).toHaveAttribute('data-status', 'ok');
    await page.evaluate(() => (window as unknown as { __dalViewer: { loseContext(): void } }).__dalViewer.loseContext());
    await expect(page.getByTestId('viewer')).toHaveAttribute('data-phase', 'lost');
    await expect(page.getByTestId('viewer-fallback').getByTestId('plan2d-engraving')).toContainText('Đurđa & Ćamil');
    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-length', '60');
    await expect(page.getByTestId('viewer-fallback').getByTestId('plan2d')).toHaveAttribute('aria-label', /60 × 28 cm/);
    await page.getByRole('button', { name: 'Pokušajte ponovo' }).click();
    await waitForViewer(page);
    await goToStep(page, /Personalizacija/);
    await expect(page.getByTestId('engrave-text')).toHaveValue('Đurđa & Ćamil');
    await goToStep(page, /Pregled/);
    await expect(specRow(page, 'length')).toContainText('60 cm');
  });

  test('osvježavanje i nazad/naprijed vraćaju isti izbor', async ({ page }) => {
    await page.goto('/konfigurator/stol');
    await waitForViewer(page);
    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-length', '240');
    await expect(page).toHaveURL(/l=2400/);
    await page.reload();
    await waitForViewer(page);
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('dim-length').locator('input')).toHaveValue('240');
    await page.getByRole('navigation', { name: 'Glavna navigacija' }).getByRole('link', { name: 'Kontakt' }).click();
    await expect(page).toHaveURL(/\/kontakt/);
    await page.goBack();
    await expect(page).toHaveURL(/l=2400/);
    await waitForViewer(page);
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('dim-length').locator('input')).toHaveValue('240');
    await page.goForward();
    await expect(page).toHaveURL(/\/kontakt/);
  });

  test('loš link i nepoznata verzija: razumljiva poruka i valjana početna konfiguracija', async ({ page }) => {
    await page.goto('/konfigurator/stol?v=1&sh=rectangle&w=teak&l=1500&wd=700&t=35&h=750&e=straight&b=trapezoid_pair&f=natural&s=1');
    await expect(page.getByRole('alert').filter({ hasText: 'neispravne vrijednosti' })).toBeVisible();
    await waitForViewer(page);
    await expect(page.locator('[data-testid="spec"] [data-key="wood"] dd')).toContainText('Hrast');
    await page.goto('/konfigurator/daska?v=9&m=dal-maple-beech-board');
    await expect(page.getByRole('alert').filter({ hasText: 'drugu verziju konfiguratora' })).toBeVisible();
    await page.goto('/konfigurator/stol?v=1&l=1500&script=alert(1)');
    await expect(page.getByRole('alert').filter({ hasText: 'nepoznate podatke' })).toBeVisible();
  });

  test('clipboard nedostupan → polje za ručno kopiranje', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    });
    await page.goto('/konfigurator/stol');
    await goToStep(page, /Pregled/);
    await page.getByTestId('copy-link').click();
    const field = page.getByTestId('manual-link');
    await expect(field).toBeVisible();
    await expect(field).toHaveValue(/\/konfigurator\/stol\?v=1/);
  });

  test('blokiran localStorage ne ruši aplikaciju', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('blocked', 'SecurityError');
        },
      });
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/konfigurator/daska');
    await waitForViewer(page);
    await goToStep(page, /Pregled/);
    await page.getByTestId('save-config').click();
    await expect(page.getByText(/ne dozvoljava spremanje/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('sačuvan izbor se nudi tek na izričit klik', async ({ page }) => {
    await page.goto('/konfigurator/stol?v=1&sh=oval&w=walnut&l=2000&wd=1000&t=40&h=750&e=rounded&b=trapezoid_pair&f=natural&s=1');
    await waitForViewer(page);
    await goToStep(page, /Pregled/);
    await page.getByTestId('save-config').click();
    await expect(page.getByText(/Izbor je sačuvan na ovom uređaju/)).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('dal:izbor:stol'));
    expect(stored).toContain('"shapeId":"oval"');
    expect(stored).not.toMatch(/email|telefon|phone/i);
    await page.goto('/konfigurator/stol');
    await page.getByRole('button', { name: 'Otvori sačuvani izbor' }).click();
    await expect(page.locator('[data-testid="spec"] [data-key="shape"] dd')).toContainText('Ovalni');
  });
});
