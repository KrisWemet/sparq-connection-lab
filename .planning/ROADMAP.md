# Roadmap

## Milestone: Beta Stabilization

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 1 | Beta Stabilization | Make the current Sparq beta feel credible by stabilizing auth, onboarding, and the daily loop while reducing only the architecture drift that directly blocks those paths. | `BETA-AUTH-01`, `BETA-ONBOARD-01`, `BETA-DAILY-01`, `BETA-ARCH-01`, `BETA-TEST-01` |
| 2 | Beta Hardening | Harden the beta for real user testing by verifying database and environment consistency, closing launch-blocker verification gaps, clarifying daily-loop state, and quarantining legacy beta-path confusion. | `BETA-HARD-DB-01`, `BETA-HARD-LAUNCH-01`, `BETA-HARD-DAILY-01`, `BETA-HARD-LEGACY-01`, `BETA-HARD-TEST-01` |
| 3 | Live Beta Verification | Verify the remaining launch risks that only live systems can prove: linked Supabase schema, deployed env and AI keys, and a manual solo-first beta run with operator evidence. | `BETA-LIVE-DB-01`, `BETA-LIVE-ENV-01`, `BETA-LIVE-MANUAL-01`, `BETA-LIVE-DOC-01` |
| 4 | Production Blocker Fixes | Fix the production blockers proven in Phase 3: the live `/signup` HTTP 500 and the consent-gated `/daily-growth` entry path, then re-run the same live evidence checks. | `BETA-PROD-SIGNUP-01`, `BETA-PROD-DAILY-01`, `BETA-PROD-VERIFY-01` |
| 5 | Live Onboarding Determinism | Make the fresh production onboarding handoff deterministic enough to reach journey selection, dashboard, and Day 1 morning flow, then prove Day 1 completion end to end with the same live walkthrough. | `BETA-LIVE-ONBOARD-01`, `BETA-LIVE-POST-ONBOARD-01`, `BETA-LIVE-PROOF-01` |
| 6 | Controlled Beta Ops | Add feedback capture, primary-path funnel analytics, and primary-path error monitoring for controlled beta without expanding product scope. | `BETA-OPS-FEEDBACK-01`, `BETA-OPS-FUNNEL-01`, `BETA-OPS-OBS-01`, `BETA-OPS-FOLLOWUP-01` |
| 7 | Live Onboarding Reliability Recovery | Recover the renewed live Peter handoff reliability, re-prove the fresh production signup path, and confirm the Phase 6 beta ops events still fire on the repaired path. | `BETA-RECOVERY-HANDOFF-01`, `BETA-RECOVERY-PROOF-01`, `BETA-RECOVERY-OPS-01` |
| 8 | Beta Ops Signal Cleanup | Remove the false-positive `journey_start_lookup` beta-path error signal, then re-prove the primary fresh-signup production walkthrough with clean ops evidence. | `BETA-SIGNAL-OPS-01`, `BETA-SIGNAL-PROOF-01` |
| 9 | Route Change Noise Cleanup And Focused Production Audit | Remove or narrow false-positive `route_change` beta-path noise, re-prove the primary production path, and produce a ranked audit with at least five real follow-up findings. | `BETA-ROUTE-NOISE-01`, `BETA-ROUTE-PROOF-01`, `BETA-AUDIT-01` |
| 10 | Onboarding Activation Fail-Closed | Make the JourneyDetail onboarding handoff require successful activation and profile persistence before advancing, then re-prove the primary production path through Day 1. | `BETA-ONBOARD-FAIL-01`, `BETA-ONBOARD-FAIL-PROOF-01` |
| 11 | Relationship Life Expansion Strategy | Define how Sparq expands from a serious relationship-work app into a relationship life app with more fun, rituals, joy, and everyday connection without redesigning the proven primary path. | `EXPANSION-STRATEGY-01`, `EXPANSION-STRATEGY-02`, `EXPANSION-STRATEGY-03` |
| 12 | Playful Connection MVP Definition | Define the smallest valuable playful-connection MVP, the exact surfaces it touches, the guardrails, and the success metrics before any build planning begins. | `PLAYFUL-MVP-01`, `PLAYFUL-MVP-02`, `PLAYFUL-MVP-03` |
| 13 | Playful Connection MVP Spec | Define the exact 3 to 5 playful features for the MVP, their purpose, surfaces, cadence, beta boundaries, and future path without drifting into implementation. | `PLAYFUL-SPEC-01`, `PLAYFUL-SPEC-02`, `PLAYFUL-SPEC-03` |
| 14 | Playful Connection MVP Implementation | Build the smallest usable playful-connection slice on safe existing surfaces while isolating it from the proven signup-driven path and protecting production stability. | `PLAYFUL-IMPL-01`, `PLAYFUL-IMPL-02`, `PLAYFUL-IMPL-03` |
| 15 | Playful Layer Live Verification And Rollout Guardrails | Verify the deployed playful MVP slice in live production, confirm fail-soft behavior and analytics visibility, and define controlled exposure guardrails without weakening the proven primary path. | `PLAYFUL-LIVE-01`, `PLAYFUL-LIVE-02`, `PLAYFUL-LIVE-03`, `PLAYFUL-LIVE-04`, `PLAYFUL-LIVE-05` |
| 16 | Playful Layer Controlled Beta Exposure And Signal Review | Expose the playful MVP only to the controlled-beta cohort, review real usage and feedback beside the core funnel, and decide whether to keep, tune, reduce, or expand later. | `PLAYFUL-COHORT-01`, `PLAYFUL-COHORT-02`, `PLAYFUL-COHORT-03`, `PLAYFUL-COHORT-04` |
| 17 | Editorial Relationship Life UI Refresh | Define the visual and interaction contract for reshaping safe core surfaces into a more editorial, premium, relationship-life experience without disturbing the proven signup-driven path. | `UI-EDITORIAL-01`, `UI-EDITORIAL-02`, `UI-EDITORIAL-03` |
| 18 | Sparq IA Contract And Home Simplification | Define the destination-based information architecture and exact Home simplification contract from the recovered baseline without changing the proven daily path. | `IA-CONTRACT-01`, `IA-CONTRACT-02`, `IA-CONTRACT-03`, `IA-CONTRACT-04` |
| 19 | 1/3 | In Progress|  |

