---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: attachment-aware-personalization
status: Defining requirements
last_updated: "2026-04-05T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State

## Current Position

Phase: Not started (defining requirements)
Plan: —

- Milestone: Attachment-Aware Personalization (v2.0)
- Active phase: none
- Phase status: Defining requirements — Last activity: 2026-04-05 — Milestone v2.0 started
- Note: Phase 20 (Editorial UI Refresh) still in flight — Plans 03 and 04 pending

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

- Phase 19 locked the stable destination structure across `Home`, `Journeys`, `Connect`, and `Journal`
- the next step is to visually refine that now-stable structure without reopening IA or behavior
- the current product still reads too much like a utility dashboard instead of a calmer relationship-life app
- this phase exists to make the stable primary destinations feel more premium, more coherent, and more emotionally intentional

## Current Risks

- daily-loop analytics still have duplicate or misattributed signals on successful runs
- entitlement fallback and analytics insert failures can still hide operator-facing production problems
- the secondary login-entry fallback path is still less dependable than the primary signup-driven path
- live migration history drift still weakens fresh-project reproducibility
- Home is overloaded and weakens clarity about the single next step
- destination ownership is still blurred between Home, Journeys, Connect, Journal, and secondary access
- direct-login re-entry behavior is still a smaller watch item compared with the fresh signup-driven primary path
- the playful layer is now cohort-gated and looks non-intrusive, but the real-user sample is still too small to claim a retention lift
- a visual refresh that reopens IA or feature scope would destabilize the newly proven structure
- editorial polish can accidentally flatten Home hierarchy or make `Connect`, `Journal`, and `Journeys` feel interchangeable if the destination moods are not kept distinct

## Next Expected Action

- execute `20-03-PLAN.md`
- extend the verified featured-module pattern from Home into `Connect`, `Journal`, and `Journeys`
- preserve the proven `Home -> daily-growth` launch path and all Phase 19 destination ownership
- keep playful placement and route-owner mapping untouched while destination personality becomes more distinct

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
- Phase 20 context gathered: editorial refresh constrained to the completed Phase 19 IA, with Home focus, Connect warmth, Journal quietness, Journeys progress clarity, and no new feature scope
- Phase 20 Plan 01 completed: Wave 0 editorial review assets, shared editorial token remap, and presentation-only editorial surface primitives landed
- Phase 20 Plan 01 verification: lint, `npx tsc --noEmit`, and the targeted Playwright bundle for dashboard, IA ownership, and editorial route coverage all passed
- Phase 20 Plan 02 completed: Home, the daily-growth home state, playful companion cards, and the bottom-nav shell now share the calmer editorial hierarchy without changing IA ownership
- Phase 20 Plan 02 verification: targeted lint passed and `e2e/tests/05-dashboard.spec.ts`, `e2e/tests/14-playful-connection.spec.ts`, `e2e/tests/19-connect-journal-ia.spec.ts`, and `e2e/tests/20-editorial-ui-refresh.spec.ts` all passed against a local Next dev server

## Decisions

- Preserve existing `brand-*` utility names and remap them to the approved editorial contract so later waves can restyle pages without a compatibility pass.
- Load `Cormorant Garamond` as the display serif via `next/font` while keeping the shell body stack sans.
- Ignore CSS files in Next ESLint so the plan's targeted lint command can verify `globals.css` without parsing it as JavaScript.
- [Phase 20]: Home keeps a single accent-dominant Today hero while Peter, Daily Spark, and the destination strip stay visually subordinate.
- [Phase 20]: The daily-growth home state keeps its existing Home-owned copy contract even after the editorial layout refresh so existing browser coverage stays valid.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Notes |
| --- | --- | --- | --- | --- | --- |
| 20 | 01 | 7min | 3 | 7 | Wave 1 foundation gate passed |
| 20 | 02 | 6min | 2 | 8 | Wave 2 lint and Playwright gates passed |

## Session

- Last session: 2026-04-06T14:55:23Z
- Stopped at: Completed 20-02-PLAN.md
