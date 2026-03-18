# Test Examples — Worked Reference

Copy-paste ready examples for each domain. Each demonstrates the mocking patterns and testing conventions from SKILL.md.

---

## 1. E2E Component Test: Daily Growth Card

Tests the morning phase of the daily loop — story display, action card, and phase transition.

```typescript
// e2e/tests/daily-growth-morning.spec.ts
import { test, expect } from '@playwright/test';
import { mockPeterRoutes } from '../helpers/mock-peter';
import { mockUserInsights, mockDailyEntries } from '../helpers/mock-supabase';

test.describe('Daily Growth — Morning Phase', () => {
  test.beforeEach(async ({ page }) => {
    await mockPeterRoutes(page);
    await mockUserInsights(page, { onboarding_day: 3, skill_tree_unlocked: false });
    await mockDailyEntries(page, null); // No entry yet — morning phase
  });

  test('shows Peter morning story with day counter', async ({ page }) => {
    await page.goto('/daily-growth');

    // Day counter reflects onboarding_day
    await expect(page.locator('text=Day 3 of 14')).toBeVisible({ timeout: 10_000 });

    // Morning badge visible
    await expect(page.locator('span:has-text("Morning")').first()).toBeVisible();

    // Peter's story loaded (from mock)
    await expect(page.locator('text=Alex noticed Sam')).toBeVisible({ timeout: 10_000 });

    // Action card is present
    await expect(page.locator('text=Today\'s Action')).toBeVisible();
  });

  test('CTA button advances to evening phase', async ({ page }) => {
    await page.goto('/daily-growth');

    const cta = page.locator('button:has-text("Got it — I\'ll try this today")');
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await cta.click();

    // Evening phase appears
    await expect(page.locator('span:has-text("Evening")').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('textarea[placeholder="How did it go today?"]')).toBeVisible();
  });

  test('solo user sees no partner-related content in morning', async ({ page }) => {
    await page.goto('/daily-growth');
    await expect(page.locator('text=Day 3 of 14')).toBeVisible({ timeout: 10_000 });

    // No "your partner" copy when solo
    await expect(page.locator('text=your partner')).not.toBeVisible();
  });
});
```

---

## 2. Unit Test: Safety Crisis Detection (Vitest)

Tests the regex-based crisis detection in `src/lib/safety.ts`. Pure function — no mocking needed.

```typescript
// src/lib/safety.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectCrisisIntent, getCrisisResources, buildCrisisResponse } from './safety';

// Mock OpenAI to prevent real API calls
vi.mock('openai', () => ({
  default: class {
    moderations = { create: vi.fn().mockResolvedValue({ results: [{ flagged: false, categories: {} }] }) };
  },
}));

describe('detectCrisisIntent', () => {
  it('detects self-harm keywords', async () => {
    const result = await detectCrisisIntent('I want to kill myself');
    expect(result.triggered).toBe(true);
    expect(result.types).toContain('self_harm');
  });

  it('detects domestic violence keywords', async () => {
    const result = await detectCrisisIntent('my partner hit me last night');
    expect(result.triggered).toBe(true);
    expect(result.types).toContain('violence_or_abuse');
  });

  it('detects child harm keywords', async () => {
    const result = await detectCrisisIntent('I am afraid they will hurt my child');
    expect(result.triggered).toBe(true);
    expect(result.types).toContain('child_harm');
  });

  it('detects acute distress', async () => {
    const result = await detectCrisisIntent('I am having a panic attack right now');
    expect(result.triggered).toBe(true);
    expect(result.types).toContain('acute_distress');
  });

  it('does NOT trigger on normal relationship content', async () => {
    const result = await detectCrisisIntent('We had a tough conversation about chores');
    expect(result.triggered).toBe(false);
    expect(result.types).toHaveLength(0);
  });

  it('does NOT trigger on empty input', async () => {
    const result = await detectCrisisIntent('');
    expect(result.triggered).toBe(false);
  });

  it('handles multiple crisis types in one message', async () => {
    const result = await detectCrisisIntent('I want to die and my partner hit me');
    expect(result.triggered).toBe(true);
    expect(result.types).toContain('self_harm');
    expect(result.types).toContain('violence_or_abuse');
  });
});

describe('getCrisisResources', () => {
  it('returns US resources by default', () => {
    const resources = getCrisisResources('US');
    expect(resources.length).toBeGreaterThan(0);
    expect(resources.some(r => r.phone === '988')).toBe(true);
  });

  it('returns country-specific resources', () => {
    const ukResources = getCrisisResources('UK');
    expect(ukResources.some(r => r.label === 'Samaritans')).toBe(true);
  });

  it('falls back to US for unknown country', () => {
    const resources = getCrisisResources('XX');
    expect(resources).toEqual(getCrisisResources('US'));
  });
});

describe('buildCrisisResponse', () => {
  it('includes emergency line for the country', () => {
    const response = buildCrisisResponse('UK', ['self_harm']);
    expect(response).toContain('999');
  });

  it('includes violence-specific language for abuse cases', () => {
    const response = buildCrisisResponse('US', ['violence_or_abuse']);
    expect(response).toContain('safety comes first');
  });

  it('stops coaching in the response', () => {
    const response = buildCrisisResponse('US', ['self_harm']);
    expect(response).toContain("can't safely continue normal relationship coaching");
  });
});
```

