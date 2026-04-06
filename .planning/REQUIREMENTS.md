# Requirements

## Milestone: Beta Stabilization

### BETA-AUTH-01 — Auth Consistency
- The app must use one clearly canonical browser auth path for login, session persistence, logout, and protected-route checks.
- Duplicate or legacy auth helpers that can cause diverging behavior in critical flows must be removed, consolidated, or fenced off from the beta path.
- Auth behavior must match the spec’s canonical architecture: `src/lib/auth-context.tsx` for app state and `src/lib/server/supabase-auth.ts` for API auth.

### BETA-ONBOARD-01 — Onboarding Reliability
- New users must reliably land in the correct onboarding state after signup or login.
- Onboarding completion, consent state, and redirects must be deterministic and resilient to refreshes or reused sessions.
- The onboarding path must feel solo-first and must not dead-end when a partner is absent.

### BETA-DAILY-01 — Daily Loop Reliability
- The daily loop must reliably support start or resume, morning progression, evening check-in, and completion without duplicate or mismatched session state.
- Session APIs must enforce deterministic state transitions and idempotent same-day behavior.
- The daily loop must reinforce the product promise from the spec: small real-world actions, simple language, and identity-level growth.

### BETA-ARCH-01 — Targeted Drift Reduction
- Architecture cleanup is limited to the auth, onboarding, and daily loop paths.
- Cleanup should reduce ambiguity between direct page-level Supabase calls, API routes, and legacy services when that ambiguity directly threatens beta reliability.
- Broad platform rewrites, new feature systems, and non-blocking cleanup are out of scope for Phase 1.

### BETA-TEST-01 — Credible Beta Verification
- The repo must have reliable automated coverage for the critical beta flows:
  - auth bootstrap and session reuse
  - onboarding completion for solo users
  - daily session start, resume, and evening completion
- Tests should focus on behavior users depend on, not broad feature inventory.

## Milestone: Beta Hardening

### BETA-HARD-DB-01 — Database And Environment Consistency
- The beta path must no longer depend on ambiguous or legacy environment-variable sources.
- Required database tables, critical columns, and schema assumptions for real user testing must be explicitly verifiable.
- Local, staging, and production readiness should be checkable from repo artifacts and repeatable verification steps.

### BETA-HARD-LAUNCH-01 — Launch-Blocker Verification
- The blocking items in `LAUNCH_CHECKLIST.md` that matter to real user testing must be translated into explicit verification work.
- Where possible, launch blockers should be checked automatically; where live access is required, the repo should provide exact operator steps and evidence targets.
- Checklist items that are no longer accurate after Phase 1 or current code changes must be updated.

### BETA-HARD-DAILY-01 — Daily Loop Clarity
- The daily-loop UI must make the user’s next step obvious at every point in the supported beta journey.
- Dashboard entry, in-loop state, and completion messaging must stay synchronized with the real session state.
- Clarity work is in scope only where it improves completion reliability and reduces user confusion.

### BETA-HARD-LEGACY-01 — Legacy Path Quarantine
- Legacy pages, hooks, clients, and alternate flows that still confuse the beta path must be removed from active use, fenced off, or explicitly marked as deprecated.
- Quarantine work should focus on beta-path confusion, not broad repo cleanup.
- The resulting supported beta path should be easy for contributors and testers to identify.

### BETA-HARD-TEST-01 — Real User Testing Confidence
- The repo must provide enough verification coverage and operator guidance that a small real-user beta can run without avoidable surprises.
- Hardening verification should include both automated tests and targeted manual/live checks for environment-dependent launch blockers.

## Milestone: Live Beta Verification

### BETA-LIVE-DB-01 — Live Supabase Schema Verification
- The active linked Supabase project must be verified against the supported beta path, not just against repo artifacts.
- Verification must confirm that the launch-blocker tables and the `daily_sessions` shape required by `/api/daily/session/*` exist in the live environment.
- Evidence for the live schema check must be captured in a durable document so later beta decisions are based on facts, not memory.

