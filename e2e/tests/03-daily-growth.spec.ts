import { test, expect } from '@playwright/test';

const morningStory = 'Good morning. Today you are becoming someone who slows down before reacting.';
const morningAction = 'Pause before your next hard moment and choose the calmer version of what you want to say.';

test.describe('Daily Growth Loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/daily/session/start', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'session-1',
            day_index: 1,
            status: 'morning_ready',
            morning_story: morningStory,
            morning_action: morningAction,
            practice_mode: 'solo',
          },
          reused: false,
        }),
      });
    });

    await page.route('**/api/daily/session/morning-viewed', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.route('**/api/peter/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'That was a strong rep. You stayed clear, and that matters.',
        }),
      });
    });

    await page.route('**/api/daily/session/complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          next_day_index: 2,
          journey_completed: false,
        }),
      });
    });
  });

  test('shows the solo-first home state before the morning session begins', async ({ page }) => {
    await page.goto('/daily-growth');

    await expect(page.locator('text=Solo-first reminder')).toBeVisible();
    await expect(page.locator('text=This is a solo-first step.')).toBeVisible();
    await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible();
  });

  test('morning flow keeps the practice rooted in what one user can control', async ({ page }) => {
    await page.goto('/daily-growth');

    await page.locator('button:has-text("Start Morning Story")').click();

    await expect(page.locator(`text=${morningStory}`)).toBeVisible();
    await expect(page.locator(`text=${morningAction}`)).toBeVisible();
    await expect(page.locator('text=This is a solo-first step.')).toBeVisible();
    await expect(page.locator('button:has-text("I\'ll do this today")')).toBeVisible();
  });

  test('evening flow supports solo completion without partner dependency', async ({ page }) => {
    await page.goto('/daily-growth');

    await page.locator('button:has-text("Start Morning Story")').click();
    await page.locator('button:has-text("I\'ll do this today")').click();

    await expect(page.locator('text=How did you practice this in the way you showed up today?')).toBeVisible();
    await expect(page.locator('text=This step still counts, even if your partner never opens the app.')).toBeVisible();

    await page.locator('button:has-text("Skip Hold (Dev)")').click();
    await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible();

    await page.locator('textarea[placeholder="How did it go today?"]').fill('I paused, breathed, and said the kinder version.');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled();

    await page.locator('textarea').fill('I felt more steady, and the whole conversation stayed calmer.');
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator('button:has-text("Finish Day 1")')).toBeVisible();
  });

  test('completion celebrates showing up, not partner adoption', async ({ page }) => {
    await page.goto('/daily-growth');

    await page.locator('button:has-text("Start Morning Story")').click();
    await page.locator('button:has-text("I\'ll do this today")').click();
    await page.locator('button:has-text("Skip Hold (Dev)")').click();

    await page.locator('textarea').fill('I repaired faster and owned my part.');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled();

    await page.locator('textarea').fill('I noticed the shift right away.');
    await page.locator('form button[type="submit"]').click();
    await page.locator('button:has-text("Finish Day 1")').click();

    await expect(page.locator('text=Day 1 complete.')).toBeVisible();
    await expect(page.locator("text=You showed up. That's everything.")).toBeVisible();
    await expect(page.locator('button:has-text("Return to Dashboard")')).toBeVisible();
  });
});
