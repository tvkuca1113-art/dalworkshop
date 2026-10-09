import { expect, test } from '@playwright/test';
import { canvasShot, diffRatio, goToStep, setDimension, specRow, waitForViewer } from './helpers';

test.describe('Konfigurator stola', () => {
  test('početna → stol → izmjene → sažetak → link → isti izbor u novom tabu', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.getByRole('link', { name: 'Kreirajte svoj stol' }).first().click();
    await expect(page).toHaveURL(/\/konfigurator\/stol/);
    await waitForViewer(page);
    const before = await canvasShot(page);

    await goToStep(page, /Drvo i dimenzije/);
    await page.getByLabel(/^Orah/).check();
    await setDimension(page, 'dim-length', '200');
    await setDimension(page, 'dim-topThickness', '4,5');
    await setDimension(page, 'dim-width', '90.5');
    await goToStep(page, /Ivica i postolje/);
    await page.getByLabel(/^Zaobljena ivica/).check();
    await page.getByLabel(/^X metalni nosači/).check();
    await waitForViewer(page);
    await page.waitForTimeout(1500); // texture for walnut
    const after = await canvasShot(page);
    const ratio = await diffRatio(page, before, after);
    expect(ratio, 'the 3D canvas must visibly change').toBeGreaterThan(0.03);

    // compare later under the same camera framing
    await page.getByRole('button', { name: 'Vrati pogled' }).click();
    await page.waitForTimeout(1000);
    const framed = await canvasShot(page);

    await goToStep(page, /Pregled/);
    await expect(specRow(page, 'wood')).toContainText('Orah');
    await expect(specRow(page, 'length')).toContainText('200 cm');
    await expect(specRow(page, 'width')).toContainText('90,5 cm');
    await expect(specRow(page, 'topThickness')).toContainText('4,5 cm');
    await expect(specRow(page, 'edge')).toContainText('Zaobljena ivica');
    await expect(specRow(page, 'base')).toContainText('X metalni nosači');
    await expect(page.getByTestId('price')).toContainText('Cijena prema odabranoj konfiguraciji');
    await expect(page.getByTestId('price')).not.toContainText('0 KM');

    await page.getByTestId('copy-link').click();
    await expect(page.getByText('Link je kopiran.')).toBeVisible();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    expect(link).toContain('/konfigurator/stol?v=1');
    expect(link).toContain('w=walnut');
    expect(link).toContain('l=2000');
    expect(link).toContain('t=45');

    const other = await context.newPage();
    await other.goto(link);
    await waitForViewer(other);
    await expect(other.locator('[data-testid="spec"] [data-key="wood"] dd')).toContainText('Orah');
    await expect(other.locator('[data-testid="spec"] [data-key="length"] dd')).toContainText('200 cm');
    await expect(other.locator('[data-testid="spec"] [data-key="base"] dd')).toContainText('X metalni nosači');
    await other.getByRole('button', { name: 'Vrati pogled' }).click();
    await other.waitForTimeout(1000);
    const reopened = await canvasShot(other);
    expect(await diffRatio(other, framed, reopened), 'same choice renders the same model').toBeLessThan(0.03);
  });

  test('WhatsApp poruka odgovara izboru i ne tvrdi da je poslana', async ({ page, context }) => {
    await context.route('https://wa.me/**', (route) => route.fulfill({ status: 200, body: 'test stub — ništa nije poslano' }));
    await page.goto('/konfigurator/stol?v=1&sh=rounded_rectangle&w=ash&l=1800&wd=900&t=40&h=760&e=straight&b=u_frame_pair&f=lighter&s=7');
    await waitForViewer(page);
    await goToStep(page, /Pregled/);
    const href = await page.getByTestId('whatsapp-cta').getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/38762704560\?text=/);
    const text = decodeURIComponent(href!.split('?text=')[1]!);
    expect(text.startsWith('Pozdrav, zainteresovan/a sam za izradu po mjeri. Šaljem svoju konfiguraciju:')).toBe(true);
    for (const part of ['Oblik: Pravougaoni sa zaobljenim uglovima', 'Drvo: Jasen', 'Dužina: 180 cm', 'Širina: 90 cm', 'Debljina ploče: 4 cm', 'Ukupna visina: 76 cm', 'Postolje: U metalni nosači', 'Svjetlija nijansa', 'Molim potvrdu mogućnosti izrade, cijene i roka.']) {
      expect(text).toContain(part);
    }
    expect(text).toContain('/konfigurator/stol?v=1&sh=rounded_rectangle&w=ash&l=1800&wd=900&t=40&h=760');
    const popup = context.waitForEvent('page');
    await page.getByTestId('whatsapp-cta').click();
    await (await popup).close();
    await expect(page.getByTestId('wa-status')).toHaveText(/Dovršite slanje u WhatsAppu/);
    await expect(page.getByText(/uspješno poslan/i)).toHaveCount(0);
  });

  test('vraćanje pogleda čuva izbor; vraćanje opcija traži potvrdu i stvarno resetuje', async ({ page }) => {
    await page.goto('/konfigurator/stol');
    await waitForViewer(page);
    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-length', '220');
    // vertical component of the viewing direction (1 = straight down)
    const viewDirY = () =>
      page.evaluate(() => {
        const c = (window as unknown as { __dalViewer: { info(): { camera: { position: number[]; target: number[] } } } }).__dalViewer.info().camera;
        const d = c.position.map((v, i) => v - c.target[i]!);
        return d[1]! / Math.hypot(d[0]!, d[1]!, d[2]!);
      });
    expect(await viewDirY()).toBeLessThan(0.6);
    await page.getByRole('button', { name: 'Odozgo' }).click();
    // camera animates to the top view (software WebGL frames can be slow)
    await expect.poll(viewDirY, { timeout: 15_000 }).toBeGreaterThan(0.99);
    await page.getByRole('button', { name: 'Vrati pogled' }).click();
    await expect.poll(viewDirY, { timeout: 15_000 }).toBeLessThan(0.6);
    await expect(page.getByTestId('dim-length').locator('input')).toHaveValue('220');

    await page.getByTestId('reset-config').click();
    const dialog = page.getByRole('dialog', { name: 'Vratiti početne opcije?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Odustani' }).click();
    await expect(dialog).toBeHidden();
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('dim-length').locator('input')).toHaveValue('220');
    await page.getByTestId('reset-config').click();
    await page.getByRole('button', { name: 'Da, vrati početne opcije' }).click();
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('dim-length').locator('input')).toHaveValue('150');
    await expect(page).toHaveURL(/l=1500/);
  });

  test('nedozvoljene dimenzije se objašnjavaju i ne primjenjuju; okrugli stol dobija centralno postolje', async ({ page }) => {
    await page.goto('/konfigurator/stol');
    await waitForViewer(page);
    await goToStep(page, /Drvo i dimenzije/);
    await setDimension(page, 'dim-length', '400');
    await expect(page.getByTestId('dim-length').getByRole('alert')).toContainText('Predloženi raspon je 120–280 cm');
    await setDimension(page, 'dim-length', 'abc');
    await expect(page.getByTestId('dim-length').getByRole('alert')).toContainText('Upišite broj');
    await goToStep(page, /Oblik/);
    await page.getByLabel(/^Okrugli/).check();
    await expect(page.getByTestId('notices')).toContainText('Postolje je promijenjeno u „Centralno postolje“');
    await goToStep(page, /Ivica i postolje/);
    await expect(page.getByLabel(/^Crni trapezni okviri/)).toBeDisabled();
    await expect(page.getByText('Par nosača na krajevima ne odgovara okrugloj ploči').first()).toBeVisible();
    await goToStep(page, /Drvo i dimenzije/);
    await expect(page.getByTestId('dim-diameter')).toBeVisible();
    await expect(page.getByTestId('dim-length')).toHaveCount(0);
  });
});