### BETA-LIVE-ENV-01 — Deployed Environment And AI Key Verification
- The deployed beta environment must be checked for the exact env keys the supported beta path depends on.
- Verification must prove that Peter’s generation path has at least one working AI provider key available in the deployed environment.
- Evidence must distinguish between documented config, observed deployed config, and successful runtime behavior.

### BETA-LIVE-MANUAL-01 — Solo-First Live Path Validation
- A human-validated run of the supported beta path must succeed from signup through onboarding, dashboard entry, daily start, and daily completion.
- The live manual walkthrough must be solo-first, meaning it cannot depend on partner adoption or partner tooling to count as a pass.
- The walkthrough must record exact observations, failures, and final pass or fail status for each step.

### BETA-LIVE-DOC-01 — Operator Evidence Trail
- Each live verification item must have exact operator steps, expected outcomes, and captured evidence.
- Documentation should make it easy for a future operator to repeat the same checks without guessing which commands, routes, or screenshots matter.
- This phase is verification-only: no broad refactors or new features should be introduced under this requirement.

## Milestone: Production Blocker Fixes

### BETA-PROD-SIGNUP-01 — Fix Live Signup Route
- The production `/signup` route must stop returning HTTP 500 and load the supported solo-first signup experience.
- The fix must stay narrow to the production blocker uncovered in `03-LIVE-EVIDENCE.md`.
- The repaired route must be re-verified against the live deployment after the fix is shipped.

### BETA-PROD-DAILY-01 — Fix Live Daily Entry Path
- A fresh solo user reaching `/daily-growth` from the supported beta path must land in the Day 1 morning flow, not an unexpected consent gate or stalled state.
- Consent and daily-entry behavior must align with the intended supported path proven in repo tests and contradicted by the Phase 3 live evidence.
- The fix must stay narrow to the live blocker and not broaden into unrelated onboarding or daily-loop redesign.

### BETA-PROD-VERIFY-01 — Re-Run Live Evidence
- After the production blockers are fixed, the same live verification evidence from Phase 3 must be re-run.
- Verification must include route checks and a live browser walkthrough against production.
- Evidence must clearly show the before-and-after status of the repaired blockers.

## Milestone: Live Onboarding Determinism

### BETA-LIVE-ONBOARD-01 — Deterministic Peter Handoff
- The live Peter onboarding experience must close in a deterministic enough way that a fresh production user can reliably reach journey selection.
- The handoff must stay aligned with the existing solo-first onboarding flow and must not expand into a redesign.
- Determinism work must focus on the real blocker documented in `04-LIVE-EVIDENCE.md`: variable live progression before journey selection is proven.

### BETA-LIVE-POST-ONBOARD-01 — Clean Dashboard And Day 1 Entry
- After onboarding and journey selection, a fresh production user must reach dashboard and then Day 1 morning flow cleanly.
- Post-onboarding state must align with the supported beta path without requiring retries, stale-session recovery, or manual workarounds.
- Scope is limited to the transitions that directly block the live fresh-user proof path.

### BETA-LIVE-PROOF-01 — End-To-End Fresh-User Production Proof
- The same live fresh-user production walkthrough must be re-run after the deterministic onboarding fixes.
- Proof must cover signup or register entry, onboarding, journey selection, dashboard entry, daily start, and Day 1 completion.
- Evidence must record exact commands, outcomes, and any residual blockers so beta readiness is based on observed live behavior.

## Milestone: Controlled Beta Ops

### BETA-OPS-FEEDBACK-01 — Primary Path Beta Feedback Capture
- Beta users on the proven primary signup-driven path must have a lightweight way to submit feedback.
- Feedback capture must stay scoped to beta operations and must not become a new product feature area.
- Submitted feedback must include enough path context to help operators understand where the user was in the proven funnel.

### BETA-OPS-FUNNEL-01 — Primary Path Funnel Analytics
- The proven primary signup-driven path must emit stable analytics events for:
  - signup or register success
  - onboarding completion
  - journey selection
  - dashboard arrival
  - daily-growth start
  - Day 1 completion
- Funnel instrumentation must stay focused on the proven primary path, not on broad product analytics expansion.
- Event naming and payloads must be documented well enough for controlled beta reporting.