## Phase 1 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Supporting context: `IMPLEMENTATION_STATUS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`
- Explicitly out of scope:
- broad new feature development
- partner-system expansion
- monetization expansion
- large UI redesigns unrelated to reliability

## Phase 1 Status
- Status: complete
- Plans completed:
  - `01-01`
  - `01-02`
  - `01-03`
- Verification:
  - `npx playwright test e2e/tests/01-auth.spec.ts`
  - `npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/05-dashboard.spec.ts`
  - `npx playwright test e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/07-daily-session-reliability.spec.ts`

## Phase 2 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Supporting context: `IMPLEMENTATION_STATUS.md`, `LAUNCH_CHECKLIST.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/STRUCTURE.md`
- Phase 1 summaries define the newly supported beta path and should be treated as upstream inputs.
- Explicitly out of scope:
  - broad new feature work
  - new premium features
  - partner-system expansion
  - general UI redesign outside daily-loop clarity

## Phase 2 Status
- Status: complete
- Plans completed:
  - `02-01`
  - `02-02`
  - `02-03`
- Verification:
  - `node scripts/verify-beta-readiness.mjs`
  - `npm run lint`
  - `npx playwright test e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts`

## Phase 3 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Supporting context: `LAUNCH_CHECKLIST.md`, `IMPLEMENTATION_STATUS.md`, `.planning/phases/01-beta-stabilization/*.md`, `.planning/phases/02-beta-hardening/*.md`
- Explicitly in scope:
  - live Supabase schema verification
  - deployed env and AI key verification
  - manual solo-first path validation
  - durable operator evidence capture
