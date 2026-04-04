# Sparq Connection Lab — Implementation Status

> Repo-first snapshot: 2026-03-30
> Source of truth: `SPARQ_MASTER_SPEC.md`
> Supporting context: `LAUNCH_CHECKLIST.md`, Phase 1 and Phase 2 planning artifacts

---

## Read This First

- `DONE` means the code exists and is part of the supported beta path.
- `PARTIAL` means the code exists but still needs hardening or live-environment proof.
- `QUARANTINED` means the code still exists in the repo but is not part of the supported beta path.
- `TECH DEBT` means it works, but contributors could still get confused if they follow the wrong module family.

---

## 1. Supported Beta Path

The current supported beta path is:
- `/login`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/daily-growth`

This path is now the one reflected in docs, route redirects, and focused Playwright coverage.

---

## 2. Infrastructure & Environment

| Item | Status | Notes |
|------|--------|-------|
| Next.js Pages Router | DONE | `src/pages/**` remains the active app shell |
| TypeScript strict mode | DONE | `tsconfig.json` is still strict |
| Tailwind + shadcn/ui primitives | DONE | Core UI layer is in active use |
| Canonical Supabase client | DONE | `src/lib/supabase.ts` |
| Legacy Supabase client shim | TECH DEBT | `src/integrations/supabase/client.ts` now exists only as a deprecated re-export |
| Env contract for beta | DONE | `.env.example` now documents the current keys, including `NEXT_PUBLIC_GOOGLE_API_KEY` |
| Vite env usage in beta path | DONE | `src/lib/api-config.ts` already uses `process.env`, and the old docs claiming otherwise were stale |
| Fresh-project DB reproducibility | PARTIAL | `supabase/schema.sql` plus migrations exist, but live-project verification is still required before inviting users |

---

## 3. Authentication & Route Access

| Item | Status | Notes |
|------|--------|-------|
| Canonical auth provider | DONE | Core flows use `src/lib/auth-context.tsx` |
| Login flow | DONE | `/login` is the supported auth entry |
| Signup flow | DONE | `/signup` now redirects into the canonical register flow and is fixed in production |
| Protected route baseline | DONE | Canonical wrapper is in place after Phase 1 |
| Legacy `/auth` page | QUARANTINED | Now redirects to `/login` |
| Legacy `src/lib/auth/**` family | TECH DEBT | Still used by non-core surfaces; should not guide beta-path work |

Phase 1 closed the most important auth consistency gaps. Phase 2 reduces route confusion but does not fully remove the older auth module family yet.

---

## 4. Onboarding

| Item | Status | Notes |
|------|--------|-------|
| Active onboarding route | DONE | `/onboarding` is the supported flow |
| Redirect determinism | DONE | Completed users are routed to dashboard instead of bouncing back into onboarding |
| Solo-first framing | DONE | The supported onboarding path no longer assumes partner adoption |
| `src/pages/onboarding-flow.tsx` as active flow | NOT APPLICABLE | Earlier docs were stale; the supported flow is `/onboarding` |
| Day-14 graduation and downstream progression | PARTIAL | Supported by current loop logic, but still worth continued live-user validation |

---

## 5. Daily Loop

| Item | Status | Notes |
|------|--------|-------|
| Canonical daily route | DONE | `/daily-growth` |
| Daily session API path | DONE | `/api/daily/session/*` is the supported loop backbone |
| Solo-first daily copy | DONE | Core labels now center on one user improving how they show up |
| Dashboard-to-daily state clarity | DONE | CTA language now distinguishes begin vs resume evening reflection |
| Evening reflection completion path | DONE | Daily page now gives clearer morning-story and evening-reflection labels |
| Legacy daily routes | QUARANTINED | `/daily-questions` and `/daily-activity` now redirect to `/daily-growth` |
| Reflection quality and analytics depth | PARTIAL | Better than before, but still not the final measurement system described in the spec |

Phase 1 stabilized backend reliability. Phase 2 tightened the user-facing clarity that directly affects follow-through.

---

## 6. Safety, Trust, and Solo-First Product Direction

| Item | Status | Notes |
|------|--------|-------|
| Trust Center | DONE | Active and aligned with solo-first positioning |
| Crisis-aware Peter responses | DONE | Safety routing remains in place |
| Solo-first relationship mode | DONE | Current beta path treats solo use as complete, not second class |
| Partner features for beta | PARTIAL | Present, but they should stay optional during early user testing |

---

## 7. Launch Readiness

| Item | Status | Notes |
|------|--------|-------|
| Repo-level beta readiness script | DONE | `scripts/verify-beta-readiness.mjs` |
| Launch checklist current to repo | DONE | `LAUNCH_CHECKLIST.md` was refreshed in Phase 2 |
| Live Supabase verification | DONE | Phase 3 verified the required beta tables and `daily_sessions` shape in the linked project |
| Live AI key verification | DONE | Phase 3 verified `OPENAI_API_KEY` and `OPENROUTER_API_KEY` are present in production |
| Live solo-first walkthrough | DONE | Phase 5 proved the primary fresh-signup production path through Day 1 completion |
| Controlled beta ops layer | DONE | Phase 6 shipped feedback capture, primary-path funnel events, and primary-path error logging to production |

---

## 8. Biggest Remaining Risks After Phase 14

1. The secondary login-entry fallback live walkthrough is still more variable than the primary signup-driven path.
2. Daily-loop analytics still duplicate or misattribute some completion and verification signals on successful runs.
3. Live migration history has drifted away from local migration history, which is a reproducibility risk even though the required tables exist.
4. Older `@/lib/auth` consumers remain in non-core pages and can still mislead contributors.
5. Entitlements and analytics writes can still degrade silently enough to weaken operator trust during beta.

---

## 9. Phase Progress Summary

### Phase 1 — Beta Stabilization
- auth consistency improved
- onboarding reliability improved
- daily-session reliability improved

### Phase 2 — Beta Hardening
- env and schema expectations made explicit
- launch checklist refreshed to match the real repo
- dashboard and daily-loop state wording clarified
- legacy auth and daily route alternatives quarantined

### Phase 3 — Live Beta Verification
- linked Supabase schema verified live
- deployed env keys verified live
- production blockers documented with screenshots and route checks

### Phase 4 — Production Blocker Fixes
- `/signup` production crash fixed and redeployed
- onboarding recommendation card restored for starter-journey IDs
- live reruns show the original blockers are gone, but Day 1 completion is still not fully proven for a fresh production account

### Phase 5 — Live Onboarding Determinism
- Peter onboarding handoff bounded with a deterministic close policy
- targeted automated coverage added for the handoff rules
- primary fresh-signup production walkthrough now passes end to end through Day 1 completion

### Phase 6 — Controlled Beta Ops
- beta feedback capture added on the primary signup-driven path
- primary-path funnel analytics added for signup, dashboard arrival, daily start, and Day 1 completion
- primary-path error logging added and verified live
- targeted production evidence confirms the new ops layer is writing to `analytics_events`
- fresh full-path live reruns surfaced renewed Peter handoff variance, which remains a follow-up reliability issue rather than a Phase 6 scope expansion

### Phase 7 — Live Onboarding Reliability Recovery
- Peter handoff policy tightened so the onboarding close is forced earlier and more predictably
- live production proof updated to wait on real Peter responses instead of fixed sleeps
- fresh signup-driven production walkthrough now passes again end to end through Day 1 completion
- Phase 6 funnel events were re-confirmed on the repaired path
- one smaller follow-up remains: noisy `journey_start_lookup` error logging can still fire on a successful run

### Phase 8 — Beta Ops Signal Cleanup
- traced the noisy `journey_start_lookup` row to the primary path calling the legacy UUID-only journey bootstrap for starter journey ids
- starter journeys now skip the legacy `/api/journeys/start` route and use only the supported starter activation path
- fresh production signup-driven walkthrough still passes through Day 1 completion
- the repaired successful run no longer writes the false-positive `journey_start_lookup` error row

### Phase 9 — Route Change Noise Cleanup And Focused Production Audit
- narrowed the global route-change error handler so expected register redirect cancels no longer report as `beta_primary_path_error`
- fresh production signup-driven walkthrough still passes through Day 1 completion after the route-signal cleanup
- the repaired successful run user `f60369d7-cb69-483e-9d81-0eab3814bff3` now has `pathErrorCount = 0`
- a focused ranked audit now captures six evidence-backed follow-up findings in `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-AUDIT-FINDINGS.md`

### Phase 10 — Onboarding Activation Fail-Closed
- `JourneyDetail` now verifies activation success before advancing out of onboarding
- `JourneyDetail` now verifies the `profiles.isonboarded` write before advancing
- the handoff emits narrow primary-path error stages for activation and persistence failures
- fresh production signup-driven walkthrough still passes through Day 1 completion after the fail-closed repair

### Phase 14 — Playful Connection MVP Implementation
- added the smallest isolated playful slice:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- used a static curated prompt catalog plus a tiny contained API instead of adding new schema or route complexity
- kept the new slice optional and fail-soft so the proven signup-driven path still behaves the same when playful prompts are unavailable
- added focused Playwright coverage for playful interactions and soft-failure behavior
- locally re-confirmed onboarding, dashboard, and daily-growth regression coverage without deploying the new slice yet

### Phase 15 — Playful Layer Live Verification And Rollout Guardrails
- deployed the playful MVP slice to production
- re-proved the fresh signup-driven production path through Day 1 completion after the playful deploy
- proved live `Daily Spark` behavior on dashboard:
  - visible
  - try
  - swap
  - copy
- proved live `Favorite Us` behavior on the daily-growth home:
  - visible
  - keep
  - copy
- proved the playful slice fails soft when `/api/playful/today` is unavailable
- confirmed the playful analytics stream is visible and distinct from the primary funnel
- the slice is now safe for limited controlled-beta exposure, with rollout guardrails documented in Phase 15

### Phase 16 — Playful Layer Controlled Beta Exposure And Signal Review
- added a production cutoff gate for the playful slice using `PLAYFUL_BETA_COHORT_CUTOFF`
- pre-cutoff cohort users still see:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- post-cutoff users stay on the proven serious core without playful prompts
- fresh post-cutoff signup-driven production walkthrough still completes through Day 1
- targeted beta feedback on the playful surfaces is now captured with playful-specific stage context
- current evidence supports keeping the playful slice as is for the controlled-beta cohort while gathering a larger real-user sample
