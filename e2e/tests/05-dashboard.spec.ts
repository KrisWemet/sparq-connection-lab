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
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();

    // Today's Question CTA
    await expect(page.locator('text=Today\'s Question')).toBeVisible();
    await expect(page.locator('button:has-text("Answer Now")')).toBeVisible();

    // Metrics
    await expect(page.locator('text=Connection Score')).toBeVisible();
    await expect(page.locator('text=Day Streak')).toBeVisible();
  });

  test('shows all 5 quick-link cards', async ({ page }) => {
    await expect(page.locator('text=🦦 Daily Loop')).toBeVisible();
    await expect(page.locator('text=Onboarding')).toBeVisible();
    await expect(page.locator('text=Mirror Report')).toBeVisible();
    await expect(page.locator('text=Translator')).toBeVisible();
    await expect(page.locator('text=Skill Tree')).toBeVisible();
  });

  test('"Answer Now" navigates to /daily-questions', async ({ page }) => {
    await page.locator('button:has-text("Answer Now")').click();
    await page.waitForURL('**/daily-questions', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/daily-questions/);
  });

  test('"🦦 Daily Loop" navigates to /daily-growth', async ({ page }) => {
    await page.locator('button:has-text("Daily Loop")').click();
    await page.waitForURL('**/daily-growth', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/daily-growth/);
  });

  test('"Skill Tree" navigates to /skill-tree', async ({ page }) => {
    await page.locator('button:has-text("Skill Tree")').click();
    await page.waitForURL('**/skill-tree', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/skill-tree/);
  });

  test('"Onboarding" navigates to /onboarding-flow', async ({ page }) => {
    await page.locator('button:has-text("Onboarding")').click();
    await page.waitForURL('**/onboarding-flow', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/onboarding-flow/);
  });

  test('partner invite section is visible', async ({ page }) => {
    await expect(page.locator('text=Invite your partner')).toBeVisible();
  });
});
