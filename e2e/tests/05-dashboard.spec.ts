import { test, expect } from '@playwright/test';

const authUserId = 'test-user-id';

test.describe('Dashboard solo-first states', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: authUserId,
          name: 'Chris Example',
          streak_count: 4,
          identity_statement: 'I am someone who stays calm and says the true thing.',
          partner_name: null,
        }),
      });
    });

    await page.route('**/rest/v1/user_insights*', async (route) => {
      const url = route.request().url();

      if (url.includes('select=onboarding_day%2Cjourney_completion_state%2Cactive_journey_id')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            onboarding_day: 3,
            journey_completion_state: null,
            active_journey_id: null,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          onboarding_day: 3,
          next_greeting_text: null,
        }),
      });
    });

    await page.route('**/rest/v1/daily_sessions*', async (route) => {
      const url = route.request().url();

      if (url.includes('evening_reflection') || url.includes('status=eq.completed')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'session-1',
          status: 'morning_viewed',
          morning_viewed_at: new Date().toISOString(),
          evening_completed_at: null,
        }),
      });
    });

    await page.route('**/api/growth-thread?limit=10', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ entries: [] }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('sparq_journey_progress', JSON.stringify({}));
    });
  });

  test('shows a complete solo-first partner card instead of an empty state', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('text=Your growth still counts on your own')).toBeVisible();
    await expect(page.locator('text=Start solo. Invite your partner later if shared reflections would help.')).toBeVisible();
    await expect(page.locator('text=Your Solo Reflection')).toBeVisible();
    await expect(page.locator('button:has-text("Invite later")')).toBeVisible();
    await expect(page.locator('button:has-text("Invite your partner when shared prompts would help")')).toBeVisible();
  });

  test('keeps the main CTA focused on personal follow-through', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('text=You started today already. Come back now and finish your evening reflection.')).toBeVisible();
    await expect(page.locator("button:has-text(\"Resume Evening Reflection\")")).toBeVisible();
    await expect(page.locator("button:has-text(\"Restart Morning Practice\")")).toBeVisible();
  });
});
