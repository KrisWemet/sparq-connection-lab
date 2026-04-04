# 08-01 Summary

Plan focus:
- remove the false-positive `journey_start_lookup` beta-path error signal without changing the primary user flow

Completed:
- traced the noisy error to `src/components/onboarding/JourneyDetail.tsx`
- confirmed the primary path was still calling `/api/journeys/start` with starter journey ids like `building-trust`
- confirmed the legacy `/api/journeys/start` path expects UUID-backed legacy journey ids, which produced the logged `22P02 invalid input syntax for type uuid` error
- added `src/lib/journeys/legacyStartPolicy.ts`
- updated `src/components/onboarding/JourneyDetail.tsx` so starter journeys skip the legacy journey bootstrap call and only use the supported starter-journey activation flow
- added focused policy coverage in `e2e/tests/11-beta-ops-signal-cleanup.spec.ts`

Verification:
- `npm run lint`
- `PLAYWRIGHT_PORT=3103 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts --project=chromium`
- `npx vercel deploy --prod --yes`

Outcome:
- starter journeys no longer trigger the legacy UUID-only journey-start path
- the false-positive `journey_start_lookup` error source is removed from the primary signup-driven flow
- the visible user flow is unchanged
