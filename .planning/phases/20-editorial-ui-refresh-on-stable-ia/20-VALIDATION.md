---
phase: 20
slug: editorial-ui-refresh-on-stable-ia
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright `1.58.2` |
| **Config file** | `playwright.config.ts` |
| **Task smoke command** | Use the per-task smoke command listed below; default to targeted `npm run lint -- --file ...` or `test -f` and `rg -n` checks only. |
| **Wave gate command** | Use the per-wave bundle in `## Wave Gate Commands`; reserve multi-spec Playwright runs for those gates. |
| **Full suite command** | `npm run test:e2e` |
| **Estimated runtime** | Task smoke: ~5-30 seconds. Wave gate: ~60-180 seconds. |

---

## Sampling Rate

- **After every task commit:** Run that task's `Task Smoke Command` only. Do not run the broader multi-spec Playwright bundle here unless the task's exact plan verify explicitly requires it for a blocker investigation.
- **After every plan wave:** Run the exact per-task automated commands for the completed plan plus that wave's bundle from `## Wave Gate Commands`.
- **Before `$gsd-verify-work`:** Full suite must be green and the manual screenshot review across the five stable primary destinations must be complete.
- **Max feedback latency:** Task smoke under 30 seconds; wave gates under 180 seconds.

---

## Per-Task Verification Map

### 20-01-01 — Task 1: Create the Wave 0 editorial verification assets

- **Plan / Wave:** `20-01` / `1`
- **Requirements:** `UI-EDITORIAL-03`
- **Task Smoke Command:** `test -f e2e/tests/20-editorial-ui-refresh.spec.ts && test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && rg -n "dashboard|daily-growth|connect|journal|journeys" e2e/tests/20-editorial-ui-refresh.spec.ts && rg -n "Home hero dominance|destination mood separation|playful subordination|bottom-nav quietness" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md`
- **Exact Plan Automated Command:** `test -f e2e/tests/20-editorial-ui-refresh.spec.ts && test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && rg -n "dashboard|daily-growth|connect|journal|journeys" e2e/tests/20-editorial-ui-refresh.spec.ts && rg -n "Home hero dominance|destination mood separation|playful subordination|bottom-nav quietness" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md`
- **Status:** `⬜ pending`

### 20-01-02 — Task 2: Replace the global token layer with the approved editorial palette

- **Plan / Wave:** `20-01` / `1`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-03`
- **Task Smoke Command:** `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx`
- **Status:** `⬜ pending`

### 20-01-03 — Task 3: Add one small presentational editorial primitive layer

- **Plan / Wave:** `20-01` / `1`
- **Requirements:** `UI-EDITORIAL-01`
- **Task Smoke Command:** `npm run lint -- --file src/components/editorial/EditorialSurface.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/components/editorial/EditorialSurface.tsx`
- **Status:** `⬜ pending`

### 20-02-01 — Task 1: Rebuild the Home hierarchy around one dominant Today module

- **Plan / Wave:** `20-02` / `2`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-02`, `IA-WAVE1-03`
- **Task Smoke Command:** `npm run lint -- --file src/pages/dashboard.tsx --file src/components/dashboard/PeterGreeting.tsx --file src/components/dashboard/HomeDestinationStrip.tsx --file src/components/playful/DailySparkCard.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/dashboard.tsx --file src/components/dashboard/PeterGreeting.tsx --file src/components/dashboard/HomeDestinationStrip.tsx --file src/components/playful/DailySparkCard.tsx`
- **Status:** `⬜ pending`

### 20-02-02 — Task 2: Refresh the daily-growth home state and nav tray without changing ownership

- **Plan / Wave:** `20-02` / `2`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-02`, `IA-WAVE1-03`
- **Task Smoke Command:** `npm run lint -- --file src/pages/daily-growth.tsx --file src/components/playful/FavoriteUsCard.tsx --file src/components/bottom-nav.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/daily-growth.tsx --file src/components/playful/FavoriteUsCard.tsx --file src/components/bottom-nav.tsx`
- **Status:** `⬜ pending`

### 20-03-01 — Task 1: Make Connect feel curated, warm, and intentional

- **Plan / Wave:** `20-03` / `3`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-02`
- **Task Smoke Command:** `npm run lint -- --file src/pages/connect.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/connect.tsx`
- **Status:** `⬜ pending`

### 20-03-02 — Task 2: Make Journal quieter and more private through reflective card hierarchy

