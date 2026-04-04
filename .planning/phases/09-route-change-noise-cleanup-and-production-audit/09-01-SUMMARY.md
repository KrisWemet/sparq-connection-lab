# 09-01 Summary

Plan focus:
- remove or narrow the false-positive `route_change` beta-path error signal during register redirects without changing the primary user flow

Completed:
- traced the noisy error to the global route-change error listener in `src/pages/_app.tsx`
- confirmed earlier successful runs were writing `beta_primary_path_error` rows with:
  - `stage = route_change`
  - `error_message = Route Cancelled`
  - `client_context.url = /login?mode=register`
- added `shouldReportPrimaryPathRouteError` in `src/lib/beta/primaryPath.ts`
- updated `src/pages/_app.tsx` so the app suppresses only the expected register redirect cancel edge
- added focused regression coverage in `e2e/tests/12-route-change-noise.spec.ts`

Verification:
- `npm run lint`
- `PLAYWRIGHT_PORT=3104 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts e2e/tests/12-route-change-noise.spec.ts --project=chromium`
- `npx vercel deploy --prod --yes`

Outcome:
- expected register redirect cancels no longer pollute the primary-path error stream
- unrelated route errors still report
- the visible user flow is unchanged
