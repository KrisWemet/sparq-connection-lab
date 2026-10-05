# Psychology Implementation Audit

**Date:** 2026-10-05 · **Scope:** what Sparq *names*, what its content *contains*, and what its working flows *consistently deliver*, for the approved foundations (constitution v1.2 §1B). Read-only audit; fixes are proposed in §6 and delivered in later, separately reviewed slices.

**No evidence-strength ratings.** This audit does not grade the modalities and does not claim Sparq has shown effectiveness. Sparq has no outcome study. Research behind a therapist-led program does not transfer to a short, self-guided, AI-assisted adaptation of it.

## 1. Doctrine check

| Item | Current doctrine | Source |
|---|---|---|
| Approved foundations | Gottman, EFT, ACT, CBT, Positive Psychology, Attachment Theory, IFS, Mindfulness, NVC, Somatic regulation, Narrative Therapy, DBT-informed skills, Transactional Analysis (13) — **matches the list in the task brief** | `docs/CONSTITUTION.md` §1B; `.claude/skills/sparq-psychology/SKILL.md` §2 |
| Ethical influence / behavior design | Supplementary layer (*how* Sparq helps), not a lens for understanding a person | §1B, §5A, §5C |
| "NLP" | Retired as a label (2026-06); techniques kept under validated construct names | §1B |
| Polyvagal theory | Excluded as a named basis (2026-06); somatic language anchored in HRV/vagal-tone research | §1B |
| Motivational Interviewing | Not named anywhere in doctrine. Peter's rules already contain MI-consistent moves (evoke reasons, ask permission, roll with resistance) under constitution names (§5, §5B, §6A) | `src/lib/peterService.ts` `PETER_SHARED_RULES` |
| IBCT, self-compassion, solution-focused | Not named in doctrine. Fragments exist (cycle-as-the-problem framing; "setbacks are data"; "when did it go better" is absent) | §2, §7, §11A |

## 2. The active flows traced

| Flow | Entry | What decides the content | Key files |
|---|---|---|---|
| Onboarding | `/onboarding` | CSI-4 baseline (skippable) → scenario questions with score deltas → derived profile → journey match | `src/pages/onboarding.tsx`, `src/components/onboarding/CsiBaseline.tsx`, `src/lib/onboarding/deriveProfile.ts`, `journeyMatcher.ts` |
| Daily loop | `/daily-growth` → `POST /api/daily/session/start` | Active starter journey day if any (`resolveJourneyContent`); otherwise an LLM morning story on a **concept chosen by day number** (`BASE_CONCEPTS[day-1]` days 1–14, then `TRACK_CONCEPTS[track][(day-15) % 7]`) plus a trait-gap "steering hint" | `src/pages/api/daily/session/start.ts:213-250`, `src/lib/peterService.ts` (`BASE_CONCEPTS`, `TRACK_CONCEPTS`, `getMorningStoryPrompt`), `src/lib/server/trait-gaps.ts` |
| Evening reflection | evening check-in → Peter chat (`eveningContext`) | Peter shared rules + mode picker; profile analysis afterwards infers traits, memories, discoveries, intentions | `src/pages/api/daily/session/evening-checkin.ts`, `src/pages/api/peter/chat.ts`, `getProfileAnalysisPrompt` |
| Peter chat | `/api/peter/chat` | Safety → North Star ladder night *or* mode picker (`decideMode`) + own-words block + do-not-repush block + conversation prefs + pattern hints + one growth moment | `src/pages/api/peter/chat.ts:140-300`, `src/lib/server/conversation-mode.ts`, `src/lib/server/memory.ts` |
| Missions / experiments | `ExperimentsCard` on the dashboard → `/api/experiments` | User-written, or one ladder idea from `suggestMission` (needs a North Star line or a still-true reason) → cue → check-in after 2 days → felt / what got in the way → keep, reshape, smaller, let go | `src/lib/missions.ts`, `src/pages/api/experiments/index.ts`, `src/components/dashboard/ExperimentsCard.tsx` |
| Journeys | `/journeys`, `/journeys/*` | Two content systems: 14 static journey pages (`src/data/journeys.ts`, `src/pages/journeys/*.tsx`) and 9 starter journeys that feed the daily loop (`src/data/starter-journeys/*`). Journey *state* is being reworked in open PR #62 — not touched here | as listed |
| Conflict help | `/conflict-first-aid` | Fixed reset protocol (breathing, 20-minute pause line, return + ownership) + repair starters, tone by stored conflict style | `src/pages/conflict-first-aid.tsx` |
| Other tools | `/translator`, `/rehearsal`, `/neutral-observer`, `/us` | Softer rewording of a draft; rehearsal with confidence before/after; Finkel-style neutral reflection; couple cycles both partners confirm | `src/pages/api/translator.ts`, `src/pages/rehearsal.tsx`, `src/pages/api/couple/cycles.ts` |
| Personalization | trait inference | `profile_traits` hypotheses (attachment, love language, conflict style, 8 pattern dimensions) shape tone and story hints, gated by confidence | `src/lib/server/trait-revision.ts`, `pattern-hints.ts`, `attachment-context.ts` |
| Progress | dashboard, Day 14, Day 30, weekly mirror | Forgiving practice-day count, growth moments (`growth-engine.ts`), CSI-4 pulse + Day-14 delta, weekly mirror, identity evidence | `src/lib/server/growth-engine.ts`, `src/components/dashboard/Csi*.tsx`, `IdentityArcCard`, `WeeklyMirrorCard` |
| Outcome "score" | `GET /api/me/relationship-score` | Weighted composite (see §5). **No user-facing screen calls it**; admin KPIs average its stored rows | `src/lib/server/relationship-score.ts`, `src/pages/api/admin/kpis.ts:120` |

