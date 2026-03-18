---
name: sparq-testing
description: "Testing standards, patterns, and Sparq-specific edge cases for the Sparq Connection codebase. Use this skill whenever: writing tests for new features, debugging test failures, setting up test infrastructure, creating mock data, testing psychology-based content personalization, testing partner sync scenarios, testing streak/daily-reset logic, or when Claude should be writing tests alongside new feature code. ALWAYS write tests when building new features — don't wait to be asked."
---

# Sparq Connection — Testing Guide

## 1. Testing Stack

### Current Infrastructure

| Tool | Purpose | Status |
|---|---|---|
| **Playwright** (`@playwright/test ^1.58`) | E2E browser tests | Installed, configured, 7 test suites |
| **Vitest** | Unit/integration tests | **NOT installed — add when needed** |
| **React Testing Library** | Component tests | **NOT installed — add when needed** |

### Playwright Config (`playwright.config.ts`)

- Test directory: `e2e/`
- Auth setup: `e2e/auth.setup.ts` → saves `e2e/.auth/user.json`
- All tests depend on `setup` project (auth runs first)
- Browser: Desktop Chrome only
- Web server: auto-starts `npm run dev` on port 3000
- Retries: 2 in CI, 0 locally
- Traces: on first retry; screenshots: on failure only

### Scripts (from `package.json`)

```bash
npm run test:e2e          # Run all Playwright tests
npm run test:e2e:ui       # Interactive Playwright UI mode
npm run test:e2e:debug    # Debug mode with step-through
npm run setup:test-user   # Create test user via script
```

### Adding Unit Tests (when needed)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Then create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

Add to `package.json` scripts: `"test": "vitest"`, `"test:ci": "vitest run"`

---

## 2. Test Philosophy

### Core Principles

1. **Every new feature ships with tests.** Don't wait to be asked — write them alongside the code.
2. **Test behavior, not implementation.** Write tests from the user's perspective:
   - Good: "when user completes daily check-in, celebration screen appears"
   - Bad: "when `setPhase('completed')` is called, `phase` state equals 'completed'"
3. **Relationship content has unique edge cases** — generic app testing misses them. See §4.
4. **Mock external services, test integration logic.** Supabase, LLM APIs, and OpenAI Moderation should be mocked, but test that the mocking-to-UI pipeline works end to end.
5. **E2E tests are the primary safety net** until unit tests are added. Prioritize E2E coverage for critical user flows.

### Test Pyramid for Sparq

| Layer | What to Test | Framework |
|---|---|---|
| **E2E** (current focus) | Complete user journeys, API reliability | Playwright |
| **Integration** (add next) | API routes, Supabase queries, hook logic | Vitest |
| **Unit** (add next) | Pure functions: safety.ts, morning-parser.ts, product.ts | Vitest |
| **Component** (add next) | Interactive UI: forms, state transitions, a11y | Vitest + RTL |

---

## 3. What to Test by Domain

### Components
- Renders correct content for each state (loading, empty, active, error)
- User interactions trigger expected outcomes (clicks, form submissions)
- Loading states always show `PeterLoading` — never bare spinners
- Accessibility: focus management after modals, ARIA labels on icon buttons, 44px touch targets
- Peter avatar shows correct mood for context (morning/afternoon/evening/celebrating)

### Daily Loop
- Full cycle: session start → morning story display → "Got it" click → evening chat → 2+ messages → Complete Day → celebration
- Idempotent session creation: duplicate `POST /api/daily/session/start` returns same session
- Concurrent race: two simultaneous starts resolve to one session
- Double completion: second complete call is idempotent, doesn't increment day_index
- Timer/phase transitions: morning → evening → completed state machine
- Partner sharing: completion triggers partner synthesis when both done

### Skill Tree
- Locked gate shows when `discovery_day < 15`
- 5 tracks visible when unlocked
- Level progression: Basic available → Advanced locked until Basic complete → Expert locked until Advanced complete
- XP calculation via `award_skill_xp()` RPC respects level thresholds (100 = Advanced, 300 = Expert)
- Celebration on level completion

### Psychology Engine
- Question selection respects user's inferred traits (attachment style, conflict style)
- Content personalization produces different output for different profiles
- **No clinical language leaks through**: never "anxious attachment," "trauma," "dysregulated" — only natural-language alternatives (see sparq-peter skill)
- Safety system: crisis keywords trigger resource display, not coaching
- Morning stories adapt to day index and relationship concepts

