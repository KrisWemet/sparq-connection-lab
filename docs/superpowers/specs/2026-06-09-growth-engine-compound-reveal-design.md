# Growth Engine & Compound Reveal — Design Spec

**Date:** 2026-06-09
**Status:** Approved by Chris (brainstorming session 2026-06-09)
**Supersedes:** Pulls forward "Compound Reveal" (idea #5) from `.planning/100x-effectiveness-roadmap.md`

---

## 1. Problem & Goal

Change is invisible from the inside. Users quit Sparq because they cannot see they are changing. Sparq stores memories (pgvector), infers 8 pattern dimensions (Phases 21–22), and adapts Peter's voice (Phase 23) — but nothing **detects growth across time** or shows the user evidence of their own change.

**Goal:** One deterministic growth-detection engine that compares the user's present state against their stored past and emits *verified growth moments*; three surfaces that voice those moments. Code decides growth happened. The LLM only voices it.

**Strategic decisions (from brainstorming):**

| Decision | Choice |
|---|---|
| Surfaces | Both in-conversation Peter moments AND longitudinal Mirror, plus Day-14 reveal |
| Growth signals | All four: pattern shifts, past-vs-present moment pairs, tone trajectory, practice consistency (+ CSI-4 delta) |
| Trust bar | Balanced — ≥1 strong signal OR ≥2 agreeing soft signals; tentative phrasing for soft-only |
| Compute timing | Weekly batch, hosted inside existing Weekly Mirror generation |
| Delivery style | "Name it, then hand it back" — state the change as evidence, end with an ownership question |
| Detection architecture | Hybrid — deterministic code gates, LLM enriches/voices |
| Before snapshot | Silent extraction from onboarding + first 3 evening reflections (no new onboarding UX) |
| First reveal | Day-14 graduation (fixed milestone; effort-honoring fallback if no verified delta) |
| Outcome measurement | CSI-4: baseline + monthly pulse via dashboard card |
| Product posture | Solo-first; sacred fixed ritual; no push notifications |

---

## 2. Architecture Overview

```
                    ┌─────────────────────────────────────┐
   weekly batch     │  growth-engine.ts (deterministic)   │
   (Mirror gen) ───▶│  compares present vs. stored past   │
                    │  emits verified growth_moments      │
                    └────────────┬────────────────────────┘
                                 │ writes
                                 ▼
   ┌──────────────────── growth_moments table ───────────────────┐
   │ read-only consumers (never compute, only voice)             │
   ├──────────────┬──────────────────────┬───────────────────────┤
   ▼              ▼                      ▼
 chat.ts      weekly-mirror/         Day-14 Compound Reveal
 (Peter        generate.ts            (graduation moment)
  in-convo)    (narrative +
               growth_thread)
```

Inputs to the engine: `pattern_snapshots` (week-over-week 8-dim state), `daily_sessions` (practice_attempted, evening_emotional_tone), `csi_pulses`, `memories` (pgvector), `baseline_snapshots`.

---

## 3. Data Layer

Four new tables (one migration). All have RLS scoped to `user_id`, following existing table patterns.

### 3.1 `pattern_snapshots`
Weekly copy of the 8-dimension state. This is the time axis `profile_traits` lacks (profile-analysis overwrites `inferred_value` in place; history is lost).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK auth.users | |
| week_start | date | unique with user_id |
| snapshot | jsonb | `{ dim: { value, confidence, effective_weight } }` for all 8 dims (null value if absent) |
| created_at | timestamptz | |

Written at Mirror-generation time, before detection runs (so detection compares the *previous* snapshots against current state).

### 3.2 `baseline_snapshots`
The silent "before" snapshot. Written **once** per user.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | unique |
| quotes | jsonb | array of `{ text, source, captured_at }` — verbatim user phrases from onboarding answers + first 3 evening reflections |
| summary | text | LLM-distilled structured summary of where the user started (fears, patterns described, hopes) |
| sources | jsonb | refs to the rows the quotes came from |
| created_at | timestamptz | |

**Trigger:** the existing profile-analysis hook (`runProfileAnalysis` after evening reflection) checks "user has ≥3 completed evening reflections AND no baseline_snapshot" → fire-and-forget extraction. Quote selection is deterministic (longest emotionally-salient user sentences, verbatim); only the `summary` field uses the LLM, and the summary is never quoted back as the user's words.

### 3.3 `growth_moments`
Engine output. The single source of truth all surfaces read.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| kind | text | `pattern_shift` \| `practice_consistency` \| `tone_trend` \| `csi_delta` \| `moment_pair` |
| strength | text | `strong` \| `soft` |
| tentative | boolean | true when surfaced on soft-signals-only — Peter must use tentative phrasing |
| evidence | jsonb | `{ dimension?, before_value?, after_value?, before_quote?, after_quote?, stats? }` — quotes are verbatim memory text retrieved deterministically, never generated |
| status | text | `active` \| `surfaced` \| `expired` |
| surfaced_at | timestamptz null | set when a surface uses it |
| week_start | date | the detection batch that produced it |
| created_at | timestamptz | |

Moments expire (status `expired`) if unsurfaced after 3 weeks — stale growth claims are worse than none.

### 3.4 `csi_pulses`
CSI-4 (Couples Satisfaction Index, 4-item) scores.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| context | text | `baseline` \| `monthly` |
| item_scores | jsonb | the 4 item responses |
| total_score | int | 0–21 standard CSI-4 scoring |
| measured_at | timestamptz | |

---

## 4. Detection Engine — `src/lib/server/growth-engine.ts`

Pure deterministic module. **No LLM calls.** Never throws (Phase 21/23 non-blocking contract). Runs inside `weekly-mirror/generate.ts` after sessions are fetched, before narrative generation.

### 4.1 Signals

**Strong:**
1. **Pattern shift** — a dimension's value in the current state differs from the value in the snapshot 2+ weeks ago AND has held its new value for 2 consecutive weekly snapshots (flip-and-hold, not flicker).
2. **Practice consistency** — `practice_attempted` rate over the current 7-day window ≥ 5/7 when the user's own prior 3-week baseline was ≤ 3/7.
3. **CSI delta** — latest monthly pulse ≥ 3 points above baseline (above test-retest noise for CSI-4).

**Soft:**
4. **Tone trend** — `evening_emotional_tone` mapped to ordinal scale, improving trend across ≥2 consecutive weeks.
5. **Moment pair** — vector search (`searchMemories`) finds a memory >21 days old on a theme similar to a current-week reflection, where the old memory's content aligns with the *previous* pattern value and the current reflection aligns with the *new* one. (Retrieval is deterministic; the pairing rule is code, not model judgment.)

### 4.2 Trust bar

Emit a `growth_moment` when: **≥1 strong signal**, or **≥2 soft signals that agree** (same dimension or same direction). Soft-only moments get `tentative: true`. Max 2 moments emitted per weekly batch (scarcity preserves weight).

### 4.3 Evidence attachment

For each emitted moment, attempt to attach a verbatim `before_quote` (from `baseline_snapshots.quotes` or an old memory) and `after_quote` (recent reflection). If retrieval finds nothing suitable, the moment ships without quotes — **never with paraphrased or generated ones**.

---

## 5. Surfaces

All three read `growth_moments` (status `active`); none compute anything.

### 5.1 Peter in conversation (`chat.ts`)
Extends the Phase 23 insertion point (after `buildPersonalizedPrompt`, before `eveningContext`). At most **one** active moment is appended per conversation as a system-prompt block:

- Frame: *name it, then hand it back* — "State this specific observed change, citing the evidence given. End by handing ownership back with a light question ('Do you feel that shift too?'). Never declare what it means about who they are."
- `tentative: true` → instruct "it feels like something's shifting" phrasing, never declarative.
- After the conversation uses it, mark `surfaced_at` + status `surfaced` (fire-and-forget update). 7-day cooldown between growth moments in chat.

### 5.2 Weekly Mirror (`weekly-mirror/generate.ts`)
Verified moments are passed into the narrative prompt with the constraint: *"You may reference ONLY the growth moments listed; do not infer or invent others."* Each surfaced moment also writes a `growth_thread` entry with `type: 'growth'` (table already exists).

### 5.3 Day-14 Compound Reveal
At the existing Day-14 graduation moment, a new reveal step composed from `baseline_snapshots` + accumulated `growth_moments` + practice stats:

- With verified delta: "Two weeks ago you told me: '{verbatim before quote}'. On Tuesday you said: '{verbatim after quote}'." Peter names the shift, hands it back.
- **Guaranteed-payoff rule:** with no verified delta, the reveal honors effort with real numbers ("You showed up 12 of 14 days. That is not nothing — that is how every change starts.") and **never claims change that didn't happen**.
- The reveal is generated once and stored (idempotent, like morning stories).

### 5.4 CSI-4 pulse card
Dashboard card, Peter-voiced ("30 seconds, just between us — there are no grades here"). Appears when due: no baseline → baseline; ≥30 days since last pulse → monthly. Existing beta users get baseline on next dashboard visit. No notifications. Submits to `csi_pulses`; card disappears until next due date.

---

## 6. Privacy & Safety

- All reads/writes gate on existing `can_personalize` / `can_store_memories` privacy preferences. No baseline extraction for users who opted out of memory storage.
- Trust Center "delete all my data" cascades to `baseline_snapshots`, `growth_moments`, `pattern_snapshots`, `csi_pulses` (extend `deleteUserMemories` or its caller).
- 90-day memory-window users: quotes respect `expires_at`; Day-14 reveals are well inside the window.
- All new Peter copy passes the established forbidden-vocabulary greps: no clinical labels, no "you are X" diagnostic framing, behavioral observation only, fourth-grade reading level.
- Silent extraction is framed at reveal time as a kept gift — "I held onto something you told me when we started" — never as monitoring.
- CSI-4 wording is presented warmly; scores are never shown as grades or compared to other users.

## 7. Failure Handling

Identical philosophy to existing personalization code:
- Every engine step try/catch fail-soft; a detection failure never breaks Mirror generation.
- Surfaces render normally when zero moments exist (no empty-state weirdness).
- Day-14 reveal **always renders** (effort fallback path).
- Snapshot write failure → engine skips that week's comparison rather than comparing against bad data.

## 8. Verification

No automated test infra (per CLAUDE.md). Verification:
- `npm run lint` + `npm run build` green.
- Grep assertions: forbidden vocabulary absent from new copy; surfaces contain no detection logic (`growth-engine` imported only by mirror generation); no direct `growth_moments` writes outside the engine + surfacing-status updates.
- Dev prompt inspection via existing `logFinalPrompt` at all three surfaces.
- Seeded-user manual UAT: seed traits/sessions/memories across 3 synthetic weeks → run Mirror generation → verify emitted moments match hand-computed expectations → walk chat, Mirror, Day-14 reveal.

## 9. Out of Scope

- Real-Time Capture, Partner Telepathy, Real-World Rituals (remain future roadmap items)
- Push notifications (CSI card is in-app only)
- Partner-facing or couple-aggregated growth views
- Science-page/marketing updates tied to CSI data (future, after data accumulates)
- DB-tracked chat cadence beyond the 7-day growth-moment cooldown
