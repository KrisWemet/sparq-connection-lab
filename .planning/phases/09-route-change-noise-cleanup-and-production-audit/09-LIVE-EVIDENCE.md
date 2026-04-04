# Phase 9 Live Evidence

Date: 2026-03-31
Phase: Route Change Noise Cleanup And Focused Production Audit
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence source carried forward: `.planning/phases/08-beta-ops-signal-cleanup/08-LIVE-EVIDENCE.md`

## Goal

Clean up the false-positive `route_change` beta-path signal during register redirects without changing the supported primary user flow, then re-prove the fresh production signup-driven path and capture a focused ranked audit.

This phase specifically proves:
- the noisy `beta_primary_path_error` row with `stage = route_change` came from an expected register redirect cancel edge
- the primary fresh-signup production path still completes through Day 1 after narrowing that logging
- the repaired successful run no longer writes `beta_primary_path_error` rows on the same path
- the repo now has a ranked list of real follow-up issues for the next narrow phases

## Root Cause

The global router error listener in `src/pages/_app.tsx` reported every route-change error through:
- `reportPrimaryPathClientError('route_change', error, { url })`

Live evidence from earlier successful runs showed:
- `event_name = beta_primary_path_error`
- `stage = route_change`
- `error_message = Route Cancelled`
- `client_context.url = /login?mode=register`

That redirect is expected on the supported public signup path:
- `/signup` returns `307`
- users are sent to `/login?mode=register`
- Next.js may emit a cancelled route event while replacing the route

So the signal was real transport, but false product meaning. Operators saw a primary-path error row even when the user succeeded.

## What Changed

### 1. Narrow route-change filtering
- updated `src/lib/beta/primaryPath.ts`
  - added `shouldReportPrimaryPathRouteError(error, url)`
  - suppresses only the known expected register redirect cancel case:
    - `url === '/login?mode=register'`
    - cancelled route object or `Route Cancelled` message
- updated `src/pages/_app.tsx`
  - the global route-change error handler now skips only that expected redirect edge
  - all other route errors still report normally

### 2. Focused local regression coverage
- added `e2e/tests/12-route-change-noise.spec.ts`
- verified:
  - expected register redirect cancels are not reported
  - unrelated route errors are still reported

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in:
    - `src/components/PeterAvatar.tsx`
    - `src/components/journey/JourneyContentView.tsx`
    - `src/lib/auth-context.tsx`
- `PLAYWRIGHT_PORT=3104 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts e2e/tests/12-route-change-noise.spec.ts --project=chromium`
  - Passed: `13/13`

## Production Deployment

- Deployment: `dpl_GNyNuwvYxiy9QbMjb6mE8utxhfnQ`
- Ready URL: `https://sparq-connection-opy6x89o4-chris-os-projects-77292ad2.vercel.app`
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
  - `live-beta-1774985194244@sparq.app`
- Fresh verified user id:
  - `f60369d7-cb69-483e-9d81-0eab3814bff3`

### 3. Confirmed repaired funnel events on the successful run
- `2026-03-31T19:26:38.167+00:00`
  - `beta_primary_signup_register_success`
- `2026-03-31T19:27:26.615+00:00`
  - `beta_primary_journey_selected`
- `2026-03-31T19:27:28.017+00:00`
  - `beta_primary_onboarding_completed`
- `2026-03-31T19:27:28.493+00:00`
  - `beta_primary_dashboard_arrived`
- `2026-03-31T19:27:34.073+00:00`
  - `beta_primary_daily_growth_started`
- `2026-03-31T19:27:55.207+00:00`
  - `beta_primary_day1_completed`

### 4. Confirmed absence of the false-positive route-change error on the repaired run
- Queried `analytics_events` for the repaired successful run user id:
  - `f60369d7-cb69-483e-9d81-0eab3814bff3`
- Result:
  - `pathErrorCount = 0`
  - no `beta_primary_path_error` rows were written on the successful run

## Focused Audit Output

Ranked follow-up findings are captured in:
- `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-AUDIT-FINDINGS.md`

Audit scope was intentionally narrow:
- primary signup-driven production path first
- operator-facing production risks second
- obvious redundancies and dead or legacy seams last

## Phase 9 Verdict

- the false-positive `route_change` beta-path error row is removed from the successful register redirect path
- the fresh production signup-driven walkthrough still completes through Day 1
- the focused production audit is complete with ranked evidence-backed follow-up findings
