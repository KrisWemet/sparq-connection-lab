# Phase 16 Live Evidence

Date: 2026-03-31
Phase: Playful Layer Controlled Beta Exposure And Signal Review
Base URL: `https://sparq-connection-lab.vercel.app`

## Goal

Expose the playful MVP only to the controlled-beta cohort, review real usage beside the core funnel, and decide whether the current playful layer should stay, be tuned, be reduced, or be expanded later.

## Rollout Action

- Added a production rollout gate on `/api/playful/today` using:
  - `PLAYFUL_BETA_COHORT_CUTOFF`
- Production cutoff used for this phase:
  - `2026-03-31T23:20:25Z`
- Production deployment carrying the gate:
  - `dpl_FqMsVPngXBo5dedMHG8EbsWSBAkN`

Interpretation:
- users created on or before the cutoff remain eligible for:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- users created after the cutoff remain on the proven serious core only

## Local Verification

- `npm run lint`
  - passed with the same pre-existing warnings
- `npx tsc --noEmit`
  - passed
- `npx playwright test e2e/tests/14-playful-connection.spec.ts --project=chromium`
  - passed: `5/5`

## Live Verification Summary

### 1. Primary path regression check after the cohort gate

- Command:
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - `PASS`
- Exact outcome:
  - `/signup` still redirects with `HTTP/2 307`
  - a fresh post-cutoff signup still completed the solo-first production path through Day 1
- Evidence:
  - `artifacts/live-beta/2026-03-30/live-beta-evidence.json`

### 2. Controlled-beta cohort user still sees the playful slice

- Command:
  - `PHASE16_COHORT_EMAIL=phase16-cohort-20260331@sparq.app PHASE16_COHORT_PASSWORD=... PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/16-live-controlled-beta-review.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - `PASS`
- Exact outcome:
  - pre-cutoff cohort user still saw `Daily Spark` on dashboard
  - pre-cutoff cohort user still saw `Favorite Us` on the daily-growth home
  - dashboard playful feedback submitted successfully
  - daily-home playful feedback submitted successfully
- Evidence:
  - `artifacts/live-beta/2026-03-31/phase16-controlled-beta-cohort.json`

### 3. Post-cutoff users stay on the serious core only

- Command:
  - same Phase 16 live review spec as above
- Result:
  - `PASS`
- Exact outcome:
  - fresh post-cutoff signup reached dashboard without `Daily Spark`
  - fresh post-cutoff signup reached the daily-growth home without `Favorite Us`
  - core morning CTA remained present and unchanged
- Evidence:
  - `artifacts/live-beta/2026-03-31/phase16-post-cutoff-serious-core.json`

### 4. Analytics review

#### Broader playful window
- Observation window:
  - `since = 2026-03-31T21:40:00Z`
- Key counts:
  - `beta_primary_signup_register_success`: `12`
  - `beta_primary_journey_selected`: `7`
  - `beta_primary_onboarding_completed`: `7`
  - `beta_primary_dashboard_arrived`: `7`
  - `beta_primary_daily_growth_started`: `2`
  - `beta_primary_day1_completed`: `2`
  - `playful_daily_spark_viewed`: `16`
  - `playful_daily_spark_tried`: `4`
  - `playful_daily_spark_swapped`: `6`
  - `playful_daily_spark_sent`: `3`
  - `playful_favorite_us_viewed`: `7`
  - `playful_favorite_us_saved`: `2`
  - `playful_favorite_us_sent`: `1`
- Distinct-user highlights:
  - `playful_daily_spark_viewed`: `8` users
  - `playful_favorite_us_viewed`: `5` users
  - `beta_primary_day1_completed`: `2` users

#### Clean gated window
- Observation window:
  - `since = 2026-03-31T23:23:00Z`
- What happened:
  - one post-cutoff fresh signup completed the full primary path through Day 1 with no playful events
  - the pre-cutoff cohort account emitted:
    - `playful_daily_spark_viewed`
    - `playful_favorite_us_viewed`
    - `beta_feedback_submitted`
  - post-cutoff users in the same window emitted no playful events
  - no `beta_primary_path_error` rows appeared in the gated window

## Qualitative Feedback Readout

Unique playful feedback themes captured in the gated window:

1. `Daily Spark`
   - sentiment: `4/5`
   - message:
     - "Daily Spark felt warm and easy to ignore if I was busy. It did not get in the way."
2. `Favorite Us`
   - sentiment: `4/5`
   - message:
     - "Favorite Us felt gentle and optional. It added warmth without changing the main daily step."

Interpretation:
- helpful: `yes`
- warm: `yes`
- optional: `yes`
- non-intrusive: `yes`
- distracting: `no evidence`
- cheesy: `no evidence`
- confusing: `no evidence`

## Additive Versus Distracting Readout

What the evidence supports:
- the primary path still works for fresh post-cutoff users with no playful prompts present
- the current cohort still sees the playful layer on Home and Daily
- at least one earlier successful primary-path Day 1 completion happened with playful visibility present
- at least one later successful primary-path Day 1 completion happened with playful visibility absent

Interpretation:
- there is **no evidence that the playful layer is harming Day 1 completion**
- there is **not yet enough sample size to claim the playful layer improves Day 1 completion**
- current evidence supports an `additive / non-distracting` read rather than a `growth-driving` read

## Decision Memo

Primary recommendation:
- `keep as is`

Why:
- the current Home and Daily placement stayed optional and non-intrusive
- the core funnel remained stable
- the gated rollout worked as intended
- the qualitative feedback was warm and positive
- there is no current evidence that the slice is distracting

What not to do yet:
- do not widen into `Tiny Dare`
- do not add `Laugh Loop`
- do not redesign navigation
- do not increase playful prominence yet

## Narrow Follow-Up

Not blocking, but recommended before any broader exposure:
- continue observing a larger non-scripted cohort before claiming retention lift
- dedupe repeated operator-generated feedback rows when re-running the same scripted cohort check

## Phase 16 Verdict

- the playful slice is now limited to the intended controlled-beta cohort
- the proven primary signup-driven path remains intact for post-cutoff users
- the current playful placement on dashboard and daily-growth home should remain unchanged for controlled beta
- the right next decision is to keep the slice as is for now and gather a larger real-user sample before broader exposure or expansion