### BETA-OPS-OBS-01 — Primary Path Error Monitoring
- The proven primary path must have structured error monitoring or logging that helps operators detect breakage during controlled beta.
- Monitoring work must focus on the stages proven in `05-LIVE-EVIDENCE.md`, not on broad platform observability rollout.
- Error evidence must be actionable enough to support rapid triage during beta.

### BETA-OPS-FOLLOWUP-01 — Secondary Fallback Path Stays Follow-Up Only
- The secondary login-entry fallback path must remain an explicitly documented follow-up hardening item.
- This phase must not quietly expand into stabilizing that secondary path.
- Planning and status artifacts must keep the active beta gate centered on the proven primary signup-driven path.

## Milestone: Live Onboarding Reliability Recovery

### BETA-RECOVERY-HANDOFF-01 — Restore Dependable Live Peter Handoff
- The renewed live Peter handoff variance documented in `06-LIVE-EVIDENCE.md` must be investigated and fixed before journey selection.
- Recovery work must stay tightly scoped to the live reliability issue and must not become an onboarding redesign.
- The repaired handoff must behave dependably enough for a fresh production user to reach journey selection on the supported beta path.

### BETA-RECOVERY-PROOF-01 — Re-Prove Fresh Production Signup Path
- After the handoff recovery is deployed, the fresh production signup-driven walkthrough must be re-run until the primary path is dependable again.
- Proof must cover signup, onboarding, journey selection, dashboard, daily start, and Day 1 completion.
- Evidence must clearly show the repaired path succeeding in production, not just in repo tests.

### BETA-RECOVERY-OPS-01 — Confirm Beta Ops Survive The Repair
- The Phase 6 controlled-beta ops events must still fire on the repaired primary path.
- Verification must confirm that the measurement layer remains trustworthy after the handoff recovery.
- Scope is limited to existing Phase 6 events and operator evidence, not broader analytics expansion.

## Milestone: Beta Ops Signal Cleanup

### BETA-SIGNAL-OPS-01 — Remove False-Positive Journey Start Errors
- The controlled-beta error stream must not write `beta_primary_path_error` rows for successful primary-path journey starts.
- Investigation and fixes must stay tightly scoped to the false-positive `journey_start_lookup` signal proven in `07-LIVE-EVIDENCE.md`.
- The fix must preserve meaningful error visibility for real journey-start failures instead of muting the stage entirely.

### BETA-SIGNAL-PROOF-01 — Re-Prove Day 1 Completion With Cleaned Signal
- After the false-positive signal is repaired, the same fresh production signup-driven walkthrough must still complete through Day 1.
- Verification must confirm both product success and cleaner ops evidence for the repaired run.
- Operator evidence must make it clear that the noisy `journey_start_lookup` error row is gone on a successful run.

## Milestone: Route Change Noise Cleanup And Focused Production Audit

### BETA-ROUTE-NOISE-01 — Remove False-Positive Route Change Error Noise
- The controlled-beta error stream should not write `beta_primary_path_error` rows for expected route-cancel behavior during primary-path register redirects.
- Investigation and fixes must stay tightly scoped to the `route_change` noise proven after Phase 8.
- The fix must preserve useful reporting for real route failures instead of disabling route error reporting entirely.

### BETA-ROUTE-PROOF-01 — Re-Prove Day 1 Completion With Cleaner Route Signal
- After the route-change noise is narrowed, the same fresh production signup-driven walkthrough must still complete through Day 1.
- Verification must confirm both product success and the improved route-error signal quality for the repaired run.
- Operator evidence must clearly show whether the previous false-positive route noise is gone or acceptably narrowed.

### BETA-AUDIT-01 — Produce Ranked Follow-Up Findings
- The repo must contain a focused audit with at least five real, ranked findings after the route-noise cleanup work.
- Findings must prioritize the primary signup-driven production path first, then operator-facing production risks, then obvious redundancies or dead or legacy paths.
- Each finding must include title, severity, affected files, why it matters, recommended fix, and whether it should be fixed now, later, or ignored.

