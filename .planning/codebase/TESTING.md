# Testing

## Current Test Stack
- End-to-end framework: Playwright
- Config: `playwright.config.ts`
- Test directory: `e2e/`

## Test Structure
- Auth bootstrap: `e2e/auth.setup.ts`
- Helpers and mocks:
  - `e2e/helpers/mock-peter.ts`
  - `e2e/helpers/mock-supabase.ts`
- Feature specs:
  - `e2e/tests/01-auth.spec.ts`
  - `e2e/tests/02-onboarding.spec.ts`
  - `e2e/tests/03-daily-growth.spec.ts`
  - `e2e/tests/04-skill-tree.spec.ts`
  - `e2e/tests/05-dashboard.spec.ts`
  - `e2e/tests/06-safety-trust.spec.ts`
  - `e2e/tests/07-daily-session-reliability.spec.ts`

## How Tests Run
- Main command: `npm run test:e2e`
- Playwright starts the app with `npm run dev` through `playwright.config.ts`
- Tests use stored auth state in `e2e/.auth/user.json`
- The setup project runs before the Chromium project

## Coverage Shape
- The suite is strongest around:
  - auth
  - onboarding
  - daily growth flow
  - dashboard behavior
  - trust and safety surfaces
  - daily session reliability

## Current Testing Characteristics
- The test style is product-flow oriented rather than unit-heavy
- Mock helpers are used to stabilize Peter and Supabase-dependent flows
- The setup assumes local env values and a working local auth path

## Gaps
- No unit-test framework was found
- No component test setup was found
- No CI workflow file was inspected in this mapping pass
- Older or less central pages appear lightly covered relative to the daily loop core

## Practical Risks
- End-to-end coverage is valuable here, but a lack of lower-level tests means regressions in helper logic can surface late
- Auth bootstrap and local data assumptions make the suite sensitive to environment drift
