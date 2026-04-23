---
phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure
plan: "02"
subsystem: ui
tags: [react, nextjs, playwright, navigation, dashboard, journeys]
requires:
  - phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure
    provides: Connect and Journal destination owners from plan 01
provides:
  - route-owner primary navigation for Home, Journeys, Connect, and Journal
  - simplified Home launcher with Daily Spark and a quiet destination strip
  - Journal follow-through from daily-growth and active-journey clarity on Journeys
affects: [19-03-PLAN.md, profile, dashboard, daily-growth, journeys, bottom-nav]
tech-stack:
  added: []
  patterns:
    - route-owner nav state via explicit pathname ownership mapping
    - Home wayfinding through a three-tile destination strip instead of full dashboard cards
key-files:
  created:
    - src/components/dashboard/HomeDestinationStrip.tsx
  modified:
    - src/components/bottom-nav.tsx
    - src/pages/dashboard.tsx
    - src/pages/daily-growth.tsx
    - src/pages/journeys.tsx
    - e2e/tests/19-connect-journal-ia.spec.ts
    - e2e/tests/05-dashboard.spec.ts
    - e2e/tests/03-daily-growth.spec.ts
key-decisions:
  - "Kept `/daily-growth` Home-owned in nav state instead of reintroducing a Daily tab."
  - "Made the Home destination strip the only post-spark wayfinding surface rather than replacing removed cards with more cards."
  - "Put the Journeys active-practice summary above search and category controls so current work stays primary without duplicating Home's CTA."
patterns-established:
  - "Secondary-access pages hide the bottom nav rather than forcing a selected primary destination."
  - "Journeys exposes active practice context with a slim summary card and a single route into the current journey detail."
requirements-completed: [IA-WAVE1-01, IA-WAVE1-03]
duration: 12min
completed: 2026-04-05
---

# Phase 19 Plan 02: Home Simplification Wave 2 Summary

**Destination-owned nav, a stripped-down Home launcher, and Journal/Journeys handoffs that preserve the daily loop**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-06T00:11:02Z
- **Completed:** 2026-04-06T00:22:33Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Replaced tab-path equality with destination ownership for the four approved primary nav items.
- Simplified Home to Peter greeting, one Today card, `DailySparkCard`, and a quiet three-tile destination strip.
- Preserved Home ownership of `/daily-growth` while routing reflection follow-through to `/journal` and surfacing active-practice context on `Journeys`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace tab-path matching with route-owner primary navigation** - `c73f31c` (feat)
2. **Task 2: Simplify Home into Today card, Daily Spark, and quiet destination strip** - `b2728a4` (feat)
3. **Task 3: Preserve daily-flow ownership and add slim active-journey clarity** - `5b9aa9b` (feat)

## Files Created/Modified

- `src/components/bottom-nav.tsx` - Route-owner primary nav with Home, Journeys, Connect, Journal and hidden secondary-access behavior.
- `src/components/dashboard/HomeDestinationStrip.tsx` - Three equal-width quiet destination tiles for Journey Progress, Shared Connection, and Journal.
- `src/pages/dashboard.tsx` - Reduced Home to the Today launcher, Daily Spark, Beta feedback, and destination strip with profile avatar entry.
- `src/pages/daily-growth.tsx` - Repointed `PreviousReflectionCard` follow-through to `/journal`.
- `src/pages/journeys.tsx` - Added a slim active-practice summary above search and browse controls.
- `e2e/tests/19-connect-journal-ia.spec.ts` - Owner-aware nav and Journeys summary assertions.
- `e2e/tests/05-dashboard.spec.ts` - Simplified Home expectations and avatar-to-profile coverage.
- `e2e/tests/03-daily-growth.spec.ts` - Journal handoff coverage from the daily home.

## Decisions Made

- Kept `aria-current="page"` as the active-nav signal so ownership tests assert a real navigation semantic, not styling alone.
- Left `Favorite Us` exactly on the daily-growth home and encoded that in regression coverage instead of widening playful placement during IA work.
- Used local journey-progress storage to derive the Journeys summary because that is the existing active-journey source of truth in this codepath.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Isolated `/daily-growth` nav ownership tests from the live session-start path**
- **Found during:** Task 1
- **Issue:** The focused nav spec hit the real session-start flow and pulled unrelated OpenRouter traffic into a navigation-only test.
- **Fix:** Added a local `/api/daily/session/start` mock in `e2e/tests/19-connect-journal-ia.spec.ts` for the Home-owned `/daily-growth` assertion.
- **Files modified:** `e2e/tests/19-connect-journal-ia.spec.ts`
- **Verification:** `npx playwright test e2e/tests/19-connect-journal-ia.spec.ts -g "Home owns /daily-growth|Connect owns leaf routes|secondary pages hide primary nav" --project=chromium`
- **Committed in:** `c73f31c`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The deviation kept verification scoped to IA ownership and did not expand product scope.

## Issues Encountered

- The full Playwright suite initially destabilized the local Next dev server with `.next/cache/webpack` ENOENT churn and then left a stale port `3000` process behind. Clearing `.next`, terminating the leftover server, and rerunning the exact plan verification command resolved it without code changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Primary nav ownership, Home simplification, and daily/journeys ownership wiring are in place for the remaining Wave 1 work.
- The remaining risk is environmental rather than product-facing: full local Playwright runs may require clearing `.next` if the Next dev cache wedges again.

## Self-Check

PASSED

- FOUND: `.planning/phases/19-implement-ia-wave-1-home-simplification-and-navigation-restructure/19-02-SUMMARY.md`
- FOUND: `c73f31c`
- FOUND: `b2728a4`
- FOUND: `5b9aa9b`

---
*Phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure*
*Completed: 2026-04-05*
