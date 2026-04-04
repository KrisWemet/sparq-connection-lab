# Phase 6 Live Evidence

Date: 2026-03-30
Phase: Controlled Beta Ops
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence source carried forward: `.planning/phases/05-live-onboarding-determinism/05-LIVE-EVIDENCE.md`

## Goal

Prove that the controlled-beta ops layer is live on the primary signup-driven path:
- beta feedback capture
- funnel analytics
- primary-path error logging

This phase does not redesign onboarding or re-open Peter behavior. Any fresh live onboarding variance should be documented, not silently absorbed into scope.

## What Changed

### 1. Feedback capture
- Added `src/components/beta/BetaFeedbackDialog.tsx`
- Added `src/pages/api/beta/feedback.ts`
- Added primary-path feedback helpers in `src/lib/beta/primaryPath.ts`
- Added feedback entry points on:
  - `src/pages/dashboard.tsx`
  - `src/pages/daily-growth.tsx`

### 2. Primary-path funnel analytics
- Added primary-path funnel events:
  - `beta_primary_signup_register_success`
  - `beta_primary_journey_selected`
  - `beta_primary_onboarding_completed`
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`

### 3. Primary-path error logging
- Added `src/lib/server/beta-ops.ts`
- Added `src/pages/api/beta/client-error.ts`
- Wired structured error capture into the primary path on both client and server edges

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in `src/components/PeterAvatar.tsx`, `src/components/journey/JourneyContentView.tsx`, and `src/lib/auth-context.tsx`
- `PLAYWRIGHT_PORT=3100 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/10-onboarding-determinism.spec.ts --project=chromium`
  - Passed: `12/12`

## Production Deployment

- Deployment: `dpl_4sQr1ycVH9nbxiJNKReF2J4oeBVz`
- Ready URL: `https://sparq-connection-3pqz9pha0-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

## Live Verification Results

### 1. Fresh full-path rerun after Phase 6 deploy
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - Failed twice at the live Peter handoff
- Failure point:
  - the fresh user reached the live onboarding chat, but did not reach the `Solo-first start` journey recommendation state within the spec window
- Latest evidence:
  - `artifacts/live-beta/2026-03-30/live-beta-evidence.json`
  - `artifacts/live-beta/2026-03-30/1774931710169-live-beta-flow-failed.png`

Interpretation:
- this did not expose a Phase 6 observability bug
- it resurfaced live onboarding variance in the Peter handoff, which remains outside this phase's intended scope

### 2. Targeted live feedback + error verification
- Created a fresh production signup user on the primary path:
  - `beta-ops-1774931875203@sparq.app`
- Confirmed:
  - `/api/beta/feedback` returned `200`
  - `/api/beta/client-error` returned `200`
- Queried `analytics_events` for that user and confirmed:
  - `beta_feedback_submitted`
  - `beta_primary_path_error`
  - `beta_primary_signup_register_success`

### 3. Targeted live downstream funnel verification
- Prepared the same verification user for the supported dashboard and daily loop
- Confirmed live events in `analytics_events`:
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`

## Exact Operator Evidence Steps

### Feedback verification
1. Create a fresh signup-driven beta user.
2. Reach any authenticated primary-path surface.
3. Submit feedback through the beta feedback dialog or `POST /api/beta/feedback`.
4. Query `analytics_events` for `event_name = 'beta_feedback_submitted'`.

### Funnel verification
1. Confirm register success writes `beta_primary_signup_register_success`.
2. Confirm dashboard arrival writes `beta_primary_dashboard_arrived`.
3. Confirm starting the daily loop writes `beta_primary_daily_growth_started`.
4. Confirm completing Day 1 writes `beta_primary_day1_completed`.

### Error verification
1. Trigger a real primary-path error, or send a clearly labeled verification event through `POST /api/beta/client-error`.
2. Query `analytics_events` for `event_name = 'beta_primary_path_error'`.
3. Review `stage`, `error_message`, `error_name`, and `beta_path_source` in `event_props`.

## Phase 6 Verdict

- Controlled-beta ops is now live on production for the primary signup-driven path.
- Feedback capture is live.
- Primary-path error logging is live.
- Primary-path funnel analytics is live and queryable.
- Fresh live proof for the two onboarding-middle funnel events (`beta_primary_journey_selected`, `beta_primary_onboarding_completed`) is still blocked by the resurfaced Peter handoff variance, even though those hooks are deployed in production code.

This phase achieved its core ops goal, but it also surfaced a separate production risk:
- the live Peter onboarding handoff is still variable enough that it should be treated as an active follow-up item for controlled beta reliability.
