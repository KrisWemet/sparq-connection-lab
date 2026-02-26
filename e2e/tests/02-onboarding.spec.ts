import { test, expect } from '@playwright/test';
import { mockPeterRoutes } from '../helpers/mock-peter';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockPeterRoutes(page);
  });

  test('shows Peter\'s welcome message on load', async ({ page }) => {
    await page.goto('/onboarding-flow');
    // Peter's initial message starts with "Hey there! I'm Peter"
    await expect(page.locator('text=Hey there!')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Peter 🦦')).toBeVisible();
    // Input should be ready
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('completes 5-turn conversation and redirects to dashboard', async ({ page }) => {
    await page.goto('/onboarding-flow');

    // Wait for Peter's initial message
    await expect(page.locator('text=Hey there!')).toBeVisible({ timeout: 10_000 });

    const responses = [
      'My name is Alex',
      'We have been struggling to communicate lately',
      'Last week we had a small argument about chores',
      'I usually need some space before talking it out',
      'My partner shows care by making me coffee in the morning',
    ];

    for (const text of responses) {
      // Type and send message
      await page.locator('textarea').fill(text);
      await page.locator('form button[type="submit"]').click();
      // Wait for Peter to respond (loading indicator disappears)
      await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });
    }

    // After 5th turn, completion message appears
    await expect(
      page.locator('text=Taking you to your dashboard...')
    ).toBeVisible({ timeout: 10_000 });

    // Should redirect to dashboard after 3s delay
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('progress dots advance with each turn', async ({ page }) => {
    await page.goto('/onboarding-flow');
    await expect(page.locator('text=Hey there!')).toBeVisible({ timeout: 10_000 });

    // Initially 0 dots are filled (all gray bg-gray-200)
    const dots = page.locator('.rounded-full.bg-gray-200');
    await expect(dots.first()).toBeVisible();

    // Send first message
    await page.locator('textarea').fill('My name is Jamie');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });

    // At least one dot should now be filled (teal)
    await expect(page.locator('.rounded-full.bg-teal-400')).toBeVisible();
  });
});