---

## 3. Unit Test: Morning Parser (Vitest)

Tests parsing of LLM-generated morning stories into story + action components.

```typescript
// src/lib/morning-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseMorningResponse } from './morning-parser';

describe('parseMorningResponse', () => {
  it('splits story and action on "Today\'s Action:" delimiter', () => {
    const raw = `Alex noticed Sam was quiet.\n\nToday's Action: Sit together in silence for 5 minutes.`;
    const { story, action } = parseMorningResponse(raw);
    expect(story).toContain('Alex noticed Sam');
    expect(action).toContain('Sit together in silence');
  });

  it('handles missing action gracefully', () => {
    const raw = 'Just a story with no action section.';
    const { story, action } = parseMorningResponse(raw);
    expect(story).toBe(raw);
    expect(action).toBe('');
  });

  it('trims whitespace from both sections', () => {
    const raw = `  Story with spaces.  \n\n  Today's Action:   Try this.  `;
    const { story, action } = parseMorningResponse(raw);
    expect(story).toBe('Story with spaces.');
    expect(action).toBe('Try this.');
  });
});
```

---

## 4. Integration Test: Daily Session API (Vitest)

Tests the session start API route with a mocked Supabase client.

```typescript
// src/pages/api/daily/session/start.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from './start';

// Mock the auth middleware
vi.mock('@/lib/server/supabase-auth', () => ({
  getAuthedContext: vi.fn(),
}));

import { getAuthedContext } from '@/lib/server/supabase-auth';

