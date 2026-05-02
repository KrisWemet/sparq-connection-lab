# Phase 23: Peter Adaptation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 23-peter-adaptation
**Areas discussed:** Hint architecture + chat tone, Confidence thresholds + 0.4 floor, Insight moment trigger + copy, Single read path scope

---

## Hint architecture + chat tone

### Q1: Where should pattern hints be emitted?

| Option | Description | Selected |
|--------|-------------|----------|
| New helper: getPatternHints(ctx, surface) | New module returns `{morningHints, chatToneHints, insightLines}` based on surface. Keeps surface-specific shape cleanly separated. | ✓ |
| Extend TRAIT_DESCRIPTIONS only | Smallest code change. Every surface gets the same trait-line shape. | |
| Extend getMorningStoryPrompt + inline chat logic | Mirrors today's pattern exactly. Risk: chat.ts grows. | |

**User's choice:** New helper `getPatternHints(ctx, surface)` (Recommended)

### Q2: How should chat tone variants be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Centralized constant table CHAT_TONE_VARIANTS | Const map keyed by (dim, value) → instruction string. Reviewable as data. | ✓ |
| Inline if/else in chat.ts | Conditional blocks inside the chat handler. | |
| Variants live inside getPatternHints(ctx, 'chat') | Same helper returns chat-tone strings. | |

**User's choice:** Centralized constant table CHAT_TONE_VARIANTS (Recommended)
**Notes:** The table will live inside the new pattern-hints.ts module — combines cleanly with the helper from Q1.

### Q3: Should chat tone adapt for dimensions beyond repair_style + reassurance_need?

| Option | Description | Selected |
|--------|-------------|----------|
| Just the two named in criterion #1 | Smaller blast radius; faster to validate. | |
| Add stress_communication too | Naturally affects how Peter pitches a chat reply. | |
| All 8 dims influence chat tone | Maximally personalized. 8 × 4 = 32 variants to author. | ✓ |

**User's choice:** All 8 dims influence chat tone
**Notes:** Higher copy load but avoids a follow-up patch. Author during execution, review during plan.

---

## Confidence thresholds + 0.4 floor

### Q1: How to reconcile the 0.4 floor with criterion #1 ("any confidence")?

| Option | Description | Selected |
|--------|-------------|----------|
| Bypass floor for chat tone path | buildPersonalizedPrompt floor stays at 0.4. New chat-tone path runs separately on raw PatternContext. | ✓ |
| Lower floor to 0.3 globally | Drop floor in buildPersonalizedPrompt to 0.3. Trait-description lines surface earlier. | |
| Per-surface thresholds inside getPatternHints | chat at 0.0, morning at 0.35, insight at 0.7. Three thresholds to reason about. | |

**User's choice:** Bypass floor for chat tone path (Recommended)

### Q2: Should chat-tone hints fire for dims at any weight (including <0.3)?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep PatternContext at >=0.3 weight | Honor Phase 21 D-15. "Any confidence" interpreted as "no separate floor beyond PatternContext". | ✓ |
| Add buildPatternContextRaw at 0.0 weight | Returns dims even at very low weight. | |
| Lower the PatternContext threshold to 0.0 | Reverses Phase 21 D-15. Big blast radius. | |

**User's choice:** Keep PatternContext at >=0.3 weight (Recommended)

### Q3: Use 0.35 morning / 0.7 insight exactly per criteria, or align with spec bands?

| Option | Description | Selected |
|--------|-------------|----------|
| Use 0.35 and 0.7 exactly per criteria | Criteria are the contract; intentionally more aggressive for morning. | ✓ |
| Round morning to 0.4 to match spec band | Keeps three thresholds consistent with master spec. | |
| Make thresholds config-driven | Read from constants/env. More knobs. | |

**User's choice:** Use 0.35 and 0.7 exactly per criteria (Recommended)

---

## Insight moment trigger + copy

### Q1: When should Peter produce an insight moment?

