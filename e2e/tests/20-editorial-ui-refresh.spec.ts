import { expect, test, type Page } from '@playwright/test';

const authUserId = 'test-user-id';

async function mockSharedAppData(page: Page) {
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
        archetype: 'The Steady Repairer',
        archetype_description: 'You keep returning to the calmer, truer version of yourself.',
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
      body: JSON.stringify({
        entries: [
          {
            id: 'entry-1',
            date: '2026-04-03',
            label: 'You repaired before the evening got heavy.',
            type: 'breakthrough',
            journey_id: null,
            detail: 'You came back to the conversation with less heat and more clarity.',
          },
        ],
      }),
    });
  });

  await page.route('**/api/profile/traits', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        traits: [
          {
            trait_key: 'attachment_style',
            inferred_value: 'secure',
            confidence: 0.81,
            effective_weight: 0.81,
            user_feedback: null,
          },
        ],
      }),
    });
  });

  await page.route('**/api/me/patterns', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        patterns: ['You pause before reacting.'],
        growth_edge: 'Repair faster after tension',
        strength: 'You stay calm and direct',
      }),
    });
  });

  await page.route('**/api/weekly-mirror/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mirror: {
          narrative_text: 'This week you kept choosing the kinder version of what you meant.',
          practice_count: 4,
          practices_felt_natural: 2,
          week_start: '2026-04-01',
        },
      }),
    });
  });

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
          morning_action:
            'Pause before your next hard moment and choose the calmer version of what you want to say.',
          practice_mode: 'solo',
        },
        reused: false,
      }),
    });
  });

  await page.route('**/api/playful/today**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const dashboardSurface = pathname.includes('/api/playful/today');

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
        favoriteUs: {
          id: 'favorite-1',
          type: 'favorite_us',
          bucket: 'help_us_enjoy_each_other',
          prompt: 'What felt easy between us lately?',
          hint: 'Look for the small warm thing, not the perfect thing.',
          soloOk: true,
          partnerOptional: true,
          sendText:
            'One thing I liked about us lately is how easy it felt to be around you.',
        },
        dashboardSurface,
      }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'sparq_journey_progress',
      JSON.stringify({
        communication: [
          {
            journey_id: 'communication',
            day: 3,
            completed: true,
            responses: {},
            created_at: '2026-04-05T12:00:00.000Z',
          },
        ],
      }),
    );
  });
}

async function expectNoDailyPrimaryTab(page: Page) {
  await expect(page.getByRole('link', { name: /^daily$/i })).toHaveCount(0);
}

test.describe('Phase 20 editorial refresh coverage', () => {
  test.beforeEach(async ({ page }) => {
    await mockSharedAppData(page);
  });

  test('keeps one featured module on /dashboard and leaves Daily Spark secondary', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByText(/you started today already\. come back now and finish your evening reflection\./i),
    ).toHaveCount(1);
    await expect(page.getByRole('button', { name: /resume evening reflection/i })).toBeVisible();
    await expect(page.getByText(/today's spark/i)).toBeVisible();
    await expect(page.getByText(/favorite us/i)).toHaveCount(0);
    await expectNoDailyPrimaryTab(page);
  });

  test('keeps one featured module on /daily-growth and reserves Favorite Us for that route', async ({
    page,
  }) => {
    await page.goto('/daily-growth');

    await expect(page.getByText(/your morning practice is ready\./i)).toHaveCount(1);
    await expect(page.getByRole('button', { name: /start morning story/i })).toBeVisible();
    await expect(page.getByText(/favorite us/i)).toBeVisible();
    await expect(page.getByText(/today's spark/i)).toHaveCount(0);
    await expectNoDailyPrimaryTab(page);
  });

  test('keeps one featured module on /connect with no playful card competition', async ({ page }) => {
    await page.goto('/connect');

    await expect(
      page.getByText(/open the tool that fits the real moment you are about to have\./i),
    ).toHaveCount(1);
    await expect(page.getByRole('heading', { name: /connect/i })).toBeVisible();
    await expect(page.getByText(/today's spark|favorite us/i)).toHaveCount(0);
    await expectNoDailyPrimaryTab(page);
  });

  test('keeps one featured module on /journal with reflective ownership intact', async ({ page }) => {
    await page.goto('/journal');

    await expect(
      page.getByText(/a quieter place to notice what is changing in you\./i),
    ).toHaveCount(1);
    await expect(page.getByText(/weekly mirror/i)).toBeVisible();
    await expect(page.getByText(/today's spark|favorite us/i)).toHaveCount(0);
    await expectNoDailyPrimaryTab(page);
  });

  test('keeps one featured module on /journeys with structured progress ownership', async ({ page }) => {
    await page.goto('/journeys');

    await expect(page.getByText(/current practice/i)).toHaveCount(1);
    await expect(page.getByText(/resume day 4 of 14/i)).toBeVisible();
    await expect(page.getByPlaceholder(/search journeys/i)).toBeVisible();
    await expect(page.getByText(/today's spark|favorite us/i)).toHaveCount(0);
    await expectNoDailyPrimaryTab(page);
  });
});
