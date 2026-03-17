import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('dashboard is accessible when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    // Should see the Sparq header and the "Today's Question" section
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible();
    await expect(page.locator('h3:has-text("Today\'s Question")')).toBeVisible();
  });

  test('/ redirects logged-in user to dashboard', async ({ page }) => {
    await page.goto('/');
    // Wait for the auth context to resolve and show the Dashboard link
    await expect(page.locator('text=Go to Dashboard')).toBeVisible({ timeout: 5000 });
  });

  test('logout works from profile page', async ({ page }) => {
    // Navigate from dashboard to profile via UI to ensure state is fully initialized
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible({ timeout: 10_000 });
    
    // Click Profile in the bottom nav
    await page.locator('nav').locator('text=Profile').click();
    await expect(page).toHaveURL(/\/profile/, { timeout: 10_000 });
    
    // Find and click the Privacy tab
    await page.locator('button', { hasText: /Privacy/ }).first().click();
    
    // Click Sign Out
    await page.locator('button', { hasText: 'Sign Out' }).click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
