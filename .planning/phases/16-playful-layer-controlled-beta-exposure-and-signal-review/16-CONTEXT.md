# Phase 16 Context

Date: 2026-03-31
Phase: Playful Layer Controlled Beta Exposure And Signal Review

## Goal

Expose the playful MVP to the controlled-beta cohort, monitor how it behaves in real usage, and decide whether it should stay, be tuned, be reduced, or be expanded later.

## Source Of Truth

- `SPARQ_MASTER_SPEC.md`

## Primary References

- `.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-LIVE-EVIDENCE.md`

## Supporting References

- `.planning/phases/12-playful-connection-mvp-definition/12-PRODUCT-DEFINITION.md`
- `.planning/phases/13-playful-connection-mvp-spec/13-MVP-SPEC.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-01-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-02-SUMMARY.md`
- `.planning/phases/14-playful-connection-mvp-implementation/14-03-SUMMARY.md`
- `.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-01-SUMMARY.md`
- `.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-02-SUMMARY.md`
- `.planning/phases/15-playful-layer-live-verification-and-rollout-guardrails/15-03-SUMMARY.md`

## Why This Phase Exists

- Phase 15 proved the playful slice is live, additive, and fail-soft in production.
- The next question is no longer "can it work live?" but "does it help real beta users enough to keep or grow it?"
- The decision now needs cohort evidence across:
  - core funnel stability
  - playful engagement
  - qualitative beta feedback
  - additive versus distracting behavior

## In Scope

- expose the playful slice only to the current controlled-beta cohort
- monitor the core funnel and playful interaction stream together:
  - `beta_primary_signup_register_success`
  - `beta_primary_journey_selected`
  - `beta_primary_onboarding_completed`
  - `beta_primary_dashboard_arrived`
  - `beta_primary_daily_growth_started`
  - `beta_primary_day1_completed`
  - `playful_daily_spark_viewed`
  - `playful_daily_spark_tried`
  - `playful_daily_spark_swapped`
  - `playful_daily_spark_sent`
  - `playful_favorite_us_viewed`
  - `playful_favorite_us_saved`
  - `playful_favorite_us_sent`
- collect qualitative beta feedback on whether the playful layer feels:
  - helpful
  - warm
  - optional
  - non-intrusive
- compare playful engagement against primary-path completion to determine whether the slice is additive, neutral, or distracting
- produce a short decision memo that chooses one of:
  - keep as is
  - tune copy or placement
  - reduce prominence
  - expand later

## Explicitly Out Of Scope

- new playful features
- `Tiny Dare`
- `Laugh Loop`
- navigation redesign
- broad UI overhaul
- onboarding changes unless a real regression appears
- broad analytics expansion unrelated to the core funnel and playful stream

## Questions This Phase Must Answer

- are users engaging with `Daily Spark`?
- are users engaging with `Favorite Us`?
- does playful usage correlate with reduced, unchanged, or improved Day 1 completion?
- does beta feedback suggest the playful layer feels distracting, cheesy, confusing, or helpful?
- should the playful slice remain on Home and Daily as currently placed?

## Required Outputs

1. a cohort-based live verification summary
2. a signal review covering both the core funnel and playful stream
3. a qualitative feedback summary for the current playful placement and tone
4. a short decision memo with one clear recommendation:
   - keep as is
   - tune copy or placement
   - reduce prominence
   - expand later

## Wave Plan

- Wave 1:
  - `16-01` controlled-beta exposure and signal capture
- Wave 2:
  - `16-02` qualitative and quantitative signal review
- Wave 3:
  - `16-03` decision memo and next-step recommendation
