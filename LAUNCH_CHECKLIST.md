# Sparq Connection Lab — Launch Checklist

> **Goal:** Get the app fully functional for real user testing.
> Repo-first audit refreshed: 2026-03-06
> Note: items below that refer to database existence or deployed services still require live-environment verification.

---

## Status Key
- 🔴 **Blocking** — app crashes or feature completely broken
- 🟡 **Important** — feature exists but won't work correctly
- 🟢 **Working** — confirmed functional
- ⬜ **Nice-to-have** — quality of life, not launch-blocking

---

## 🔴 BLOCKING — Fix Before Any User Testing

### 1. Verify Required Database Tables Exist in the Active Environment

The repo now contains a migration for the core missing tables, but the live environment may still be out of sync. If these tables are absent remotely, the corresponding features will 500.

| Table | Used By | What Breaks |
|-------|---------|-------------|
| `outcome_assessments` | `/api/me/assessment`, `src/pages/assessment.tsx` | Relationship assessment (baseline + Day 14 improvement) |
| `conflict_episodes` | `/api/conflicts/index.ts`, `/api/conflicts/resolve.ts`, `src/pages/conflict-first-aid.tsx` | Conflict First Aid tracking |
| `user_preferences` | `/api/preferences.ts`, `/api/me/memory-settings.ts`, `src/pages/trust-center.tsx` | Trust Center privacy settings, notification prefs, AI memory mode |
| `analytics_events` | `src/lib/server/analytics.ts` → called from almost every API route | Event tracking (fails silently due to try/catch, but data is lost) |

**Repo state:** `supabase/migrations/20260302120000_create_missing_tables.sql` exists.

**Action:** Verify that migration has been applied to the active environment, or apply an equivalent schema update there:

```sql
-- outcome_assessments
CREATE TABLE public.outcome_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone text NOT NULL,  -- 'baseline' | 'day_14' | etc.
  responses jsonb NOT NULL DEFAULT '[]',
  total_score numeric(5,2) NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own assessments" ON public.outcome_assessments
  FOR ALL USING (auth.uid() = user_id);

-- conflict_episodes
CREATE TABLE public.conflict_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity integer NOT NULL DEFAULT 3,
  tool_used text,
  notes text,
  resolved_at timestamptz,
  resolution_notes text,
  started_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conflict_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own episodes" ON public.conflict_episodes
  FOR ALL USING (auth.uid() = user_id);

-- user_preferences
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  insights_visible boolean NOT NULL DEFAULT true,
  personalization_enabled boolean NOT NULL DEFAULT true,
  ai_memory_mode text NOT NULL DEFAULT 'rolling_90_days',
  relationship_mode text NOT NULL DEFAULT 'solo',
  reminder_time text,
  notifications_enabled boolean NOT NULL DEFAULT true,
  timezone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- analytics_events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_props jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own events" ON public.analytics_events
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX analytics_events_user_name_idx ON public.analytics_events (user_id, event_name, created_at DESC);
```

---

### 2. Verify Supabase Schema Matches Code Expectations

All migrations in `supabase/migrations/` before `20260301091500` are **empty placeholder files** — the actual schema was applied directly to the remote database, not through migrations. This means:

- A fresh Supabase project (for staging, testing, or a new dev) will be missing all core tables
- `supabase db reset` will leave you with an empty database

**Action:** Export the full current remote schema and save it as the canonical migration:
```bash
supabase db dump --schema public > supabase/schema_dump.sql
```
Then verify all tables the code references actually exist in the remote DB.

---

### 3. Environment Variables — Confirm `.env.local` Is Set Up

