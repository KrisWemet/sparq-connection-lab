# Phase 15 Context

Date: 2026-03-31
Phase: Playful Layer Live Verification And Rollout Guardrails

## Goal

Safely validate the new playful connection slice in live production without weakening the proven primary signup-driven path.

## Source Of Truth

- `SPARQ_MASTER_SPEC.md`

## Primary References

- `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
- `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-01-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-02-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-03-SUMMARY.md`

## Why This Phase Exists

- Phase 14 proved the playful slice locally, but it has not yet been proven in live production.
- The playful MVP must remain additive, optional, and fail-soft on the same beta path that is already live-proven.
- Controlled exposure needs explicit monitoring and rollback rules before this slice should be trusted in production.

## In Scope

- deploy and verify the current playful MVP slice:
  - `Daily Spark`
  - `Favorite Us`
- confirm the playful layer is fully additive and fail-soft
- re-prove the primary signup-driven production path:
  - signup or register
  - onboarding
  - journey selection
  - dashboard
  - daily-growth
  - Day 1 completion
- verify the playful layer on:
  - dashboard
  - daily-growth home
- verify production fail-soft behavior when the playful endpoint is unavailable
- define rollout guardrails for controlled exposure:
  - what to monitor
  - what counts as safe
  - what should trigger rollback or disablement

## Explicitly Out Of Scope

- new playful features
- widening into `Tiny Dare` or `Laugh Loop`
- redesigning dashboard or daily-growth
- touching onboarding or Peter unless a real regression is found
- broad cleanup unrelated to live proof and rollout safety

## Required Outputs

1. live verification summary
2. exact pass or fail results for:
   - primary path regression check
   - dashboard playful surface
   - daily-growth playful surface
   - fail-soft API outage behavior
   - analytics visibility
3. rollout guardrails:
   - safe to expose now or not yet
   - limited rollout recommendation
   - rollback conditions
4. any narrow fixes required before exposure

## Wave Plan

- Wave 1:
  - `15-01` deploy and prove the primary path plus playful surfaces
- Wave 2:
  - `15-02` prove fail-soft production behavior and analytics visibility
- Wave 3:
  - `15-03` write rollout guardrails and any narrow follow-up requirements
