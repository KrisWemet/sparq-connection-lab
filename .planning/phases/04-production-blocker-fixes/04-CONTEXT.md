# Phase 4 Context — Production Blocker Fixes

## Intent
Phase 4 is a production-fix phase, not a product-expansion phase.

The only allowed targets are the blockers proven in:
- `.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md`

## Proven Live Blockers
1. `/signup` returns `HTTP 500` in production.
2. After fallback account creation via `/login`, `/daily-growth` does not reach the Day 1 morning flow for a fresh solo user.

## Source Of Truth
- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Source
- `.planning/phases/03-live-beta-verification/03-LIVE-EVIDENCE.md`

## Supporting Context
- `LAUNCH_CHECKLIST.md`
- `IMPLEMENTATION_STATUS.md`
- `.planning/phases/03-live-beta-verification/03-01-SUMMARY.md`
- `.planning/phases/03-live-beta-verification/03-02-SUMMARY.md`

## Scope Guardrails
- no feature additions
- no broad cleanup
- no speculative refactors
- no unrelated onboarding redesign
- no daily-loop redesign beyond the exact blocker

## Required Finish
- the same live verification checks from Phase 3 must be re-run after fixes ship
- outcome must be recorded against the same evidence baseline