## Milestone: Onboarding Activation Fail-Closed

### BETA-ONBOARD-FAIL-01 — Fail-Closed Journey Activation Handoff
- The onboarding confirmation step must require successful journey activation before advancing out of onboarding.
- The same step must require successful persistence of `profiles.isonboarded` before advancing.
- `onConfirm()` must only run after both writes succeed, and either failure path must emit a narrow primary-path error event.

### BETA-ONBOARD-FAIL-PROOF-01 — Re-Prove Primary Path After Fail-Closed Fix
- After the fail-closed onboarding handoff is repaired, the same fresh production signup-driven walkthrough must still complete through Day 1.
- Proof must cover signup or register entry, onboarding, journey selection, dashboard arrival, daily-growth start, and Day 1 completion.
- Evidence must stay tightly focused on the repaired onboarding handoff and the preserved primary-path success case.

## Milestone: Relationship Life Expansion Strategy

### EXPANSION-STRATEGY-01 — Define Lightness And Stickiness Expansion
- Sparq must have a ranked product map for expanding beyond serious relationship work into a broader relationship life app.
- The strategy must preserve Sparq’s strengths in personalization, emotional intelligence, and the proven primary path.
- The strategy must explicitly target more lightness, fun, daily stickiness, and reasons to open the app when nothing is wrong.

### EXPANSION-STRATEGY-02 — Evaluate The Five Expansion Buckets
- The product map must cover:
  - playful connection layer
  - shared rituals layer
  - adaptive date-night layer
  - couple game mode
  - joy and celebration layer
- Each bucket must include user value, retention impact, identity fit, example features, implementation complexity, beta risk, and timing recommendation.

### EXPANSION-STRATEGY-03 — Produce A Ranked Product Roadmap
- The strategy output must rank the expansion buckets in rollout order.
- The roadmap must distinguish what should be built now, later, and much later.
- The roadmap must stay at the product level and must not drift into implementation planning or redesign of the proven primary path.

## Milestone: Playful Connection MVP Definition

### PLAYFUL-MVP-01 — Choose The First Expansion Lane
- Sparq must define a single best next expansion lane based on delight, retention impact, risk to the proven primary path, and MVP size.
- The choice must compare the five expansion options from Phase 11 and commit to one clear winner.
- The output must explain why that lane wins now and what should not be built yet.

### PLAYFUL-MVP-02 — Define The Smallest Valuable Playful Connection MVP
- The chosen lane must be reduced to the smallest buildable slice with real user value.
- The MVP definition must stay product-level and avoid engineering tasks or implementation design.
- The MVP must remain compatible with Sparq’s solo-first stance and serious-core identity.

### PLAYFUL-MVP-03 — Define Surfaces, Guardrails, And Success Metrics
- The product definition must list the exact user-facing surfaces the MVP would touch.
- It must define the main product risks and the guardrails that protect the proven primary path.
- It must define success in terms of delight, repeat opens, and retention without harming the current core flow.

## Milestone: Playful Connection Feature MVP Spec

### PLAYFUL-SPEC-01 — Define A Contained Feature Set
- Sparq must define a playful connection MVP made of 3 to 5 features only.
- Each feature must clearly fit one of these roles:
  - connect us
  - delight us
  - make us laugh
  - help us enjoy each other
- The feature set must feel native to Sparq and must not read like generic party-game widgets.

### PLAYFUL-SPEC-02 — Define Product Behavior For Each Feature
- Each feature in the MVP spec must include:
  - user story
  - why it matters
  - entry point in the app
  - frequency of use
  - required backend or data needs
  - UX flow
  - beta scope
  - future expansion path
- The spec must stay product-level and must not become engineering design.

### PLAYFUL-SPEC-03 — Keep The Slice Contained And Safe
- The playful connection MVP must remain buildable as a contained slice.
- The spec must explicitly protect the proven signup-driven path and avoid redesigning the serious core.
- The output must define what belongs in beta versus what is intentionally deferred.

## Milestone: Playful Connection MVP Implementation