| Option | Description | Selected |
|--------|-------------|----------|
| Suggest, don't force — system-prompt instruction | When a >=0.7 dim exists, append a "you MAY name a pattern naturally" instruction. LLM decides per-turn. | ✓ |
| Deterministic — once per day per user, evening only | If a >=0.7 dim exists and no insight today, append a strong instruction. Predictable cadence. | |
| Only when a dim freshly crosses 0.7 | Track 'last named confidence' per (user, dim). Adds new state. | |

**User's choice:** Suggest, don't force — system-prompt instruction (Recommended)

### Q2: How should the insight line be generated?

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-written templates per (dim, value) | 32 templates curated for tone, reviewable, deterministic. Verbatim through the system prompt. | |
| LLM-generated from dim + value description | Pass dim+value+description, ask Peter to phrase it himself. Risk of clinical drift. | |
| Hybrid: template skeleton + LLM polish | Skeleton like "I've noticed you tend to {behavior}", Peter wraps warmly. Middle ground. | ✓ |

**User's choice:** Hybrid: template skeleton + LLM polish

### Q3: Which surface(s) carry the insight moment?

| Option | Description | Selected |
|--------|-------------|----------|
| Both — evening primary, chat secondary | Evening reflection is natural reflective surface; chat opens spontaneous moments. | ✓ |
| Evening check-in only | Smaller surface. Chat insight moments deferred. | |
| Chat only | Open chat is where users seek deeper conversation. | |

**User's choice:** Both — evening check-in primary, chat secondary (Recommended)

### Q4: Per-user cadence cap?

| Option | Description | Selected |
|--------|-------------|----------|
| Soft cadence via system prompt — no DB tracking | "Use this sparingly, at most once per conversation." No new infra. | ✓ |
| Hard cap — max 1 per day across surfaces | New tracking table. Adds infra but guarantees pacing. | |
| No cap — fire whenever the trigger condition is met | Simplest. Risk: loses weight if every evening. | |

**User's choice:** Soft cadence via system prompt — no DB tracking (Recommended)
**Notes:** Escalation path documented — if soft cadence proves insufficient, future phase can add DB tracking.

---

## Single read path scope (criterion #5)

### Q1: How to satisfy "buildPatternContext is the only profile_traits read path"?

| Option | Description | Selected |
|--------|-------------|----------|
| Add buildLegacyTraits helper + call both | Sibling helper for love_language + conflict_style. Zero direct reads remain. Honors Phase 21 D-13 contract. | ✓ |
| Extend PatternContext to include love_language + conflict_style | Adds 2 fields, expands PATTERN_KEYS to 10. Changes Phase 21's locked contract. | |
| Interpret criterion #5 literally — only the 8 dims path matters | Treat criterion as scoped to 8 dims. | |

**User's choice:** Add buildLegacyTraits helper + call both (Recommended)

### Q2: Return shape for buildLegacyTraits?

| Option | Description | Selected |
|--------|-------------|----------|
| ProfileTrait[] directly | Same shape as patternContextToTraits. Minimal call-site change. | ✓ |
| Typed object {love_language, conflict_style} mirroring PatternContext | Symmetric. More boilerplate. | |
| Defer this decision to the planner | Lock only existence + module location here. | |

**User's choice:** ProfileTrait[] directly (Recommended)

---

## Claude's Discretion

The user explicitly left these to Claude/planning:
- Exact wording of 32 chat tone variants and 32 insight skeleton templates (author against NLP framework)
- Internal type/variable names inside `pattern-hints.ts`
- Sync vs async signature of `getPatternHints` (no I/O — should be sync)
- How `morning.ts` threads new hints into existing `getMorningStoryPrompt + appended hints` flow

## Deferred Ideas

- DB-tracked insight cadence (escalation path if soft cadence proves insufficient)
- Extending `PatternContext` beyond 8 dims (would change Phase 21 contract)
- Migrating scattered `profile_traits` reads outside morning + chat (Phase 21 D-17 deferred this)
- Weekly Mirror (spec §8.4) vocabulary update — separate surface, separate phase
- A/B testing infrastructure for tone variant copy
- User-facing "Peter is learning" disclosure copy
