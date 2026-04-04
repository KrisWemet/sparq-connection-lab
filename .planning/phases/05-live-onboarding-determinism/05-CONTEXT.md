# Phase 5 Context — Live Onboarding Determinism

## Goal

Make the fresh production solo-first onboarding path deterministic enough that a brand-new user can reliably:
- complete the Peter onboarding handoff
- reach journey selection
- enter the dashboard
- reach Day 1 morning flow
- complete the same live production walkthrough end to end

## Source Of Truth

- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Source

- `.planning/phases/04-production-blocker-fixes/04-LIVE-EVIDENCE.md`

## Supporting Context

- `IMPLEMENTATION_STATUS.md`
- `LAUNCH_CHECKLIST.md`
- `.planning/phases/04-production-blocker-fixes/04-01-SUMMARY.md`
- `.planning/phases/04-production-blocker-fixes/04-02-SUMMARY.md`

## What Phase 4 Proved

- The live `/signup` crash is fixed.
- Fresh registration now enters the supported onboarding flow.
- The blank recommendation handoff is fixed.
- The remaining live risk is determinism inside the Peter onboarding conversation and the handoff from onboarding into journey selection, dashboard entry, and Day 1 proof.

## In Scope

- tighten only the onboarding behaviors that block deterministic live progression
- tighten only the post-onboarding path needed to reach dashboard and Day 1 morning flow
- re-run the same live fresh-user production walkthrough and capture evidence

## Out Of Scope

- new features
- broad cleanup
- onboarding redesign
- broad copy rewrites
- unrelated architecture work
