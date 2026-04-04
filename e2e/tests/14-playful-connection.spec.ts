import { expect, test, type Page } from '@playwright/test';

const authUserId = 'test-user-id';

async function mockDashboardShell(page: Page) {
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
}

async function mockDailyGrowthShell(page: Page) {
  await page.route('**/api/daily/session/start', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: {
          id: 'session-1',
          day_index: 1,
          status: 'morning_ready',
          morning_story: 'Good morning. This is your story.',
          morning_action: 'Pause before your next hard moment and choose the calmer version of what you want to say.',
          practice_mode: 'solo',
        },
        reused: false,
      }),
    });
  });
}

test.describe('Playful connection MVP', () => {
  test('shows Daily Spark on the dashboard and lets the user swap prompts', async ({ page }) => {
    await mockDashboardShell(page);

    await page.route('**/api/playful/today**', async (route) => {
      const url = new URL(route.request().url());
      const offset = url.searchParams.get('dailySparkOffset') || '0';

      const prompt =
        offset === '1'
          ? {
              id: 'spark-2',
              type: 'daily_spark',
              bucket: 'delight_us',
              prompt: 'Bring up one tiny memory that still makes you smile.',
              hint: 'Pick something small and real.',
              soloOk: true,
              partnerOptional: true,
              sendText: 'A tiny memory of us still makes me smile.',
            }
          : {
              id: 'spark-1',
              type: 'daily_spark',
              bucket: 'connect_us',
              prompt: 'Send one short text that says what you still like about them.',
              hint: 'Keep it simple. One true line is enough.',
              soloOk: true,
              partnerOptional: true,
              sendText: 'One thing I still like about you is how warm you are.',
            };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dateKey: '2026-03-31',
          dailySpark: prompt,
          favoriteUs: null,
        }),
      });
    });

    await page.goto('/dashboard');

    await expect(page.locator("text=Today's Spark")).toBeVisible();
    await expect(page.locator('text=Send one short text that says what you still like about them.')).toBeVisible();

    await page.locator('button:has-text("Try this")').click();
    await expect(page.locator('button:has-text("Doing this today")')).toBeVisible();

    await page.locator('button:has-text("Another one")').click();
    await expect(page.locator('text=Bring up one tiny memory that still makes you smile.')).toBeVisible();
  });

  test('shows Favorite Us on the daily-growth home and lets the user save and send a short note', async ({ page }) => {
    await mockDailyGrowthShell(page);

    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {},
        },
      });
    });

    await page.route('**/api/playful/today**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dateKey: '2026-03-31',
          dailySpark: null,
          favoriteUs: {
            id: 'favorite-1',
            type: 'favorite_us',
            bucket: 'help_us_enjoy_each_other',
            prompt: 'What felt easy between us lately?',
            hint: 'Look for the small warm thing, not the perfect thing.',
            soloOk: true,
            partnerOptional: true,
            sendText: 'One thing I liked about us lately is how easy it felt to be around you.',
          },
        }),
      });
    });

    await page.goto('/daily-growth');

    await expect(page.locator('text=Favorite Us')).toBeVisible();
    await expect(page.locator('text=What felt easy between us lately?')).toBeVisible();

    await page.locator('textarea[placeholder="Write one small thing that felt good about us."]').fill('We felt calm when we cleaned up dinner together.');
    await page.locator('button:has-text("Keep this note")').click();
    await expect(page.locator('button:has-text("Kept for today")')).toBeVisible();

    await page.locator('button:has-text("Copy short note")').click();
    await expect(page.locator('button:has-text("Copied short note")')).toBeVisible();
  });

  test('fails softly when playful prompts do not load', async ({ page }) => {
    await mockDashboardShell(page);
    await mockDailyGrowthShell(page);

    await page.route('**/api/playful/today**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'boom' }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.locator('button:has-text("Resume Evening Reflection")')).toBeVisible();
    await expect(page.locator("text=Today's Spark")).not.toBeVisible();

    await page.goto('/daily-growth');
    await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible();
    await expect(page.locator('text=Favorite Us')).not.toBeVisible();
  });

  test('stays quiet when the playful API returns no prompts for the user', async ({ page }) => {
    await mockDashboardShell(page);
    await mockDailyGrowthShell(page);

    await page.route('**/api/playful/today**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dateKey: '2026-03-31',
          dailySpark: null,
          favoriteUs: null,
        }),
      });
    });

    await page.goto('/dashboard');
    await expect(page.locator('button:has-text("Resume Evening Reflection")')).toBeVisible();
    await expect(page.locator("text=Today's Spark")).not.toBeVisible();

    await page.goto('/daily-growth');
    await expect(page.locator('button:has-text("Start Morning Story")')).toBeVisible();
    await expect(page.locator('text=Favorite Us')).not.toBeVisible();
  });
});