const mockSession = {
  id: 'session-uuid-123',
  user_id: 'user-uuid-456',
  session_local_date: '2026-03-15',
  day_index: 3,
  status: 'morning_ready',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/daily/session/start', () => {
  it('returns 401 without auth', async () => {
    (getAuthedContext as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { local_date: '2026-03-15', timezone: 'America/New_York' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('creates new session for new day', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: [mockSession], error: null }),
      }),
    };

    (getAuthedContext as ReturnType<typeof vi.fn>).mockResolvedValue({
      supabase: mockSupabase,
      userId: 'user-uuid-456',
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { local_date: '2026-03-15', timezone: 'America/New_York' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.session).toBeDefined();
  });

  it('returns existing session for same day (idempotent)', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockSession, error: null }),
      }),
    };

    (getAuthedContext as ReturnType<typeof vi.fn>).mockResolvedValue({
      supabase: mockSupabase,
      userId: 'user-uuid-456',
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: { local_date: '2026-03-15', timezone: 'America/New_York' },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.reused).toBe(true);
    expect(data.session.id).toBe(mockSession.id);
  });

  it('rejects non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
```

---

## 5. E2E Test: Complete Onboarding Flow

Tests the full user journey from first visit through onboarding to dashboard.

```typescript
// e2e/tests/onboarding-full-flow.spec.ts
import { test, expect } from '@playwright/test';
import { mockPeterRoutes } from '../helpers/mock-peter';

test.describe('Complete Onboarding Journey', () => {
  test.beforeEach(async ({ page }) => {
    await mockPeterRoutes(page);
  });

  test('new user: onboarding → 5 turns → dashboard redirect', async ({ page }) => {
    await page.goto('/onboarding-flow');

    // Step 1: Peter's welcome
    await expect(page.locator('text=Hey there!')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Peter 🦦')).toBeVisible();

    // Step 2: Complete 5-turn conversation
    const responses = [
      'My name is Jordan',
      'We argue about money sometimes',
      'Last fight was about a surprise purchase',
      'I tend to shut down and need space',
      'My partner shows love through quality time together',
    ];

    for (let i = 0; i < responses.length; i++) {
      await page.locator('textarea').fill(responses[i]);
      await page.locator('form button[type="submit"]').click();

      if (i < responses.length - 1) {
        // Wait for Peter's response before next turn
        await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });
      }
    }

    // Step 3: Completion message and redirect
    await expect(
      page.locator('text=Taking you to your dashboard...')
    ).toBeVisible({ timeout: 10_000 });

    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('progress indicators advance through turns', async ({ page }) => {
    await page.goto('/onboarding-flow');
    await expect(page.locator('text=Hey there!')).toBeVisible({ timeout: 10_000 });

    // Initially: unfilled progress dots
    const unfilledDots = page.locator('.rounded-full.bg-gray-200');
    await expect(unfilledDots.first()).toBeVisible();

    // After first response: at least one filled dot
    await page.locator('textarea').fill('My name is Taylor');
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator('textarea')).toBeEnabled({ timeout: 8_000 });
    await expect(page.locator('.rounded-full.bg-teal-400')).toBeVisible();
  });
});
```

---

## 6. E2E Test: API Reliability (No Browser)

Tests API idempotency and race conditions using Playwright's `request` fixture.

```typescript
// e2e/tests/api-daily-session.spec.ts
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

function readAuthToken(): string {
  const authFile = path.join(__dirname, '..', '.auth', 'user.json');
  const raw = fs.readFileSync(authFile, 'utf-8');
  const state = JSON.parse(raw);

  for (const origin of state.origins || []) {
    for (const entry of origin.localStorage || []) {
      if (!entry.name.includes('-auth-token')) continue;
      try {
        const parsed = JSON.parse(entry.value);
        if (parsed.access_token) return parsed.access_token;
      } catch { /* continue */ }
    }
  }
  throw new Error('No auth token found');
}

test.describe('Session API Reliability', () => {
  const token = readAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Use far-future dates to avoid collisions
  function futureDate(offset: number): string {
    const d = new Date(Date.UTC(2099, 0, 1 + offset + Math.floor(Math.random() * 365)));
    return d.toISOString().split('T')[0];
  }

  test('idempotent: same-day start returns same session', async ({ request }) => {
    const localDate = futureDate(100);
    const body = { local_date: localDate, timezone: 'UTC', idempotency_key: `idem-${Date.now()}` };

    const first = await request.post('/api/daily/session/start', { headers, data: body });
    expect(first.ok()).toBe(true);
    const firstData = await first.json();

    const second = await request.post('/api/daily/session/start', { headers, data: body });
    expect(second.ok()).toBe(true);
    const secondData = await second.json();

    expect(secondData.session.id).toBe(firstData.session.id);
    expect(secondData.reused).toBe(true);
  });

  test('race: concurrent starts resolve to one session', async ({ request }) => {
    const localDate = futureDate(200);

    const [r1, r2] = await Promise.all([
      request.post('/api/daily/session/start', {
        headers,
        data: { local_date: localDate, timezone: 'UTC', idempotency_key: `race-a-${Date.now()}` },
      }),
      request.post('/api/daily/session/start', {
        headers,
        data: { local_date: localDate, timezone: 'UTC', idempotency_key: `race-b-${Date.now()}` },
      }),
    ]);

    expect(r1.ok()).toBe(true);
    expect(r2.ok()).toBe(true);
    const d1 = await r1.json();
    const d2 = await r2.json();
    expect(d1.session.id).toBe(d2.session.id);
  });
});
```

---

## 7. Unit Test: Personalization (No Clinical Language)

Tests that Peter's output never uses clinical terminology.

```typescript
// src/lib/peterService.test.ts
import { describe, it, expect } from 'vitest';
import { buildPersonalizedPrompt } from './peterService';

const FORBIDDEN_TERMS = [
  'anxious attachment',
  'avoidant attachment',
  'disorganized attachment',
  'trauma',
  'dysregulated',
  'therapeutic',
  'diagnosis',
  'pathology',
  'codependent',
  'narcissist',
];

describe('buildPersonalizedPrompt', () => {
  const profiles = [
    { attachment_style: 'anxious', love_language: 'words-of-affirmation', conflict_style: 'volatile' },
    { attachment_style: 'avoidant', love_language: 'quality-time', conflict_style: 'avoiding' },
    { attachment_style: 'secure', love_language: 'physical-touch', conflict_style: 'validating' },
  ];

  profiles.forEach(profile => {
    it(`never uses clinical language for ${profile.attachment_style} profile`, () => {
      const prompt = buildPersonalizedPrompt(profile, []);
      const promptLower = prompt.toLowerCase();

      for (const term of FORBIDDEN_TERMS) {
        expect(promptLower).not.toContain(term.toLowerCase());
      }
    });
  });

  it('produces different prompts for different attachment styles', () => {
    const anxiousPrompt = buildPersonalizedPrompt(
      { attachment_style: 'anxious', love_language: 'words-of-affirmation', conflict_style: 'volatile' },
      []
    );
    const avoidantPrompt = buildPersonalizedPrompt(
      { attachment_style: 'avoidant', love_language: 'quality-time', conflict_style: 'avoiding' },
      []
    );

    // Prompts should differ — personalization is working
    expect(anxiousPrompt).not.toBe(avoidantPrompt);
  });
});
```
