# Phase 15 Live Evidence

Date: 2026-03-31
Phase: Playful Layer Live Verification And Rollout Guardrails
Base URL: `https://sparq-connection-lab.vercel.app`
Primary references:
- `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
- `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-01-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-02-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-03-SUMMARY.md`

## Goal

Safely validate the live playful connection slice in production without weakening the proven primary signup-driven path.

This phase specifically proves:
- the playful MVP is deployed live
- the playful slice remains additive and optional
- the primary signup-driven path still works end to end
- the intended playful surfaces work live:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- the playful slice fails soft when its endpoint is unavailable
- playful analytics are visible and distinguishable from the core funnel
- rollout guardrails can now be defined from real production evidence

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in:
    - `src/components/PeterAvatar.tsx`
    - `src/components/journey/JourneyContentView.tsx`
    - `src/lib/auth-context.tsx`
- `npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium`
  - Passed: `12/12`

## Production Deployment

- Deployment: `dpl_3xadJ1vxZUsDEkfymfzJfXGEqWYN`
- Ready URL: `https://sparq-connection-ontc3nbu8-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

## Live Verification Summary

### 1. Primary path regression check
- Command:
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - `PASS`
- Exact outcome:
  - `/signup` still returns `HTTP/2 307`
  - the fresh production signup-driven walkthrough still passes end to end through Day 1 completion
- Evidence:
  - `artifacts/live-beta/2026-03-30/live-beta-evidence.json`
- Fresh verified user:
  - `live-beta-1774993199474@sparq.app`

### 2. Dashboard playful surface
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/15-live-playful-verification.spec.ts --project=chromium --workers=1 --no-deps -g "dashboard and daily-growth playful surfaces work in production"`
- Result:
  - `PASS`
- Exact outcome:
  - `Daily Spark` is visible on dashboard
  - `Try this` works
  - `Another one` changes the live prompt
  - `Copy text` works
- Evidence:
  - `artifacts/live-beta/2026-03-31/live-playful-surfaces.json`

### 3. Daily-growth playful surface
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/15-live-playful-verification.spec.ts --project=chromium --workers=1 --no-deps -g "dashboard and daily-growth playful surfaces work in production"`
- Result:
  - `PASS`
- Exact outcome:
  - `Favorite Us` is visible on the live daily-growth home
  - `Keep this note` works
  - `Copy short note` works
  - the core `Start Morning Story` flow remains present and unchanged
- Evidence:
  - `artifacts/live-beta/2026-03-31/live-playful-surfaces.json`
  - the fresh Day 1 screenshot in `artifacts/live-beta/2026-03-30/1774993260521-daily-home.png` also shows `Favorite Us` on the primary path

### 4. Fail-soft API outage behavior
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/15-live-playful-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - `PASS`
- Exact outcome:
  - dashboard still loads when `/api/playful/today` is forced to return `503`
  - dashboard still shows the core CTA
  - daily-growth still loads when `/api/playful/today` is forced to return `503`
  - daily-growth still shows the normal home state
  - the serious core remains unchanged under playful outage conditions
- Evidence:
  - `artifacts/live-beta/2026-03-31/live-playful-fail-soft.json`

### 5. Analytics visibility
- Command:
  - production `analytics_events` query using the linked Supabase project and service-role access
- Result:
  - `PASS`
- Exact outcome:
  - core funnel milestones remained visible:
    - `beta_primary_signup_register_success`
    - `beta_primary_journey_selected`
    - `beta_primary_onboarding_completed`
    - `beta_primary_dashboard_arrived`
    - `beta_primary_daily_growth_started`
    - `beta_primary_day1_completed`
  - playful events were visible and separate:
    - `playful_daily_spark_viewed`
    - `playful_daily_spark_tried`
    - `playful_daily_spark_swapped`
    - `playful_daily_spark_sent`
    - `playful_favorite_us_viewed`
    - `playful_favorite_us_saved`
    - `playful_favorite_us_sent`

### Exact event sample from the successful live surface run
- `2026-03-31T21:53:03.755+00:00`
  - `playful_daily_spark_viewed`
- `2026-03-31T21:53:05.338+00:00`
  - `playful_daily_spark_tried`
- `2026-03-31T21:53:05.494+00:00`
  - `playful_daily_spark_swapped`
- `2026-03-31T21:53:06.049+00:00`
  - `playful_daily_spark_sent`
- `2026-03-31T21:53:10.089+00:00`
  - `playful_favorite_us_viewed`
- `2026-03-31T21:53:11.654+00:00`
  - `playful_favorite_us_saved`
- `2026-03-31T21:53:11.806+00:00`
  - `playful_favorite_us_sent`

## Rollout Guardrails

### Exposure decision
- Safe to expose now:
  - `yes`, for controlled beta
- Rationale:
  - the playful slice is live
  - the core signup-driven path still passes through Day 1
  - the playful surfaces work on their intended live pages
  - the slice fails soft under endpoint failure
  - the playful analytics stream is visible and separate from the core funnel

### Limited rollout recommendation
- expose to the existing controlled-beta cohort first
- keep the playful slice limited to:
  - dashboard
  - daily-growth home
- do not widen into `Tiny Dare`, `Laugh Loop`, reminders, or new hubs yet
- monitor the first 10 to 25 live users before broader exposure

### What to monitor
- core funnel:
  - `beta_primary_signup_register_success`
  - `beta_primary_journey_selected`
  - `beta_primary_onboarding_completed`
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`
- playful usage:
  - `playful_daily_spark_viewed`
  - `playful_daily_spark_tried`
  - `playful_daily_spark_swapped`
  - `playful_daily_spark_sent`
  - `playful_favorite_us_viewed`
  - `playful_favorite_us_saved`
  - `playful_favorite_us_sent`
- error behavior:
  - `beta_primary_path_error`
  - any noticeable `503` or `401` pattern on `/api/playful/today`

### What counts as safe
- no drop in primary-path completion relative to the pre-playful controlled-beta baseline
- dashboard still reaches the core CTA when playful prompts load normally
- daily-growth still reaches the normal home state and core morning button when playful prompts load normally
- dashboard and daily-growth still load cleanly when the playful endpoint fails
- playful analytics continue to appear as a separate stream without masking the core funnel

### Rollback or disablement conditions
- two consecutive fresh production signup-driven walkthrough failures after the playful rollout
- any production case where dashboard or daily-growth no longer loads the serious core because `/api/playful/today` fails
- a sustained spike in `beta_primary_path_error` that clusters around dashboard or daily-growth after the rollout
- a sustained failure pattern where playful surfaces stop rendering for authenticated primary-path users
- evidence that playful exposure causes confusion about the main daily step or measurably harms Day 1 completion

## Narrow Fixes Required Before Exposure

- None blocking for limited controlled-beta exposure.

## Watch Items After Exposure

- the shorter authenticated spot-check path was less stable than the fresh primary-path proof for some UI confirmations
- keep an eye on authenticated re-entry consistency for playful UI state after direct login, even though the fresh signup-driven path passed cleanly

## Phase 15 Verdict

- the playful slice works live
- the proven primary path remains intact
- the feature is additive and fail-soft in production
- the analytics are visible and separable
- the slice is ready for gradual controlled exposure with clear monitoring and rollback rules
