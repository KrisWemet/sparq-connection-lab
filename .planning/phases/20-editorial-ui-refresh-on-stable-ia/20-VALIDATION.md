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
| **Quick run command** | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` |
| **Full suite command** | `npm run test:e2e` |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` plus targeted lint on touched files.
- **After every plan wave:** Run `npx tsc --noEmit` and `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1`.
- **Before `$gsd-verify-work`:** Full suite must be green and the manual screenshot review across the five stable primary destinations must be complete.
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | UI-EDITORIAL-01 | lint + grep | `npm run lint -- --file tailwind.config.ts --file src/styles/globals.css --file src/pages/_app.tsx` | ✅ | ⬜ pending |
| 20-01-02 | 01 | 1 | UI-EDITORIAL-03 | typecheck + e2e smoke | `npx tsc --noEmit && PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/19-connect-journal-ia.spec.ts --project=chromium --no-deps --workers=1` | ✅ | ⬜ pending |
| 20-02-01 | 02 | 2 | UI-EDITORIAL-01 | e2e + manual visual | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` | ✅ | ⬜ pending |
| 20-03-01 | 03 | 3 | UI-EDITORIAL-02 | e2e | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/19-connect-journal-ia.spec.ts --project=chromium --no-deps --workers=1` | ✅ | ⬜ pending |
| 20-04-01 | 04 | 4 | UI-EDITORIAL-02 | manual screenshot review | `test -f .planning/phases/20-editorial-ui-refresh-on-stable-ia/20-EDITORIAL-REVIEW.md` | ❌ W0 | ⬜ pending |
| 20-04-02 | 04 | 4 | IA-WAVE1-03 | e2e | `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test e2e/tests/19-connect-journal-ia.spec.ts e2e/tests/05-dashboard.spec.ts e2e/tests/14-playful-connection.spec.ts --project=chromium --no-deps --workers=1` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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
