---
phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure
plan: "01"
subsystem: ui
tags: [react, nextjs, playwright, navigation, journal, connect]
requires:
  - phase: 18-sparq-ia-contract-and-home-simplification
    provides: destination ownership contract for Home, Journal, Connect, and secondary access
provides:
  - Wave 0 Playwright coverage for Connect and Journal IA ownership
  - shared profile-traits hook for reflective surfaces
  - `/journal` reflective destination page
  - `/connect` curated landing page
  - Connect-owned leaf returns to `/connect`
affects: [19-02-PLAN.md, 19-03-PLAN.md, bottom-nav, dashboard, profile]
tech-stack:
  added: []
  patterns:
    - shared reflective data hook using `supabase.auth.getSession()` plus `/api/profile/traits`
    - route-ownership Playwright coverage with named `-g` filters for staged IA rollout
key-files:
  created:
    - e2e/tests/19-connect-journal-ia.spec.ts
    - src/hooks/useProfileTraits.ts
    - src/pages/journal.tsx
    - src/pages/connect.tsx
  modified:
    - src/pages/profile.tsx
    - src/pages/go-connect.tsx
    - src/pages/translator.tsx
key-decisions:
  - "Kept Journal on the existing reflective modules and profile-backed archetype data instead of copying profile page logic."
  - "Kept the existing `/api/profile/traits` bearer-token fetch path by extracting it into `useProfileTraits`."
  - "Made Connect a four-row landing page and only changed leaf return orientation, leaving tool internals untouched."
patterns-established:
  - "Reflective destinations reuse `useProfileTraits` instead of duplicating profile fetch/session wiring."
  - "IA rollout coverage can be targeted by name with Playwright `-g` filters while later-wave assertions stay in the same spec."
requirements-completed: [IA-WAVE1-02]
duration: 8min
completed: 2026-04-05
---

# Phase 19 Plan 01: Home Simplification Wave 1 Summary

**Connect and Journal now exist as destination owners, backed by shared reflective trait loading and Wave 0 IA coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-05T23:48:59Z
- **Completed:** 2026-04-05T23:56:34Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added Wave 0 Playwright coverage for Connect landing ownership, Journal ownership, Connect leaf return routes, and later-wave nav ownership assertions.
- Extracted a shared `useProfileTraits` hook so Journal can reuse the existing reflective data path without duplicating profile fetch logic.
- Built `/journal` and `/connect`, and repointed Connect-owned leaves back to `/connect`.

## Task Commits

Each task was committed atomically:

1. **Task 0: Create Wave 0 Playwright coverage for the new IA owners** - `d9b171e` (test)
2. **Task 1: Extract the shared reflective data hook for Journal** - `2b94651` (refactor)
3. **Task 2: Build the Journal and Connect destination pages** - `878717c` (feat)

## Files Created/Modified

- `e2e/tests/19-connect-journal-ia.spec.ts` - staged IA ownership coverage for Connect, Journal, and later-wave nav ownership.
- `src/hooks/useProfileTraits.ts` - shared reflective data loader returning traits, bearer token access, refresh handler, and archetype fields.
- `src/pages/profile.tsx` - switched to the shared reflective hook.
- `src/pages/journal.tsx` - new reflective destination composed from Weekly Mirror, arc, traits/archetype interpretation, and growth thread.
- `src/pages/connect.tsx` - new curated landing page with the four Wave 1 destination rows.
- `src/pages/go-connect.tsx` - return action now routes back to `/connect`.
- `src/pages/translator.tsx` - back action now routes back to `/connect`.

## Decisions Made

- Reused existing reflective cards directly on `/journal` so Wave 1 stays a destination-ownership pass instead of a component rewrite.
- Kept the profile traits loader browser-side and session-backed, matching the existing `/api/profile/traits` contract exactly.
- Left Connect leaf internals alone and limited changes to destination framing and return orientation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The shared Playwright auth setup briefly failed because a reused local `next dev` process served a blank login shell with all animated content stuck at `opacity: 0`. Restarting the local Next dev processes resolved the harness and the focused Task 2 verification passed immediately after.
- The plan-level `npx playwright test e2e/tests/19-connect-journal-ia.spec.ts --project=chromium` run still fails on the three later-wave assertions that belong to follow-on plan scope:
  - `Home owns /daily-growth in primary navigation`
  - `Connect owns leaf routes in primary navigation`
  - `secondary pages hide primary nav`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/journal` and `/connect` now exist as destination owners, so Home and secondary-access surfaces can safely shed reflective and shared-tool ownership in later plans.
- Plan `19-02` and `19-03` still need to make the nav ownership assertions pass by updating primary-nav ownership and hiding nav on secondary-access routes.

## Self-Check

PASSED

- FOUND: `.planning/phases/19-implement-ia-wave-1-home-simplification-and-navigation-restructure/19-01-SUMMARY.md`
- FOUND: `d9b171e`
- FOUND: `2b94651`
- FOUND: `878717c`

---
*Phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure*
*Completed: 2026-04-05*
