# Phase 10 Context

Phase: 10
Name: Onboarding Activation Fail-Closed
Date: 2026-03-31

## Source Of Truth

- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Sources

- `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-AUDIT-FINDINGS.md`
- `.planning/phases/09-route-change-noise-cleanup-and-production-audit/09-LIVE-EVIDENCE.md`

## Why This Phase Exists

Phase 9 cleaned up the remaining route-change noise and re-proved the primary signup-driven production path through Day 1 completion.

That audit also surfaced the highest-priority remaining primary-path state risk:
- `src/components/onboarding/JourneyDetail.tsx` can advance out of onboarding even if journey activation fails
- it can also advance even if the `profiles.isonboarded` write fails

That means the current live path is proven when writes succeed, but the handoff is not fail-closed.

## Scope

This phase is limited to the onboarding handoff in `JourneyDetail` and the same fresh-signup production proof path.

In scope:
- require successful journey activation before advancing
- require successful `isonboarded` persistence before advancing
- call `onConfirm()` only after both writes succeed
- emit a narrow primary-path error event if either write fails
- re-run the same fresh production signup-driven walkthrough and confirm Day 1 still completes

Out of scope:
- new features
- onboarding redesign
- dashboard changes
- daily-growth changes
- broad cleanup

## Success Criteria

- `JourneyDetail` fails closed if journey activation fails
- `JourneyDetail` fails closed if profile persistence fails
- the user is not advanced unless both writes succeed
- the failure path emits a narrow, useful primary-path error event
- the fresh production signup-driven walkthrough still completes through Day 1 after the fix