- Explicitly out of scope:
  - new features
  - broad refactors
  - general cleanup not required for live verification

## Phase 3 Status
- Status: complete
- Plans completed:
  - `03-01`
  - `03-02`
- Verification:
  - `npx supabase migration list`
  - live Supabase REST queries against the linked project
  - `npx vercel env ls production`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/09-live-login-fallback.spec.ts --project=chromium --workers=1`

## Phase 4 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - fix live `/signup` HTTP 500
  - fix live `/daily-growth` consent-gate blocker for fresh solo users
  - re-run the existing live verification evidence after fixes
- Explicitly out of scope:
  - new feature work
  - broad cleanup
  - architecture cleanup beyond what directly fixes the proven blockers

## Phase 4 Status
- Status: complete with residual live-verification risk
- Plans completed:
  - `04-01`
  - `04-02`
- Verification:
  - `npm run lint`
  - `npx playwright test e2e/tests/01-auth.spec.ts e2e/tests/02-onboarding.spec.ts`
  - `npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/09-live-login-fallback.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - `/signup` fixed in production
  - onboarding recommendation handoff fixed in production
  - full fresh-user Day 1 completion still not fully proven live

## Phase 5 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/04-production-blocker-fixes/04-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - make the live Peter onboarding handoff deterministic enough for fresh users to reach journey selection
  - ensure the post-onboarding path reaches dashboard and Day 1 morning flow cleanly
  - re-run the same live fresh-user production walkthrough to prove Day 1 completion end to end
- Explicitly out of scope:
  - new features
  - broad cleanup
  - onboarding redesign
  - unrelated architecture work

## Phase 5 Status
- Status: complete
- Plans completed:
  - `05-01`
  - `05-02`
- Verification:
  - `npm run lint`
  - `npx playwright test e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/09-live-login-fallback.spec.ts --project=chromium --workers=1 --no-deps`
- Result:
  - live Peter onboarding handoff is deterministic enough for the primary fresh-signup production path
  - dashboard and Day 1 completion are proven end to end in production on the primary path
  - the secondary login-entry fallback live spec is still a smaller follow-up item

## Phase 6 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/05-live-onboarding-determinism/05-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - add feedback capture for beta users on the primary signup-driven path
  - add funnel analytics for the proven primary path
  - add error monitoring or logging for the proven primary path
  - keep the secondary login-entry fallback path as a follow-up hardening item only
- Explicitly out of scope:
  - product features
  - onboarding, dashboard, or daily-growth redesign
  - Peter behavior changes unless required for observability or bug fixes
  - broad cleanup

## Phase 6 Status
- Status: complete with residual live-verification risk
- Plans completed:
  - `06-01`
  - `06-02`
  - `06-03`
- Verification:
  - `npm run lint`
  - `PLAYWRIGHT_PORT=3100 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/10-onboarding-determinism.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production verification of `/api/beta/feedback`
  - targeted production verification of `/api/beta/client-error`
  - targeted `analytics_events` verification for beta funnel and error rows
- Result:
  - controlled-beta feedback capture is live
  - primary-path funnel analytics is live and queryable
  - primary-path error logging is live and queryable
  - fresh full-path live reruns still hit Peter handoff variance before journey selection, so onboarding-middle funnel milestones were not freshly reproven end to end in this phase

## Phase 7 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/06-controlled-beta-ops/06-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - investigate and fix the renewed live Peter handoff variance before journey selection
  - re-run the fresh production signup-driven walkthrough until the primary path is dependable again
  - confirm the existing Phase 6 beta ops events still fire on the repaired path
- Explicitly out of scope:
  - new features
- onboarding redesign
- dashboard or daily-growth changes except where required by the handoff fix
- broad cleanup

## Phase 7 Status
- Status: complete
- Plans completed:
  - `07-01`
  - `07-02`
  - `07-03`
- Verification:
  - `npm run lint`
  - `PLAYWRIGHT_PORT=3102 npx playwright test e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted `analytics_events` verification for the repaired live run
