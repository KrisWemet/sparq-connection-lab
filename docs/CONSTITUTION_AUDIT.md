# Constitution Audit — Repo vs. `docs/CONSTITUTION.md`

**Date:** 2026-09-30 · **Constitution step:** §14.1 ("Audit the current repo … keep / adapt / replace / missing")
**Method:** read every server module under `src/lib/server/`, the Peter routes, the daily-session routes, and the live Supabase schema (62 public tables); grepped which tables code actually touches.

Legend: **Keep** = fits the constitution as is · **Adapt** = right idea, needs changes · **Replace** = conflicts; rebuild or retire · **Missing** = nothing exists yet.

---

## Summary

The repo already has a lot of the constitution's *spirit*: a deterministic growth engine that flags tentative evidence, a North Star ladder the user confirms, an encrypted private journal, safety routing, and a Day-14 reveal. The big gaps are structural:

1. **No single Person Model.** Psychological "truth" lives in six places (three are dead tables).
2. **Hypotheses are stored like facts.** `profile_traits` has confidence but no evidence, and one contradicting reflection *replaces* the value instead of weakening it.
3. **Memory is undifferentiated.** Every evening conversation is stored raw; there are no memory types, no self-discoveries, no experiments.
4. **Peter has no conversation modes** and several prompt lines state inferences as fact ("I've noticed you tend to…").
5. **A latent private → shared leak:** partner synthesis blends both partners' evening reflections into shared text with no explicit user action (stored, not yet displayed).
6. **No relationship model, no Shared Peter, no discovery metrics.**

---

## §3 Person Model V1

| Existing | Where | Verdict | Notes |
|---|---|---|---|
| `profile_traits` (8 pattern dims + love language + conflict style, `confidence`, `effective_weight`) | `profile-analysis.ts`, `attachment-context.ts` | **Adapt** → becomes the hypothesis layer | Missing constitution metadata: source, evidence, contradictory evidence, sensitivity, confirmation status. |
| `user_insights.attachment_style / love_language / conflict_style` | columns on `user_insights` | **Replace** | Parallel copy of trait truth. `emotional_state` stays (it is Current Life context). |
| `personality_signals`, `personality_profiles`, `mirror_narratives` | no code references | **Replace** (retire) | Dead competing stores — violates §12 "one authoritative Person Model". |
| `north_stars` (ladder → user-confirmed line) | `north-star.ts` | **Keep** | Best existing example of user-confirmed Core Self. |
| Onboarding psychological profile (`profiles.psychological_profile`) | onboarding | **Keep** | Explicit user-supplied facts. |
| Insight Profile (how this person reaches insight) | — | **Missing** | Partly implied by `reflection-quality.ts` depth; nothing stored. |

## §4 Memory Architecture

| Existing | Verdict | Notes |
|---|---|---|
| `memories` (pgvector) + `searchMemories` top-5 | **Adapt** | Retrieval is already selective (good, §12). But every evening chat is stored raw via `addMemory` in `profile-analysis.ts` — violates "nothing worth remembering is a valid outcome". No memory types. |
| `conversation_memories` (used only by edge function `memory-operations`), `memory_storage` (unused) | **Replace** (retire) | Legacy duplicate stores. |
| Facts / Current Context / Patterns & Hypotheses / Self-Discoveries / Intentions & Experiments / Growth Evidence types | **Missing** | Need a `kind` on memories plus first-class records for discoveries and experiments. |
| Knowledge levels (told / discovered / evidence suggests / wondering) | **Missing** | |
| Contradictions preserved | **Replace** | `profile-analysis.ts` flips `inferred_value` on a single contradiction (confidence −0.15). Evidence for the old value is lost. |
| 90-day expiry, memory off, delete-all (Trust Center) | **Keep** | `privacy.ts`, `memory-settings.ts`. |

## §5–6 Peter's Behavioral Constitution & Conversation Engine