## 3. Named → content → consistently delivered

"Delivered" means a working flow reliably puts the approach in front of a user who uses the core loop — not that a page exists somewhere.

| Approach | Named in docs | Represented in content | Consistently delivered | Notes |
|---|---|---|---|---|
| Gottman | Yes | Yes — `shared-language` journey; repair, bids, turning toward in static journeys; Conflict First Aid 20-minute pause | **Partly** | The repair ladder (`missions.ts` `repair`) and Conflict First Aid are reachable; "5:1 ratio" and "Weekly Mirror" uses named in the skill are not implemented as such |
| EFT | Yes | Yes — `safe-in-love`, `building-trust`; cycle framing in Peter rules ("the cycle is the problem") | **Partly** | Cycles in `/us` need both partners; solo users get the framing only through Peter's rules |
| ACT | Yes | Yes — `calm-before-closeness`, `opening-heart`, `staying-grounded`, values journey; North Star + Deep Why | **Yes** | North Star → Deep Why → reason → mission is the most complete chain in the product |
| CBT | Yes | Partly — story recipe's "inner turn"; `absolute_about_partner` challenge | **Partly** | No thought–feeling–behavior practice in missions; the "Translator" named as a CBT feature in the skill only softens wording |
| Positive Psychology | Yes | Yes — `deepening-good`, appreciation ladder, capitalization micro-primes | **Yes** | The skill lists "Relationship OS Score" as a Positive Psychology feature — that score is not a positive-psychology measure (§5) |
| Attachment Theory | Yes | Yes — trait inference, `attachment-healing` journey, tone hints | **Yes (as personalization)** | Delivered as tone and story shaping, never shown as a label — correct per §2. `/translator` asks the user to pick an attachment-style card for their partner ("Needs space"); plain words, but it is still a label on an absent partner |
| IFS | Yes | Yes — `mixed-feelings`, `healing-old-wounds`, "part of you" phrasing | **Only inside journeys** | No mission or Peter mode uses parts language |
| Mindfulness | Yes | Yes — `staying-grounded`, Stabilize mode's single breath | **Partly** | |
| NVC | Yes | Partly — `shared-language` | **No** | The `/translator` prompt is "rewrite softer" — no observation / feeling / need / request structure. No mission practices a clear request |
| Somatic regulation | Yes | Yes — Stabilize mode, Conflict First Aid breathing | **Yes** | Correctly anchored without polyvagal claims |
| Narrative Therapy | Yes | Partly — weekly mirror, Day-30 mirror, growth arcs, graduation report | **Partly** | Re-authoring happens at milestones; externalizing the problem is not used day to day |
| DBT-informed skills | Yes (2026-10-01) | Tags only — `calm-before-closeness`, `safe-in-love` carry `'dbt'` | **No distinct delivery** | Stabilize mode overlaps with distress tolerance; no skill such as a clear ask (DEAR MAN-style) or "pause and agree when to return" exists as a practice |
| Transactional Analysis | Yes (2026-10-01) | **None** in product content | **No** | Only in `modalities-therapeutic.md` §8 |
| Ethical influence (supplementary) | Yes | Yes | **Yes** | Well guarded: provenance on mission ideas, "not anymore" retirement, eval specs |
| PPR / capitalization (relationship science) | Micro-prime metadata only | Yes — `src/data/micro-primes.ts` | **Yes** | Not in the approved list; they are research constructs, used as content topics — worth naming in the skill so the doctrine matches the product |

