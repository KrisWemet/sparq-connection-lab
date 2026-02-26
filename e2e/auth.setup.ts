import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.local.\n' +
      'Run `npm run setup:test-user` first to create the test account.'
    );
  }

  await page.goto('/login');

  // Fill login form
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait for success message + redirect to dashboard (1500ms delay in LoginForm)
  await expect(page.locator('text=Login successful!')).toBeVisible({ timeout: 10_000 });
  await page.waitForURL('**/dashboard', { timeout: 10_000 });

  // Save auth state for reuse across all tests
  await page.context().storageState({ path: AUTH_FILE });
});
