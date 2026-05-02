# Phase 23: Peter Adaptation - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the 8 inferred pattern dimensions (`PatternContext` from Phase 21) to Peter's morning story prompt, chat tone, and contextual insight moments — without naming or diagnosing the user.

Specifically:
- Add a single `getPatternHints(ctx, surface)` helper that emits surface-specific hints (morning story-shape, chat tone-shape, insight naming-shape)
- Adapt Peter chat opening tone for all 8 dimensions via a centralized `CHAT_TONE_VARIANTS` table (32 variants — 8 dims × 4 values)
- Add an "I've noticed you tend to..." insight moment path on both evening check-in and open chat, gated at confidence ≥ 0.7
- Update dead `attachment_style` clinical-label branches in `getMorningStoryPrompt` to the Phase 21 behavioral vocabulary
- Add a sibling `buildLegacyTraits()` helper covering `love_language` + `conflict_style` so morning.ts/chat.ts have zero direct `profile_traits` queries

Explicitly out of scope: journey routing changes (Phase 24), onboarding changes, new UI surfaces, expanding `PatternContext` to more than 8 dims.

</domain>

<decisions>
## Implementation Decisions

### Hint Architecture

- **D-01:** A new module `src/lib/server/pattern-hints.ts` exports `getPatternHints(ctx: PatternContext, surface: 'morning' | 'chat' | 'insight')` returning a typed shape: `{ morningHints: string[], chatToneHints: string[], insightLines: string[] }` (only the surface-relevant array is populated; others empty).
- **D-02:** `morning.ts` calls `getPatternHints(ctx, 'morning')` and appends `morningHints` to the prompt produced by `getMorningStoryPrompt`. The 8-dim hints live in the helper, not inside `getMorningStoryPrompt` itself — keeps the prompt-template function focused on structure.
- **D-03:** `chat.ts` calls `getPatternHints(ctx, 'chat')` and appends `chatToneHints` lines to the chat system prompt before evening/journey context is appended.
- **D-04:** The helper is the single owner of all 8-dim hint copy for this phase. New dim copy lands here, never in `peterService.ts` constants.

### Chat Tone Variants