## 4. Overlapping exercises

The same handful of skills appear in four or five places with different words and no shared record of what the user has practiced:

| Skill | Where it appears |
|---|---|
| Listening before answering / reflecting back | `BASE_CONCEPTS[0]`, `TRACK_CONCEPTS.communication[0]`, micro-prime `ppr-understood`, mission `curiosity` step 3, `communication` and `healing-old-wounds` journeys |
| Pause before reacting / time-out | `BASE_CONCEPTS[3]`, `TRACK_CONCEPTS.conflict_repair[0,4]`, Conflict First Aid reset protocol, Stabilize mode, `staying-grounded` |
| Apology without "but" / repair | `BASE_CONCEPTS[8]`, `TRACK_CONCEPTS.conflict_repair[2]`, `TRACK_CONCEPTS.communication[6]`, mission `repair` ladder, Conflict First Aid starters |
| Appreciation | `BASE_CONCEPTS[1,4,12]`, mission `appreciation` ladder, `deepening-good`, capitalization primes |

The overlap itself is fine — repetition is how skills form. The gap is **continuity**: the daily concept changes every day by day number, and `suggestMission` (step 3) starts a *new* skill once the user has tried one, even if the first is not yet easy. Nothing links "you practiced listening on Tuesday's mission" to Wednesday's story.

## 5. Measurement and unsupported claims

### The composite score (`src/lib/server/relationship-score.ts`) — confirmed still true

| Sub-score | Built from | Problem |
|---|---|---|
| `communication_quality` (25%) | 60% share of 7 days with an evening reflection **longer than 20 characters**; 40% days with any **Peter usage** | Measures app usage and reflection length, not communication |
| `repair_speed` (30%) | Average `repair_duration_minutes` of logged conflicts; 50 if none | Faster logged reconciliation is not proof of good repair; no conflicts logged ≠ neutral |
| `emotional_safety` (20%) | Inferred `emotional_state` (thriving 90 / neutral 60 / struggling 30) minus 15 per `safety_events` row | A model's mood guess is not safety; *not* logging a safety event does not establish safety, and seeking help lowers the score |
| `ritual_consistency` (25%) | Completed sessions ÷ 7 | Practice activity, reasonable as such — but folded into a "relationship" number |

Fewer Peter conversations *lower* the score, which contradicts constitution §10 ("a user who eventually needs Peter less … may be succeeding"). The weights are arbitrary. It is written to a `relationship_scores` table that no migration in this repo creates, and averaged on `/api/admin/kpis`. No user sees it.