### PLAYFUL-IMPL-01 — Isolate The New Feature From The Critical Path
- The first playful MVP implementation must be isolated from the proven signup-driven onboarding and Day 1 flow.
- Routing and state changes must stay contained so the feature can fail safely without blocking dashboard or daily-growth load.
- The implementation must not redesign onboarding, dashboard core logic, or daily-growth core logic.

### PLAYFUL-IMPL-02 — Ship The Smallest Usable Slice
- The first implementation slice must focus on the smallest useful pair:
  - `Daily Spark`
  - `Favorite Us`
- The implementation must use safe existing surfaces and remain optional for the user.
- The slice must deliver real value without requiring the full four-feature playful layer.

### PLAYFUL-IMPL-03 — Maintain Production Stability
- The implementation phase must preserve production stability and the proven primary-path verification baseline.
- Acceptance criteria and verification must explicitly prove that signup, onboarding, dashboard arrival, and Day 1 completion still work.
- New analytics for the playful layer must remain separate from primary funnel analytics.

## Milestone: Playful Layer Live Verification And Rollout Guardrails

### PLAYFUL-LIVE-01 — Re-Prove The Primary Signup-Driven Path With The Playful Slice Deployed
- After deployment, the proven primary signup-driven production path must still complete through:
  - signup or register
  - onboarding
  - journey selection
  - dashboard
  - daily-growth
  - Day 1 completion
- Verification must confirm that the playful slice is additive only and does not interrupt the serious core flow.
- Evidence must record exact pass or fail results for each primary-path stage.

### PLAYFUL-LIVE-02 — Prove The Intended Playful Surfaces In Production
- The deployed playful MVP slice must load correctly for authenticated users on its intended surfaces:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- Swap, keep or save, and copy interactions must work as intended in production.
- The slice must remain optional and must not interrupt the main daily loop.

### PLAYFUL-LIVE-03 — Prove Fail-Soft Production Behavior
- If the playful endpoint is unavailable or failing, dashboard must still load.
- If the playful endpoint is unavailable or failing, daily-growth must still load.
- The serious core must remain unchanged and usable during playful outage conditions.
- This must be verified in production, not only in local tests.

### PLAYFUL-LIVE-04 — Prove Analytics Separation And Visibility
- Playful interaction analytics must be visible in production.
- Playful analytics must remain distinguishable from the primary funnel analytics.
- Verification must confirm that the core funnel remains observable while the playful slice is active.

### PLAYFUL-LIVE-05 — Define Rollout Guardrails
- The phase must produce clear rollout guardrails for controlled exposure of the playful slice.
- The output must define:
  - what to monitor
  - what counts as safe
  - what should trigger rollback or disablement
- Any narrow required fixes before exposure must be documented without widening into new playful feature work.

## Milestone: Playful Layer Controlled Beta Exposure And Signal Review

### PLAYFUL-COHORT-01 — Expose The Playful Slice Only To The Controlled-Beta Cohort
- The playful MVP slice must be exposed only to the current controlled-beta cohort during this phase.
- Exposure must remain limited to the already-proven MVP surfaces:
  - `Daily Spark` on dashboard
  - `Favorite Us` on the daily-growth home
- This phase must not widen into new playful features, broader navigation changes, or onboarding changes unless a real regression is found.

### PLAYFUL-COHORT-02 — Review Playful Engagement Beside The Core Funnel
- The phase must monitor the core funnel and playful interaction stream together for the controlled-beta cohort.
- The review must answer whether playful usage appears additive, neutral, or distracting relative to Day 1 completion.
- Evidence must come from real cohort behavior, not only synthetic or operator-only tests.

### PLAYFUL-COHORT-03 — Summarize Qualitative Beta Feedback
- The phase must collect and summarize beta feedback on whether the playful layer feels:
  - helpful
  - warm
  - optional
  - non-intrusive
- The summary must also identify whether users describe the playful layer as distracting, cheesy, or confusing.
- Feedback interpretation must stay tightly scoped to the current playful slice and its current placement.

### PLAYFUL-COHORT-04 — Produce A Decision Memo
- The output of the phase must be a short decision memo with one clear recommendation:
  - keep as is
  - tune copy or placement
  - reduce prominence
  - expand later