- **Plan / Wave:** `20-03` / `3`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-02`
- **Task Smoke Command:** `npm run lint -- --file src/pages/journal.tsx --file src/components/dashboard/WeeklyMirrorCard.tsx --file src/components/dashboard/IdentityArcCard.tsx --file src/components/dashboard/GrowthThread.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/journal.tsx --file src/components/dashboard/WeeklyMirrorCard.tsx --file src/components/dashboard/IdentityArcCard.tsx --file src/components/dashboard/GrowthThread.tsx`
- **Status:** `⬜ pending`

### 20-03-03 — Task 3: Give Journeys structured progress clarity without duplicating Home

- **Plan / Wave:** `20-03` / `3`
- **Requirements:** `UI-EDITORIAL-01`, `UI-EDITORIAL-02`
- **Task Smoke Command:** `npm run lint -- --file src/pages/journeys.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/journeys.tsx`
- **Status:** `⬜ pending`

### 20-04-01 — Task 1: Apply minimum editorial cohesion to secondary-access pages only

- **Plan / Wave:** `20-04` / `4`
- **Requirements:** `UI-EDITORIAL-02`, `IA-WAVE1-03`
- **Task Smoke Command:** `npm run lint -- --file src/pages/profile.tsx --file src/pages/settings.tsx --file src/pages/trust-center.tsx --file src/pages/subscription.tsx`
- **Exact Plan Automated Command:** `npm run lint -- --file src/pages/profile.tsx --file src/pages/settings.tsx --file src/pages/trust-center.tsx --file src/pages/subscription.tsx`
- **Status:** `⬜ pending`

### 20-04-02 — Task 2: Complete editorial review evidence and Phase 20 validation status

- **Plan / Wave:** `20-04` / `4`
- **Requirements:** `UI-EDITORIAL-02`, `IA-WAVE1-03`
- **Task Smoke Command:** `test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-VALIDATION.md && rg -n "dashboard|daily-growth|connect|journal|journeys" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && rg -n "## Per-Task Verification Map|## Wave Gate Commands|## Validation Sign-Off" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-VALIDATION.md`
- **Exact Plan Automated Command:** `test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-VALIDATION.md && rg -n "dashboard|daily-growth|connect|journal|journeys" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md && rg -n "## Per-Task Verification Map|## Wave Gate Commands|## Validation Sign-Off" .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-VALIDATION.md`
- **Status:** `⬜ pending`

*Status: `⬜ pending` · `✅ green` · `❌ red` · `⚠️ flaky`*

---

## Wave Gate Commands

### Wave 1 / Plan 20-01

- `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx --file src/components/editorial/EditorialSurface.tsx --file e2e/tests/20-editorial-ui-refresh.spec.ts`
- `npx tsc --noEmit`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/20-editorial-ui-refresh.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts --project=chromium --no-deps --workers=1`

### Wave 2 / Plan 20-02

- `npm run lint -- --file src/pages/dashboard.tsx --file src/components/dashboard/PeterGreeting.tsx --file src/components/dashboard/HomeDestinationStrip.tsx --file src/components/playful/DailySparkCard.tsx --file src/pages/daily-growth.tsx --file src/components/playful/FavoriteUsCard.tsx --file src/components/bottom-nav.tsx`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/20-editorial-ui-refresh.spec.ts --project=chromium --no-deps --workers=1`

### Wave 3 / Plan 20-03

- `npm run lint -- --file src/pages/connect.tsx --file src/pages/journal.tsx --file src/components/dashboard/WeeklyMirrorCard.tsx --file src/components/dashboard/IdentityArcCard.tsx --file src/components/dashboard/GrowthThread.tsx --file src/pages/journeys.tsx`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/20-editorial-ui-refresh.spec.ts --project=chromium --no-deps --workers=1`

### Wave 4 / Plan 20-04

- `npm run lint -- --file src/pages/profile.tsx --file src/pages/settings.tsx --file src/pages/trust-center.tsx --file src/pages/subscription.tsx`
- `npx tsc --noEmit`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/20-editorial-ui-refresh.spec.ts --project=chromium --no-deps --workers=1`

---

## Wave 0 Requirements

- [ ] `e2e/tests/20-editorial-ui-refresh.spec.ts` — editorial regression coverage for stable primary surfaces and visible hierarchy markers
- [ ] `.planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md` — screenshot checklist plus pass/fail notes for `/dashboard`, `/daily-growth`, `/connect`, `/journal`, and `/journeys`
- [ ] Manual checklist for Home hero dominance, destination mood separation, playful subordination, and bottom-nav quietness

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Primary destinations feel warmer, calmer, and more relationship-life oriented without losing readability | UI-EDITORIAL-01 | Editorial hierarchy and emotional tone are not fully assertable with current automated coverage | Capture one screenshot each for `/dashboard`, `/daily-growth`, `/connect`, `/journal`, and `/journeys`; record whether the page has one featured module, quieter support modules, readable body copy, and a distinct destination mood. |
| Home Today hero stays visually dominant over `Daily Spark` and the destination strip | UI-EDITORIAL-01 | Relative emphasis is a visual judgment | Review mobile viewport screenshots for `/dashboard` and confirm the Today hero is the first and strongest visual landing point above the fold. |
| `Daily Spark` and `Favorite Us` remain additive, not task-competing | UI-EDITORIAL-02 | Requires human comparison of emphasis against primary CTA surfaces | Check `/dashboard` and `/daily-growth`; confirm playful cards feel like warm side notes rather than primary actions. |
| `Connect`, `Journal`, and `Journeys` feel distinct inside one shared system | UI-EDITORIAL-01 | Mood separation is qualitative | Compare the three route screenshots side-by-side and note whether each page's composition matches its intended mood without feeling like a separate product. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
