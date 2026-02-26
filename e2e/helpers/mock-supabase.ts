import type { Page } from '@playwright/test';

// Checks if the request is a Supabase .single() call
// (PostgREST .single() sends Accept: application/vnd.pgrst.object+json)
function isSingleRequest(headers: Record<string, string>): boolean {
  return (headers['accept'] ?? '').includes('pgrst.object');
}

// Mock the user_insights table reads.
// Writes (POST/PATCH/DELETE) are passed through to real Supabase.
export async function mockUserInsights(
  page: Page,
  overrides: Record<string, unknown> = {}
) {
  const defaults: Record<string, unknown> = {
    onboarding_day: 1,
    skill_tree_unlocked: false,
    attachment_style: null,
    love_language: null,
    conflict_style: null,
    emotional_state: 'neutral',
    last_analysis_at: null,
  };
  const row = { ...defaults, ...overrides };

  await page.route(/\/rest\/v1\/user_insights/, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    const single = isSingleRequest(route.request().headers());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: single ? JSON.stringify(row) : JSON.stringify([row]),
    });
  });
}

// Mock the daily_entries table reads.
// Pass null to simulate "no entry for today" (morning phase).
// Pass an entry object to simulate morning-viewed or evening-complete state.
export async function mockDailyEntries(
  page: Page,
  entry: Record<string, unknown> | null = null
) {
  await page.route(/\/rest\/v1\/daily_entries/, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    if (entry === null) {
      // Simulate empty result for .single() — Supabase returns 406 with PGRST116
      await route.fulfill({
        status: 406,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST116',
          details: 'The result contains 0 rows',
          hint: null,
          message: 'JSON object requested, multiple (or no) rows returned',
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(entry),
      });
    }
  });
}

// Mock the skill_progress table reads (always returns an array).
// Writes are passed through.
export async function mockSkillProgress(
  page: Page,
  rows: Array<{ track: string; level: string; completed_at: string | null }> = []
) {
  await page.route(/\/rest\/v1\/skill_progress/, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rows),
    });
  });
}
