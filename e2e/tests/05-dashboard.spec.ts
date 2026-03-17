import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for dashboard to fully load
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible({ timeout: 10_000 });
  });

  test('shows key dashboard sections', async ({ page }) => {
    // Header
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible();

    // Today's Question CTA
    await expect(page.locator('text=Today\'s Question')).toBeVisible();

    // Metrics
    await expect(page.locator('h3:has-text("Connection Score")')).toBeVisible();
    
    // Bottom Nav presence
    await expect(page.locator('nav').locator('text=Home')).toBeVisible();
    await expect(page.locator('nav').locator('text=Profile')).toBeVisible();
  });

  test('shows simplified daily action cards', async ({ page }) => {
    await expect(page.locator('h3:has-text("Daily Loop")')).toBeVisible();
    await expect(page.locator('h3:has-text("Today\'s Question")')).toBeVisible();
    // Mirror Report is now in the progress section
    await expect(page.locator('h3:has-text("Mirror Report")')).toBeVisible();
  });

  test('"Today\'s Question" navigates to /daily-questions', async ({ page }) => {
    await page.locator('button:has-text("Today\'s Question")').click();
    await page.waitForURL('**/daily-questions', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/daily-questions/);
  });

  test('"Daily Loop" navigates to /daily-growth', async ({ page }) => {
    await page.locator('button:has-text("Daily Loop")').click();
    await page.waitForURL('**/daily-growth', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/daily-growth/);
  });

  test('"Skills" in bottom nav navigates to /skill-tree', async ({ page }) => {
    await page.locator('nav').locator('text=Skills').click();
    await page.waitForURL('**/skill-tree', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/skill-tree/);
  });

  test('"Profile" in bottom nav navigates to /profile', async ({ page }) => {
    await page.locator('nav').locator('text=Profile').click();
    await page.waitForURL('**/profile', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/profile/);
  });

  test('partner invite section is visible', async ({ page }) => {
    await expect(page.locator('text=Invite your partner')).toBeVisible();
  });
});
