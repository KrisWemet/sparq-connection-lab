# Phase 9 Context — Route Change Error Noise Cleanup Plus Focused Production Audit

## Source of Truth
- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Source
- `.planning/phases/08-beta-ops-signal-cleanup/08-LIVE-EVIDENCE.md`

## Why This Phase Exists

Phase 8 removed the false-positive `journey_start_lookup` error row from the primary signup-driven success path.

The remaining smaller error-noise issue is:
- `beta_primary_path_error`
- `stage = route_change`
- `error_message = Route Cancelled`
- usually during register redirects to `/login?mode=register`

This still weakens operator trust in the beta-path error stream even though the primary path succeeds.

The user also asked for a focused production audit in the same phase, with at least five real ranked findings. That audit must stay grounded in the current supported path and production/operator realities, not speculation.

## Primary Objective

1. investigate `beta_primary_path_error` rows caused by `route_change` during register redirects
2. remove or narrow that false-positive logging without changing the primary user flow
3. re-run the primary fresh-signup production walkthrough and confirm:
   - Day 1 still completes
   - route-change false-positive noise is reduced or gone

## Secondary Objective

4. perform a focused audit and produce at least five credible findings with ranking and next-step guidance

## Audit Ordering

Audit priorities must be:
1. the primary signup-driven production path
2. operator-facing production risks
3. obvious redundancies or dead or legacy paths

## Explicitly Out Of Scope

- new features
- broad redesign
- random polish
- fixing all audit findings unless they are tiny and directly tied to the route-noise cleanup

## Expected Outcome

After this phase:
- the route-change error stream should be cleaner for the primary path
- the primary fresh-signup production walkthrough should still complete through Day 1
- the repo should contain a ranked follow-up audit with at least five real findings
