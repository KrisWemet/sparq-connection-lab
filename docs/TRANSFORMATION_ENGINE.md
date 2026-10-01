# Transformation Engine — Implementation Map

**Constitution:** v1.2 (§1A, §1B, §5A–§5C, §6B, §8A, §11A–§11D, §12A) · **Date:** 2026-10-01
**Status: doctrine and planning only.** Nothing in this document is built. No code, migration or UI change follows from it until Chris reviews the v1.2 doctrine (constitution §14, steps 17–26).

This document answers four questions for the v1.2 amendment:

1. Which v1.2 ideas already exist in Sparq, so we build on them instead of duplicating them?
2. Where will application code eventually need to change?
3. What are the safety, privacy and product risks?
4. In what order should it be built?

---

## 1. The engine, stage by stage — what exists today

Legend: **Exists** = in the product now · **Partial** = the right idea exists, needs extending · **Missing** = nothing yet.

| # | Stage (§1A) | What exists | Status | Gap |
|---|---|---|---|---|
| 1 | Insight | Morning story → bridge question; evening reflection; Peter's modes and distance rule (`PETER_SHARED_RULES`, `conversation-mode.ts`); `self_discoveries`; weekly mirror | **Exists** | — |
| 2 | Meaning | North Star ladder (`north-star.ts`, `north_stars`), `user_reasons` + `reasons.ts`, Seven Layers of Why in the language framework | **Partial** | Reasons are single entries, not chains; no Deep Why depth or "meaning domain"; reasons link to experiments only (`experiments.reason_id`) |
| 3 | Choice | Experiment creation (user-written), "Not now" honored in prompts, `SharePrompt` default-private | **Exists** | Destination isn't modeled separately from the experiment (a goal vs. a step toward it) |
| 4 | Micro-action | Daily micro-action (now an invitation, B6), experiments | **Exists** | Suggestion → accept/reshape loop is implicit in chat |
| 5 | Implementation cue | `experiments.intention` stores "When X, I'll try Y"; micro-primes carry if-then plans with the user's habit anchor (`micro-primes.ts`, `HabitAnchorPick`) | **Partial** | Cue isn't a separate field; habit anchor only feeds primes |
| 6 | Real-world practice | Experiments with `check_in_on`; daily "Implement" step | **Partial** | No concept of a *mission* with domain, difficulty or adaptation history |
| 7 | Reflection | Experiment check-in after ~2 days (`ExperimentsCard`), evening reflection | **Exists** | — |
| 8 | Learning | `experiments.outcome` (helped / mixed / didnt_help) + `outcome_note`; growth engine | **Partial** | No structured "what got in the way / what surprised you"; outcome is closer to a grade than a lesson |
| 9 | Adaptation | — | **Missing** | No `revised_from` / iteration chain; a mission that didn't work is let go, not reshaped (`docs/PERSON_MODEL.md` §8.5 proposed `revised_from`) |
| 10 | Repetition | Forgiving practice-day streak; daily loop rhythm | **Partial** | No per-skill repetition count; no adaptive difficulty |
| 11 | Identity evidence | `IdentityArcCard` (user's own North Star words), growth engine `growth_moments` (then vs. now), Day-14 reveal, Day-30 mirror | **Partial** | Desired identity and *evidence for/against it* aren't linked; no "three times now — does that change how you see yourself?" moment |
| 12 | Contribution | Values journey touches it | **Missing** | No contribution prompts or missions |

### Cross-cutting v1.2 concepts

| Concept | What exists | Status |
|---|---|---|
| Deep Why (§5B) | North Star ladder (shipped with max 4 follow-ups and what/how phrasing — now changed to seven "why is that important to you?" askings, 2026-10-01); Seven Layers of Why (language framework); `user_reasons` | **Partial** — the mechanism exists twice under two names; v1.2 unifies them as Deep Why |
| Self-persuasion | `user_reasons`, "What makes it worth trying for you?", own-reason rate metric | **Exists** |
| Whole-app priming (§5C) | Golden-hour imagery rule, Plum/Coral/Gold "colour follows the moment" tones (`moment-tone.ts`), micro-primes, story recipe, `DailyPrimeCard` | **Partial** — practiced but not named, tiered or disclosed |
| "How Sparq is designed" disclosure | Trust Center (`/trust-center`); science-page citations live in prime metadata | **Partial** — no plain-language design disclosure yet |
| Timing intelligence (§6B) | Emotional check-in before content; `conversation-mode.ts` (heavy feeling → Listen); `return-state.ts`; struggling/thriving adaptation in `sparq-psychology` | **Partial** — no receptivity facet; Behavioral Baseline not built |
| Stabilization | Comfort-first rule, somatic suggestions, Conflict First Aid, `/help-now` | **Exists** |
| Setbacks are data (§11A) | "The Way Back" (forgiving streak, gap-aware welcome, `WelcomeBackCard`), "a skipped experiment is information", experiment `let_go` | **Partial** — return is handled; *within-practice* setback inquiry (what changed? too big?) is not |
| Adaptive difficulty (§11A) | Content difficulty tags (Beginner/Intermediate/Advanced); "thriving → increase challenge"; journeys gradient | **Partial** — per-content, not per-person-per-skill |
| Environment design (§11A) | Habit anchor, if-then primes, Current Life context | **Partial** |
| Identity change (§11B) | Identity statement + North Star, B1/B5 fixes (no assigned identity) | **Partial** |
| Milestones (§11C) | Day-14 graduation, Day-30 mirror (user writes the ending), graduation report | **Partial** — first two arcs exist; no later arcs; no "what I still struggle with / ready next" fields |
| Contribution (§11D) | — | **Missing** |
| Social reinforcement (§8A) | Partner link, `/us`, `shared_items`, `SharePrompt`, Neutral Observer `shared_with_partner` | **Partial** — partner only; correct consent model to reuse |
| Hughes-inspired behavioral layer | Insight Profile page (user-set part), rejected-hypotheses store, pushback signal | **Partial** — Baseline and inferred facets not built |
| Transformation metrics (§10) | MDR, follow-through, correction rate, own-reason rate (`docs/METRICS.md`) | **Partial** |
| Domain-agnostic architecture (§12A) | Person Model is mostly individual-first already | **Partial** — some names assume a partner |

---

## 2. Contradictions found and how v1.2 reconciles them

| # | Contradiction | Where | Reconciliation |
|---|---|---|---|
| C1 | v1.1 gate: "Influence is available only after … User chooses. Before that point Peter listens… nothing more." vs. v1.2 "influence may support the process at any stage" | Constitution §5A, §1, §2; language framework; `modalities-applied.md` §12; `CLAUDE.md` | Split influence into **process** (any stage, in the open, in the user's interest) and **destination** (only toward a user-chosen target, with provenance). Everything v1.1 forbade before the choice was destination influence, so no shipped fix (INFLUENCE_AUDIT B1–B16) is undone. |
| C2 | "Agency before influence" slogan vs. "Sparq is intentionally designed to lead" | Constitution §1, §2; `peterService.ts:41` quotes the slogan | Governing principles restated: *Sparq may help determine the path; the user determines the destination* · *Discovery before destination* · *Leadership supports agency.* The code's phrase "discovery before direction, agency before influence" is still correct in substance; updating the prompt wording is a later, reviewed code change (P1 below). |
| C3 | Peter "is not a … persuader" vs. Peter "leads" | Constitution §5 | Peter is not a persuader *toward his own conclusions*; he is a guide who leads the *process* toward the user's chosen destination. |
| C4 | "Challenge once… if the user pushes back… never come back to it later by another route" vs. "Peter should sometimes challenge discrepancies between a user's stated values and their behavior" | Constitution §5, §6A; language framework; resistance evals R4 | Two different objects: a **hypothesis about the user** (rejected → never re-pushed) and a **goal the user chose** (may be revisited later with new evidence, as a question whether it still matters, accepting "not anymore"). Values–behavior challenges point only to the user's own stated value and always leave three answers open: recommit / something's in the way / the goal no longer fits. |
| C5 | "Prefer user-created experiments over assigned homework"; "Offer ideas only if they ask or seem stuck" vs. Peter suggests Real-World Missions | Constitution §5; `PETER_SHARED_RULES`; `sparq-peter` §4b | Peter may suggest missions **drawn from the user's own goals and context**; a suggestion becomes theirs only when they accept, reshape or replace it and give their reason. Note `experiments.origin` already allows `peter_suggested`. |
| C6 | Seven Layers of Why ("seven times") vs. the shipped North Star ladder (max 4 follow-ups, never "why is that important") | language framework; North Star spec; `north-star.ts` | **Decided by Chris 2026-10-01:** seven askings of "Why is that important to you?". The user can still stop at any layer. The ladder prompt and its turn caps are updated to match. |
| C7 | User brief lists DBT, Transactional Analysis, Polyvagal and "NLP where appropriate" as already-approved | `sparq-psychology` listed 11 modalities + ethical influence; NLP label retired 2026-06; Polyvagal removed 2026-06; DBT only in a 2026-03 routing draft; TA absent | **Decided by Chris 2026-10-01:** DBT-informed skills and TA approved, with reference entries (`modalities-therapeutic.md` §7–8). Polyvagal (as a named basis) and the NLP label stay retired; their usable parts already live under other names. |
| C8 | "Ethical Influence" sits as modality #12 vs. "influence is a supplementary layer, not a modality" | `sparq-psychology/SKILL.md` table | Kept as #12 for continuity, explicitly classified as supplementary (how, not what). |
| C9 | Transparency test v1.1: "An influence technique that would stop working if the user understood it is not allowed" vs. v1.2: "Would the interaction remain acceptable if the user fully understood how Sparq was designed?" | Constitution §5A; language framework | Adopted the v1.2 question, kept the v1.1 floor: influence may not *depend* on the user not understanding it; design-level influences are disclosed in a plain-language "how Sparq is designed to help you" explanation. |
| C10 | Notifications, social reinforcement, community, other domains vs. beta scope (no push notifications, no social sharing, no therapist flows, couples only) | `CLAUDE.md` Beta Scope | Doctrine describes future architecture only; §8A and §12A state explicitly that beta scope is unchanged. |
| C11 | "Peter's job … help users reach their own [conclusions]" + "desired return thought: what will I understand about myself today?" vs. "optimize for real-world change" | Constitution §1, §10 | Success redefined to include lived change; a second return thought added ("How did it go out there — and what's next?"). |
| C12 | Two-track streak includes a "dopamine track" that silently resets vs. "milestones replace shallow gamification" | `20260612100000_streak_dopamine_layer.sql`; `CURRENT_STATE.md` | **Decided by Chris 2026-10-01: shallow gamification is out.** The consecutive track is retired (slice 2b in §5); the forgiving practice-day count stays. |
| C13 | `sparq-psychology` Day-14 "Profile reveal — 'Here's what I've learned about you'" vs. hypotheses-never-labels (pre-existing v1.0 tension; code fixed in B2) | `sparq-psychology/SKILL.md` | Skill text aligned to the shipped behavior (guesses the user judges). |

---

## 3. Where application code will eventually need alignment (not done now)

### Peter (prompts and mode logic)

| # | Where | Change | Constitution |
|---|---|---|---|
| P1 | `src/lib/peterService.ts` `PETER_SHARED_RULES` header ("discovery before direction, agency before influence") | Restate as "the user chooses where they're going; you help with the way" — wording only | §1 |
| P2 | `PETER_SHARED_RULES` Act mode ("Offer ideas only if they ask or seem stuck") | Allow mission suggestions tied to an active, user-chosen goal; keep accept/reshape/decline | §5, §6, §11A |
| P3 | `PETER_SHARED_RULES` Challenge mode | Add values–behavior discrepancy challenge with the three open answers; only toward user-stated values; timing gate | §5, §6B |
| P4 | `conversation-mode.ts` | Add signals: setback language ("I didn't do it", "fell back into") → Explore with setback inquiry; flooded/depleted → Listen/stabilize, suppress Act and Challenge | §6, §6B, §11A |
| P5 | Evening reflection / experiment check-in prompts | Replace pass/fail framing with learn/adapt questions; offer resize or re-cue | §11A |
| P6 | Celebrate prompts, growth-moment block | Identity-evidence question after repeated evidence toward a *user-named* identity | §11B |
| P7 | North Star ladder (`north-star.ts`) + reasons capture | Persist ladder layers as a Deep Why chain; reuse at moments of difficulty | §5B |
| P8 | Mission suggestions | Difficulty step-up when capacity evidence shows it's easy; step-down after setbacks | §11A |
| P9 | `docs/evals/resistance-handling.md` | v1.2 cases L1–L6 added (spec only); run by hand, then decide on automation with Chris | §6A |

### Data model (conceptual — see `docs/PERSON_MODEL.md` §9; no migrations yet)

Likely changes, all as **extensions of existing tables** (§12 "one authoritative store"):

- `user_reasons` → Deep Why chains: `parent_reason_id`, `depth`, `meaning_domain`, broader `attached_to` (goal, value, north_star, experiment/mission, identity, relationship_intention, contribution).
- `experiments` → missions: `kind` (experiment | mission), `cue`, `difficulty_level`, `skill_key`, `domain`, `revised_from`, `obstacle_plan`, `environment_notes`, structured learning (`what_helped`, `what_got_in_way`, `surprise`).
- Desired identity: reuse `north_stars` (+ identity statement) as the identity record; new `identity_evidence` rows (or `growth_moments` with `identity_ref` and `direction` consistent/inconsistent).
- Setbacks: no separate failure store — `experiments.status`/learning fields + an `insight.*` note on what tends to get in the way.
- Environment & conditions: `memories.kind = context` with a `condition` tag, or `profile_traits` `insight.environment.*` facets (user-visible).
- Receptivity and capacity: `profile_traits` `insight.receptivity`, `insight.capacity.<skill>` facets — the Insight Profile pattern already planned.
- Milestones: `growth_arcs` (user-written fields from §11C) — generalizing the Day-30 mirror record.
- Contribution: a `contribution` value for `attached_to`/mission `domain`; no separate store.
- Influence provenance: `{kind: process|destination, principle, target_type, target_id}`; priming elements carry a `review_tier`.
- Social reinforcement (future, out of beta scope): `support_grants` (owner, supporter, scope item, visibility, expires_at, revoked_at) on the `shared_items` consent model.

### UX (future, each needs its own reviewed slice)

- Mission card (suggestion → accept / reshape / not now → cue → check-in → learn → adapt) evolving `ExperimentsCard`.
- Deep Why view: the user's own chain of reasons, editable, "not why anymore".
- Identity card: user's desired identity + recent evidence, with an "is this still you?" edit path (evolves `IdentityArcCard`).
- Setback check-in: warm, curious, "make it smaller / change the cue / let it go".
- Milestone ritual screens for arcs beyond Day 30.
- "How Sparq is designed to help you" page (Trust Center or science page) disclosing priming, sequencing and reminders.
- Insight Profile page: add receptivity, capacity and environment entries with confirm/correct/delete.
- Contribution prompts only for users who opt in.

---

## 4. Safety, privacy and product risks

| Risk | Why it matters | Mitigation in doctrine |
|---|---|---|
| **Loosened influence gate** | "Process influence at any stage" could become a loophole for steering | Destination influence still gated + provenance; seven questions; tier-3 review; transparency floor (no influence that depends on not being understood) |
| **Values–behavior challenge feels like being watched or judged** | Users disclosed values in trust; being confronted with them can feel like a gotcha | Only the user's own stated value; timing gate; once per moment; three open answers; "not anymore" retires the goal everywhere |
| **Missions as homework / compliance** | Peter-suggested actions drift into assignments | Accept/reshape/decline; own reason; adapt not grade; follow-through < 20% is a red flag in user testing |
| **Major life outcomes** | Leading could tilt toward stay/leave/forgive | Explicit prohibition in §5A; safety is the only exception |
| **Timing intelligence → exploitation** | Receptivity data could be used to catch people at low moments | Knowingly provided data only; never for upgrades or destination influence; tier 3 |
| **Environment data is sensitive** | Alcohol, money, sleep, family stress | User-raised only, sensitive by default, private, no moralizing, safety routing |
| **Identity pressure** | Evidence-based identity prompts could still feel like labels | User-authored identity only; asked, never declared; inconsistent evidence is a question, not a verdict |
| **Priming without disclosure** | Whole-app priming can feel manipulative if discovered | Tiered review; design-level disclosure page; no hidden cues |
| **Social reinforcement leaks** | Supporters seeing private Peter content | Explicit, scoped, revocable grants on the `shared_items` model; out of beta scope |
| **Scope creep** | Notifications, community, other domains | §8A, §12A and §14 state they wait for authorization |
| **Dependency** | A more compelling Peter can increase reliance | Success = needing Peter less for basic situations; agency metrics; "send back into real life" |
| **Clinical overreach** | Setbacks, substances, stress can verge on treatment | Educational stance, forbidden-language table, crisis routing unchanged |
| **Model change** | Free models (temporary, `CLAUDE.md`) may follow nuanced challenge rules less reliably | Re-run the resistance + leadership evals on Haiku before shipping P2–P4 |

---

## 5. Recommended implementation sequence

Each step is a separate, reviewed slice. Steps follow constitution §14 (17–26).

1. **Doctrine review** — ✅ done 2026-10-01 (C6, C7, C12 decided; Chris is the tier-3 reviewer).
2. **Peter prompt alignment, conversation only** (P1–P4) + seven-why ladder (P7, prompt part) + run `docs/evals/resistance-handling.md` including the new L-cases. Lowest risk, highest leverage; no schema.
   - **2b. Retire the consecutive "dopamine" streak track** (UI + streak copy; leave the column until Chris OKs dropping it).
3. **Learn/adapt check-ins** (P5): experiment check-in asks what got in the way and offers resize/re-cue. Small schema extension (`revised_from`, learning fields).
4. **Deep Why chains** (P7): persist the North Star ladder as a reason chain; show it to the user; reuse at difficult moments.
5. **Missions** as an extension of experiments: suggestion → accept/reshape → cue → reflection → adapt (P2, UX mission card).
6. **Identity evidence** (P6): link evidence to the user's desired identity; the "three times now" question.
7. **Whole-app priming audit + "how Sparq is designed" page** (step 24). Classify existing elements by tier before adding new ones.
8. **Adaptive difficulty + environment prompts** (P8; steps 22–23), once missions produce evidence.
9. **Milestones beyond Day 30**; contribution prompts for users who opt in (step 25).
10. **Transformation metrics** defined in `docs/METRICS.md`, then instrumented; v1.2 user-testing questions (step 26).
11. **Later, with explicit authorization only:** social reinforcement beyond the partner (§8A), notifications, other domains (§12A).