### Partner Sync
- Single user (no partner): all partner-referencing UI handles gracefully
- Partner linked but hasn't completed onboarding: don't show "your partner's reflection"
- Both partners active: partner synthesis appears after both complete
- Partner removed mid-journey: graceful degradation
- Realtime presence: partner online/offline status via Supabase channels

### Auth
- Login → dashboard redirect
- Signup → profile creation → onboarding flow → dashboard
- Logout → login redirect
- Partner invitation via link (`/join-partner?code=XXX`)
- Protected routes redirect unauthenticated users

### API Routes / Edge Functions
- Request validation (missing fields, bad types)
- Auth verification: 401 without token, scoped results with token
- Error responses are JSON with `{ error: string }`
- LLM API failures return graceful fallbacks
- Edge Functions: CORS preflight, service role operations

---

## 4. Sparq-Specific Edge Cases

These are the relationship-app-specific scenarios that generic testing would miss:

### Solo User (No Partner)
- Dashboard hides partner synthesis card
- "Invite your partner" CTA is visible
- HeartbeatButton ("Thinking of you") is hidden or disabled
- Daily completion skips partner synthesis trigger
- All copy referencing "your partner" has fallback for solo mode

### Relationship Stage Personalization
- New user (Day 1): sees introductory content, simpler reflection prompts
- Mid-journey (Day 7): sees deeper content, more nuanced follow-ups
- Post-graduation (Day 15+): sees Skill Tree, not daily loop gate

### Attachment Style Personalization
- **Anxious** profile: receives more reassurance copy ("I'm not going anywhere")
- **Avoidant** profile: receives shorter, lower-pressure copy ("Take your time")
- **Secure** profile: receives balanced, growth-oriented copy
- Verify that different profiles produce different Peter responses

### Content Referencing Partner
- "Your partner completed their session" — only show when partner actually completed
- Partner synthesis: only generate when BOTH partners have completed that day
- "Your partner is online" — only show when realtime presence confirms it
- Partner hasn't completed onboarding: don't leak incomplete state

### Daily Reset / Timezone
- Midnight boundary: session for "today" uses user's local timezone, not UTC
- `session_local_date` unique constraint prevents duplicate sessions per day
- User changes timezone mid-journey: next session uses new timezone
- Streak calculation: consecutive days based on `session_local_date`, not `created_at`

### Streak Edge Cases
- Streak across timezone changes (e.g., travel from EST to PST)
- Long gap: user returns after 2+ weeks — streak resets, welcome-back greeting
- Streak milestones trigger correct celebration tier (3/7/14/30 days)
- Streak survives server clock drift (uses client-provided local_date)

### Insufficient Data
- New user (< 7 days): weekly insights card shows "building" state, not empty
- No trait data yet: personalization falls back to generic content
- Relationship score with < 3 data points: shows "building" state with encouraging copy
- Skill Tree XP at 0: shows "Start" badge, not "0 XP" or empty

### Safety System
- Crisis keywords ("kill myself", "domestic violence") trigger resource display
- Safety response includes country-specific hotline numbers
- Peter stops coaching and shows resources — doesn't continue normal conversation
- Moderation API failure falls back to regex patterns
- Non-English input with English crisis keywords still triggers

---

## 5. Mocking Patterns

### E2E: Playwright Route Mocking (current approach)

Existing helpers in `e2e/helpers/`:

```typescript
// mock-peter.ts — Mocks all Peter AI API routes
import { mockPeterRoutes } from '../helpers/mock-peter';
await mockPeterRoutes(page);

// mock-supabase.ts — Mocks Supabase PostgREST reads
import { mockUserInsights, mockDailyEntries, mockSkillProgress } from '../helpers/mock-supabase';
await mockUserInsights(page, { onboarding_day: 5, skill_tree_unlocked: false });
await mockDailyEntries(page, null); // Simulates no entry (morning phase)
await mockSkillProgress(page, [{ track: 'communication', level: 'basic', completed_at: '...' }]);
```

Key patterns:
- Mock GETs only — let writes pass through to real Supabase
- Use `isSingleRequest()` to detect PostgREST `.single()` calls (Accept header check)
- Return 406 with `PGRST116` code for empty `.single()` results

### E2E: API-Level Tests

For testing API reliability without a browser (see `07-daily-session-reliability.spec.ts`):
- Read auth token from `e2e/.auth/user.json`
- Use `request.post()` / `request.get()` directly
- Use future dates to avoid conflicts with real data
- Test idempotency, race conditions, double completion

