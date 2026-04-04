# Phase 4 Live Evidence

Date: 2026-03-30
Phase: Production Blocker Fixes
Base URL: `https://sparq-connection-lab.vercel.app`
Primary source carried forward from Phase 3: `.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md`

## What Was Fixed

### 1. `/signup` production crash
- Local change: `src/pages/signup.tsx` now redirects to the canonical register flow at `/login?mode=register`.
- Supporting auth fix: `src/pages/login.tsx` now keeps register mode in the URL and avoids auto-sending fresh registrants straight to `/dashboard`.
- Supporting consent fix: `src/components/auth/LoginForm.tsx` now records consent through `PATCH /api/preferences` before sending a new user into onboarding.

### 2. Missing journey recommendation card
- Local change: `src/components/onboarding/JourneyRecommendation.tsx` now falls back to starter-journey metadata when the legacy journey catalog does not contain the recommended journey ID.
- This fixed the live blank "Your starting point" state that appeared after the Peter onboarding chat.

## Local Verification

- `npm run lint`
  - Passed with the same pre-existing warnings in `src/components/PeterAvatar.tsx`, `src/components/journey/JourneyContentView.tsx`, and `src/lib/auth-context.tsx`
- `npx playwright test e2e/tests/01-auth.spec.ts e2e/tests/02-onboarding.spec.ts`
  - Passed earlier during Phase 4 signup and onboarding fixes
- `npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - Passed: `7/7`

## Production Deployments

### Deploy 1
- Deployment: `dpl_4mqKb8ZEmx97UjgZuVWU97RKNJpz`
- Ready URL: `https://sparq-connection-mew4ob9pq-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

### Deploy 2
- Deployment: `dpl_CYYbTS7QfcFYpvzSY2yZC4ALESDu`
- Ready URL: `https://sparq-connection-748y12p43-chris-os-projects-77292ad2.vercel.app`
- Alias: `https://sparq-connection-lab.vercel.app`

## Live Verification Results

### Verified live
- `curl -I https://sparq-connection-lab.vercel.app/signup`
  - Result: `HTTP/2 307`
  - Redirect target: `/login?mode=register`
- Fresh-user registration now reaches the supported onboarding flow instead of failing at `/signup`.
- The onboarding recommendation screen now renders a real primary journey card instead of stopping at a blank "Your starting point" state.

### Still not fully proven live
- The fresh solo-user walkthrough from signup to Day 1 completion still could not be marked complete in production.
- The latest live Playwright reruns no longer fail on the original blockers. They now stall inside the longer Peter onboarding conversation before a clean deterministic handoff to journey selection and daily completion is proven.

## Latest Live Browser Evidence

Artifacts referenced from `test-results/` and `artifacts/live-beta/2026-03-30/` show:
- `/signup` redirect working
- onboarding consent saving and route entry working
- Peter onboarding chat working
- recommendation card rendering with a visible primary action
- no completed proof yet of dashboard -> `/daily-growth` -> Day 1 finish for a truly fresh live account

Representative screenshots:
- `test-results/tests-08-live-beta-verific-609e2-ta-path-works-in-production-chromium/test-failed-1.png`
- `test-results/tests-09-live-login-fallba-695dd-ue-into-the-solo-first-path-chromium/test-failed-1.png`

## Phase 4 Verdict

- `/signup` HTTP 500: fixed in production
- Blank recommendation handoff after onboarding: fixed in production
- Fresh-user Day 1 completion in live production: still not fully proven

Phase 4 reduced the proven production blockers, but the beta still should not be treated as fully launch-ready until the live solo-first path is validated through dashboard and Day 1 completion with stable evidence.
