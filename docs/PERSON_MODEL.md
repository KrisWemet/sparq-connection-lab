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

---

## 8. v1.1 conceptual data model — Ethical Influence & Behavioral Understanding

**Status: conceptual only — no migration, no code yet** (constitution §14 steps 12–15). Implements constitution v1.1 §3 (Behavioral Baseline, Insight Profile), §4 (User's Own Reasons, Insight Evidence), §5A (influence provenance) and §6A (reasoning hierarchy).

Design rules that apply to every entity below:

- **Private by construction.** Owner-only RLS. Never readable by the partner, Shared Peter, or admins (metrics see counts only).
- **Probabilistic and revisable.** Inferred entries carry the §2 hypothesis metadata (`status`, `source`, `confidence`, `evidence`, `counter_evidence`, `sensitivity`, recency) and follow the §4 revision rules.
- **User-visible and user-correctable.** Anything inferred can be shown in plain language and confirmed, corrected or deleted by the user; confirmed/rejected entries are frozen against inference.
- **Knowingly provided data only.** Built from what the user writes or does in Sparq. No hidden telemetry (typing dynamics, latency-as-lie-signal, device sensors), no deception inference.
- **Additive.** Extends existing tables where one already fits; no parallel stores of psychological truth (§12).

### 8.1 Insight Profile — *how this person reaches their own realizations*

One conceptual record per user, made of independent **facets**. Each facet is a small hypothesis with its own metadata, so one facet can be confirmed while another is still a guess.

| Facet | Example values (probabilistic, never labels) | Learned from |
|---|---|---|
| `processing` | reflective ↔ analytical · feeling-first ↔ thinking-first · talks it out ↔ quiet first | reflection depth and shape over time; what preceded realizations |
| `question_styles` | open · specific · "what/how" over "why" · scaling · future-imagining · looking back at a moment · story | which question types preceded a discovery (Insight Evidence) |
| `challenge_tolerance` | low / medium / high + "warmth needed first" | reactions to Challenge-mode turns |
| `pacing` | depth per session, exchanges before a realization tends to land, when to stop | session history |
| `motivational_drivers` | a short list **in the user's own words** ("being a good dad", "peace at home", "feeling chosen") with optional coarse tags for retrieval | user-owned reasons, North Star, discoveries — never a typology |
| `resonant_language` | their own metaphors and phrases; humor style; words to avoid | their messages; corrections |
| `defensive_triggers` | topics/framings after which they tend to shut down (signal to slow down, never to route around) | pushback and disengagement patterns — **sensitive, cooling-off rule applies** |
| `helped` / `didnt_help` | approaches that preceded a realization or a kept experiment / that landed badly | Insight Evidence outcomes |
| `communication_prefs` | tone, brevity, emoji, rhythm | stated preferences + behavior |

- **Cooling-off rule:** `defensive_triggers` and `motivational_drivers` inferred by Peter are used only after ≥3 consistent observations, and are never named to the user unprompted (only shown on their Insight Profile page).
- **Where it could live:** extend `profile_traits` with `trait_key`s namespaced `insight.*` (e.g. `insight.processing`) and a `value_text` column for free-text facets — reuses the hypothesis metadata and revision engine instead of a new store.
- **Uses:** shapes *how* Peter asks (§6), never *what* the user should conclude.

### 8.2 Behavioral Baseline — *how this person usually shows up*

Rolling, per-user statistics compared only with the same person over time.

| Signal | Stored as | Notes |
|---|---|---|
| message length / depth | rolling median + spread over the last N sessions | from `reflection-quality.ts` |
| emotional tone | distribution of tones | existing `evening_emotional_tone` |
| engagement rhythm | usual days/times, typical gaps | from `daily_sessions` |
| words for partner / self | small frequency map of the user's terms | tokens only, not transcripts |
| how hard moments are described | a few coarse features (e.g. absolutes, "we" vs "I") | from text Peter already processes |

- **Readiness:** `baseline_ready` only after ~14 days of regular use; before that, every deviation is treated as noise.
- **Deviation output:** a short, transient note for Peter's prompt ("quieter than usual tonight"), phrased as a reason to ask — never persisted as a conclusion about the person.
- **Where it could live:** one `behavioral_baselines` row per user (JSON stats + `computed_at`, `window_days`, `ready`), recomputed by a job; deviations computed at read time, not stored.
- **Never:** compared with the partner or other users; shared; used to judge truthfulness.

### 8.3 User-owned reasons — *why it matters, in their words*

| Field | Meaning |
|---|---|
| `id`, `user_id` | owner |
| `reason_text` | the user's words, verbatim or near-verbatim ("because I want my kids to see us laugh again") |
| `attached_to` | `{ type: value \| north_star \| discovery \| experiment \| intention, id }` — what it's a reason *for* |
| `source` | evening · chat · mirror · ladder · onboarding |
| `still_true`, `revised_at` | the user can retire or rewrite a reason; retired reasons are never used for influence |
| `created_at` | recency |

- **Captured** when the user says why something matters (Peter asks "What makes this matter to you?" at the Connect/Choose steps of §6A). Never paraphrased into something stronger than what they said.
- **Where it could live:** a `user_reasons` table (RLS own-row), mirrored as a `memories` row of kind `discovery`/`intention` with `importance ≥ 0.8` for retrieval.
- **Use:** the only material Commitment & Consistency may draw on; referenced by influence provenance (§8.6).

### 8.4 Self-discoveries — *conclusions the user reached* (extends existing `self_discoveries`)

Existing: `discovery`, `context`, `source`, `session_id`, `sensitivity`, `still_true`, `revisited_at`. Add conceptually:

| Field | Meaning |
|---|---|
| `preceded_by` | the question style / mode that came right before (feeds `insight.question_styles`) |
| `linked_values` | ids of values/North Star/reasons the user connected it to (§6A "Connect") |
| `origin` | `user_led` (they got there) vs `peter_reflected_then_confirmed` (they confirmed Peter's reflection) — lets metrics track how often conclusions originate with the user |

### 8.5 Experiments + reason (extends existing `experiments`)

Existing: `intention`, `context`, `origin`, `status`, `outcome`, `outcome_note`, `check_in_on`, `resolved_at`. Add conceptually:

| Field | Meaning |
|---|---|
| `reason_id` | the user-owned reason it serves (§8.3) — **required for Peter to use any influence on it** |
| `linked_value_id` | optional: the value/North Star it connects to |
| `obstacle_plan` | the user's own "if X gets in the way, I'll…" (optional) |
| `follow_through_supports` | which supports were used (reminder tied to reason, made smaller, obstacle plan) — for learning `insight.helped` |
| `revised_from` | if the user reshaped the experiment, the previous version |

A skipped or let-go experiment writes Insight Evidence ("what got in the way?") — never a failure mark.

### 8.6 Influence provenance (supporting record)

Any prompt block that applies an influence principle records `{ principle, target_type, target_id }`, where the target is a user-chosen reason, value, intention or experiment. **No target, no influence** (constitution §12). Logged with the conversation turn (not user-visible by default; available to the user on "Why did Peter say that?").

### 8.7 Rejected hypotheses — *what Peter got wrong* (Insight Evidence)

| Field | Meaning |
|---|---|
| `id`, `user_id` | owner |
| `hypothesis_ref` | `profile_traits.id` / facet key, or a free-text summary of the reflection Peter offered |
| `offered_as` | reflection · challenge · suggestion · interpretation |
| `user_response` | the user's words ("that's not it — I just get tired at night") |
| `what_peter_missed` | the corrected understanding, if the user gave one |
| `trigger_noted` | optional facet signal for `insight.defensive_triggers` (subject to cooling-off) |
| `created_at` | recency |

Effects (constitution §6A resistance protocol, §12):

- lowers the hypothesis's confidence and appends to `counter_evidence`; an explicit "no, that's not me" sets `status = rejected`
- **do-not-re-push:** a rejected hypothesis is never offered again unless the user raises it themselves
- stored as evidence about Peter's understanding — never as a "resistance" score about the user
- **Where it could live:** a `rejected_hypotheses` table (RLS own-row) plus the existing `profile_traits.counter_evidence`.

### 8.8 How the pieces flow (reasoning hierarchy, §6A)

`Listen` → `Notice` (baseline deviation, transient) → `Ask/Explore` (style from Insight Profile) → `Reflect` (with permission) → **user accepts** → `self_discoveries` (+ `preceded_by`) · **user rejects** → `rejected_hypotheses` → `Connect` (links to values/reasons) → `Choose` (`experiments` + `reason_id`) → `Support follow-through` (influence with provenance) → `Observe` (`outcome`) → `Revisit` → `Update` (Insight Profile facets, trait confidence).
