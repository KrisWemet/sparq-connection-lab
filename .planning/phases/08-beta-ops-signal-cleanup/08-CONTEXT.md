# Phase 8 Context — Beta Ops Signal Cleanup

## Source of Truth
- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Source
- `.planning/phases/07-live-onboarding-reliability-recovery/07-LIVE-EVIDENCE.md`

## Why This Phase Exists

Phase 7 restored the primary fresh-signup production path and re-confirmed the controlled-beta ops events. That same successful run still wrote a noisy `beta_primary_path_error` row with:
- `stage = journey_start_lookup`
- `error_message = [object Object]`

That weakens trust in the controlled-beta error stream. Operators should not have to wonder whether the primary path is actually broken when the live walkthrough succeeded end to end.

## Scope

This phase is intentionally narrow:
- investigate why `beta_primary_path_error` is being written during successful journey start
- remove or narrow that false-positive logging without changing the primary user flow
- re-run the fresh production signup-driven walkthrough
- confirm Day 1 still completes
- confirm the noisy false-positive error row no longer appears for the repaired run

## Explicitly Out Of Scope

- new features
- onboarding redesign
- dashboard redesign
- daily-growth redesign
- Peter behavior changes unrelated to this false-positive ops signal
- broad cleanup

## Expected Outcome

After this phase:
- the primary signup-driven beta path should still complete through Day 1
- the error stream should be cleaner and more trustworthy
- operators should be able to trust that a `beta_primary_path_error` row during journey start reflects a real problem, not a successful run