- Result:
  - the live Peter handoff is dependable again on the primary signup-driven path
  - the fresh production walkthrough is re-proven through Day 1 completion
  - Phase 6 beta ops funnel events still fire on the repaired path
  - one smaller follow-up remains around noisy `journey_start_lookup` error logging on successful runs

## Phase 8 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/07-live-onboarding-reliability-recovery/07-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - investigate why `beta_primary_path_error` with `stage = journey_start_lookup` is being written on successful runs
  - remove or narrow that false-positive error logging without changing the primary user flow
  - re-run the fresh production signup-driven walkthrough and confirm Day 1 still completes
  - confirm the noisy false-positive error row no longer appears on the repaired successful run
- Explicitly out of scope:
  - new features
  - onboarding, dashboard, or daily-growth redesign
- Peter behavior changes unrelated to the false-positive signal
- broad cleanup

## Phase 8 Status
- Status: complete
- Plans completed:
  - `08-01`
  - `08-02`
- Verification:
  - `npm run lint`
  - `PLAYWRIGHT_PORT=3103 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production `analytics_events` verification for the repaired successful run
- Result:
  - the false-positive `journey_start_lookup` beta-path error signal is gone on the primary successful run
  - the fresh production signup-driven path still completes through Day 1
  - the next ops-cleanup candidate is smaller route-change noise rather than starter-journey bootstrap confusion

## Phase 9 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/08-beta-ops-signal-cleanup/08-LIVE-EVIDENCE.md`
- Primary objective:
  - investigate `beta_primary_path_error` rows caused by `route_change` during register redirects
  - remove or narrow that false-positive logging without changing the primary user flow
  - re-run the primary fresh-signup production walkthrough and confirm Day 1 still completes with reduced or eliminated route-change noise
- Secondary objective:
  - perform a focused audit and document at least five real bugs, issues, or redundancies
- Audit priorities:
  - primary signup-driven production path first
  - operator-facing production risks second
  - obvious redundancies or dead or legacy paths third
- Explicitly out of scope:
  - new features
  - broad redesign
  - random polishing
  - fixing all audit findings unless they are tiny and directly related

## Phase 9 Status
- Status: complete
- Plans completed:
  - `09-01`
  - `09-02`
  - `09-03`
- Verification:
  - `npm run lint`
  - `PLAYWRIGHT_PORT=3104 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/11-beta-ops-signal-cleanup.spec.ts e2e/tests/12-route-change-noise.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production `analytics_events` verification for the repaired successful run
- Result:
  - the false-positive `route_change` error signal is removed from the successful register redirect path
  - the fresh signup-driven production walkthrough still completes through Day 1
  - a ranked audit with six real follow-up findings is now documented for the next narrow phase

## Phase 10 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence sources:
  - `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-AUDIT-FINDINGS.md`
  - `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-LIVE-EVIDENCE.md`
- Priorities:
  - make `JourneyDetail` require successful journey activation before advancing
  - make `JourneyDetail` require successful `isonboarded` persistence before advancing
  - call `onConfirm()` only after both writes succeed
  - emit a narrow primary-path error event if either write fails
  - re-run the fresh production signup-driven walkthrough and confirm Day 1 still completes
- Explicitly out of scope:
  - new features
  - onboarding redesign
  - dashboard changes
  - daily-growth changes
  - broad cleanup

## Phase 10 Status
- Status: complete
- Plans completed:
  - `10-01`
  - `10-02`
- Verification:
  - `npm run lint`
  - `PLAYWRIGHT_PORT=3105 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/13-onboarding-activation-fail-closed.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production `analytics_events` verification for the repaired successful run
