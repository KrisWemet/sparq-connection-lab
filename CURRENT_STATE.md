# Sparq Connection — Current State & Session Handoff

> **What this is:** a factual snapshot of where the project actually stands, written so a fresh Claude session (or a human) can resume without re-deriving context.
>
> **What this is NOT:** a spec. The Master PRD warns that the repo already suffered "spec proliferation across pivots" — do **not** treat this as a new source of truth, and do not write another one. Specs live in `docs/superpowers/specs/`; strategy lives in the Master PRD.

**Last updated:** 2026-06-12 (end of a ~51-commit session)
**Last commit at time of writing:** `05b353c fix(way-back): include firstName in greeting effect deps`

---

## 1. Quick facts

| Thing | Value |
|---|---|
| Repo (local) | `/Users/chris/sparq-connection-lab` |
| GitHub | `KrisWemet/sparq-connection-lab` (main, pushed through `05b353c`) |
| Supabase project id | `ujqdnyxdenadpowxrkjn` (LIVE — ~102 real users) |
| Stack | Next.js **Pages Router**, TypeScript strict, Supabase, Tailwind + shadcn/ui, Framer Motion, Vercel |
| AI | OpenRouter → Claude Haiku 4.5 (Peter). OpenAI used only for embeddings. |
| Dev | `npm run dev` → localhost:3000 |
| Verification | `npx tsc --noEmit && npm run lint && npm run build` |
| **No automated tests** | Deliberate decision (see `CLAUDE.md`). Verification = tsc/lint/build + greps + live SQL checks + manual UAT. Do not add test infra unasked. |

**Source-of-truth hierarchy:** Master PRD (`SC-PRD-MASTER-1.0`, Chris has it at `~/Downloads/SPARQ_CONNECTION_MASTER_PRD.md`) → `CLAUDE.md` (working rules + architecture) → per-feature specs in `docs/superpowers/specs/` → this file (state only).

---

## 2. Product in one line

A "relationship gym" for couples — **"a stronger individual creates stronger couples."** Educational, psychology-based; explicitly **not** therapy, not diagnosis, not crisis intervention.

**Governing design principle (Chris, load-bearing):** *enjoyment first.* If users don't stay, no amount of life-changing science matters. Growth should feel invisible — the user shouldn't notice they're being challenged. **Science lives in metadata and the Trust Center, never in the daily loop.** Never clinical in UX.

---

## 3. Locked decisions (do not relitigate)

### Architectural (from CLAUDE.md)
- Next.js **Pages Router** — never suggest App Router migration
- Supabase only; shadcn/ui + Tailwind (no new UI libs); Framer Motion for animation
- Mem0 is a **deprecated mock** (`src/lib/mem0.ts`) — the REAL memory system is `src/lib/server/memory.ts` (pgvector + OpenAI embeddings, fully wired)
- OpenRouter → Claude Haiku 4.5 for Peter — don't change the model

