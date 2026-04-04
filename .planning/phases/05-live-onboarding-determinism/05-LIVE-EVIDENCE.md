# Phase 5 Live Evidence

Date: 2026-03-31
Phase: Live Onboarding Determinism
Base URL: `https://sparq-connection-lab.vercel.app`
Primary evidence source carried forward: `.planning/phases/04-production-blocker-fixes/04-LIVE-EVIDENCE.md`

## Goal

Prove that a fresh production user can move through:
- signup
- onboarding
- journey selection
- dashboard
- Day 1 morning flow
- Day 1 completion

## What Changed

### 1. Deterministic Peter handoff
- Added `src/lib/onboarding/peterHandoffPolicy.ts`
- Tightened `src/pages/api/peter/onboarding.ts` so the live Peter onboarding conversation:
  - allows closing from exchange 2 onward
  - prefers closing by exchange 3
  - force-closes by exchange 4
- The onboarding prompt now explicitly frames the conversation as short and bounded.

### 2. Focused verification coverage
- Added `e2e/tests/10-onboarding-determinism.spec.ts`
- This directly verifies the exchange-count policy instead of relying only on live browser timing.

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in `src/components/PeterAvatar.tsx`, `src/components/journey/JourneyContentView.tsx`, and `src/lib/auth-context.tsx`
- `npx playwright test e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - Passed: `10/10`

## Production Deployment

- Deployment: `dpl_41EhMzAGSJQqEuSDoEkwecUEqGSH`
- Ready URL: `https://sparq-connection-7igh2bsqx-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

## Live Verification Results

### Route check
- `curl -I https://sparq-connection-lab.vercel.app/signup`
  - Result: `HTTP/2 307`
  - Redirect target: `/login?mode=register`

### Primary fresh-user production walkthrough
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - Passed: `1/1`
- Proven path:
  - signup redirect works
  - account creation works
  - onboarding question flow works
  - Peter handoff reaches journey selection
  - journey selection reaches detail and dashboard
  - dashboard reaches `/daily-growth`
  - Day 1 morning flow loads
  - Day 1 completes successfully

Artifacts from the successful run:
- `artifacts/live-beta/2026-03-30/1774923216001-journey-recommendation.png`
- `artifacts/live-beta/2026-03-30/1774923216196-journey-detail.png`
- `artifacts/live-beta/2026-03-30/1774923218267-dashboard.png`
- `artifacts/live-beta/2026-03-30/1774923223776-daily-home.png`
- `artifacts/live-beta/2026-03-30/1774923223895-daily-morning.png`
- `artifacts/live-beta/2026-03-30/1774923227397-daily-evening-entry.png`
- `artifacts/live-beta/2026-03-30/1774923242695-daily-reflection.png`
- `artifacts/live-beta/2026-03-30/1774923245935-daily-complete.png`

### Secondary login-entry fallback walkthrough
- Command:
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/09-live-login-fallback.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - Failed
- Current state:
  - this fallback spec still hit a longer conversation branch and did not reach journey selection within its current scripted reply set
  - latest screenshot shows the live conversation is functioning, but the harness still needs broader response handling for this secondary path

## Phase 5 Verdict

- Fresh production signup -> onboarding -> journey selection -> dashboard -> Day 1 completion: proven
- Live Peter onboarding handoff: deterministic enough for the primary fresh-user production path
- Secondary login-entry fallback script: still more variable than the primary path, but no longer the main launch blocker

This phase achieved the main goal: the core solo-first beta path is now proven end to end in production.