- The memo must explicitly say whether the current Home and Daily placement should remain.
- Any narrow follow-up fixes or experiments must be documented without widening into new playful feature work.

## Milestone: Editorial Relationship Life UI Refresh

### UI-EDITORIAL-01 — Establish The Visual Direction
- Sparq must define a visual contract that shifts the product from a utility-heavy relationship-work app toward a premium relationship life app.
- The contract must be grounded in the provided editorial reference direction: warm ivory surfaces, violet accents, rounded cards, expressive serif display type, and magazine-like section hierarchy.
- The contract must preserve Sparq's emotional safety, solo-first clarity, and simple language expectations.

### UI-EDITORIAL-02 — Limit The Refresh To Safe Surfaces
- The visual refresh contract must stay focused on safe existing surfaces:
  - dashboard
  - daily-growth home
  - bottom navigation
  - editorial content cards and supporting modules
  - playful layer styling on its current MVP surfaces
- The contract must not redesign onboarding flow logic, Peter behavior, or the proven Day 1 path.
- The contract must make the new layer additive and visually cohesive without turning the app into a separate product.

### UI-EDITORIAL-03 — Make The Refresh Buildable And Safe
- The UI contract must define design tokens, type hierarchy, spacing rules, color allocation, copywriting rules, and registry safety expectations in a way the current codebase can implement.
- The contract must explicitly avoid broad new feature scope and must not require a routing rewrite or product architecture change.
- The contract must be actionable enough to drive a later implementation phase without guessing at the intended aesthetic.

## Milestone: Sparq IA Contract And Home Simplification

### IA-CONTRACT-01 — Define Final Destination Ownership
- Sparq must define one explicit primary navigation structure grounded in the recovered implementation baseline.
- The contract must assign clear jobs to `Home`, `Journeys`, `Connect`, `Journal`, and secondary access.
- The contract must resolve ambiguous ownership between private reflection, structured progression, shared connection tools, and account surfaces.

### IA-CONTRACT-02 — Define Exact Home Scope
- The contract must define exactly what stays on Home and exactly what leaves Home.
- Home must become the single-next-step launcher rather than a multi-purpose dashboard feed.
- The contract must preserve `Daily Spark` on Home and keep `Favorite Us` on `daily-growth`.

### IA-CONTRACT-03 — Preserve The Proven Daily Path
- The contract must preserve the supported `/dashboard -> /daily-growth` launch path.
- `Daily` must remain a flow launched from Home rather than a primary navigation destination.
- The contract must not weaken the proven solo-first, signup-driven path or reopen onboarding and daily-loop logic.

### IA-CONTRACT-04 — Produce Safe Rollout Guardrails
- The IA contract must define a phased implementation order, key risks, and explicit guardrails for the first structural IA wave.
- The contract must separate IA work from visual redesign, playful expansion, and unrelated feature work.
- The contract must be grounded in full planning history, not just the later editorial phases.

## Milestone: Implement IA Wave 1: Home Simplification and Navigation Restructure

### IA-WAVE1-01 — Simplify Home To The Core Launcher
- Home must be reduced to the agreed Wave 1 structure:
  - Peter greeting
  - one Today card
  - `Daily Spark`
  - one quiet destination strip
- Home must stop owning progress, mirror/history, partner synthesis, and other non-launch modules.
- The Home Today card must remain the single strongest call to action above the fold.

### IA-WAVE1-02 — Establish Destination Ownership
- The app must add or activate the new owned destinations needed for the IA contract, especially `Connect` and `Journal`.
- Reflective and personal-history surfaces must move toward `Journal`, and shared or partner-aware tools must move under `Connect`.
- `profile` must become secondary access for account, settings, trust, billing, and related controls only.

### IA-WAVE1-03 — Switch Primary Navigation Without Breaking The Core Path
- The primary navigation must become `Home`, `Journeys`, `Connect`, and `Journal`.
- `/daily-growth` must remain Home-owned in navigation and behavior, not a standalone tab.
- Navigation and ownership changes must preserve the proven daily loop, the current playful placements, and existing primary-path instrumentation.