| Existing | Verdict | Notes |
|---|---|---|
| `PETER_SHARED_RULES` warmth, 4th-grade language, no clinical terms, one question at a time, comfort first | **Keep** | |
| "Blindspot detection" + generous-reframe mirroring | **Keep** (maps to Challenge mode) | Should be framed with curiosity and permission. |
| Identity language, Reflect → Breathe → Declare, future pacing | **Adapt** | Fine, but must not turn into guilt or be forced every turn. |
| Modes (Listen, Explore, Reflect, Challenge, Act, Celebrate, Safety), "smallest useful action", distance rule, stop digging, remember instead of coach, ask before interpreting | **Missing** | |
| `INSIGHT_SKELETONS` "I've noticed you tend to…" | **Adapt** | Stated as fact. Must be tentative and ask whether it fits (Reflect mode). |
| Personalization block "From what you've learned: …" | **Adapt** | Should say these are hypotheses, never facts. |
| Growth-moment block ("name the change, hand it back") | **Keep** | Already Celebrate-mode shaped. |
| Crisis detection → resources, nothing stored; `/help-now` | **Keep** | Safety as a first-class path (§12). |
| Evening turn-3 forced close | **Keep** | Supports "stop digging". |

## §7 Relationship Model

| Existing | Verdict | Notes |
|---|---|---|
| `profiles.partner_id` linking, partner invites | **Keep** | |
| `partner_syntheses` (blended, no attribution) | **Adapt** | Useful "Us" signal, but see §8. |
| `shared_answers`, `vulnerability_escrow` (no code references) | **Replace** (retire or re-home) | Unused. |
| Us / Interaction Cycles / Connection & Repair / Trajectory | **Missing** | `conflict_episodes` + `relationship-score.ts` hold a sliver of repair data. |

## §8 Privacy & Multi-Partner

| Existing | Verdict | Notes |
|---|---|---|
| RLS on every table; memories filtered by `user_id` | **Keep** | |
| Neutral Observer reflections encrypted, `shared_with_partner` flag | **Keep** | Explicit sharing — the right model. |
| Partner synthesis generated automatically from both partners' private evening reflections | **Replace** | Private → shared with no explicit user action (the consent screen promises "stays private unless you later choose a shared feature"). It is stored but not shown anywhere in the UI today. Stop generating it until both partners opt in. |
| My Private Peter / Partner's Private Peter / Shared Peter spaces | **Missing** (only private exists) | |
| "Help me put this into words to share" flow | **Missing** | |

## §9 First 30 Days

| Day band | Existing | Verdict |
|---|---|---|
| 0–3 useful before complete | Consent gate, question flow, CSI baseline, habit anchor, first Peter session | **Adapt** — onboarding still front-loads profiling questions. |
| 4–7 visible memory, North Star discovery | Memories in chat; North Star ladder nights | **Keep** |
| Day 7 First Mirror | Weekly mirror (`weekly-mirror/generate.ts`) | **Adapt** — must be one strength, one emerging pattern, one question; user completes the interpretation. |
| 8–14 experiments | Daily micro-actions (assigned), `if_then_checkins` table (no code) | **Missing** user-chosen experiments + outcomes. |
| Day 14 Growth Reveal | Day-14 graduation, CSI delta, baseline snapshot, growth engine | **Keep** |
| 15–21 Understand Us, 22–29 Agency | — | **Missing** |
| Day 30 Mirror | — | **Missing** |

## §10–11 Engagement & Growth Proof

| Existing | Verdict | Notes |
|---|---|---|
| Forgiving streak, return-state, no guilt copy | **Keep** | |
| Growth engine (deterministic gates, `tentative`, evidence JSON), baseline snapshot, CSI delta with honest flat/down copy | **Keep** | Strongest constitutional fit in the repo. |
| `analytics_events` / `trackEvent` | **Keep** | Instrumentation hook exists. |
| Meaningful Discovery Rate, correction rate, experiment follow-through, mirror usefulness | **Missing** | |

## §13 Tests

None exist. Chris decided (2026-09-29): tests are allowed but ask before adding each one.

---

## Build status (constitution §14) — all 10 steps shipped 2026-09-30