### Master PRD §9 decisions (Chris, 2026-06-12)
1. **ICP** = couples in their first **0–18 months of marriage** / whoever will actually pay. Reachable via Rustic Retreat's wedding audience.
2. **Palette** = reconcile via color theory → adopt **Warm Clay** system (see §7 pending task 3). Live app is currently a *third* unreconciled direction (violet).
3. **Crisis handling** = **MANUAL LINK ONLY.** No automated text-scanning. (Currently violated in shipped code — see §7 task 1.)
4. **Streak** = **two-track.** Keep the forgiving "practice days" count (never resets, no shame) AND add a consecutive-streak **dopamine kick** when alive; a miss silently removes the kick, never zeroes the cumulative count, never guilt copy.
5. **§4.2 defaults confirmed** for this ICP: CSI-4 (short, validated), `best_for_all` A/B default (Finkel's), in-app-only delivery (no push in v1).

---

## 4. What has been BUILT (working code, pushed)

### Pre-existing (before this session)
Onboarding scoring engine (`deriveProfile.ts` + question flow → `profile_traits`), Peter (avatar + tone routing + `peterService`), 14 journeys, daily loop (`/daily-growth`), Conflict First Aid, Rehearsal Room, Trust Center, Weekly Mirror, playful layer (Daily Spark / Favorite Us), beta ops analytics, pgvector memory.

### Phase 23 — Peter Adaptation *(this session)*
- `src/lib/server/pattern-hints.ts` — `getPatternHints(ctx, surface)` + **93 authored copy strings** (31 morning hints, 31 chat tone variants, 31 insight skeletons all starting "I've noticed you tend to…")
- `buildLegacyTraits()` added to `attachment-context.ts`; `dev-prompt-log.ts` (`logFinalPrompt`) for dev verification
- Wired into `peter/morning.ts` + `peter/chat.ts`; removed dead clinical `attachment_style` branches

### Growth Engine & Compound Reveal *(this session)*
- `src/lib/server/growth-engine.ts` — **deterministic** detection (code gates, LLM only voices). 5 signals: pattern flip-and-hold, practice consistency, CSI delta, tone trend, moment pair. Balanced trust bar (1 strong OR 2 agreeing soft), max 2/week.
- `src/lib/server/growth-moments.ts` — consumer module (chat pick/mark, Day-14 read-all, prompt blocks)
- `src/lib/server/baseline-snapshot.ts` — silent "before" snapshot after 3rd reflection
- Surfaces: Peter chat moments, Weekly Mirror narrative, **Day-14 Compound Reveal** (verbatim before/after quotes + honest effort fallback)
- CSI-4 pulse: `api/csi/pulse.ts` + `CsiPulseCard` (baseline + monthly, **on dashboard**)
- Tables: `pattern_snapshots`, `baseline_snapshots`, `growth_moments`, `csi_pulses`, `match_memories_before` RPC

### Security hardening *(this session)*
- RLS enabled w/ policies on 7 exposed legacy tables (`goals`, `goal_milestones`, `daily_questions`, `daily_question_responses`, `date_ideas`, `user_date_ideas`, `system_settings`)
- `award_skill_xp` locked (was SECURITY DEFINER callable by **anon** with no auth check — anyone could grant XP)
- `search_path` pinned on 8 functions; client EXECUTE revoked on trigger functions
- Supabase security advisors: **23 warnings → 5**, all remaining accepted-by-design or dashboard-only

### Science program — 4 phases *(this session, all pushed)*
- **Phase A — Credibility.** Retired the "NLP" label (kept every technique, retagged to validated constructs: cognitive reappraisal/Gross 2002, linguistic presupposition, identity-based motivation/Oyserman, autonomy support/Deci & Ryan, mimicry/Chartrand & Bargh). Softened Polyvagal → clinical lens (anchored to HRV/Thayer & Lane + Davidson). Renamed `nlp-language-framework.md` → `language-framework.md`. Added **"The Science" section to Trust Center** (7-university roster, Finkel 2013 card, expandable pillars, honest "what to expect" d≈0.3–0.5). Audit report: `audit_report_sprint1.md`. **Zero `src/` exposure existed** — it was all internal docs.
- **Phase B — The North Star** (ideal-self capture). Adaptive **values laddering** (Chris's "7 layers of why", adapted: variable depth, *what/how* phrasing never "why is that important", bedrock detection, max 4 follow-ups) inside the Day 2–4 evening check-in. `north-star.ts` state machine + hidden `[[NORTH_STAR_*]]` markers for deterministic capture. Dashboard placecard, chat/morning orientation blocks, graduation reaffirm/shift buttons. Table: `north_stars`.
- **Phase C — A Different Pair of Eyes** (Finkel Neutral Observer). **Ported** the finished-but-never-merged `sprint-3-finkel-method` worktree onto main: 3-screen private writing flow + history + AES-256-GCM per-user encrypted `reflections` APIs. Warm label + quiet "Backed by Northwestern research". Three triggers: quarterly card, post-Conflict-First-Aid offer, "Fresh Eyes" home-strip entry. Added a **503 guard** (original silently encrypted with an *empty key* if env missing).
- **Phase D — The Way Back** (relapse/repair). Rewrote the live `update_streak_on_session` trigger to **delete the gap-reset branch** (a missed day no longer zeros the streak — resolving a contradiction with Sparq's own copy library). Added `get_return_state()` RPC (DB-basis date math), return-state module + endpoint, **gap-aware welcome greeting** (fixes a stale forward-greeting bug where returners saw a week-old "today" line), and `WelcomeBackCard` celebrating lifetime practice-days. 3+ day threshold, deterministic warm copy.

---

## 5. Live database state

All migrations through `20260611140000_forgiving_streak_and_return_state.sql` are **applied to the live project**. Notable tables added this session: `pattern_snapshots`, `baseline_snapshots`, `growth_moments`, `csi_pulses`, `north_stars`. Notable RPCs: `match_memories_before`, `get_return_state`.

**⚠️ The streak trigger `update_streak_on_session` lives ONLY in the live DB** (its original body was never in a repo migration). The Phase D migration `CREATE OR REPLACE`s it — read the live body with `SELECT pg_get_functiondef('public.update_streak_on_session'::regproc)` before touching it.

---

## 6. Two things Chris must do manually

1. **`REFLECTION_ENCRYPTION_KEY` in Vercel** — generate with `openssl rand -hex 32`. Local `.env.local` already has one. Until set in prod, the Neutral Observer flow returns a graceful 503 "not available yet" (by design — never weak encryption).
2. **Enable leaked-password protection** — Supabase Dashboard → Authentication. Two clicks; the last meaningful security advisor.

---

## 7. PENDING WORK QUEUE

**✅ Tasks 1–4 were EXECUTED and pushed (2026-06-12).** See §7b for what's left.

**⚠️ ONE BLOCKED ITEM:** the streak-dopamine migration
(`20260612100000_streak_dopamine_layer.sql`) is **committed to the repo but NOT
applied to the live DB** — Supabase connections were timing out. Apply it with
the Supabase MCP `apply_migration` (or `npx supabase db push`) when reachable.
The app is safe until then: `consecutive_streak` defaults to 0, so the
celebration beat simply doesn't render rather than erroring.

<details>
<summary>Original spec for tasks 1–4 (kept for reference — all now done)</summary>


### Task 1 — Crisis → manual link (PRD §4.2/§7 compliance) ⚠️ IN PROGRESS, NOT APPLIED
Shipped code **violates** the locked decision. Required:
- `src/lib/safety.ts`: **delete `import OpenAI from 'openai'` (line 2, still present)** and the entire OpenAI Moderation block inside `detectCrisisIntent` (~lines 91–117). Keep the local regex check + add a doc comment explaining it's *response routing*, not monitoring.
- `src/pages/api/peter/chat.ts`: delete the `safety_events` insert (it logs **verbatim matched crisis phrases** — violates "never log sensitive content") and the `crisis_escalation_triggered` analytics event.
- `src/pages/api/peter/onboarding.ts` + `rehearsal/message.ts`: **audited — they only respond, never log. No changes needed.**
- **Create `src/pages/help-now.tsx`** — region-aware resources page, no auth, `getServerSideProps` reading `x-vercel-ip-country`, reusing `getCrisisResources()`. Calm tone, no confidentiality promises. (Full draft was written but never saved — rewrite from `CRISIS_RESOURCES` in `safety.ts`.)
- Add persistent low-key "Need help now?" links: dashboard + Neutral Observer footer.
- **Flagged deviation for Chris:** the plan keeps a *local* explicit-disclosure regex so Peter doesn't coach through "I want to kill myself" — nothing stored, nothing sent to third parties. If Chris wants literal zero detection, remove it entirely.

### Task 2 — Fix ladder-night prompt competition (real defect, found by self-review)
In `chat.ts`, on North Star ladder nights the growth-moment block is still appended AND `markMomentSurfaced` **consumes** the moment while Peter is instructed to run the ladder → competing instructions + a growth moment burned without ever being voiced. Fix: gate the `getActiveGrowthMomentForChat` block on `!ladderState` (same as the orientation block already does). Consider also skipping Phase 23 `insightLines` on ladder nights (minor).

### Task 3 — Palette reconciliation (violet → Warm Clay)
Live app is a **third** unreconciled direction: `brand.primary = #6E56F7` (violet), `brand-parchment = #EEE7F8` (lavender — actively breaks the "warm" intent). Centralized in exactly two files: `tailwind.config.ts` (brand tokens + `primary.100/200` scale) and `src/styles/globals.css` (HSL vars, `--primary: 250 91% 65%` etc.).

Recommended system (color theory: warm analogous core + single cool counterweight):

| Role | Color | Hex |
|---|---|---|
| Primary / CTA | Warm Clay | `#C56B4D` (≈ HSL 15 52% 54%) |
| Calm / grounding | Sage | `#9CB5A0` |
| Anchor / text | Warm Espresso | `#2E2620` |
| Background | Warm Linen | `#F5F1EA` |
| Milestone / dopamine | Rationed Gold | `#D9A441` |

### Task 4 — Streak dopamine layer (PRD decision 4)
Add `consecutive_streak` column maintained by the trigger (increments on consecutive days, **silently resets on a gap**) alongside the forgiving `current_streak`. Surface a **gold celebration beat** on the `/daily-growth` completion screen (the existing streak badge, ~line 1036) when the run ≥2. Never any punitive/guilt copy on a miss.

</details>

---

## 7b. WHAT'S ACTUALLY LEFT

### ✅ ALL THREE GATES (3, 4, 5) SHIPPED 2026-06-12 — PRD v1 conversion arc is built.

**The one blocking item is the un-applied migration (see §7 warning).** After that, what remains is not code: **manual UAT, then real users and CSI data.**

**Gate 3 — onboarding conversion arc (done):** new `csi_baseline` phase runs right after consent (before the profiling questions, so it measures the relationship untouched); `CsiBaseline.tsx` is Peter-framed, 4 taps, skippable. Journey confirm now routes into the **Day-1 Neutral Observer hook** (`?trigger=hook` → `trigger_source: 'onboarding_hook'`, which deliberately does NOT consume the quarterly schedule), then on to the dashboard.

**Gate 5 — Day-14 conversion moment (done):** `/api/csi/delta` (states: `no_baseline | too_early | remeasure_due | ready`) + `CsiTrajectoryCard` on the graduation screen. Asks the same four questions again, shows day-one → today side by side, and has **honest copy for all four outcomes including flat and DOWN** per the PRD's non-negotiable. Footnote names the instrument and calls two weeks "a first data point, not a verdict."

**Gate 4 — micro-primes (done):** `src/data/micro-primes.ts` holds 8 primes across the two v1 categories only (PPR, Capitalization), each with a Gollwitzer implementation intention pre-filled with the user's anchor. `HabitAnchorPick` is now onboarding's final beat (writes `profiles.habit_anchors` + `onboarding_anchor_set_at` — columns sprint 2 created but nothing had ever set). `DailyPrimeCard` shows one prime/day on the dashboard, categories alternating, stable per day. Citations live in metadata only — never in the loop.

**PRD v1 onboarding arc is now complete end to end:**
`consent → CSI-4 baseline → questions → Peter session → journey rec → journey detail → habit anchor → Day-1 Neutral Observer hook → dashboard`
…and at day 14, the `CsiTrajectoryCard` closes the loop with an honest delta.

<details>
<summary>Original Task 5 spec (for reference)</summary>
- **Gate 3:** onboarding order → sign-up → **CSI-4 baseline** → **Day-1 Neutral Observer hook** (live recalled grievance = the trial's emotional proof point) → habit-anchor pick. *Insertion design:* CSI-4 right after consent (4 taps, Peter-framed); the Neutral Observer as the **first practice immediately after journey confirm** — preserves "Day 1 proof" without bloating an onboarding that took two phases to harden.
- **Gate 5:** Day-14 CSI **remeasure** + trajectory + honest conversion screen (must report honestly even if flat).
- **Gate 4:** PPR + Capitalization micro-primes on the anchor schedule.
- PRD mandates a **working demo + screenshot at each gate** before starting the next — this is deliberately designed around Chris's documented 80–90%-then-pivot pattern.

</details>

### Also outstanding
- **Apply the streak-dopamine migration** to the live DB (see §7 warning above).
- **Manual UAT — PARTIALLY DONE (2026-06-12).** Unauthenticated pass completed against a live dev server: all new/changed routes return 200 with no runtime errors (`/help-now`, `/neutral-observer`, `/login`, `/onboarding`, `/dashboard`), and the Warm Clay palette + Cormorant serif were verified in-browser with computed styles. **This pass is what caught the dual-Tailwind-config bug.** Still needed: an **authenticated** walkthrough (real signup → CSI baseline → questions → Peter → journey → anchor → Day-1 hook → dashboard → day-14), which needs test credentials.
- **Hardcoded legacy hexes** — ~10 older components still carry `#6E56F7` / `#8B5CF6` / `#5B4A86` inline (PeterAvatar, PeterSession, MorningBrief, DailyTimeline, etc.). The token swap covers everything using `brand-*` classes; these inline ones need a manual pass.
- **Legacy streak components** (`StreakIndicator`, `JourneyMapCard`, `DashboardContent`) are unmounted on the beta path and contain unsourced stats + "embedded command" copy — retire or clean up.

---

## 7c. Completed 2026-06-12 (post-outage execution)

| Task | What shipped |
|---|---|
| **Crisis → manual link** | Removed the OpenAI Moderation layer from `safety.ts` (ML-scanned every message, sent user text to a third party) + the `safety_events` insert in `chat.ts` that logged **verbatim matched crisis phrases** + the crisis analytics event. Added `/help-now` (region-aware, no auth, no scanning) and persistent "Need help now?" links on dashboard + Neutral Observer footer. Kept a local explicit-disclosure check so Peter answers with resources instead of coaching — **response routing, not monitoring**. Audited `peter/onboarding.ts` + `rehearsal/message.ts`: they only respond, never log — unchanged. |
| **Ladder-night defect** | Growth-moment block + insight skeletons now gated on `!ladderState`. Previously a verified growth moment was marked consumed while Peter was busy running the values ladder — burned without the user ever hearing it. |
| **Palette** | Violet → **Warm Clay**. `tailwind.config.ts` brand tokens + `globals.css` HSL vars swapped in sync. The old "parchment" was `#EEE7F8` — a lavender that silently broke the warm intent. |
| **Streak dopamine** | Two-track: forgiving `current_streak` (never resets) + new `consecutive_streak` (dopamine track, silently resets on a gap). Completion screen shows "Days you've shown up" always, and a gold "N in a row" beat only when a run is live. No guilt copy on a miss. *(Migration pending — see §7.)* |

---

## 8. Known gaps vs. the Master PRD

| PRD item | Reality |
|---|---|
| Neutral Observer **6-step** flow w/ autosave per step | Built as **3 writing screens**; no per-step autosave; no A/B `best_for_all` toggle |
| CSI-4 placement | On **dashboard**, not onboarding-baseline → Day-14 conversion |
| Daily micro-primes (5 categories) | **Not built** — only the playful Daily Spark exists. PPR + Capitalization are v1 scope. |
| Money Module | **Not built** |
| JITAI state-tag schema | ✅ Built (`user_state_events`, tagging only) — matches PRD Phase 1 |
| Question bank "200+" | Unverified; likely smaller/static, not the phase-dependent AI-generated format |

---

## 9. Craft lessons / traps hit (save future-you the pain)

- **⚠️ TWO Tailwind configs existed (`.js` + `.ts`) and `.js` silently won.** Found only by looking at the running app in a browser — tsc, lint, AND the production build all passed while the app rendered the *wrong design system*: the Warm Clay palette was inert, `brand-text-secondary`/`brand-border` didn't exist (15 files), and `font-serif` didn't exist (52 files — the whole editorial voice was falling back to sans). The `.js` was a shim added because `.ts` needs `tailwindcss-animate`, which was never installed. Fixed by installing the dep and deleting the `.js`. **Lesson: green build ≠ correct app. Look at the thing.**
- **supabase-js query builders are LAZY.** An un-awaited `.insert()` **never executes.** This silently broke an existing `growth_thread` mirror insert. Always `await`.
- **`git add -A` in this repo sweeps in junk** — `.claude/cheatsheets/`, `.claude/worktrees/` (embedded git repos!), stale `.planning/` docs. Always use scoped `git add <files>`.
- **zsh globs unquoted paths:** `src/pages/api/reflections/[id].ts` must be quoted or the command errors with "no matches found".
- **Deprecation markers lie.** `mem0.ts` says "mock" and made me wrongly conclude memory was mocked — the real pgvector system was fully wired the whole time. **Verify the actual call path.**
- **Vector search self-matches.** Every evening reflection is stored as a memory, so searching with today's reflection returns *today's reflection* at ~1.0 similarity. Required an age-filtered RPC (`match_memories_before`).
- **Memories are stored as `"user: …\nassistant: …"`** — naive slicing quotes *Peter's* words back as the user's. Extract the user portion only.
- **"NLP" is ambiguous** — one hit in `SPARQ_MASTER_SPEC.md` meant *natural language processing*, not neuro-linguistic programming. Don't retag blindly.
- **The active `dashboard.tsx` renders NO streak indicator.** `StreakIndicator`, `JourneyMapCard`, `DashboardContent` are legacy/unmounted on the beta path (they also contain unsourced stats + "embedded command" copy — a future cleanup).
- **The onboarding Peter handoff is fragile** — it took two phases to make deterministic. Be careful adding depth there (this is why the Day-1 hook goes *after* journey confirm).

---

## 10. Workflow that worked well

For each feature: **brainstorm (skill) → spec → reviewer subagent loop → plan → reviewer subagent loop → inline execution with per-task commits → build/greps → push.**

The reviewer subagents earned their keep — they caught, before any user hit them: the `growth_thread` CHECK constraint that would have silently swallowed every insert; a stranded-ladder bug that would have permanently blocked day-completion (streak loss); a re-ladder loop that would have nagged nightly; and a permanently-inert graduation button. **Keep using them.**

---

## 11. Honest strategic read (important context)

The four science phases are genuinely well-aligned with research — Finkel 2013 is a real, faithful implementation, and the retention-specific work (forgiving streak, welcome-back, Compound Reveal) targets the exact failure points where habit apps lose people (median ~4% D30 retention).

**But:** "will users change" is currently a well-grounded *hypothesis*, not data — the CSI-4 loop exists to answer it and hasn't run with real users. And the PRD's #1 kill risk (9/10) is the documented **"build to 80–90%, widen, never converge"** pattern. This session built a lot of adjacent depth that is *beyond* PRD v1 scope while the actual v1 conversion arc (gates 3–5) remains unbuilt.

**Following the PRD faithfully now means NARROWING to finish the conversion arc — not adding more mechanisms.** Also worth watching: whether all this surface area (growth engine, north star, Finkel, relapse, CSI, playful, journeys, Peter) coheres into *one warm companion* or fragments into *many features* — which is exactly what the enjoyment-first principle warns against.

**Also pending:** manual UAT walkthroughs for Phases B, C, D. All logic is verified (live SQL, builds, greps, pure-function checks), but nobody has yet walked the real browser flow with a seeded user.