## Milestone: Attachment-Aware Personalization

### ATTACH-INFRA-01 — Define Pattern Vocabulary
- The system must define 7 new `profile_traits` key values: `repair_style`, `reassurance_need`, `space_preference`, `stress_communication`, `interpretation_bias`, `vulnerability_pace`, `worth_pattern`.
- Each key must have 2–4 allowed pattern values expressed in plain human language (no clinical labels).
- Allowed values must be enforced via server-side validation before any insert, mirroring the existing pattern in `profile-analysis.ts`.
- A migration must document the new keys and their allowed values so future phases have a stable contract.

### ATTACH-INFRA-02 — Unified Pattern Context Builder
- A server helper (`src/lib/server/attachment-context.ts`) must consolidate `profile_traits` reads for all 8 dimensions into a single `PatternContext` object.
- The helper must be used by Peter morning, Peter chat, and journey recommendation so trait reads are consistent and not scattered.
- The helper must handle missing traits gracefully (return null per dimension, never throw).

### ATTACH-SIGNAL-01 — Onboarding Signal Capture
- The onboarding question set must capture behavioral signals for `repair_style`, `reassurance_need`, and `space_preference` through adapted quick-reply options and score deltas.
- No new onboarding steps may be added — signals must be captured through existing question slots or gentle rephrasing of existing options.
- No clinical framing or label language may appear in any onboarding question or option.

### ATTACH-SIGNAL-02 — Evening Reflection Inference
- Evening reflection analysis (`src/lib/server/profile-analysis.ts`) must infer all 8 pattern dimensions from reflection text, extending the existing fire-and-forget pattern.
- Inference must remain non-blocking and silent — it must never delay or fail the session completion response.
- Each new dimension must have an allowed-value validation step that discards hallucinated or out-of-vocab values before any insert.
- Confidence must be updated using the existing quality-weighted boost pattern from `reflection-quality.ts`.

### ATTACH-SIGNAL-03 — Trait Gap Steering
- The trait gap system (`src/lib/server/trait-gaps.ts`) must include all 8 dimensions in its `CORE_TRAITS` list and `STEERING_HINTS` map.
- Steering hints must guide morning story generation toward surfacing signals for under-profiled dimensions without naming or revealing the dimension being explored.
- Steering hint language must be non-clinical and consistent with Peter's voice.

### ATTACH-PETER-01 — Morning Story Personalization
- Morning story generation (`src/lib/peterService.ts` → `getMorningStoryPrompt`) must apply personalization hints for all 8 dimensions when confidence meets the threshold.
- Hints must adapt narrative tone, micro-action framing, and story scenario to match the user's inferred pattern without naming the pattern.
- The personalization must remain additive — no existing personalization branches for `attachment_style`, `love_language`, or `conflict_style` may be removed.

### ATTACH-PETER-02 — Peter Chat Tone Adaptation
- Peter chat responses must adapt tone and framing based on `reassurance_need` and `repair_style`, with specific language adjustments per pattern value.
- High `reassurance_need` must produce warmer, more affirming openings before any reflection or challenge.
- `repair_style` must shape how Peter frames repair suggestions (direct invitation vs. space-giving vs. process-first framing).

### ATTACH-PETER-03 — Pattern Insight Moments
- Peter must be able to name a pattern naturally in context during evening check-in or chat using plain human language.
- Insight moments must only trigger when a dimension's confidence is 0.7 or higher.
- The named pattern must be framed as an observation, not a diagnosis: "I've noticed you tend to..." not "You are..." or "Your attachment style is...".
- No clinical label may appear in any user-facing insight moment copy.

### ATTACH-JOURNEY-01 — Pattern-Weighted Journey Routing
- Journey recommendations (`src/lib/server/next-journey-recommender.ts`) must weight available journeys by affinity to the user's inferred pattern profile.
- Journeys aligned to a user's highest-confidence, lowest-satisfaction dimensions must score higher in the recommendation ranking.
- The weighting must be additive to the existing attachment-style affinity scoring, not a replacement.
