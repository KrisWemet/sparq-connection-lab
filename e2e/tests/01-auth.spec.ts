import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('dashboard is accessible when logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('SPARQ')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Begin Today|Choose Next Journey|Evening Check-in/i }).first()
    ).toBeVisible();
  });

  test('session survives a dashboard reload', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('SPARQ')).toBeVisible();
  });

  test('login page redirects logged-in users to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByText('SPARQ')).toBeVisible();
  });

  test('logout works from settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 10_000 });
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
