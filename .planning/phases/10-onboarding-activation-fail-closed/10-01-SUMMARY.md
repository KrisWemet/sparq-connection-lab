# 10-01 Summary

Plan focus:
- make the `JourneyDetail` onboarding handoff fail closed without redesigning onboarding

Completed:
- added `src/lib/onboarding/journeyDetailStartPolicy.ts` to centralize fail-closed onboarding handoff checks
- updated `src/components/onboarding/JourneyDetail.tsx` so:
  - legacy journey start calls must return a successful response before continuing
  - starter journey activation must return a successful response before continuing
  - the `profiles.isonboarded` write must succeed before continuing
  - `onConfirm()` is called only after both activation and onboarding persistence succeed
  - narrow primary-path error stages now distinguish:
    - `journey_detail_activation`
    - `journey_detail_profile_persist`
- added a small user-facing retry message if the handoff fails instead of advancing silently
- added focused regression coverage in `e2e/tests/13-onboarding-activation-fail-closed.spec.ts`

Verification:
- `npm run lint`
- `PLAYWRIGHT_PORT=3105 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/13-onboarding-activation-fail-closed.spec.ts --project=chromium`

Outcome:
- onboarding no longer advances on activation failure
- onboarding no longer advances on profile persistence failure
- the success path still advances exactly once