- **D-05:** A constant `CHAT_TONE_VARIANTS: Record<PatternKey, Record<string, string>>` lives inside `pattern-hints.ts`. Keys are the 8 PATTERN_KEYS; inner keys are the allowed vocabulary values per Phase 21. Values are short instruction strings ("open warmer before any reflection", "give the user room before suggesting a next step", etc.).
- **D-06:** Chat tone covers all 8 dims (criterion #1 names only `repair_style` + `reassurance_need`; we extend to all 8 in this phase to avoid a follow-up patch). 32 variants total — copy is authored during planning/execution, not at discuss time.
- **D-07:** When multiple dims are populated, all relevant tone hints are appended; ordering is by PATTERN_KEYS order. The LLM blends them — Peter is not a multiplexer.

### Confidence Thresholds

- **D-08:** Chat-tone path bypasses the 0.4 floor in `buildPersonalizedPrompt`. The floor stays at 0.4 for the legacy "From what you've learned" trait lines (no behavior change there). The new `getPatternHints` helper runs on raw `PatternContext` directly — which is already filtered to `effective_weight >= 0.3` per Phase 21 D-15.
- **D-09:** "Any confidence" in criterion #1 means "no additional floor beyond what `PatternContext` already provides". Trait values at weight < 0.3 are not surfaced — too noisy to shape Peter's tone.
- **D-10:** Morning hint threshold is 0.35 exactly per criterion #2. The helper checks `effective_weight >= 0.35` for each dim before adding to `morningHints`. (Slightly more aggressive than the spec's 0.4 band — intentional.)
- **D-11:** Insight moment threshold is 0.7 exactly per criterion #3. The helper checks `effective_weight >= 0.7` before adding to `insightLines`.
- **D-12:** Phase 21's `PatternContext` shape (effective_weight ≥ 0.3) is preserved. We do NOT add a `buildPatternContextRaw` variant.

### Insight Moment Generation

- **D-13:** Insight moments are SUGGESTED, not forced. When at least one dim is at `effective_weight >= 0.7`, `getPatternHints` returns an `insightLines` entry that is appended to the system prompt as: "If it fits this moment naturally, you may quietly observe: '{template}'. Use sparingly — at most once per conversation. Never force it."
- **D-14:** Copy generation is hybrid: the helper provides a TEMPLATE SKELETON per (dim, value) pair using behavior fragments — e.g. for `repair_style=needs_space_first`: `"I've noticed you tend to want a little space before circling back when things feel hard"`. Peter is instructed to wrap the template warmly in his own voice; the skeleton anchors him to non-clinical phrasing.
- **D-15:** The helper authors 32 (dim × value) skeleton templates. All are pre-reviewed and authored against the NLP language framework. No clinical labels, no diagnostic phrasing ("you are X"), only behavioral observation ("you tend to...").
- **D-16:** Insight moment surfaces: BOTH evening check-in (primary) and open chat (secondary). Both code paths run through the same `getPatternHints(ctx, 'chat')` because evening check-in is rendered through `chat.ts` with `eveningContext`. The surface-specific text wrap happens in chat.ts based on `eveningContext` presence.
- **D-17:** Cadence is enforced via system-prompt language ("at most once per conversation, use sparingly") — NOT via DB tracking. No new tables, no new columns. Trade: pacing is approximate, not guaranteed. Acceptable for v1.
- **D-18:** Selection when multiple dims are >= 0.7: append insightLines for each qualifying dim (typically 0–2 in practice). Peter chooses at runtime which (if any) to weave in.

### Single Read Path (Criterion #5)

- **D-19:** A new sibling helper `buildLegacyTraits(supabase, userId): Promise<ProfileTrait[]>` is added to `src/lib/server/attachment-context.ts`. It queries `profile_traits` for `love_language` + `conflict_style` at `effective_weight >= 0.3` and returns them as `ProfileTrait[]`.
- **D-20:** `morning.ts` and `chat.ts` remove their inline `profile_traits` queries for `love_language` + `conflict_style` and replace with `await buildLegacyTraits(authed.supabase, authed.userId)`. After this phase, neither file contains a direct `.from('profile_traits')` call.
- **D-21:** `PatternContext` stays at exactly 8 dimensions per Phase 21 D-13. We do NOT extend it to include `love_language` + `conflict_style` — they remain a separate "legacy" surface because they predate the pattern vocabulary work and aren't part of the unified Phase 21–24 contract.
- **D-22:** Return shape is `ProfileTrait[]` (not a typed object). Allows splatting directly into the existing traits array passed to `buildPersonalizedPrompt`. Minimal call-site diff.

### Backward Compatibility

- **D-23:** The dead `attachment_style` clinical-label branches in `getMorningStoryPrompt` (peterService.ts:162-168, currently checking `'anxious' | 'avoidant' | 'disorganized'`) are UPDATED to the new behavioral vocabulary, not removed (criterion #4). They are migrated to live inside `getPatternHints` morning hint emission instead — `getMorningStoryPrompt` no longer reads `insights.attachment_style`. The code change is "moved + revived", not "removed".
- **D-24:** Existing `love_language` + `conflict_style` branches in `getMorningStoryPrompt` (peterService.ts:170-188) STAY in place untouched (criterion #4). They continue to receive their values via the `insights` param (`UserInsights` shape unchanged for these legacy keys).
- **D-25:** `TRAIT_DESCRIPTIONS` map in `peterService.ts` is NOT extended with the 7 new dims. The new dims surface via `getPatternHints` chat-tone + insight paths, not via the legacy "From what you've learned" trait-line path. Avoids double-emission.

### Claude's Discretion

- Exact wording of the 32 chat tone variants (8 × 4) — author against NLP framework during execution, review during plan
- Exact wording of the 32 insight moment template skeletons — same
- Exact wording of the per-dim morning story-shape hints (8 dims × up to 4 values = up to 32 hints; some values may share a hint)
- Internal type/variable names inside `pattern-hints.ts`
- Whether `getPatternHints` is async or sync (no I/O — should be sync; returns `{ morningHints, chatToneHints, insightLines }`)
- How morning.ts threads the new hints into the existing `getMorningStoryPrompt(...) + appended hints` flow (preserve cache-key behavior)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §ATTACH-PETER-01, §ATTACH-PETER-02, §ATTACH-PETER-03 — canonical requirement statements
- `.planning/ROADMAP.md` Phase 23 — goal + 5 success criteria

### Phase 21 Contract (load-bearing)
- `.planning/phases/21-pattern-infrastructure/21-CONTEXT.md` — D-13/14/15 lock the PatternContext shape and 0.3 weight floor
- `src/lib/server/attachment-context.ts` — `buildPatternContext`, `PatternContext` type, `PATTERN_KEYS`, `VALID_PATTERN_VALUES`. Phase 23 extends this module with `buildLegacyTraits`.

### Phase 22 Output (informational)
- `src/lib/server/trait-gaps.ts` — `STEERING_HINTS` for all 8 dims. Phase 22 already grounds the morning story toward under-profiled dims; Phase 23 adds the OUTPUT side (hints based on inferred values).
- `src/lib/server/profile-analysis.ts` — confirms all 8 dims are inferred from evening reflection.

### Files Phase 23 Modifies
- `src/lib/peterService.ts` §getMorningStoryPrompt (lines 145-227) — D-23 updates dead attachment_style branches; D-24 leaves love_language/conflict_style branches; D-25 leaves TRAIT_DESCRIPTIONS untouched.
- `src/lib/peterService.ts` §buildPersonalizedPrompt (lines 301-370) — UNCHANGED; 0.4 floor preserved per D-08.
- `src/pages/api/peter/morning.ts` — D-02 appends `morningHints`; D-20 swaps inline love_language/conflict_style query for `buildLegacyTraits`.
- `src/pages/api/peter/chat.ts` — D-03 appends `chatToneHints` + `insightLines`; D-20 swaps inline query for `buildLegacyTraits`. Evening check-in path uses same helper, surface differentiation handled by existing `eveningContext` presence.

### Files Phase 23 Creates
- `src/lib/server/pattern-hints.ts` — new module: `getPatternHints(ctx, surface)`, `CHAT_TONE_VARIANTS`, morning-hint table, insight-template-skeleton table.

### Product Spec
- `SPARQ_MASTER_SPEC.md §11` — Living Profile & Personalization System (non-clinical language constraint, confidence band guidance — note Phase 23 uses 0.35 morning vs spec's 0.4 band, by criterion #2)
- `SPARQ_MASTER_SPEC.md §8.4` — Weekly Mirror context (different surface from Phase 23 insight moments — Weekly Mirror is GPT-cached weekly card; Phase 23 is per-conversation contextual)

### Voice & Copy Guardrails (MANDATORY for any new copy in this phase)
- `.claude/skills/sparq-psychology/references/nlp-language-framework` — pull language, presupposition, identity reinforcement, fourth-grade reading level. ALL 32 chat tone variants + 32 insight skeletons must pass these constraints.
- `.claude/skills/sparq-peter` — Peter voice rules; never clinical, never instructional, never diagnostic.
- `CLAUDE.md` "What Sparq Is / Voice of Sparq" section.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `buildPatternContext(supabase, userId)` — already returns the typed PatternContext for the 8 dims at weight ≥ 0.3. Called from morning.ts:93 and chat.ts:104 today.
- `patternContextToTraits(ctx)` — already converts PatternContext → ProfileTrait[]. Stays in use; the new chat-tone path runs in parallel with it (different semantics).
- `buildPersonalizedPrompt(traits, memories, basePrompt, options)` — UNCHANGED by Phase 23. The 0.4 confidence floor inside it is intentionally preserved (gates the cautious "From what you've learned" trait-line path).
- `STEERING_HINTS` in `trait-gaps.ts` — Phase 22's morning steering already covers all 8 dims. Phase 23's `getPatternHints(ctx, 'morning')` is the OUTCOME-side counterpart (steering aims morning story toward signals; hints shape morning story FROM signals).
- `eveningContext` block in `chat.ts:148-177` — existing surface differentiation. Phase 23 uses this to pick evening-vs-chat insight wrapping.

### Established Patterns
- Non-blocking personalization: `morning.ts` and `chat.ts` both wrap personalization in try/catch and silently fall back to base prompt. Phase 23 must preserve this — `getPatternHints` should never throw.
- System prompt assembly: `let systemPrompt = PETER_SYSTEM_PROMPT; ... systemPrompt = buildPersonalizedPrompt(...); ... systemPrompt += eveningContextBlock;` — Phase 23 inserts hint blocks in this same chain (after `buildPersonalizedPrompt`, before evening context).
- Centralized constant tables (e.g. `VALID_PATTERN_VALUES`, `PATTERN_KEYS`, `TRAIT_DESCRIPTIONS`, `STEERING_HINTS`) — Phase 23 adds three more (`CHAT_TONE_VARIANTS`, morning hint table, insight skeleton table) following the same pattern.
- `Promise.all` parallel reads in morning.ts:92-113 and chat.ts:103-124 — the `buildLegacyTraits` swap (D-20) plugs into this same Promise.all without changing fan-out.

### Integration Points
- `morning.ts:84-135` — the personalization Promise.all block. After Phase 23: `[buildPatternContext(...), buildLegacyTraits(...), profileResult, insightsResult, memResult]` instead of an inline `profile_traits` query.
- `chat.ts:95-146` — same pattern. Evening surface differentiation already lives in chat.ts:148-177.
- `getMorningStoryPrompt` in `peterService.ts:145` — Phase 23 keeps its signature; the new hints are appended OUTSIDE this function via `morning.ts` so the prompt template stays focused on structure.
- `daily_sessions.morning_story` cache — unchanged. Personalized prompts produce different stories per user, but the cache is keyed per user-day so reuse is correct.

</code_context>

<specifics>
## Specific Ideas

- "I've noticed you tend to..." is the canonical insight phrasing — never "You are X" or "Your X style is Y". The template skeleton table must enforce this at the data layer.
- Peter is "a wise old doctor who makes you feel like the only person in the room" (CLAUDE.md voice). Insight moments must feel like a quiet observation from a friend, not a callout.
- Sparingly is real — the cadence-via-prompt approach (D-17) trades exact pacing for code simplicity. If users report Peter naming patterns too often, escalate to D-17 alternative (DB tracking) in a follow-up phase.
- Criterion #2 says "verifiable by logging the prompt string in development" — keep `getPatternHints` output trivially loggable. A dev-only `console.log` at the morning.ts/chat.ts assembly site is sufficient evidence.
- Confidence threshold 0.35 (criterion #2) is intentionally below the spec's 0.4 band lower bound. Don't "round up" to 0.4 in implementation.

</specifics>

<deferred>
## Deferred Ideas

- DB-tracked insight cadence (one insight per day cap, fresh-crossing detection) — escalate path if soft cadence proves insufficient. Future phase.
- Extending `PatternContext` to include `love_language` + `conflict_style` — explicitly NOT done; would change Phase 21's locked 8-dim contract. Future milestone if needed.
- Migrating remaining scattered `profile_traits` reads in rehearsal, session APIs, profile snapshot — Phase 21 D-17 deferred this; Phase 23 only addresses morning + chat per criterion #5. Future phase.
- Updating `Weekly Mirror` (spec §8.4) to use Phase 21 behavioral vocabulary — separate surface, separate phase.
- A/B testing infrastructure for tone variant copy — out of scope.
- User-facing "Peter is learning" disclosure copy — out of scope.

</deferred>

---

*Phase: 23-peter-adaptation*
*Context gathered: 2026-05-02*
