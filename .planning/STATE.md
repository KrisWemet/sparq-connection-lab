---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Milestone complete
last_updated: "2026-04-06T00:45:18.167Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
---

# State

## Current Position

Phase: 19
Plan: Not started

- Milestone: Editorial Relationship Life UI Refresh
- Active phase: 19
- Phase status: UI-SPEC approved

## Current Inputs

- Source of truth: `SPARQ_MASTER_SPEC.md`
- Implementation snapshot: `IMPLEMENTATION_STATUS.md`
- Recovered implementation baseline:
  - `origin/main` dashboard and daily-growth are the working source of truth for current core flows
  - `Daily Spark` and `Favorite Us` are wired on the recovered branch and locally re-verified
  - the broken local-`main` dashboard merge is not part of the implementation baseline
- Codebase map:
  - `.planning/codebase/STACK.md`
  - `.planning/codebase/INTEGRATIONS.md`
  - `.planning/codebase/ARCHITECTURE.md`
  - `.planning/codebase/STRUCTURE.md`
  - `.planning/codebase/CONVENTIONS.md`
  - `.planning/codebase/TESTING.md`
  - `.planning/codebase/CONCERNS.md`

## Why This Phase Exists

- Phase 18 defined the destination-based IA contract and the full planning-history synthesis behind it
- the next step is to implement the first safe structural wave from that contract
- Home still carries too many jobs at once and the current bottom nav still mixes destinations with a task flow
- this phase exists to simplify Home and restructure primary navigation without breaking the proven daily path

## Current Risks

- daily-loop analytics still have duplicate or misattributed signals on successful runs
- entitlement fallback and analytics insert failures can still hide operator-facing production problems
- the secondary login-entry fallback path is still less dependable than the primary signup-driven path
- live migration history drift still weakens fresh-project reproducibility
- Home is overloaded and weakens clarity about the single next step
- destination ownership is still blurred between Home, Journeys, Connect, Journal, and secondary access
- direct-login re-entry behavior is still a smaller watch item compared with the fresh signup-driven primary path
- the playful layer is now cohort-gated and looks non-intrusive, but the real-user sample is still too small to claim a retention lift
- a visual refresh before Wave 1 IA implementation would risk polishing the wrong structure

## Next Expected Action

- execute `19-02-PLAN.md`
- update primary-nav ownership to `Home`, `Journeys`, `Connect`, and `Journal`
- make `/daily-growth` read as Home-owned in nav state
- hide primary navigation on `/profile`, `/settings`, `/subscription`, and `/trust-center`
- preserve the proven `dashboard -> daily-growth` launch path during navigation changes
- keep playful placement narrow: `Daily Spark` on Home and `Favorite Us` on `daily-growth`

## Accumulated Context

### Roadmap Evolution

- Phase 18 added: Sparq IA Contract And Home Simplification — destination-based navigation and Home simplification from the recovered baseline
- Phase 18 completed: final tab structure, Home simplification contract, destination ownership map, and rollout guardrails documented in `18-IA-CONTRACT.md`
- Phase 19 added: Implement IA Wave 1: Home Simplification and Navigation Restructure — first implementation wave for Home simplification and primary-nav restructuring from the Phase 18 IA contract
- Phase 19 context gathered: Home simplification, Connect landing, Journal/profile split, and deferred `date-ideas` decisions locked in `19-CONTEXT.md`
- Phase 19 UI-SPEC approved: Wave 1 visual and interaction contract documented in `19-UI-SPEC.md`
- Phase 19 Plan 01 completed: Wave 0 IA coverage, shared reflective trait hook, `/journal`, `/connect`, and Connect leaf returns to `/connect`
- Phase 19 Plan 01 verification: focused Connect/Journal ownership checks passed; full IA spec remains red only on later-wave nav ownership assertions
- Phase 20 added: Editorial UI Refresh on Stable IA