| # | §14 step | Shipped | Where |
|---|---|---|---|
| 1 | Audit | [KrisWemet/sparq-connection-lab#27](https://github.com/KrisWemet/sparq-connection-lab/pull/27) | this document |
| 2 | Person Model + memory schema | [KrisWemet/sparq-connection-lab#28](https://github.com/KrisWemet/sparq-connection-lab/pull/28) | `docs/PERSON_MODEL.md`, migration `…_person_model_v1.sql` |
| 3 | Retrieval, confidence, revision, discovery capture | [KrisWemet/sparq-connection-lab#29](https://github.com/KrisWemet/sparq-connection-lab/pull/29) | `trait-revision.ts`, `profile-analysis.ts`, `memory.ts` |
| 4 | Peter's decision layer + tests | [KrisWemet/sparq-connection-lab#30](https://github.com/KrisWemet/sparq-connection-lab/pull/30) | `PETER_SHARED_RULES`, `conversation-mode.ts`, `tests/` |
| 5 | Onboarding + first 7 days | [KrisWemet/sparq-connection-lab#31](https://github.com/KrisWemet/sparq-connection-lab/pull/31) | onboarding questions/Peter, weekly mirror (First Mirror) |
| 6 | Mirrors + experiment follow-up | [KrisWemet/sparq-connection-lab#32](https://github.com/KrisWemet/sparq-connection-lab/pull/32) | `/api/experiments`, `ExperimentsCard`, Day-30 mirror |
| 7 | Relationship model + access controls | [KrisWemet/sparq-connection-lab#33](https://github.com/KrisWemet/sparq-connection-lab/pull/33) | `docs/RELATIONSHIP_MODEL.md`, `supabase/tests/rls_boundaries.sql` |
| 8 | Shared Peter | [KrisWemet/sparq-connection-lab#34](https://github.com/KrisWemet/sparq-connection-lab/pull/34) | `SharePrompt`, `/us`, `/api/peter/shared-reflect` |
| 9 | Metrics | step-9 PR | `docs/METRICS.md`, Admin → Discovery |
| 10 | User testing | plan ready — **Chris runs it** | `docs/USER_TESTING_PLAN.md` |

## §13 Definition of Done — status

| Item | Status |
|---|---|
| Person Model V1 schema and migration plan exist | ✅ `docs/PERSON_MODEL.md` + migration |
| Memory types and confidence/revision rules are specified | ✅ `docs/PERSON_MODEL.md` §3–5, `trait-revision.ts` |
| Peter's modes and next-action decision logic are implemented and testable | ✅ `PETER_SHARED_RULES`, `conversation-mode.ts`, `tests/conversation-mode.test.ts` |
| Self-discoveries and user-created experiments are first-class records | ✅ `self_discoveries`, `experiments` |
| Relationship Model schema separates individual, shared and interaction-cycle knowledge | ✅ `couple_spaces`, `shared_items`, `interaction_cycles` |
| Private Peter and Shared Peter have enforceable access boundaries | ✅ RLS, verified live by `supabase/tests/rls_boundaries.sql` |
| First 30-day experience is mapped to concrete product flows | ✅ see table below |
| Growth mirrors use historical evidence and guided reflection | ✅ weekly First Mirror + Day-30 mirror (user writes the ending) |
| Existing repo capabilities are mapped before major replacement work | ✅ this audit (nothing working was rebuilt) |
| Automated tests cover privacy leakage, inference certainty, memory revision and shared-space access | ✅ unit tests in `tests/` (32) + live RLS script. Shared-space DB access is checked by the SQL script, not in CI (no test database). |

### First 30 days → product flows (§9)

| Band | Flow |
|---|---|
| Days 0–3 useful before complete | Onboarding with skippable deep questions → Peter's first guess ("tell me if I'm off") → journey → Neutral Observer hook |
| Days 4–7 visible memory | Distilled memories + self-discoveries in Peter's context; North Star ladder nights |
| Day 7 First Mirror | Weekly mirror: strength, maybe-pattern, question → user answers → self-discovery, optional share |
| Days 8–14 experiments | Evening intentions + user-written experiments → check-in after 2 days → outcome as growth evidence |
| Day 14 growth reveal | Existing Day-14 graduation, CSI delta, growth engine |
| Days 15–21 Understand Us | `/us`: shared items, interaction cycles both confirm, Shared Peter question |
| Days 22–29 agency | Peter's Listen/distance rules + user's own discoveries outranking guesses |
| Day 30 The Mirror | Day-30 mirror from their own words and verified growth; user writes the conclusion |

## Still open (not constitution blockers)

- Drop the deprecated tables (`personality_signals`, `personality_profiles`, `mirror_narratives`, `memory_storage`, `conversation_memories`, `if_then_checkins`, `partner_syntheses`, and the `user_insights` trait columns) — all empty or unused; waiting for Chris's OK.
- Logged-in walkthrough of the new UI (Journal experiments, mirrors, `/us`) — no test account in the cloud environment.
- A CI-run database test for shared-space access needs a test database or Supabase branch.
