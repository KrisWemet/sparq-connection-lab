# Phase 8 Live Evidence

Date: 2026-03-31
Phase: Beta Ops Signal Cleanup
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence source carried forward: `.planning/phases/07-live-onboarding-reliability-recovery/07-LIVE-EVIDENCE.md`

## Goal

Clean up the false-positive `journey_start_lookup` error signal without changing the supported primary user flow.

This phase specifically proves:
- the noisy `beta_primary_path_error` row came from the primary path calling a legacy UUID-only journey-start route with starter journey ids
- the primary fresh-signup production path still completes through Day 1 after the cleanup
- the repaired successful run no longer writes the false-positive `journey_start_lookup` error row

## Root Cause

On the primary onboarding confirmation step:
- `src/components/onboarding/JourneyDetail.tsx` called `/api/journeys/start`
- then it called `/api/journeys/activate`

That was safe for the user because starter journeys rely on `/api/journeys/activate`, but it still hit the legacy route with starter journey ids such as `building-trust`.

The legacy route:
- `src/pages/api/journeys/start.ts`
- queries the old `journeys` table by `id`
- expects UUID-backed legacy journey ids

Observed live behavior before the fix:
- starter journey id: `building-trust`
- database error: `22P02`
- message: `invalid input syntax for type uuid: "building-trust"`
- noisy analytics row:
  - `event_name = beta_primary_path_error`
  - `stage = journey_start_lookup`

Because the client ignored the legacy route response and proceeded with starter journey activation, the user still reached dashboard and Day 1 completion even while the false-positive error row was written.

## What Changed

### 1. Narrow signal cleanup
- added `src/lib/journeys/legacyStartPolicy.ts`
- updated `src/components/onboarding/JourneyDetail.tsx`
  - starter journeys now skip the legacy `/api/journeys/start` call
  - starter journeys still use `/api/journeys/activate`
  - non-starter legacy journeys still retain the old bootstrap path

### 2. Focused local verification
- added `e2e/tests/11-beta-ops-signal-cleanup.spec.ts`
- verified starter journeys no longer opt into the legacy bootstrap policy

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in:
    - `src/components/PeterAvatar.tsx`
    - `src/components/journey/JourneyContentView.tsx`
    - `src/lib/auth-context.tsx`
- `PLAYWRIGHT_PORT=3103 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts --project=chromium`
  - Passed: `12/12`

## Production Deployment

- Deployment: `dpl_H8vY4psAUEs56gQAAWYa1Dp2T1dw`
- Ready URL: `https://sparq-connection-3pqll1yv3-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

## Live Verification Results

### 1. Public signup route
- Command:
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
- Result:
  - still returns `HTTP/2 307`
  - still redirects to `/login?mode=register`

### 2. Fresh production signup-driven walkthrough
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - Passed: `1/1`
- Evidence file:
  - `artifacts/live-beta/2026-03-30/live-beta-evidence.json`
- Fresh verified user:
  - `live-beta-1774984264284@sparq.app`
- Fresh verified user id:
  - `12a420a8-8536-4d9e-a468-58fc988972df`

### 3. Confirmed repaired funnel events on the successful run
- `2026-03-31T19:11:08.658+00:00`
  - `beta_primary_signup_register_success`
- `2026-03-31T19:12:05.706+00:00`
  - `beta_primary_journey_selected`
- `2026-03-31T19:12:07.428+00:00`
  - `beta_primary_onboarding_completed`
- `2026-03-31T19:12:07.929+00:00`
  - `beta_primary_dashboard_arrived`
- `2026-03-31T19:12:14.409+00:00`
  - `beta_primary_daily_growth_started`
- `2026-03-31T19:12:38.676+00:00`
  - `beta_primary_day1_completed`

### 4. Confirmed absence of the false-positive journey-start error
- Queried `analytics_events` for the repaired successful run user id:
  - `12a420a8-8536-4d9e-a468-58fc988972df`
- Result:
  - no `beta_primary_path_error` row with `stage = journey_start_lookup`
  - the old noisy row remains only on the earlier pre-fix run user id:
    - `534b7f6c-dd74-4e98-a3ad-9cd472974119`

## Residual Notes

- The primary-path signal cleanup is complete for `journey_start_lookup`.
- Other beta-path error rows may still exist for separate reasons, such as route-cancel noise during the register redirect.
- Those are outside this phase unless they become the next narrow ops-cleanup target.

## Phase 8 Verdict

- the false-positive `journey_start_lookup` error row is removed from the primary signup-driven success path
- the fresh production signup-driven walkthrough still completes through Day 1
- controlled-beta operators can now trust that this specific journey-start error signal reflects a real issue, not a successful run
