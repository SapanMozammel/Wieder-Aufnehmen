import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home links to a live API status page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /A solid foundation/ })).toBeVisible();
  if (process.env.E2E_CAPTURE_VISUALS === 'true') {
    await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  await page.getByRole('link', { name: /system status/i }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Aufnehmen system status' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Services available' })).toBeVisible();
});

test('status remains usable at mobile widths @accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/system-status');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Services available' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('network outage is recoverable with the keyboard', async ({ page }) => {
  await page.route('**/v1/system/status', (route) => route.abort('failed'));
  await page.goto('/system-status');
  await expect(page.getByRole('heading', { name: 'Status unavailable' })).toBeVisible();
  await page.unroute('**/v1/system/status');
  await page.getByRole('button', { name: 'Retry status check' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Services available' })).toBeVisible();
});

test('degraded status is accessible in dark mode @accessibility', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.route('**/v1/system/status', async (route) => {
    const response = await route.fetch();
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object')
      throw new Error('Live API returned an invalid response.');
    await route.fulfill({
      response,
      json: { ...payload, state: 'degraded', database: 'unavailable' },
    });
  });
  await page.goto('/system-status');
  await expect(page.getByRole('heading', { name: 'Service degraded' })).toBeVisible();
  if (process.env.E2E_CAPTURE_VISUALS === 'true')
    await page.screenshot({ path: 'test-results/status-dark.png', fullPage: true });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
