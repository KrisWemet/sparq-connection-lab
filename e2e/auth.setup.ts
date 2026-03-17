import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL || `test-${Date.now()}@sparq.app`;
  const password = process.env.TEST_USER_PASSWORD || 'E2eTestPass123!';

  await page.goto('/login');

  // Try to login first
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait briefly to see if we get an invalid login error or a redirect
  try {
    await page.waitForURL('**/dashboard', { timeout: 3_000 });
  } catch (e) {
    // If we didn't get to the dashboard, it means the user doesn't exist yet.
    // Let's create it.
    await page.locator('button:has-text("Create Account")').click();
    
    // Fill the registration form
    await page.locator('input[name="name"]').fill('E2E Test User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    // Wait for the redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
  }

  // Save real auth state for reuse across all tests
  await page.context().storageState({ path: AUTH_FILE });
});
