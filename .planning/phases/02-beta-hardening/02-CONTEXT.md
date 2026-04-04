# Phase 2: Beta Hardening - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning
**Source:** User-directed phase definition using `SPARQ_MASTER_SPEC.md`

<domain>
## Phase Boundary

Phase 2 exists to harden the supported Sparq beta path for real user testing after Phase 1 stabilization.

This phase is limited to:
- database and environment consistency
- launch-blocker verification from `LAUNCH_CHECKLIST.md`
- daily-loop UI and state clarity where it directly affects reliability
- removing or quarantining legacy code that still confuses the beta path

Out of scope:
- broad new feature development
- partner feature expansion
- monetization expansion
- broad refactors that do not reduce real-user beta risk

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions
- `SPARQ_MASTER_SPEC.md` remains the source of truth.
- `IMPLEMENTATION_STATUS.md` and `LAUNCH_CHECKLIST.md` are supporting repo and launch context, not higher-order sources.
- Phase 1 summaries define the currently supported beta path and must not be undone.
- Hardening should prefer explicit verification, quarantine, and consistency over new capability.
- Daily-loop UI work is allowed only when it makes the supported user path clearer and more reliable.
- Legacy removal is in scope only when that code still misleads contributors, testers, or users about the supported beta flow.

### The Agent's Discretion
- Exact split between automated verification and operator-run checklist steps
- Which legacy files should be deleted versus fenced off behind clear deprecation boundaries
- Whether daily-loop clarity is best improved in dashboard entry UI, in-loop sequencing UI, or both
- How much of the DB/env consistency work should be enforced by scripts versus documentation and tests

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source Of Truth
- `SPARQ_MASTER_SPEC.md` — authoritative spec for behavior, architecture, and product scope

### Repo And Launch Context
- `IMPLEMENTATION_STATUS.md` — audited implementation gaps and technical debt
- `LAUNCH_CHECKLIST.md` — launch blockers and required live-environment checks
- `.planning/codebase/CONCERNS.md` — current architecture and risk hotspots
- `.planning/codebase/STRUCTURE.md` — codebase layout and legacy surfaces

### Upstream Phase Outputs
- `.planning/phases/01-beta-stabilization/01-01-SUMMARY.md`
- `.planning/phases/01-beta-stabilization/01-02-SUMMARY.md`
- `.planning/phases/01-beta-stabilization/01-03-SUMMARY.md`

### Likely Hardening Targets
- `src/lib/supabase.ts`
- `src/lib/api-config.ts`
- `src/integrations/supabase/client.ts`
- `supabase/schema.sql`
- `supabase/migrations/**`
- `src/pages/dashboard.tsx`
- `src/pages/daily-growth.tsx`
- `src/pages/daily-questions.tsx`
- `src/pages/daily-activity.tsx`
- `src/pages/auth.tsx`
- `src/pages/onboarding-flow.tsx`
- `e2e/tests/**`
- `scripts/**`

</canonical_refs>

<specifics>
## Specific Ideas

- Prefer creating an obvious “supported beta path” over trying to fully modernize the repo.
- Translate `LAUNCH_CHECKLIST.md` from a mostly manual audit into a narrower, more operational hardening pass.
- Use this phase to make it easier for another engineer or operator to answer:
  - Is the environment ready?
  - Is the schema compatible?
  - What path should testers use?
  - Which routes or files are legacy and not part of beta?

</specifics>

<deferred>
## Deferred Ideas

- New product features
- Major journey-system redesign
- Subscription persistence redesign unless it becomes a launch blocker for current beta testing
- Broad type-system cleanup outside files that directly affect the beta path

</deferred>

---

*Phase: 02-beta-hardening*
*Context gathered: 2026-03-30 via direct planning request*
