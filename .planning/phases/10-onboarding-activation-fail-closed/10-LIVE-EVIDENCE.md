# Phase 10 Live Evidence

Date: 2026-03-31
Phase: Onboarding Activation Fail-Closed
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence sources:
- `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-AUDIT-FINDINGS.md`
- `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-LIVE-EVIDENCE.md`

## Goal

Make the onboarding journey-confirmation handoff fail closed, then re-prove that the primary signup-driven production path still reaches Day 1 completion.

This phase specifically proves:
- `JourneyDetail` no longer advances if journey activation fails
- `JourneyDetail` no longer advances if `profiles.isonboarded` persistence fails
- `onConfirm()` still runs on the success path only after both writes succeed
- the same fresh production signup-driven walkthrough still completes through Day 1 after the repair

## Root Cause

Phase 9 found that `src/components/onboarding/JourneyDetail.tsx` awaited both the activation write and the profile persistence write, but did not verify success before calling `onConfirm()`.

That meant onboarding could advance even if:
- `/api/journeys/activate` failed
- or the `profiles.isonboarded` update failed

This was a real state-integrity risk on the primary signup-driven path even though successful runs still completed.

## What Changed

### 1. Fail-closed handoff policy
- added `src/lib/onboarding/journeyDetailStartPolicy.ts`
- updated `src/components/onboarding/JourneyDetail.tsx`
  - activation responses must now be `ok` before continuing
  - profile persistence must now succeed before continuing
  - `onConfirm()` runs only after both writes succeed
  - failure paths emit narrow primary-path error stages:
    - `journey_detail_activation`
    - `journey_detail_profile_persist`

### 2. Focused regression coverage
- added `e2e/tests/13-onboarding-activation-fail-closed.spec.ts`
- verified:
  - activation failures throw the narrow activation stage
  - profile persistence failures throw the narrow persistence stage
  - success cases continue cleanly

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in:
    - `src/components/PeterAvatar.tsx`
    - `src/components/journey/JourneyContentView.tsx`
    - `src/lib/auth-context.tsx`
- `PLAYWRIGHT_PORT=3105 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/13-onboarding-activation-fail-closed.spec.ts --project=chromium`
  - Passed: `14/14`

## Production Deployment

- Deployment: `dpl_DdM5MkmzqDmTUmdbEANiFdZg7k89`
- Ready URL: `https://sparq-connection-4yr5bycyr-chris-os-projects-77292ad2.vercel.app`
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
  - `live-beta-1774989392461@sparq.app`
- Fresh verified user id:
  - `bfbbe676-88a9-49d9-98b3-dff9a0a1c7f7`

### 3. Confirmed repaired funnel events on the successful run
- `2026-03-31T20:36:38.315+00:00`
  - `beta_primary_signup_register_success`
- `2026-03-31T20:37:26.920+00:00`
  - `beta_primary_journey_selected`
- `2026-03-31T20:37:28.709+00:00`
  - `beta_primary_onboarding_completed`
- `2026-03-31T20:37:29.204+00:00`
  - `beta_primary_dashboard_arrived`
- `2026-03-31T20:37:34.701+00:00`
  - `beta_primary_daily_growth_started`
- `2026-03-31T20:37:57.241+00:00`
  - `beta_primary_day1_completed`

### 4. Confirmed no primary-path error event in the captured successful-run checkpoint set
- Queried `analytics_events` for the repaired successful run user id:
  - `bfbbe676-88a9-49d9-98b3-dff9a0a1c7f7`
- Result:
  - the checkpoint event trail contains the expected funnel milestones
  - no `beta_primary_path_error` row appeared in that captured successful-run checkpoint set

## Phase 10 Verdict

- the onboarding confirmation step is now fail-closed for activation and profile persistence
- the primary signup-driven production path still completes through Day 1
- the repair tightened state safety without breaking the proven live beta path
