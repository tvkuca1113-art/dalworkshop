import { expect, type Page } from '@playwright/test';

export const FORM_SERVER = 'http://localhost:3201';

export async function waitForViewer(page: Page) {
  await expect(page.getByTestId('viewer')).toHaveAttribute('data-phase', 'ready', { timeout: 90_000 });
  // one more frame so the finished model is on screen
  await page.waitForTimeout(400);
}

export async function canvasShot(page: Page): Promise<Buffer> {
  return page.locator('[data-testid="viewer"] canvas').screenshot();
}

/** Share of pixels that differ noticeably between two PNG screenshots (computed in the browser). */
export async function diffRatio(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ([ia, ib]) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      const [x, y] = await Promise.all([load(ia), load(ib)]);
      const w = Math.min(x.width, y.width);
      const h = Math.min(x.height, y.height);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(x, 0, 0);
      const da = ctx.getImageData(0, 0, w, h).data;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(y, 0, 0);
      const db = ctx.getImageData(0, 0, w, h).data;
      let diff = 0;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.abs(da[i]! - db[i]!) + Math.abs(da[i + 1]! - db[i + 1]!) + Math.abs(da[i + 2]! - db[i + 2]!);
        if (d > 40) diff++;
      }
      return diff / (w * h);
    },
    [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`] as const,
  );
}

export async function goToStep(page: Page, name: RegExp | string) {
  await page.getByRole('navigation', { name: 'Koraci konfiguracije' }).getByRole('button', { name }).click();
}

export async function setDimension(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId).locator('input[type="text"]');
  await input.fill(value);
  await input.press('Enter');
}

export function specRow(page: Page, key: string) {
  return page.locator(`[data-testid="spec"] [data-key="${key}"] dd`).first();
}