- Result:
  - `JourneyDetail` now requires activation success before advancing
  - `JourneyDetail` now requires onboarding persistence success before advancing
  - the fresh production signup-driven path still completes through Day 1

## Phase 11 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Product goal:
  - expand Sparq from serious relationship work into a broader relationship life app
- Current strengths to preserve:
  - strong personalization
  - emotionally intelligent guidance
  - proven signup-driven primary path
- Expansion needs:
  - more lightness
  - more fun
  - more daily stickiness
  - more reasons to open the app when nothing is wrong
- Required buckets:
  - playful connection layer
  - shared rituals layer
  - adaptive date-night layer
  - couple game mode
  - joy and celebration layer
- Explicitly out of scope:
  - code changes
  - engineering plans
  - redesigning the proven primary path

## Phase 12 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Upstream strategy source:
  - `.planning/phases/11-relationship-life-expansion-strategy/11-PRODUCT-STRATEGY.md`
- Chosen lane:
  - playful connection layer
- Required output:
  - best choice
  - why it wins now
  - what not to build yet
  - the smallest MVP version
  - the exact surfaces it would touch
  - the main risks
- Explicitly out of scope:
  - code changes
  - engineering work
  - redesigning onboarding, dashboard, or daily-growth

## Phase 13 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Upstream product sources:
  - `.planning/phases/11-relationship-life-expansion-strategy/11-PRODUCT-STRATEGY.md`
  - `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
- Required output:
  - 3 to 5 playful features only
  - user story for each
  - why it matters
  - entry point in the app
  - frequency of use
  - required backend or data needs
  - UX flow
  - beta scope
  - future expansion path
- Explicitly out of scope:
  - code
  - engineering plans
  - redesign of the proven signup-driven path

## Phase 14 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Upstream product sources:
  - `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
  - `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
- Milestone plan:
  - build the smallest usable pair:
    - `Daily Spark`
    - `Favorite Us`
- Wave order:
  - Wave 1: isolated data and delivery layer
  - Wave 2: optional UI surfaces on dashboard and daily-growth home
  - Wave 3: regression and production-safety verification
- Explicitly out of scope:
  - onboarding changes
  - core dashboard logic redesign
  - core daily-growth logic redesign
  - `Tiny Dare`
  - `Laugh Loop`
  - reminders and notifications
  - archives, packs, or game mechanics

## Phase 14 Status
- Status: complete
- Plans completed:
  - `14-01`
  - `14-02`
  - `14-03`
- Verification:
  - `npm run lint`
  - `npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium`
  - `npx playwright test e2e/tests/02-onboarding.spec.ts --project=chromium`
- Result:
  - `Daily Spark` and `Favorite Us` are now implemented as an isolated optional MVP slice
  - dashboard and daily-growth both fail soft if playful prompts do not load
  - the proven signup-driven path remains intact in focused local regression coverage
  - this phase did not deploy or claim new live production evidence

## Phase 15 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary references:
  - `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
  - `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
  - `.planning/phases/14-playful-connection-mvp-implementation/14-01-SUMMARY.md`
  - `.planning/phases/14-playful-connection-mvp-implementation/14-02-SUMMARY.md`
  - `.planning/phases/14-playful-connection-mvp-implementation/14-03-SUMMARY.md`
- Goal:
  - safely validate the new playful connection slice in live production without weakening the proven primary signup-driven path
- Wave order:
  - Wave 1: deploy and re-prove the primary path plus intended playful surfaces
  - Wave 2: prove fail-soft production behavior and analytics visibility
  - Wave 3: define rollout guardrails and any narrow pre-exposure fixes
- Explicitly out of scope:
  - new playful features
  - widening into `Tiny Dare` or `Laugh Loop`
  - redesigning dashboard or daily-growth
  - touching onboarding or Peter unless a real regression is found

## Phase 15 Status
- Status: complete
- Plans completed:
  - `15-01`
  - `15-02`
  - `15-03`
- Verification:
  - `npm run lint`
  - `npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/15-live-playful-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production `analytics_events` queries for the core funnel and playful event stream
