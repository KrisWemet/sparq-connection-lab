---
phase: 20-editorial-ui-refresh-on-stable-ia
plan: "01"
subsystem: ui
tags: [nextjs, react, tailwind, playwright, editorial, typescript]
requires:
  - phase: 17-editorial-relationship-life-ui-refresh
    provides: approved editorial palette, typography contract, and hierarchy rules
  - phase: 19-implement-ia-wave-1-home-simplification-and-navigation-restructure
    provides: stable primary route ownership and baseline Playwright IA coverage
provides:
  - Wave 0 editorial review checklist for the five stable primary destinations
  - Phase 20 regression coverage for dashboard, daily-growth, connect, journal, and journeys
  - Editorial token remap on the shared shell plus a small reusable surface primitive layer
affects: [20-02, 20-03, 20-04, dashboard, daily-growth, connect, journal, journeys]
tech-stack:
  added: []
  patterns: [token-first editorial rollout, presentation-only editorial wrappers, route-level playwright regression scaffolds]
key-files:
  created:
    - e2e/tests/20-editorial-ui-refresh.spec.ts
    - .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md
    - src/components/editorial/EditorialSurface.tsx
  modified:
    - tailwind.config.ts
    - src/styles/globals.css
    - src/pages/_app.tsx
    - .eslintrc.json
key-decisions:
  - "Preserved existing brand utility names and remapped them to the Phase 17 editorial contract to avoid broad refactors in later waves."
  - "Loaded Cormorant Garamond as the display serif via next/font and kept the shell body stack sans."
  - "Ignored CSS files in Next ESLint so the plan's targeted lint command could run without treating globals.css as JavaScript."
patterns-established:
  - "Wave 0 verification assets live alongside implementation plans and cover route hierarchy before page-specific polish."
  - "EditorialSurface exports featured and quiet wrappers plus a shared eyebrow label, with no routing or data concerns."
requirements-completed: [UI-EDITORIAL-01, UI-EDITORIAL-03]
duration: 7min
completed: 2026-04-06
---

# Phase 20 Plan 01: Editorial Foundation Summary

**Editorial foundation tokens, Wave 0 route coverage, and reusable featured/quiet surface primitives for the stable primary destinations**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-06T14:28:56Z
- **Completed:** 2026-04-06T14:35:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Added Phase 20 Playwright coverage for `/dashboard`, `/daily-growth`, `/connect`, `/journal`, and `/journeys`, including playful-placement and no-`Daily`-tab assertions.
- Replaced the shared shell palette and font pairing with the approved editorial contract while keeping the current Pages Router and existing utility class names intact.
- Added a small presentation-only editorial primitive layer for featured surfaces, quiet surfaces, and shared eyebrow labels.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the Wave 0 editorial verification assets** - `94b265d` (test)
2. **Task 2: Replace the global token layer with the approved editorial palette** - `0bcb49d` (feat)
3. **Task 3: Add one small presentational editorial primitive layer** - `b20e14e` (feat)

## Files Created/Modified
- `e2e/tests/20-editorial-ui-refresh.spec.ts` - route-level editorial regression coverage for the five stable destinations
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md` - screenshot checklist for Wave 0 manual review
- `tailwind.config.ts` - editorial color remap, serif/sans font hooks, and preserved brand aliases
- `src/styles/globals.css` - shared CSS variables and shell defaults aligned to the approved palette
- `src/pages/_app.tsx` - global font loading and editorial shell background/text defaults
- `src/components/editorial/EditorialSurface.tsx` - presentation-only featured, quiet, and eyebrow primitives
- `.eslintrc.json` - CSS ignore rule so the plan's targeted lint command succeeds

## Decisions Made

- Preserved existing `brand-*` utility names instead of forcing a wider rename so later waves can restyle pages without a second compatibility pass.
- Used `Cormorant Garamond` for the display serif and kept the main app shell sans to match the approved editorial hierarchy.
- Treated the CSS lint parse failure as a blocking verification issue and fixed the narrow ESLint behavior rather than changing the plan's verify command.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed targeted lint verification for `globals.css`**
- **Found during:** Task 2 (Replace the global token layer with the approved editorial palette)
- **Issue:** `next lint --file src/styles/globals.css` tried to parse CSS as JavaScript and failed before it could verify the task.
- **Fix:** Added a CSS ignore pattern to `.eslintrc.json` so the plan's lint command runs cleanly while still checking the TypeScript files in the same command.
- **Files modified:** `.eslintrc.json`
- **Verification:** `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx`
- **Committed in:** `0bcb49d`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix was limited to verification behavior and did not widen product scope.

## Issues Encountered

- `next lint` emitted an expected ignored-file warning for `src/styles/globals.css` after the ESLint fix; the command still exited successfully and verified the targeted TypeScript files as required.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Later Phase 20 waves can now consume the shared editorial palette and `EditorialSurface` primitives without reopening route ownership or shell behavior.
- Wave 1 verification is green: `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx --file src/components/editorial/EditorialSurface.tsx --file e2e/tests/20-editorial-ui-refresh.spec.ts`, `npx tsc --noEmit`, and `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/20-editorial-ui-refresh.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts --project=chromium --no-deps --workers=1`.

## Known Stubs

- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md:7` uses `Screenshot: TODO` as an intentional manual capture slot for `/dashboard`.
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md:18` uses `Screenshot: TODO` as an intentional manual capture slot for `/daily-growth`.
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md:29` uses `Screenshot: TODO` as an intentional manual capture slot for `/connect`.
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md:40` uses `Screenshot: TODO` as an intentional manual capture slot for `/journal`.
- `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md:51` uses `Screenshot: TODO` as an intentional manual capture slot for `/journeys`.

---
*Phase: 20-editorial-ui-refresh-on-stable-ia*
*Completed: 2026-04-06*

## Self-Check: PASSED
