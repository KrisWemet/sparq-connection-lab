import { expect, test, type Page } from '@playwright/test';

const authUserId = 'test-user-id';

async function mockProfile(page: Page) {
  await page.route('**/rest/v1/profiles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: authUserId,
        name: 'Chris Example',
        partner_name: null,
        archetype: 'The Steady Repairer',
        archetype_description: 'You keep returning to the calmer, truer version of yourself.',
      }),
    });
  });
}

async function mockJournalData(page: Page) {
  await mockProfile(page);

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
}

async function expectConnectNavActive(page: Page) {
  const connectLink = page.getByRole('link', { name: /connect/i });
  await expect(connectLink).toBeVisible();
  await expect(connectLink).toHaveAttribute('href', '/connect');
  await expect(connectLink).toHaveClass(/text-brand-primary|bg-brand-primary|active/i);
}

async function expectHomeNavActive(page: Page) {
  const homeLink = page.getByRole('link', { name: /home/i });
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveClass(/text-brand-primary|bg-brand-primary|active/i);
}

async function expectPrimaryNavHidden(page: Page) {
  await expect(page.getByRole('link', { name: /^home$/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^journeys$/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^connect$/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^journal$/i })).toHaveCount(0);
}

test.describe('Phase 19 IA ownership', () => {
  test('Connect landing ownership shows four curated destination rows', async ({ page }) => {
    await page.goto('/connect');

    await expect(page.getByRole('heading', { name: /connect/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/messages');
    await expect(page.getByRole('link', { name: /go connect/i })).toHaveAttribute('href', '/go-connect');
    await expect(page.getByRole('link', { name: /translator/i })).toHaveAttribute('href', '/translator');
    await expect(page.getByRole('link', { name: /join partner/i })).toHaveAttribute('href', '/join-partner');
  });

  test('Journal ownership keeps reflective surfaces together on /journal', async ({ page }) => {
    await mockJournalData(page);

    await page.goto('/journal');

    await expect(page.getByRole('heading', { name: /journal/i })).toBeVisible();
    await expect(page.getByText(/weekly mirror/i)).toBeVisible();
    await expect(page.getByText(/your arc/i)).toBeVisible();
    await expect(page.getByText(/what peter has learned about you/i)).toBeVisible();
    await expect(page.getByText(/growth thread/i)).toBeVisible();
  });

  test('Connect leaf return routes point back to /connect', async ({ page }) => {
    await page.goto('/go-connect');
    await page.getByRole('button', { name: /completed my mission/i }).click();
    await expect(page).toHaveURL(/\/connect$/);

    await page.goto('/translator');
    await page.getByRole('button', { name: /back to connect/i }).click();
    await expect(page).toHaveURL(/\/connect$/);
  });

  test('Home owns /daily-growth in primary navigation', async ({ page }) => {
    await page.goto('/daily-growth');
    await expectHomeNavActive(page);
  });

  test('Connect owns leaf routes in primary navigation', async ({ page }) => {
    for (const route of ['/messages', '/go-connect', '/translator', '/join-partner']) {
      await page.goto(route);
      await expectConnectNavActive(page);
    }
  });

  test('secondary pages hide primary nav', async ({ page }) => {
    for (const route of ['/profile', '/settings', '/subscription', '/trust-center']) {
      await page.goto(route);
      await expectPrimaryNavHidden(page);
    }
  });
});