- Result:
  - the playful MVP slice is live and additive on production
  - the primary signup-driven path still completes through Day 1
  - dashboard and daily-growth playful surfaces work live
  - the playful slice fails soft when its endpoint is unavailable
  - the feature is safe for limited controlled-beta exposure with clear rollback guardrails

## Phase 16 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary evidence source: `.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-LIVE-EVIDENCE.md`
- Explicitly in scope:
  - expose the playful slice only to the current controlled-beta cohort
  - monitor the core funnel and playful interaction stream together
  - collect qualitative beta feedback on warmth, helpfulness, optionality, and intrusiveness
  - decide whether to keep, tune, reduce, or expand later
- Explicitly out of scope:
  - new playful features
  - navigation redesign
  - broad UI overhaul
  - onboarding changes unless a real regression appears

## Phase 16 Status
- Status: complete
- Plans completed:
  - `16-01`
  - `16-02`
  - `16-03`
- Verification:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx playwright test e2e/tests/14-playful-connection.spec.ts --project=chromium`
  - `npx vercel deploy --prod --yes`
  - `curl -I https://sparq-connection-lab.vercel.app/signup`
  - `PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/08-live-beta-verification.spec.ts --project=chromium --workers=1 --no-deps`
  - `PHASE16_COHORT_EMAIL=... PHASE16_COHORT_PASSWORD=... PLAYWRIGHT_BASE_URL=https://sparq-connection-lab.vercel.app npx playwright test e2e/tests/16-live-controlled-beta-review.spec.ts --project=chromium --workers=1 --no-deps`
  - targeted production `analytics_events` review for the core funnel, playful stream, and beta feedback rows
- Result:
  - the playful slice is now limited to the intended controlled-beta cohort
  - pre-cutoff cohort users still see the playful layer on dashboard and daily-growth home
  - post-cutoff users stay on the serious core with no playful prompts
  - the core primary path still completes through Day 1
  - current evidence supports keeping the playful slice as is for controlled beta

## Phase 17 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Primary visual reference:
  - user-provided editorial relationship-life mockup dated `2026-03-31`
- Upstream product inputs:
  - `.planning/phases/11-relationship-life-expansion-strategy/11-PRODUCT-STRATEGY.md`
  - `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
  - `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
  - `.planning/phases/16-playful-layer-controlled-beta-exposure-and-signal-review/16-LIVE-EVIDENCE.md`
- Goal:
  - define a UI design contract that moves Sparq toward an editorial, premium, relationship-life feel while protecting the proven signup-driven path
- Safe target surfaces:
  - dashboard
  - daily-growth home
  - bottom navigation
  - editorial content cards and support modules
  - current playful MVP styling
- Explicitly out of scope:
  - onboarding logic changes
  - Peter behavior changes
  - dashboard core logic redesign
  - daily-growth core logic redesign
  - new features or new navigation sections

## Phase 17 Status
- Status: defined
- Deliverables created:
  - `17-CONTEXT`
  - `17-UI-SPEC`
- Verification:
  - visual contract reviewed against current Tailwind, shadcn, Radix, and existing brand-token constraints
  - recovery branch re-verified the current implementation baseline with:
    - `npm run lint`
    - `npx tsc --noEmit`
    - `PLAYWRIGHT_PORT=3108 npx playwright test e2e/tests/02-onboarding.spec.ts e2e/tests/03-daily-growth.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium`
    - `PLAYWRIGHT_PORT=3109 npx playwright test e2e/tests/10-onboarding-determinism.spec.ts e2e/tests/13-onboarding-activation-fail-closed.spec.ts --project=chromium`
- Result:
  - the next UI phase now has a concrete editorial design contract instead of only a mood reference
  - dashboard and daily-growth should now be treated from the recovered `origin/main` baseline rather than the broken local-`main` merge state
  - `Daily Spark` and `Favorite Us` are part of the recovered safe-surface baseline for future UI planning

