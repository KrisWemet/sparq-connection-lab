import { test, expect } from '@playwright/test';
import { mockPeterRoutes } from '../helpers/mock-peter';
import { mockUserInsights, mockDailyEntries } from '../helpers/mock-supabase';

test.describe('Daily Growth Loop', () => {
  test.beforeEach(async ({ page }) => {
    await mockPeterRoutes(page);
    // Day 1, not yet unlocked, no existing entry today
    await mockUserInsights(page, { onboarding_day: 1, skill_tree_unlocked: false });
    await mockDailyEntries(page, null);
  });

  test('morning phase: shows story and action card', async ({ page }) => {
    await page.goto('/daily-growth');

    // Header shows "Day 1 of 14"
    await expect(page.locator('text=Day 1 of 14')).toBeVisible({ timeout: 10_000 });

    // Morning badge visible
    await expect(page.locator('span:has-text("Morning")').first()).toBeVisible();

    // Peter's morning story should load (mocked instantly)
    await expect(page.locator('text=Alex noticed Sam')).toBeVisible({ timeout: 10_000 });

    // Today's Action card visible
    await expect(page.locator('text=Today\'s Action')).toBeVisible();

    // CTA button visible
    await expect(
      page.locator('button:has-text("Got it — I\'ll try this today")')
    ).toBeVisible();
  });

  test('morning → evening transition on "Got it" click', async ({ page }) => {
    await page.goto('/daily-growth');

    // Wait for morning content to load
    await expect(
      page.locator('button:has-text("Got it — I\'ll try this today")')
    ).toBeVisible({ timeout: 10_000 });

    await page.locator('button:has-text("Got it — I\'ll try this today")').click();

    // Phase transitions to evening
    await expect(page.locator('span:has-text("Evening")').first()).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator('text=Hey, welcome back!')
    ).toBeVisible({ timeout: 5_000 });

    // Evening action reminder shows
    await expect(page.locator('text=Today\'s action:')).toBeVisible();

    // Chat input is ready
    await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible();
  });

  test('evening phase: complete button appears after 2 messages', async ({ page }) => {
    await page.goto('/daily-growth');

    // Skip morning phase
    await expect(
      page.locator('button:has-text("Got it — I\'ll try this today")')
    ).toBeVisible({ timeout: 10_000 });
    await page.locator('button:has-text("Got it — I\'ll try this today")').click();
    await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible({ timeout: 5_000 });

    // Send first evening message
    await page.locator('textarea[placeholder="How did it go today?"]').fill('We tried it together and it felt really good!');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });

    // Complete button should NOT be visible yet (only 1 turn)
    await expect(
      page.locator('button:has-text("Complete Day")')
    ).not.toBeVisible();

    // Send second evening message
    await page.locator('textarea').fill('It surprised me how much easier it was than I expected.');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });

    // Complete button should now appear
    await expect(
      page.locator('button:has-text("Complete Day 1")')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('completing a day shows celebration screen', async ({ page }) => {
    await page.goto('/daily-growth');

    // Morning phase
    await expect(
      page.locator('button:has-text("Got it — I\'ll try this today")')
    ).toBeVisible({ timeout: 10_000 });
    await page.locator('button:has-text("Got it — I\'ll try this today")').click();

    // Evening phase — send 2 messages
    await expect(page.locator('textarea')).toBeVisible({ timeout: 5_000 });
    await page.locator('textarea').fill('It went really well today!');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });

    await page.locator('textarea').fill('I feel closer to my partner already.');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });

    // Click Complete Day 1
    await page.locator('button:has-text("Complete Day 1")').click();

    // Celebration screen
    await expect(
      page.locator('text=Day 1 complete!')
    ).toBeVisible({ timeout: 10_000 });

    // Back to Dashboard button for non-graduation days
    await expect(
      page.locator('button:has-text("Back to Dashboard")')
    ).toBeVisible();
  });
});
