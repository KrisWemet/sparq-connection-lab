---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: attachment-aware-personalization
status: Phase 21 defined
last_updated: "2026-04-05T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State

## Current Position

Phase: 21 — Pattern Infrastructure
Plan: —

- Milestone: Attachment-Aware Personalization (v2.0)
- Active phase: 21
- Phase status: defined — Last activity: 2026-04-05 — Roadmap created for v2.0
- Note: Phase 20 (Editorial UI Refresh) still in flight — Plans 03 and 04 pending on previous milestone

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

- Phase 20 completed the editorial UI refresh and destination structure is now locked
- the app has no hidden personalization layer — Peter tone, morning stories, and journey routing treat every user identically
- users with different relationship patterns (repair style, reassurance need, etc.) receive identical experiences
- Phase 21 lays the vocabulary foundation and shared context builder that makes silent personalization possible without clinical labels or new UI surfaces

## Current Risks

- pattern vocabulary must be non-clinical throughout — one leaked label in a user-facing surface breaks the trust contract
- inference is silent and fire-and-forget; any blocking behavior in evening reflection would regress a proven daily-loop completion path
- the `buildPatternContext` type signature locked in Phase 21 becomes load-bearing for phases 22, 23, and 24 — changes after Phase 21 would cascade
- all 8 dimensions must work solo-first; none can depend on partner presence

## Next Expected Action

- execute Phase 21: write the Supabase migration documenting the 7 new `profile_traits` keys and allowed values, then implement `src/lib/server/attachment-context.ts` with the `buildPatternContext` helper

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
- Phases 21–24 added: Attachment-Aware Personalization roadmap created — infrastructure, signal capture, Peter adaptation, and journey routing in four sequential phases

### Milestone v2.0 Phase Map

| Phase | Name | Status |
|-------|------|--------|
| 21 | Pattern Infrastructure | defined |
| 22 | Signal Capture | defined |
| 23 | Peter Adaptation | defined |
| 24 | Pattern-Weighted Journey Routing | defined |

## Decisions

- Preserve existing `brand-*` utility names and remap them to the approved editorial contract so later waves can restyle pages without a compatibility pass.
- Load `Cormorant Garamond` as the display serif via `next/font` while keeping the shell body stack sans.
- Ignore CSS files in Next ESLint so the plan's targeted lint command can verify `globals.css` without parsing it as JavaScript.
- [Phase 20]: Home keeps a single accent-dominant Today hero while Peter, Daily Spark, and the destination strip stay visually subordinate.
- [Phase 20]: The daily-growth home state keeps its existing Home-owned copy contract even after the editorial layout refresh so existing browser coverage stays valid.
- [Phase 21]: `profile_traits` is the single store for all 8 inferred dimensions — no new tables.
- [Phase 21]: `buildPatternContext` returns `null` per missing dimension, never throws — this is the contract downstream phases depend on.
- [v2.0]: All pattern vocabulary must use plain human language — no clinical labels anywhere in any server path or user-facing surface.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Notes |
| --- | --- | --- | --- | --- | --- |
| 20 | 01 | 7min | 3 | 7 | Wave 1 foundation gate passed |
| 20 | 02 | 6min | 2 | 8 | Wave 2 lint and Playwright gates passed |

## Session

- Last session: 2026-04-06T14:55:23Z
- Stopped at: Roadmap created for v2.0 Attachment-Aware Personalization