## Phase 18 Notes
- Source of truth: `SPARQ_MASTER_SPEC.md`
- Implementation baseline:
  - recovered `origin/main` branch
  - current supported beta path in `IMPLEMENTATION_STATUS.md`
- Product and UX references:
  - `.planning/phases/11-relationship-life-expansion-strategy/11-PRODUCT-STRATEGY.md`
  - `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
  - `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
  - `.planning/phases/16-playful-layer-controlled-beta-exposure-and-signal-review/16-03-SUMMARY.md`
  - `.planning/phases/17-editorial-relationship-life-ui-refresh/17-CONTEXT.md`
  - `.planning/phases/17-editorial-relationship-life-ui-refresh/17-UI-SPEC.md`
- Explicitly in scope:
  - final primary tab structure
  - destination job definition
  - exact Home contents and removals
  - exact module ownership by destination
  - phased implementation order and guardrails
- Explicitly out of scope:
  - visual redesign execution
  - onboarding flow changes
  - daily-growth step logic changes
  - new playful feature expansion
  - new backend endpoints

## Phase 18 Status
- Status: complete
- Plans:
  - [x] 18-01-PLAN.md -- Navigation and destination contract
  - [x] 18-02-PLAN.md -- Home simplification and module ownership contract
  - [x] 18-03-PLAN.md -- IA rollout order, risks, and verification contract
- Verification:
  - contract references recovered `dashboard`, `daily-growth`, `journeys`, `bottom-nav`, and current secondary destinations
  - contract preserves the proven `/dashboard -> /daily-growth` launch path
  - contract keeps `Daily Spark` on Home and `Favorite Us` on `daily-growth`
  - contract moves profile/settings/account to secondary access instead of primary tab ownership
- Deliverables:
  - `18-CONTEXT.md`
  - `18-IA-CONTRACT.md`
  - `18-01-SUMMARY.md`
  - `18-02-SUMMARY.md`
  - `18-03-SUMMARY.md`
- Result:
  - Sparq now has a destination-based IA contract grounded in the recovered baseline
  - Home simplification is defined before visual redesign work
  - later implementation can move modules with explicit ownership and guardrails instead of guesswork

### Phase 19: Implement IA Wave 1: Home Simplification and Navigation Restructure

**Goal:** Make Home a single-next-step launcher and switch primary navigation to destination ownership without regressing the proven `/dashboard -> /daily-growth` path or the locked playful placements.
**Requirements**: `IA-WAVE1-01`, `IA-WAVE1-02`, `IA-WAVE1-03`
**Depends on:** Phase 18
**Plans:** 1/3 plans executed

Plans:
- [x] 19-01-PLAN.md -- Create `/connect` and `/journal` plus the shared reflective hook and Connect leaf return paths
- [ ] 19-02-PLAN.md -- Restructure primary nav and simplify Home into Today card plus quiet destination strip
- [ ] 19-03-PLAN.md -- Reduce `/profile` to secondary access and update focused Playwright IA coverage

Verification:
- `npm run lint -- --file src/hooks/useProfileTraits.ts --file src/pages/journal.tsx --file src/pages/connect.tsx --file src/pages/go-connect.tsx --file src/pages/translator.tsx`
- `npx playwright test e2e/tests/19-connect-journal-ia.spec.ts -g "Connect landing|Journal ownership|Connect leaf return routes" --project=chromium`
- `npx playwright test e2e/tests/19-connect-journal-ia.spec.ts --project=chromium` (later-wave nav ownership assertions still pending Plan 19-02 and 19-03)

Result:
- `/journal` now owns the reflective Wave 1 surfaces outside secondary account access
- `/connect` now owns the curated landing path into Messages, Go Connect, Translator, and Join Partner
- nav ownership and secondary-page nav hiding remain the next execution step
