# Sparq Connection Lab — Launch Checklist

> Goal: make the solo-first beta path safe and believable for real user testing.
> Repo-first refresh: 2026-03-30
> Source of truth: `SPARQ_MASTER_SPEC.md`

---

## Status Key
- 🔴 Blocking — do not invite real users yet
- 🟡 Important — beta can run, but trust or clarity is weaker
- 🟢 Ready — checked in repo and matches the supported beta path

---

## Supported Beta Path

These are the routes and flows this checklist assumes:
- `/login`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/daily-growth`

These older routes are now quarantined and should not be used for beta testing:
- `/auth` -> redirects to `/login`
- `/daily-questions` -> redirects to `/daily-growth`
- `/daily-activity` -> redirects to `/daily-growth`

---

## 1. Repo Checks You Can Run Locally

### 🔴 1.1 Beta readiness script

Run:

```bash
node scripts/verify-beta-readiness.mjs
```

What it checks:
- required env keys are documented in `.env.example`
- supported beta routes exist
- launch-blocker tables are referenced in `supabase/schema.sql` or `supabase/migrations/`
- quarantined legacy routes redirect to the supported beta path

### 🟢 1.2 Lint and focused beta-path tests

Run:

```bash
npm run lint
PLAYWRIGHT_PORT=3100 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium
```

Expected result:
- lint passes with only known pre-existing warnings outside this phase
- focused primary-path specs pass together

### 🟢 1.3 Environment contract

The current beta path expects these keys:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_GOOGLE_API_KEY=
```

Optional local beta helpers:

```env
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
PLAYFUL_BETA_COHORT_CUTOFF=
```

Notes:
- use `.env.local` for local Next.js work
- `.env.example` is current
- do not treat old `VITE_*` keys as part of the beta contract

---

## 2. Live Environment Checks Still Required

These cannot be proven from repo state alone.

### Latest live verification: 2026-03-31

Evidence files:
- [.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md)
- [.planning/phases/04-production-blocker-fixes/04-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/04-production-blocker-fixes/04-LIVE-EVIDENCE.md)
- [.planning/phases/05-live-onboarding-determinism/05-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/05-live-onboarding-determinism/05-LIVE-EVIDENCE.md)
- [.planning/phases/06-controlled-beta-ops/06-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/06-controlled-beta-ops/06-LIVE-EVIDENCE.md)
- [.planning/phases/07-live-onboarding-reliability-recovery/07-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/07-live-onboarding-reliability-recovery/07-LIVE-EVIDENCE.md)
- [.planning/phases/08-beta-ops-signal-cleanup/08-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/08-beta-ops-signal-cleanup/08-LIVE-EVIDENCE.md)
- [.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-LIVE-EVIDENCE.md)
- [.planning/phases/10-onboarding-activation-fail-closed/10-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/10-onboarding-activation-fail-closed/10-LIVE-EVIDENCE.md)
- [.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-LIVE-EVIDENCE.md](/Users/chris/sparq-connection-lab/.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-LIVE-EVIDENCE.md)

Current result:
- live schema: verified
- deployed env keys: verified for core Supabase and Peter AI keys
- public signup route: fixed in production
- onboarding recommendation handoff: dependable again in production on the primary signup-driven path
- full solo-first path to Day 1 completion: re-proven in production for the primary fresh-signup path
- controlled beta ops layer: re-confirmed in production and writing to `analytics_events`
- false-positive `journey_start_lookup` error signal: cleaned up on the primary successful run
- false-positive `route_change` error signal during register redirect: cleaned up on the latest successful run
- onboarding confirmation handoff: now fail-closed for activation and profile persistence while still passing the primary live path
- playful MVP slice: live on production, additive on dashboard and daily-growth, and fail-soft under playful endpoint failure
- playful rollout gate: live in production through `PLAYFUL_BETA_COHORT_CUTOFF`

### 🔴 2.1 Confirm the active Supabase project has the launch-blocker tables

Required tables:
- `daily_sessions`
- `user_preferences`
- `analytics_events`
- `outcome_assessments`
- `conflict_episodes`

Quick checks:

```bash
SUPABASE_ACCESS_TOKEN=... npx supabase inspect db tables --linked
SUPABASE_ACCESS_TOKEN=... npx supabase migration list
```

If the linked project is missing any of those tables, core beta features will fail.

Status on 2026-03-30:
- verified present in the linked project
- proof captured in the Phase 3 live evidence file

### 🔴 2.2 Confirm `daily_sessions` matches the beta API

The core loop depends on `/api/daily/session/*`.

Minimum expected fields:
- `id`
- `user_id`
- `session_local_date`
- `day_index`
- `status`
- `morning_story`
- `morning_action`
- `morning_viewed_at`
- `evening_reflection`
- `evening_peter_response`
- `evening_completed_at`

