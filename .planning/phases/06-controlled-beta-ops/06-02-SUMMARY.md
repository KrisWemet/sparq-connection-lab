# 06-02 Summary

Plan focus:
- instrument the primary signup-driven funnel without expanding analytics scope

Completed:
- added primary-path client event helpers in `src/lib/beta/primaryPath.ts`
- instrumented:
  - register success in `src/components/auth/LoginForm.tsx`
  - journey selection in `src/components/onboarding/JourneyRecommendation.tsx`
  - onboarding completion in `src/components/onboarding/JourneyDetail.tsx`
  - dashboard arrival in `src/pages/dashboard.tsx`
  - daily-growth start and Day 1 completion in `src/pages/daily-growth.tsx`

Verification:
- `npm run lint`
- `PLAYWRIGHT_PORT=3100 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/10-onboarding-determinism.spec.ts --project=chromium`
- targeted live production event verification through `analytics_events`

Outcome:
- the primary signup-driven path now emits a stable beta funnel contract
- live evidence captured:
  - `beta_primary_signup_register_success`
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`
- the onboarding-middle events remain instrumented in production code, but fresh live proof is still gated by the variable Peter handoff
