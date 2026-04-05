# State

## Current Position
- Milestone: Editorial Relationship Life UI Refresh
- Active phase: 17
- Phase status: defined

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
- Phase 15 proved the playful slice is live, additive, and fail-soft in production.
- Phase 16 showed the playful layer is safe to keep for the controlled-beta cohort, but the product still looks more like a serious utility than the relationship-life app vision.
- The new phase exists to convert the editorial visual reference into a buildable contract for safe existing surfaces without destabilizing the proven signup-driven path.

## Current Risks
- daily-loop analytics still have duplicate or misattributed signals on successful runs
- entitlement fallback and analytics insert failures can still hide operator-facing production problems
- the secondary login-entry fallback path is still less dependable than the primary signup-driven path
- live migration history drift still weakens fresh-project reproducibility
- the product still leans too heavily toward “open this when something is wrong”
- direct-login re-entry behavior is still a smaller watch item compared with the fresh signup-driven primary path
- the playful layer is now cohort-gated and looks non-intrusive, but the real-user sample is still too small to claim a retention lift
- the visual system is not yet cohesive enough to deliver the premium editorial feel the product direction now calls for

## Next Expected Action
- use `17-UI-SPEC.md` to plan a narrow visual refresh for safe existing surfaces
- keep the proven signup-driven path, onboarding logic, and Day 1 core loop untouched
- treat the playful layer as additive styling, not a new navigation or product branch
- treat the recovered `origin/main` dashboard and daily-growth flows as the implementation baseline for future UI work
- only move into implementation once the safe-surface scope and token contract are accepted
