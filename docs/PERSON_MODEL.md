# Person Model V1 & Memory Schema

**Constitution steps:** §14.2 (specify) · implements §3, §4, §12
**Migration:** `supabase/migrations/20260930100000_person_model_v1.sql` (additive — nothing existing breaks)

One rule governs everything here: **the user is the authority on themselves.** Sparq holds *hypotheses*; only the user can turn one into a fact.

---

## 1. Where each layer lives (one authoritative store per kind of knowledge)

| Constitution layer (§3) | Authoritative store | Notes |
|---|---|---|
| **Core Self** — values, North Star, identity, strengths, needs, preferences | `north_stars` (confirmed line), `profiles.psychological_profile` (onboarding answers), `memories` kind `fact` | North Star is user-confirmed by design. |
| **Relationship Patterns** — attachment signals, conflict, repair, reassurance, space… | `profile_traits` (the hypothesis layer) | 8 pattern dimensions + love language + conflict style. |
| **Current Life** — stressors, moods, events | `user_insights.emotional_state`, `memories` kind `context` | Context decays in retrieval after ~30 days. |
| **Growth** — goals, experiments, discoveries, evidence | `experiments`, `self_discoveries`, `growth_moments`, `baseline_snapshots`, `csi_pulses`, `memories` kind `growth` | Growth engine stays the only writer of `growth_moments`. |
| **Insight Profile** — how this person reaches insight | derived at read time from `reflection-quality.ts` depth + discovery/experiment history | Not stored separately in V1 (avoids a seventh store). |

**Deprecated (no code uses them; kept until Chris approves dropping):** `personality_signals`, `personality_profiles`, `mirror_narratives`, `memory_storage`, `conversation_memories`, `if_then_checkins`, and the `user_insights.attachment_style / love_language / conflict_style` columns. New code must never read or write them.

## 2. Hypothesis metadata (`profile_traits`)

| Column | Meaning |
|---|---|
| `inferred_value`, `confidence` | Current best guess and how sure (0.1–1.0). |
| `status` | `hypothesis` (default) · `confirmed` (user said "yes, that's me") · `rejected` (user said "no"). |
| `source` | `inferred` (from conversations) · `user_stated` (onboarding self-report) · `user_confirmed`. |
| `sensitivity` | `normal` · `sensitive` (sexuality, worth, anything that would hurt if said clumsily). |
| `evidence` / `counter_evidence` | Up to 10 `{at, source, value, note}` entries each. `note` is a short paraphrase, never a verbatim quote. |
| `candidate_value`, `candidate_confidence` | A competing value, held until it outweighs the current one. |
| `last_evidence_at`, `confirmed_at` | Recency. |

## 3. Knowledge levels (§4)

Every piece of knowledge carries exactly one level, and Peter's wording must match it:

| Level | Stored as | How Peter may speak about it |
|---|---|---|
| **User told me** | `memories.kind = fact`, `profile_traits.source = user_stated` | Plainly: "You mentioned…" |
| **User discovered** | `self_discoveries` | In their words: "You said it yourself — …" |
| **Evidence suggests** | `profile_traits` `status = hypothesis`, `confidence ≥ 0.6` | Tentatively, and ask: "I might be wrong — does it feel like…?" |
| **Wondering** | `profile_traits` `confidence < 0.6` | Only as a question, never as a statement. Usually unsaid. |

`confirmed` traits move to "user told me". `rejected` traits are never used again unless the user brings them back.

## 4. Revision rules (§2 "actively revises", §12)

1. **Agreeing evidence** raises confidence by the quality-weighted boost (existing `getConfidenceBoost`) and is appended to `evidence`.
2. **Contradicting evidence never flips the value on one reflection.** It lowers confidence (−0.1), is appended to `counter_evidence`, and builds up `candidate_value` / `candidate_confidence`.
3. The **candidate replaces the current value** only when `candidate_confidence > confidence`; the old value's evidence moves to `counter_evidence` so the history survives.
4. A **mismatched candidate** (third value) resets the candidate — contradictions stay visible instead of being silently resolved (§4 "contradictions are preserved").
5. **`confirmed` / `rejected` traits are frozen** against inference. New conflicting evidence is recorded in `counter_evidence` only — a discovery opportunity Peter may gently raise, not an overwrite.
6. **Recency:** retrieval treats traits without evidence for 60+ days as `wondering` regardless of confidence.

## 5. Memory kinds & the "worth remembering" gate (§4, §2 "nothing worth remembering is valid")

`memories.kind`: `fact` · `context` · `pattern` · `discovery` · `intention` · `growth`; `importance` 0–1.

Instead of storing every evening conversation raw, the analysis step returns zero or more **distilled memories**, each one short sentence with a kind and importance. Only these are stored. An empty list is a normal, valid outcome. Self-discoveries and intentions are also written to their first-class tables.

**Growth traces.** The growth engine pairs "then vs now" moments by finding an older reflection similar to today's. For that one purpose the user's own words (never Peter's) are kept as a `growth` memory with `importance 0.1` and `metadata.trace = true`. Traces are **excluded from every retrieval that feeds Peter** (`match_memories_ranked`, `getRecentMemories`) and follow the same memory window and delete paths.

**Feedback.** `/api/profile/traits` PATCH maps the user's "does this fit?" answer onto `status`: yes → `confirmed`, not really → `rejected`, unsure → `hypothesis`.

## 6. Retrieval (§12 "retrieve selectively")

`match_memories_ranked` returns the top N by `similarity × importance weight`, with a small lift for discoveries and facts and a decay for month-old context. Callers ask for 5 by default; the full history is never sent to the model.

## 7. Privacy (§8, §12)

- All new tables use RLS `auth.uid() = user_id` — private by construction.
- Nothing in this schema is shareable. Sharing (Shared Peter, step 7–8) will be a separate, explicit, per-item action that copies a user-approved text into shared space; it never reads these tables for the partner.
- Trust Center delete-all must cover `self_discoveries` and `experiments` (done in step 3).
