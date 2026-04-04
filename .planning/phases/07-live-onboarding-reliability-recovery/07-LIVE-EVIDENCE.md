# Phase 7 Live Evidence

Date: 2026-03-31
Phase: Live Onboarding Reliability Recovery
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence source carried forward: `.planning/phases/06-controlled-beta-ops/06-LIVE-EVIDENCE.md`

## Goal

Recover dependable live onboarding on the primary signup-driven path without adding features or redesigning onboarding.

This phase specifically proves:
- the Peter handoff reaches journey selection again
- the full fresh production signup path reaches Day 1 completion again
- the Phase 6 beta ops events still fire on the repaired path

## What Changed

### 1. Narrow handoff repair
- tightened `src/lib/onboarding/peterHandoffPolicy.ts`
  - close allowed from exchange 2
  - close forced by exchange 3
- kept the closing-message normalization in place so the journey handoff always lands in the same two-line format
- kept `src/components/onboarding/PeterSession.tsx` guarded against duplicate sends while closing

### 2. Live-proof repair
- updated `e2e/tests/08-live-beta-verification.spec.ts` so each Peter turn waits for the real `/api/peter/onboarding` response and the next visible UI state
- this removed the false-negative timing window caused by fixed sleeps during slower production replies

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in:
    - `src/components/PeterAvatar.tsx`
    - `src/components/journey/JourneyContentView.tsx`
    - `src/lib/auth-context.tsx`
- `PLAYWRIGHT_PORT=3102 npx playwright test e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - Passed: `11/11`

## Production Deployment

- Deployment: `dpl_7Ehw1PPprz2MpTDeKx9iENSayVWH`
- Ready URL: `https://sparq-connection-fqz1vr8bw-chris-os-projects-77292ad2.vercel.app`
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
  - `live-beta-1774963399259@sparq.app`

### 3. Confirmed production funnel stages on the repaired run
- verified in `artifacts/live-beta/2026-03-30/live-beta-evidence.json` and in `analytics_events`:
  - signup page redirect
  - signup complete
  - consent gate passed
  - question flow complete
  - journey recommendation loaded
  - journey detail loaded
  - dashboard arrived
  - daily growth opened
  - morning story completed
  - evening reflection completed
  - Day 1 completed

## Phase 6 Beta Ops Re-Verification

Fresh repaired-run user id:
- `534b7f6c-dd74-4e98-a3ad-9cd472974119`

Confirmed `analytics_events` rows:
- `2026-03-31T13:23:23.46+00:00`
  - `beta_primary_signup_register_success`
- `2026-03-31T13:24:17.229+00:00`
  - `beta_primary_onboarding_completed`
- `2026-03-31T13:24:17.656+00:00`
  - `beta_primary_dashboard_arrived`
- `2026-03-31T13:24:23.109+00:00`
  - `beta_primary_daily_growth_started`
- `2026-03-31T13:24:47.02+00:00`
  - `beta_primary_day1_completed`

## Residual Finding

One non-blocking noisy error row appeared on the same successful run:
- `event_name = beta_primary_path_error`
- `stage = journey_start_lookup`
- `journey_id = building-trust`
- `error_message = [object Object]`

Interpretation:
- the repaired primary path still succeeds end to end
- the controlled-beta ops layer still works
- there is still a smaller follow-up item to clean up journey-start error logging so operators do not see a false error signal on a successful run

## Phase 7 Verdict

- the renewed live Peter handoff reliability issue is recovered on the primary signup-driven path
- the fresh production signup walkthrough is dependable again through Day 1 completion
- the Phase 6 beta ops events still fire on the repaired path
- the remaining follow-up is smaller and operational:
  - reduce noisy `journey_start_lookup` error logging
  - continue treating the secondary login-entry fallback path as a separate hardening item
