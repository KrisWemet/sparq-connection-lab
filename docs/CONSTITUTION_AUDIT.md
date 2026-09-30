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

## Build plan (constitution §14, sliced)

Each slice ships as its own PR.

| # | §14 step | Slice |
|---|---|---|
| 1 | Audit | This document. |
| 2 | Person Model + memory schema | `docs/PERSON_MODEL.md` spec + migration: hypothesis metadata on `profile_traits`, memory `kind`s, `self_discoveries`, `experiments`, retire dead tables. |
| 3 | Retrieval, confidence, revision, discovery capture | Evidence-based revision (contradictions weaken, never flip on one reflection); "worth remembering" gate; Peter marks self-discoveries and experiments; retrieval respects kinds. |
| 4 | Peter decision layer | Modes + smallest-useful-action rules in `PETER_SHARED_RULES`; tentative insight lines; hypothesis framing. |
| 5 | Onboarding / first 7 days | Lighter start, first useful interaction, Day-7 first mirror. |
| 6 | Mirrors + experiment follow-up | Weekly mirror reshaped; experiment check-ins; Day-30 mirror. |
| 7 | Relationship model + access controls | Schema for Us / cycles / repair; partner synthesis opt-in by both partners. |
| 8 | Shared Peter | Private-discovery → "keep private / help me share" flow. |
| 9 | Metrics | Meaningful Discovery Rate + supporting events. |
| 10 | User testing | Structured test plan (needs real users — Chris runs it). |
