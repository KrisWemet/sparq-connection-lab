# Phase 6 Context — Controlled Beta Ops

## Goal

Add the minimum operational layer needed to run a controlled beta on the proven primary signup-driven path:
- capture user feedback
- capture funnel analytics
- capture path errors and monitoring signals

This phase does not expand product scope. It makes the proven path measurable and supportable.

## Source Of Truth

- `SPARQ_MASTER_SPEC.md`

## Primary Evidence Source

- `.planning/phases/05-live-onboarding-determinism/05-LIVE-EVIDENCE.md`

## Supporting Context

- `IMPLEMENTATION_STATUS.md`
- `LAUNCH_CHECKLIST.md`
- `.planning/codebase/STACK.md`
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/codebase/TESTING.md`

## What Phase 5 Proved

- The primary fresh-signup production path is now proven end to end:
  - signup
  - onboarding
  - journey selection
  - dashboard
  - Day 1 morning flow
  - Day 1 completion
- The secondary login-entry fallback path is still a follow-up hardening item, not the current beta gate.

## In Scope

- feedback capture for beta users on the primary signup-driven path
- funnel analytics for the proven primary path
- error monitoring and structured logging for the proven primary path
- explicit scoping that keeps the secondary login-entry fallback path as follow-up work only

## Out Of Scope

- product feature work
- onboarding redesign
- dashboard redesign
- daily-growth redesign
- Peter behavior changes unless required for observability or a bug fix
- broad cleanup