### Unit/Integration: Supabase Client Mock (for Vitest)

```typescript
// src/test/mocks/supabase.ts
export function createMockSupabase(overrides: Record<string, unknown> = {}) {
  const mockFrom = (table: string) => ({
    select: () => mockFrom(table),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    upsert: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => mockFrom(table),
    single: () => ({ data: overrides[table] ?? null, error: null }),
    maybeSingle: () => ({ data: overrides[table] ?? null, error: null }),
    order: () => mockFrom(table),
    ...overrides,
  });
  return { from: mockFrom, rpc: vi.fn(), channel: vi.fn() };
}
```

### Unit/Integration: LLM Response Mocks

```typescript
// src/test/mocks/llm.ts
export const mockMorningStory = {
  story: 'Alex noticed Sam had been quieter than usual...',
  action: 'Find one moment today to sit with your partner in silence.',
};

export const mockChatResponse = {
  message: "Thanks for sharing that with me 🦦 I hear you.",
};

export const mockTraitAnalysis = {
  attachment_style: 'secure',
  love_language: 'time',
  conflict_style: 'validating',
};
```

### Unit/Integration: Time Mocking

```typescript
// For streak/daily reset testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should reset streak after midnight in user timezone', () => {
  // Set time to 11:59 PM EST
  vi.setSystemTime(new Date('2026-03-15T23:59:00-05:00'));
  // ... assert streak is still active

  // Advance to 12:01 AM EST (next day)
  vi.setSystemTime(new Date('2026-03-16T00:01:00-05:00'));
  // ... assert new session_local_date
});
```

---

## 6. Test Naming & Organization

### File Location

| Test Type | Location | Pattern |
|---|---|---|
| E2E | `e2e/tests/` | `NN-feature-name.spec.ts` (numbered for run order) |
| E2E helpers | `e2e/helpers/` | `mock-*.ts` |
| Unit/Integration | Co-located with source | `Component.test.tsx` next to `Component.tsx` |
| Test fixtures | `src/test/fixtures/` | `mock-*.ts` |
| Test setup | `src/test/setup.ts` | Vitest globals, RTL matchers |

### Naming Convention

```typescript
test.describe('Daily Growth Loop', () => {
  test('morning phase: shows story and action card', async ({ page }) => { ... });
  test('morning → evening transition on "Got it" click', async ({ page }) => { ... });
  test('completing a day shows celebration screen', async ({ page }) => { ... });
});
```

Pattern: `describe("[Feature/Component]")` → `test("[expected behavior] [when condition]")`

### Existing E2E Test Suites

| File | Coverage |
|---|---|
| `01-auth.spec.ts` | Login, redirect, logout |
| `02-onboarding.spec.ts` | Peter welcome, 5-turn conversation, progress dots, dashboard redirect |
| `03-daily-growth.spec.ts` | Morning phase, morning→evening transition, evening chat, day completion |
| `04-skill-tree.spec.ts` | Locked gate, 5 tracks, level progression, node panel, completion |
| `05-dashboard.spec.ts` | Dashboard sections, navigation, partner invite |
| `06-safety-trust.spec.ts` | Conflict First Aid routing, Trust Center access |
| `07-daily-session-reliability.spec.ts` | API idempotency, race conditions, double completion |

---

## 7. CI Rules

### Current State
- No CI pipeline configured (no `.github/workflows/`)
- Tests run manually via `npm run test:e2e`

### Recommended Setup

```yaml
# .github/workflows/test.yml
name: Tests
on: [pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - run: npm run test:ci
```

### Coverage Thresholds (recommended progression)

| Phase | Coverage | When |
|---|---|---|
| Start | 40% | After adding Vitest + first unit tests |
| Month 1 | 60% | Core flows covered |
| Month 3 | 75% | Safety, personalization, partner sync covered |

### What Must Pass Before Merge

- All E2E tests pass
- Unit tests pass (when added)
- No lint errors (`npm run lint`)
- Safety system tests always pass — crisis detection is never allowed to regress

---

## Cross-Skill References

- **For component patterns** (what to render, loading states): see `sparq-ui` skill
- **For Peter's personality and copy**: see `sparq-peter` skill
- **For database schema and RLS**: see `sparq-db` skill
- **For architecture and API routes**: see `sparq-architecture` skill
- **For psychology content and safety**: see `sparq-psychology` skill

> Worked test examples: see `references/test-examples.md`
> Reusable fixtures: see `references/test-fixtures.md`
