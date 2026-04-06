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

    await page.route('**/api/playful/today**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dateKey: '2026-04-05',
          dailySpark: {
            id: 'spark-1',
            type: 'daily_spark',
            bucket: 'connect_us',
            prompt: 'Send one short text that says what you still like about them.',
            hint: 'Keep it simple. One true line is enough.',
            soloOk: true,
            partnerOptional: true,
            sendText: 'One thing I still like about you is how warm you are.',
          },
          favoriteUs: null,
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('sparq_journey_progress', JSON.stringify({}));
    });
  });

  test('renders the simplified Home shape with quiet destination links only', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/today's spark/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /journey progress/i })).toHaveAttribute('href', '/journeys');
    await expect(page.getByRole('link', { name: /shared connection/i })).toHaveAttribute('href', '/connect');
    await expect(page.getByRole('link', { name: /^journal$/i })).toHaveAttribute('href', '/journal');

    await expect(page.getByText(/your growth still counts on your own/i)).toHaveCount(0);
    await expect(page.getByText(/your solo reflection/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /invite later/i })).toHaveCount(0);
  });

  test('keeps the main CTA focused on personal follow-through', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('text=You started today already. Come back now and finish your evening reflection.')).toBeVisible();
    await expect(page.locator("button:has-text(\"Resume Evening Reflection\")")).toBeVisible();
    await expect(page.locator("button:has-text(\"Restart Morning Practice\")")).toBeVisible();
  });

  test('routes the avatar entry to profile secondary access', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /open profile/i }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });
});
