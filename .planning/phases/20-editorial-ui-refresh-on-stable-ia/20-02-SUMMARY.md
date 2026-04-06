---
phase: 20-editorial-ui-refresh-on-stable-ia
plan: "02"
subsystem: ui
tags: [react, nextjs, tailwind, framer-motion, playwright, editorial-ui]
requires:
  - phase: 20-01
    provides: shared editorial tokens and presentation primitives for stable IA surfaces
provides:
  - calmer Home hierarchy with one dominant Today hero
  - editorial daily-growth home state that preserves Home ownership
  - softer floating nav tray with unchanged route-owner mapping
affects: [dashboard, daily-growth, bottom-nav, playful-cards]
tech-stack:
  added: []
  patterns:
    - featured hero plus quiet companion modules on stable destination pages
    - presentation-only editorial refinement on locked IA and route ownership
key-files:
  created:
    - .planning/phases/20-editorial-ui-refresh-on-stable-ia/deferred-items.md
  modified:
    - src/pages/dashboard.tsx
    - src/components/dashboard/PeterGreeting.tsx
    - src/components/dashboard/HomeDestinationStrip.tsx
    - src/components/playful/DailySparkCard.tsx
    - src/pages/daily-growth.tsx
    - src/components/playful/FavoriteUsCard.tsx
    - src/components/bottom-nav.tsx
key-decisions:
  - "Home keeps a single accent-dominant Today hero while Peter, Daily Spark, and the destination strip stay visually subordinate."
  - "The daily-growth home state keeps its existing Home-owned copy contract even after the editorial layout refresh so existing browser coverage stays valid."
patterns-established:
  - "Home pattern: unboxed Peter greeting, one featured Today hero, then quieter companion modules."
  - "Nav pattern: warm floating tray with accent reserved for the active owner only."
requirements-completed: [UI-EDITORIAL-01, UI-EDITORIAL-02, IA-WAVE1-03]
duration: 6min
completed: 2026-04-06
---

# Phase 20 Plan 02: Home Cluster Editorial Refresh Summary

**Editorial Home hero hierarchy, calmer daily-growth entry state, and softer owner-aware bottom navigation on the locked Phase 19 IA**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-06T14:48:54Z
- **Completed:** 2026-04-06T14:55:23Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Rebuilt `/dashboard` so Peter stays unboxed, the Today module is the only accent-dominant card above the fold, and the destination strip reads as a quiet editorial rail.
- Refreshed the `/daily-growth` home state into one lead statement plus quieter companion surfaces while keeping `Favorite Us` exclusive to that route and preserving the Home-owned flow.
- Softened the bottom navigation tray into a premium floating well without changing `hiddenNavPrefixes`, `secondaryAccessPrefixes`, `navItems`, or `getPrimaryNavOwner()`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rebuild the Home hierarchy around one dominant Today module** - `c18da31` (feat)
2. **Task 2: Refresh the daily-growth home state and nav tray without changing ownership** - `a72ee5d` (feat)
3. **Verification fix: Restore the `/daily-growth` hero copy contract after browser validation** - `c66634a` (fix)

## Files Created/Modified
- `src/pages/dashboard.tsx` - Rebalanced Home around a single featured Today hero and quieter supporting modules.
- `src/components/dashboard/PeterGreeting.tsx` - Kept Peter warm and unboxed while giving the greeting a calmer editorial rhythm.
- `src/components/dashboard/HomeDestinationStrip.tsx` - Restyled the destination rail into a softer, premium wayfinding strip.
- `src/components/playful/DailySparkCard.tsx` - Reduced visual weight so the playful card stays secondary to the Today hero.
- `src/pages/daily-growth.tsx` - Rebuilt the `showHome` morning entry presentation and replaced lingering legacy lavender literals with Phase 20 tokens.
- `src/components/playful/FavoriteUsCard.tsx` - Restyled the card as a warm side note instead of a competing task surface.
- `src/components/bottom-nav.tsx` - Softened the floating tray and active-state well without touching owner mapping logic.
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/deferred-items.md` - Logged unrelated warnings surfaced during local verification.

## Decisions Made

- Kept the Home cluster order unchanged: top bar, `PeterGreeting`, one Today hero, optional `DailySparkCard`, then `HomeDestinationStrip`.
- Preserved the `/daily-growth` home-state headline contract after the browser gate showed the refreshed copy would break existing editorial verification.
- Converted remaining legacy lavender literals inside `src/pages/daily-growth.tsx` so the file now matches the shared Phase 20 token layer end to end.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed remaining legacy lavender literals from `daily-growth` branches outside the new home state**
- **Found during:** Task 2 (Refresh the daily-growth home state and nav tray without changing ownership)
- **Issue:** The task acceptance check required `src/pages/daily-growth.tsx` to be free of the old Phase 17 lavender hex literals, but multiple evening and completion branches still used them.
- **Fix:** Replaced the old literals with Phase 20 brand tokens across the morning reminder, evening verification, reflection close state, and completion state.
- **Files modified:** `src/pages/daily-growth.tsx`
- **Verification:** `! rg -n "#EDE9FE|#5B4A86|#2E1065" src/pages/daily-growth.tsx src/components/playful/FavoriteUsCard.tsx src/components/bottom-nav.tsx`, targeted lint, and the full Wave 2 Playwright bundle.
- **Committed in:** `a72ee5d`

**2. [Rule 1 - Bug] Restored the expected `/daily-growth` hero headline after browser validation**
- **Found during:** Wave 2 verification after Task 2
- **Issue:** `e2e/tests/20-editorial-ui-refresh.spec.ts` expected the existing home-state line `Your morning practice is ready.` and failed when the editorial rewrite changed that copy.
- **Fix:** Restored the established headline contract while keeping the new editorial layout and quieter companion stack.
- **Files modified:** `src/pages/daily-growth.tsx`
- **Verification:** `npm run lint -- --file src/pages/daily-growth.tsx` and `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/20-editorial-ui-refresh.spec.ts --project=chromium --no-deps --workers=1`
- **Committed in:** `c66634a`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were necessary to satisfy the plan's acceptance gates and preserve existing verification coverage. No IA or behavior scope expanded.

## Issues Encountered

- The first Wave 2 Playwright run failed on the `/daily-growth` home-state headline because the editorial rewrite changed copy that the existing spec intentionally pinned. Restoring that string resolved the failure without changing the new layout.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The Home cluster, daily-growth entry state, and primary nav tray now share the Phase 20 editorial hierarchy and are verified against the Wave 2 browser bundle.
- Phase `20-03` can build on the same featured-module versus quiet-companion pattern for `Connect`, `Journal`, and `Journeys`.

## Self-Check

PASSED

- FOUND: `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-02-SUMMARY.md`
- FOUND: `c18da31`
- FOUND: `a72ee5d`
- FOUND: `c66634a`

---
*Phase: 20-editorial-ui-refresh-on-stable-ia*
*Completed: 2026-04-06*