The repo contains a `.env` file with Supabase credentials (not gitignored), but Next.js reads from `.env.local`. Confirm the following are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ujqdnyxdenadpowxrkjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
OPENAI_API_KEY=<your openai key>       # used by /api/date-ideas/generate and /api/peter/*
OPENROUTER_API_KEY=<key if using>      # referenced in peter/chat.ts
```

**Warning:** The `.env` file currently committed to git has real credentials. It should either be deleted or added to `.gitignore` to prevent accidentally committing updated secrets.

---

## 🟡 IMPORTANT — Fix for Features to Work Correctly

### 4. Peter AI — OpenAI / OpenRouter Key

The daily growth loop (`/api/peter/morning`, `/api/peter/chat`) is the **core daily engagement feature**. It requires either:
- `OPENAI_API_KEY` env var (for direct OpenAI calls), or
- `OPENROUTER_API_KEY` env var (for OpenRouter)

Without a valid key, Peter will fail to generate morning stories and evening responses, breaking the primary user loop.

**Check:** Verify which API is configured in `src/pages/api/peter/morning.ts` and `src/pages/api/peter/chat.ts`, and confirm the corresponding env var is in `.env.local`.

---

### 5. Date Ideas Feature — OpenAI Key

`/api/date-ideas/generate` calls OpenAI to generate personalized date ideas. Without a key it will 500.

**Action:** Add `OPENAI_API_KEY` to `.env.local`. If using the Vite-legacy client in `src/lib/api-config.ts`, also add `VITE_OPENAI_API_KEY` — but prefer moving to `process.env.OPENAI_API_KEY` server-side.

---

### 6. `daily_sessions` Table — Confirm Exists

The two real migration files (`20260301` and `20260302`) modify a `daily_sessions` table by adding columns — but only if it already exists. If the remote DB doesn't have this table, the migrations will silently no-op and the entire daily session API (`/api/daily/session/*`) will fail.

**Action:** Run this query in Supabase SQL editor to confirm:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'daily_sessions' AND table_schema = 'public';
```
Expected columns: `id`, `user_id`, `session_local_date`, `day_index`, `status`, `morning_story`, `morning_action`, `morning_viewed_at`, `evening_reflection`, `evening_peter_response`, `evening_completed_at`.

---

### 7. New Pages Not Linked From Navigation

Three new feature pages exist but are not reachable from the bottom nav or any dashboard link:

| Page | Route | Entry Point Needed |
|------|-------|--------------------|
| `src/pages/assessment.tsx` | `/assessment` | Dashboard card or Profile page link |
| `src/pages/conflict-first-aid.tsx` | `/conflict-first-aid` | Dashboard "SOS" card or Tools menu |
| `src/pages/trust-center.tsx` | `/trust-center` | Settings page or Profile |

**Action:** Add navigation links to at least one of: the bottom nav, dashboard, or profile/settings pages.

---

### 8. Onboarding Flow — Verify Completion State

The active onboarding flow is implemented directly in `src/pages/onboarding-flow.tsx`; the deprecated hook file is `src/hooks/useOnboarding.ts.deprecated`.

Confirm:
- The onboarding completion flag is persisted to the `profiles` table so users aren't re-shown onboarding on every login
- The Day 14 transition and skill-tree unlock logic behave as intended

---

### 9. Partner Connection Flow

The partner linking feature (`/join-partner`) is implemented but needs end-to-end verification:
- Invitation emails require the `send-partner-invite` Edge Function to be deployed and an email provider configured
- Check `supabase/functions/send-partner-invite/` is deployed to the remote project
- Without this, partner invites are generated but never delivered

**Action:**
```bash
supabase functions deploy send-partner-invite
```

---

### 10. Subscription Tier Gating

`SubscriptionProvider` currently uses `localStorage` — subscription state is not persisted to the database. This means:
- Clearing browser storage resets users to the free tier
- No server-side enforcement of tier limits

For a real launch, this is a trust issue (users could manually set themselves to `ultimate`). However, if you're not charging yet, this is acceptable for testing.

---

## 🟢 CONFIRMED WORKING

- **Authentication** — `AuthProvider` correctly wired in `_app.tsx`. Login, register, logout all functional.
- **Subscription context** — `SubscriptionProvider` correctly wrapped in `_app.tsx`. `useSubscription()` works in all pages.
- **Next.js routing** — All pages use `next/link` and `next/router`. No `react-router-dom` usage anywhere.
- **Bottom navigation** — Correctly uses Next.js `Link` and `useRouter`.
- **Vercel config** — `vercel.json` is correctly set to `"framework": "nextjs"` with proper build command.
- **All npm dependencies** — `@tanstack/react-query`, `framer-motion`, `sonner`, `@supabase/supabase-js`, all Radix UI components, `mem0ai` — all installed in `package.json`.
- **API auth middleware** — `getAuthedContext()` in `src/lib/server/supabase-auth.ts` correctly validates Bearer tokens.
- **Assessment page UI** — Complete and polished (Hendrick scale, animated carousel, score submission).
- **Conflict First Aid UI** — Complete (reset protocol, repair starters, episode tracking).
- **Trust Center UI** — Complete (privacy toggles, AI memory window, relationship mode).
- **E2E test framework** — Playwright configured correctly with auth state reuse.

---

## ⬜ NICE-TO-HAVE (Post-Launch)

### Technical Debt to Address Eventually

1. **Mem0 is mocked** — `src/lib/mem0.ts` uses an in-memory Map. The `mem0ai` package is installed. Wire up `src/lib/server/memory.ts` with a real `MEM0_API_KEY` env var for persistent AI relationship memory.

2. **Duplicate auth files** — `src/lib/auth/` directory is unused refactored code. Can be deleted once stable. Multiple `ProtectedRoute` components in different locations — consolidate to one.

3. **Legacy Vite env vars** — `src/lib/api-config.ts` and `src/integrations/supabase/client.ts` use `import.meta.env.VITE_*`. These work locally but are fragile. Migrate to `process.env.NEXT_PUBLIC_*`.

4. **Schema migration history** — Replace placeholder migrations with real SQL so the database can be recreated from scratch. Essential before adding team members or creating a staging environment.

5. **Subscription persistence** — Move subscription state from `localStorage` to a `subscriptions` table if you plan to charge users.

6. **Admin KPIs endpoint** — `/api/admin/kpis.ts` returns growth metrics. Ensure it's protected by an admin role check (verify it checks `is_admin()` or a similar guard before shipping).

7. **CSP headers** — `vercel.json` has `'unsafe-eval'` and `'unsafe-inline'` in the script-src policy. Tighten these before production launch.

---

## Launch Order of Operations

```
1. Verify or apply the existing migration for the 4 required DB tables (Step 1 above)
2. Verify daily_sessions table exists with correct columns (Step 6)
3. Set up .env.local with all required API keys (Steps 3, 4, 5)
4. Deploy send-partner-invite edge function (Step 9)
5. Add navigation links to the 3 new feature pages (Step 7)
6. Run: npm run dev → manually test auth → daily growth loop → partner invite
7. Run: npx playwright test (e2e tests)
8. Deploy to Vercel
```

---

*Generated by codebase audit on 2026-03-02. Update this file as items are completed.*