Recommended live check:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'daily_sessions'
ORDER BY ordinal_position;
```

Status on 2026-03-30:
- verified by live REST query selecting the required beta fields

### 🔴 2.3 Confirm real AI keys exist in the deployed environment

The daily loop depends on Peter.

Required:
- `OPENAI_API_KEY` or a working `OPENROUTER_API_KEY`

Without one of those keys:
- morning story generation can fail
- evening reflection replies can fail
- the core beta loop will feel broken

Status on 2026-03-30:
- `OPENAI_API_KEY` present in production
- `OPENROUTER_API_KEY` present in production
- production env list did not show `NEXT_PUBLIC_GOOGLE_API_KEY`

### 🟡 2.4 Confirm partner invites only if you plan to test them

Solo-first beta does not require partner linking.

If you do want to test invites:
- deploy `supabase/functions/send-partner-invite`
- confirm email delivery is configured

If not:
- keep partner testing out of the first beta round

### 🟡 2.5 Confirm controlled-beta ops evidence is flowing

For controlled beta, operators should be able to see:
- `beta_feedback_submitted`
- `beta_primary_signup_register_success`
- `beta_primary_dashboard_arrived`
- `beta_primary_daily_growth_started`
- `beta_primary_day1_completed`
- `beta_primary_path_error`

Evidence on 2026-03-31:
- Phase 7 live verification confirmed those events are writing to `analytics_events` on a fresh successful production walkthrough
- confirmed again:
  - `beta_primary_signup_register_success`
  - `beta_primary_onboarding_completed`
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`
- Phase 8 live verification confirmed the noisy `journey_start_lookup` false-positive row no longer appears on the repaired successful run
- Phase 9 live verification confirmed the noisy `route_change` false-positive row no longer appears on the repaired successful run
- current residual follow-up is smaller:
  - successful runs can still emit duplicate or misattributed daily-loop analytics, which affects operator signal quality more than user flow stability
- Phase 15 live verification confirmed the playful events are also writing separately:
  - `playful_daily_spark_viewed`
  - `playful_daily_spark_tried`
  - `playful_daily_spark_swapped`
  - `playful_daily_spark_sent`
  - `playful_favorite_us_viewed`
  - `playful_favorite_us_saved`
  - `playful_favorite_us_sent`

---

## 3. Known Beta Decisions

### 🟢 3.1 Solo-first is the supported testing stance

Beta success means one person can:
- sign up
- finish onboarding
- use the daily loop
- get value without partner adoption

### 🟡 3.2 Subscription enforcement is still light

Current subscription state is not hardened for paid launch.

That is acceptable for beta testing if:
- you are not charging yet
- you treat monetization as out of scope for this round

### 🟡 3.3 Legacy auth and module drift still exist outside the core beta path

Core flows use:
- `@/lib/auth-context`
- `@/lib/supabase`

Older modules still exist in the repo for non-core surfaces, but they should not guide new beta work.

### 🟢 3.4 Playful connection MVP is optional and fail-soft

The new playful MVP surfaces:
- `Daily Spark` on `/dashboard`
- `Favorite Us` on the `/daily-growth` home

They are intentionally not part of the critical signup, onboarding, or Day 1 gating logic.

If playful prompts fail to load:
- dashboard still shows the core CTA
- daily-growth still shows the normal morning home state

Phase 15 live result:
- this behavior is now proven in production with a forced `/api/playful/today` outage during live browser verification

### 🟢 3.5 Playful slice is safe for limited controlled-beta exposure

Current recommendation:
- expose only to the controlled-beta cohort first
- keep the slice limited to:
  - dashboard
  - daily-growth home
- do not widen into more playful features yet

Phase 16 live result:
- pre-cutoff cohort users still see the playful slice
- post-cutoff users stay on the serious core only
- fresh post-cutoff signup still completes the primary path through Day 1
- qualitative feedback on the current playful placement was warm, optional, and non-intrusive
- current decision:
  - keep as is for the controlled-beta cohort
  - gather a larger real-user sample before broader exposure or expansion

Rollback conditions:
- two consecutive fresh production primary-path failures after the playful rollout
- any case where dashboard or daily-growth no longer loads the serious core when `/api/playful/today` fails
- a sustained spike in `beta_primary_path_error` tied to dashboard or daily-growth after rollout

---

## 4. Ready-for-Beta Exit Bar

Do not invite real users until all of these are true:
- `node scripts/verify-beta-readiness.mjs` passes
- lint passes at the same baseline as this phase
- focused dashboard and daily-loop Playwright specs pass
- active Supabase project contains the required launch-blocker tables
- deployed environment has working AI keys
- a manual solo-first test from signup to dashboard to daily completion succeeds

### Current live beta verdict

The core solo-first beta path now has the minimum ops layer required for controlled live testing.

Residual notes after Phase 9:
- the primary fresh-signup production walkthrough is still proven end to end through Day 1
- the beta ops error stream is cleaner after both the `journey_start_lookup` and `route_change` false-positive cleanups
- the onboarding confirmation handoff is now fail-closed instead of advancing on silent write failure
- the next likely operator-facing follow-up is analytics signal quality inside the daily loop, not a blocker on the core user path
- the secondary login-entry fallback live spec is still more variable than the main path and should be treated as follow-up hardening, not as the main beta gate
