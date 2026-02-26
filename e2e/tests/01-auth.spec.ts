import { test, expect } from '@playwright/test';

// Auth tests use real Supabase — no mocking.
// storageState from auth.setup.ts is active, so we start logged in.

test.describe('Authentication', () => {
  test('dashboard is accessible when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    // Should see the Sparq header and the "Answer Now" button
    await expect(page.locator('h1:has-text("Sparq")')).toBeVisible();
    await expect(page.locator('button:has-text("Answer Now")')).toBeVisible();
  });

  test('/ redirects logged-in user to dashboard', async ({ page }) => {
    await page.goto('/');
    // Index page either redirects or shows a "Go to Dashboard" link
    const url = page.url();
    const body = await page.locator('body').innerText();
    const isOnDashboard = url.includes('/dashboard');
    const hasDashboardLink = body.includes('Dashboard') || body.includes('Go to Dashboard');
    expect(isOnDashboard || hasDashboardLink).toBeTruthy();
  });

  test('logout redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign Out")').click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
