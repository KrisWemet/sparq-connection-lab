# The North Star — Ideal-Self Capture (Phase B) — Design Spec

**Date:** 2026-06-11
**Status:** Approved by Chris (brainstorming session 2026-06-11)
**Origin:** Phase B of the science/psychology program (Chris-approved order: credibility → ideal self → Finkel → relapse/repair). Incorporates Chris's "7 layers of why" idea, adapted to adaptive values laddering.

---

## 1. Problem & Goal

Sparq orients users toward growth but never asks **who they want to become**. Self-Determination Theory: goals reached through autonomous (emotionally-owned) motivation survive hard moments; imposed goals evaporate. The Michelangelo phenomenon: naming and affirming the ideal self accelerates movement toward it. Without a captured ideal self, "their ideal outcome" is undefined — the growth engine has no destination, Peter has no north star, the Compound Reveal has no arc endpoint.

**Goal:** capture each user's emotional bedrock — the felt "why" beneath their stated reason for being here — distill it into a "who you're becoming" line, and orient the whole product toward it.

**Mechanism decision (from Chris's "7 layers of why"):** values laddering, adapted:
- The *principle* is kept: ladder beneath the surface answer to the emotional driver; that emotional answer is what pulls the user forward when things get hard.
- The *format* is adapted: no fixed 7 rounds (forces confabulation; reads as interrogation by round 4); no mechanical "why" phrasing (triggers justification, not feeling — motivational interviewing finding). Instead: variable-depth, max 4 follow-ups, *what/how* phrasing, stop at bedrock.

**Decisions (from brainstorming):**

| Decision | Choice |
|---|---|
| Timing | Seed at Day 0 (from existing onboarding answers — zero new UX), full ladder inside the Day 2–4 evening check-in |
| Authorship | Peter distills the bedrock into identity language; user confirms or adjusts ("did I get that right?") — confirmation doubles as a commitment device |
| Surfacing | Dashboard placecard (quiet, serif, no chrome) + silent orientation of Peter's prompts |
| Re-laddering | At journey boundaries only (Day-14 graduation, journey completions): "is that still the truest version?" |
| Deflection | Two surface/deflecting answers → graceful exit, retry on a later evening; never forced, never re-run same conversation |
| Depth bound | Max 4 follow-up exchanges — the 5-minute promise holds |
| Architecture | Hybrid: ladder runs INSIDE the normal evening check-in (invisible as a feature) orchestrated by a server-side state module consulted by chat.ts — the proven Phase 23 / growth-engine pattern |

Governing principle: [enjoyment-first / below-the-critical-factor] — the user should never feel they did "a laddering exercise"; they should feel Peter got curious about them one evening.

---

## 2. Experience walkthrough

**Day 0 (onboarding):** no new screens, no new questions. The seed is derived from the user's existing onboarding answers (`profiles.psychological_profile` jsonb, written by ScoringTransition). A short seed phrase (their stated reason/hope) is stored on the north-star row at status `seeded`. If no usable free-text exists, seed is null — the ladder simply opens without the callback ("Can I ask you something I've been wondering?").

**Day 2–4 evening:** the night's check-in opens as the ladder instead of the generic reflection prompt:
- Opening (with seed): "Before tonight's reflection — when we first met, you said you wanted {seed}. Can I ask — what would having that actually give you?"
- Ladder: one follow-up at a time; Peter reflects the user's own words back; *what/how/what-would-that-give-you* phrasing; **never the word-pattern "why is that important."**
- Bedrock tells (prompt-described, LLM-judged): feeling words appear, answers shorten, self-referential truth ("I don't want to become my father", "I just want to feel safe"), or explicit "I don't know how to say it."
- Distill + confirm: "So it sounds like you're becoming someone who {distillation}. Did I get that right?" User confirms → captured. User adjusts → Peter re-distills once with their adjustment → captured on acceptance.
- After capture (same conversation): Peter bridges into a brief normal reflection close so the night still feels like an evening check-in and the session completes normally (streak intact).

**Deflection path:** two consecutive surface answers or deflections → "That's okay — it'll come when it comes." Conversation becomes a normal reflection. Ladder cooldown: not retried for 2+ days; max 3 lifetime attempts before status `declined` (Peter stops trying; user can still arrive at one via journey-boundary moments).

**After capture:**
- Dashboard shows the placecard: just the line, serif, quiet. No label, no edit affordance.
- Peter's chat + morning prompts gain one orientation block (see §5).
- Day-14 graduation / journey completion: "When we started, you told me '{line}'. Is that still the truest version of where you're headed?" Yes → reaffirmed (timestamp). No → mini-ladder (max 2 follow-ups) → new line; old row retired, new row created. The retired-line history is future Compound Reveal material.

---

## 3. Data — one migration

### `north_stars`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK auth.users | NOT unique — history rows accumulate; at most one non-retired row enforced in code |
| status | text | `seeded` \| `laddering` \| `active` \| `retired` \| `declined` |
| seed_text | text null | derived from onboarding answers |
| line | text null | the confirmed "becoming" sentence |
| ladder_transcript | jsonb | array of {role, content} exchanges from the ladder |
| attempt_count | int default 0 | lifetime ladder attempts (cap 3) |
| last_attempt_at | timestamptz null | cooldown anchor |
| confirmed_at | timestamptz null | |
| reaffirmed_at | timestamptz null | journey-boundary "still true" timestamps |
| created_at | timestamptz | |

RLS user-scoped, same pattern as `growth_moments`. Index on `(user_id, status)`.

---

## 4. Server logic — `src/lib/server/north-star.ts` (single owner of ladder state)

Exports (all fail-soft, never throw):
- `getNorthStarState(supabase, userId)` → `{ row, shouldLadderTonight }` — true when: day 2–4 of journey, no `active`/`declined` row, `attempt_count < 3`, `last_attempt_at` ≥ 2 days ago (or null), privacy `can_personalize`.
- `seedNorthStar(supabase, userId)` → derives seed from `profiles.psychological_profile` free-text fields; inserts `seeded` row. Called fire-and-forget from onboarding completion (ScoringTransition's existing server path) — idempotent.
- `buildLadderPromptBlock(state, turnNumber)` → the evening system-prompt replacement for ladder turns: opening, follow-up guidance, bedrock tells, deflection-exit rule, distill instruction with the **structured marker contract** (below), bridge-to-reflection instruction.
- `processLadderTurn(supabase, userId, peterResponse, userMessage)` → parses markers, advances state, appends to `ladder_transcript`, increments attempts on open, writes `line`+`active` on confirmation.
- `getActiveNorthStar(supabase, userId)` → the `active` row's line or null (read by surfaces).
- `retireAndReplace(supabase, userId, newLine)` — journey-boundary re-ladder writes.

**Structured marker contract (deterministic capture):** the ladder prompt instructs Peter to end specific turns with a hidden machine line:
- Proposing: `[[NORTH_STAR_PROPOSED: {distilled line}]]`
- After user confirms: `[[NORTH_STAR_CONFIRMED]]`
- Graceful exit: `[[NORTH_STAR_DEFERRED]]`
chat.ts strips `[[...]]` markers from the user-visible message (extend existing stripMarkdown post-processing site). The module treats marker parsing failures as deferral — never a broken evening.

**chat.ts integration:** in the evening path only — when `shouldLadderTonight`, swap the eveningContext block for `buildLadderPromptBlock` and route each turn through `processLadderTurn` (fire-and-forget where possible). Any module error → normal evening check-in (try/catch fail-soft, the established contract). Crisis detection continues to run first and aborts the ladder.

---

## 5. Orientation wiring (the payoff)

Phase 23 insertion pattern, one block, both prompt surfaces (chat.ts, morning.ts):

> `This person is becoming: "{line}" (their own confirmed words). Never quote this at them or mention you know it; let it quietly shape what you notice, the stories you choose, and what you encourage.`

Appended after `buildPersonalizedPrompt`, before evening/growth blocks. The Day-14 graduation report gains the reaffirm/re-ladder beat (extends the existing reveal step). **No growth-engine changes in this phase** (YAGNI — the engine can read `north_stars` in a later phase).

## 6. Dashboard placecard — `src/components/dashboard/NorthStarCard.tsx`

Reads the active line via a tiny endpoint (`/api/me/north-star`, GET only). Renders only when an active line exists: serif italic line on a quiet parchment card, no heading, no buttons. Mounted above the daily CTA on `dashboard.tsx`. Fail-soft: any fetch error renders nothing.

## 7. Privacy, safety, failure

- All reads/writes gated on `can_personalize`; ladder transcript is treated as memory-class data — `can_store_memories` off ⇒ transcript not stored (line + status only, with user confirmation in-conversation serving as consent for the line itself).
- Trust Center delete-all cascades `north_stars` (extend the existing `deleteGrowthData` helper in memory-settings.ts).
- Crisis detection precedes and aborts the ladder.
- Forbidden-vocabulary constraints apply to all new prompt copy; distilled lines are the user's co-authored words — never clinical labels.
- Every integration point fail-soft: ladder failure = normal evening check-in; placecard failure = no card; seed failure = ladder without callback.

## 8. Verification (no test infra, per CLAUDE.md)

- tsc/lint/build green; `logFinalPrompt('peter/chat[ladder]', …)` at the ladder prompt assembly.
- Grep assertions: markers stripped before response (`[[NORTH_STAR` never in returned message path), no "why is that important" phrasing in prompt copy, module imported only by chat.ts/morning.ts/graduation/api surfaces.
- Seeded manual UAT: fresh user → onboarding (seed written) → simulate Day 3 evening → walk ladder to confirmation → verify row `active`, placecard renders, orientation block appears in logged prompts → walk deflection path → verify cooldown.

## 9. Out of scope (deferred)

- Growth-engine consumption of north-star direction (future phase)
- Re-laddering UI outside journey boundaries; user-initiated editing
- Partner-visible north stars / Michelangelo partner-affirmation features (post-beta, dyad work)
- Compound-Reveal use of retired-line history (future milestone)
- Push/notification nudges (out of beta scope)
