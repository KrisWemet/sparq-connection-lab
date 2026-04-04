# Phase 1: Beta Stabilization - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning
**Source:** User-directed phase definition using `SPARQ_MASTER_SPEC.md`

<domain>
## Phase Boundary

Phase 1 exists to make Sparq’s current beta credible without expanding the feature set.

This phase is limited to:
- auth consistency
- onboarding reliability
- daily loop reliability
- architecture cleanup only where it directly protects those flows

Out of scope:
- broad new feature work
- partner feature expansion
- monetization expansion
- general cleanup that does not reduce beta risk

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- `SPARQ_MASTER_SPEC.md` is the source of truth for product behavior and architecture expectations.
- The beta promise is solo-first and individual-first, not partner-dependent.
- Auth must follow the spec’s canonical path:
  - browser/app state through `src/lib/auth-context.tsx`
  - API auth through `src/lib/server/supabase-auth.ts`
- Onboarding must be deterministic, refresh-safe, and non-blocking for solo users.
- Daily loop behavior must be idempotent for same-day use and must preserve morning/action/evening progression.
- Architecture cleanup is allowed only when it removes ambiguity or bugs in auth, onboarding, or daily-session flows.
- Testing must prove real user-critical flows, not just static rendering.

### The Agent's Discretion
- Exact file-level consolidation strategy for duplicate auth hooks and protected-route helpers
- Whether onboarding reliability is best improved by page logic cleanup, shared helper extraction, API tightening, or a combination
- Which daily-session invariants deserve lower-level tests versus Playwright-only coverage
- Whether targeted cleanup should delete legacy code, deprecate it, or isolate it from the beta path

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Source Of Truth
- `SPARQ_MASTER_SPEC.md` — authoritative spec for product behavior, architecture, and roadmap
- `IMPLEMENTATION_STATUS.md` — repo-state snapshot and identified gaps

### Codebase Architecture
- `.planning/codebase/ARCHITECTURE.md` — current architectural center of gravity and drift
- `.planning/codebase/CONCERNS.md` — current risks and best near-term refactor targets
- `.planning/codebase/TESTING.md` — current E2E setup and gaps

### Critical Product Paths
- `src/lib/auth-context.tsx` — canonical app auth provider
- `src/lib/server/supabase-auth.ts` — canonical API auth helper
- `src/lib/supabase.ts` — browser Supabase client
- `src/pages/onboarding.tsx` — active onboarding page
- `src/components/onboarding/ConsentGate.tsx` — onboarding consent and safety entry
- `src/pages/daily-growth.tsx` — core daily loop UI
- `src/pages/api/daily/session/start.ts` — daily session creation and resume
- `src/pages/api/daily/session/morning-viewed.ts` — morning transition
- `src/pages/api/daily/session/complete.ts` — session completion
- `src/pages/api/daily/session/evening-checkin.ts` — evening reflection flow
- `e2e/auth.setup.ts` — auth bootstrap coverage
- `e2e/tests/02-onboarding.spec.ts` — onboarding verification
- `e2e/tests/03-daily-growth.spec.ts` — daily loop verification
- `e2e/tests/05-dashboard.spec.ts` — dashboard entry reliability
- `e2e/tests/07-daily-session-reliability.spec.ts` — session invariants

</canonical_refs>

<specifics>
## Specific Ideas

- Favor a small number of vertical stabilization slices over broad cleanup.
- Use the phase to make the beta path obvious in code:
  - one auth path
  - one onboarding progression path
  - one daily-session state machine
- Eliminate or fence off legacy code only if it is actively confusing or breaking these paths.

</specifics>

<deferred>
## Deferred Ideas

- Skill tree progression expansion
- Partner-system improvements beyond beta-safe solo-first framing
- New dashboards or new premium surfaces
- Broad architecture modernization outside the critical flows

</deferred>

---

*Phase: 01-beta-stabilization*
*Context gathered: 2026-03-30 via direct planning request*
