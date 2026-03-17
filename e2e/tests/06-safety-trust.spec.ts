import { test, expect } from '@playwright/test';

test.describe('Safety + Trust', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard first-aid nav routes to conflict first aid', async ({ page }) => {
    await page.locator('nav').locator('text=First Aid').click();
    await page.waitForURL('**/conflict-first-aid', { timeout: 5_000 });
    await expect(page.locator('h1:has-text("Conflict First Aid")')).toBeVisible();
    await expect(page.locator('text=2-10 Minute Reset Protocol')).toBeVisible();
  });

  test('settings links to trust center', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 10_000 });
    await page.locator('button:has-text("Trust Center")').click();
    await page.waitForURL('**/trust-center', { timeout: 5_000 });
    await expect(page.locator('h1:has-text("Trust Center")')).toBeVisible();
    await expect(page.locator('text=Personalization Controls')).toBeVisible();
  });
});