### CSI-4 (`CsiBaseline.tsx`, `CsiPulseCard.tsx`, `CsiTrajectoryCard.tsx`)

The Couples Satisfaction Index (Funk & Rogge, 2007, *J. Family Psychology* 21:572–583) is the right kind of instrument and is scored correctly (0–6 + 3 × 0–5 = 0–21). But **all four items and their response labels are paraphrased** — e.g. item 1's anchor scored 3 is "Happy" in the original and "Even" in Sparq; item 2 ("I have a warm and comfortable relationship with my partner", rated *true*) became a "how … day to day" question. The results are not comparable to the validated scale while the card says "Measured with the CSI-4". The Day-14 copy adds causal or unsupported lines ("small compounds", "most of what you practiced works underneath the surface first").

### Other claims to correct

| Where | Claim | Issue |
|---|---|---|
| `src/pages/journeys/conflict-resolution.tsx:148` | "The ability to repair in real-time is the strongest predictor of relationship success." | Overstated; repair is *one* well-supported predictor in Gottman's observational work |
| `src/pages/trust-center.tsx:457` | relationship quality is "the single strongest predictor of long-term health and happiness" | Overstated paraphrase of the Harvard Study of Adult Development |
| `src/data/micro-primes.ts` (`cap-good-news`) | responding to good news matters "as much as how you handle fights" | Stronger than Gable et al. (2006) supports |
| `src/pages/journeys/intimacy.tsx:132` | a nightly check-in makes intimacy "deepen predictably" | No basis for "predictably" |
| `src/data/micro-primes.ts` header comment | Gollwitzer's effect is "the single most robust effect in behavior-change research" | Internal only, but overstated; cite the meta-analysis (Gollwitzer & Sheeran, 2006) instead |
| `src/lib/server/growth-moments.ts` `csi_delta` | "meaningfully risen" | No minimal-important-difference is established for CSI-4 in this context; say "rose by N points" |

Content with real, cited figures (Lehmiller's fantasy survey; the newlywed bids study, introduced as "one Gottman study") is acceptable as written.

## 6. Opportunities (and where they are addressed)

| # | Opportunity | Slice |
|---|---|---|
| 1 | Separate practice activity, the user's own answers and tentative inferences; stop presenting the composite as relationship health; keep history | Phase 2 |
| 2 | Restore the CSI-4's original wording and scoring; honest before/after copy; add a short, clearly-informal check-in (goal progress, heard and respected, hard topics, repair, practice usefulness) | Phase 2 |
| 3 | Give each practice its source approach, skill, intended outcome, context, intensity, limitations and follow-up question — on the existing ladders, not a new content system | Phase 3 |
| 4 | Repeat a skill across situations before moving on; change or pause a practice the user says didn't help or felt like too much; link the daily story to the skill being practiced | Phase 3 |
| 5 | Add the missing skill practices the doctrine already names: a clear request (NVC/DBT), pausing and agreeing when to return (Gottman/DBT), one value-aligned action (ACT) | Phase 3 |
| 6 | Make Peter's MI-consistent moves explicit: double-sided reflections, confidence and barriers, ask-permission before information, summaries — and stop asking "why" once something meaningful lands (Deep Why excepted) | Phase 4 |
| 7 | IBCT-informed cycle questions, self-compassion after a setback or regret, solution-focused "when was it a little better?" | Phase 5 |
| 8 | Transactional Analysis has no delivery; either give it one small, descriptive use or mark it "reference only" in the skill | Open — needs Chris |
| 9 | `/translator` doesn't use Peter's shared rules or NVC structure, labels the absent partner by attachment card, and does not check sign-in before calling OpenRouter | Open — outside this task's scope |
| 10 | Unsupported claims in §5 | Phase 2 (measurement copy); journey/trust-center lines are listed for Chris — journeys are under open PR #62 |
