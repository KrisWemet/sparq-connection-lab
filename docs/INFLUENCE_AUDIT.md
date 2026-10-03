# Influence Audit — "Discovery before direction. Agency before influence."

**Date:** 2026-09-30 · **Against:** `docs/CONSTITUTION.md` v1.1 (§1, §2, §5, §5A, §6A, §10, §12)
**Scope:** every Peter prompt in `src/lib` and `src/pages/api`, user-facing copy in `src/`, all skills in `.claude/skills/`, `CLAUDE.md`, and the root/`docs` specs.
**Method:** targeted searches for presupposition rules, identity assignment, urgency/scarcity, obligation framing, statistics and social proof, authority-as-reason, emotion claims, covert/steering language and partner steering, then reading each hit in context.

**Status (updated 2026-09-30):** guidance fixed in the first pass (section A); the copy clean-up and the two high-severity app findings were fixed in the follow-up (✅ in section B). B4–B9 (Peter prompts) were fixed in the third pass: permission-first interpretation, the resistance protocol in `PETER_SHARED_RULES` and a deterministic `pushback` signal in `conversation-mode.ts`, evoking the user's own reasons, presupposition only for chosen directions, no assigned identity lines, and the daily action framed as an invitation. Live replies still need a manual run of `docs/evals/resistance-handling.md` on a preview with an OpenRouter key.

Severity: **High** = directly contradicts a v1.1 rule in something users see or Peter says · **Medium** = pushes against the spirit, or is guidance that would steer future work wrong · **Low** = wording or accuracy.

---

## A. Fixed in this change (guidance / skills / docs)

| # | Where | Conflict | Fix |
|---|---|---|---|
| A1 | `language-framework.md` §3 | "Never ask 'do you want to' — always presuppose… how, not whether" | Presupposition only after the user chose; "whether" and permission questions required before |
| A2 | `language-framework.md` §4 | Options must "both move forward (no stay-stuck option)" | "Not now" is agency, allowed when the user hasn't chosen |
| A3 | `language-framework.md` §8 | Peter "quietly make[s] staying stuck feel less interesting" | Open invitation, at the user's pace; resistance = information |
| A4 | `language-framework.md` Stories | Stories work because readers "stop arguing back" | Stories let people try ideas on and stay free to disagree |
| A5 | `language-framework.md` Seven Whys | "That's what Peter works with. That's the pull." | The answer is a user-owned reason; stop anytime; not an interrogation |
| A6 | `language-framework.md` R→B→D | Breath as "the installation step"; declaration assumed | "Settling step", skippable; declaration only if the user wants |
| A7 | `language-framework.md` Memory | "Peter remembers everything"; never mention past commitments | Remembers what matters; may ask if a commitment still holds; "not anymore" respected |
| A8 | `language-framework.md` Return | "People who don't care don't come back" (×2) | "You chose to come back…" |
| A9 | `language-framework.md` | No rules for influence or pushback | New sections: *Ethical Influence Language* (7 principles, say / never say) and *When the User Pushes Back* |
| A10 | `modalities-applied.md` §12 | Reciprocity as debt; scarcity as "daily urgency"/premium scarcity; social proof "other couples…"; authority "Research shows…" | Rewritten per §5A: freely chosen generosity, genuine context only, grounded normalization, evidence with uncertainty; hook-model mechanics excluded; behavioral-understanding limits |
| A11 | `modalities-applied.md` §7 | Unsourced "15-25%" gratitude effect; unsourced "Research shows" | Real citations with hedging |
| A12 | `CLAUDE.md` Psychological Content Design | "Always presuppose forward movement — never ask 'do you want to'" | Governing rule + two-phase guidance, self-persuasion, resistance, no fabricated proof/urgency/emotion claims |
| A13 | `sparq-psychology/SKILL.md` | "Covert Growth Principle — change without feeling like they're being changed"; notification "I've been thinking about you" for anxious users; Influence row "partner accountability" | "Transparent Growth Principle"; no emotion claims; ethical-influence row |
| A14 | `question-bank-patterns.md` | Commitment "leverages consistency bias"; unsourced "25% higher satisfaction" | Self-originated commitment + own reason, revisable; hedged claim |
| A15 | `peter-copy-library.md` | "I missed you"; "Most people don't make it this far. You're not most people"; "your partner feels it too"; "most people… stop"; "I'm so proud of who you're becoming"; "I can feel it" | Warm lines without emotion claims, comparison or speaking for the partner |
| A16 | `SPARQ-PSYCHOLOGY-MODALITIES.md` (root) | "92% of couples…" social proof example; "Notice what comes back" reciprocity; "Users don't realize they're being assessed" | Grounded normalization; generosity for its own sake; hypotheses the user can see and correct |

---

## B. App code & copy — needs a change later (not modified now)

| # | Where | What conflicts | Sev. | Proposed fix | Step |
|---|---|---|---|---|---|
| B1 ✅ | `src/pages/api/daily/session/evening-checkin.ts` (`ARC_DEFAULT_STATEMENTS`) | Advances an identity "arc" on a schedule and writes Peter-authored "I'm becoming someone who…" statements the user never chose (§1, §5A Commitment, identity only for user-named identities) | **High** | **Fixed:** arc advances as a practice marker only; no assigned statement is written. `IdentityArcCard` shows the user's own North Star words or an open invitation, and ignores old assigned statements | done |
| B2 ✅ | `src/pages/api/me/graduation-report.ts` | Feeds raw inferred traits to the model and asks Peter to declare "what I learned about you" and a "relationship superpower" (§2 hypotheses; §9 user completes interpretation) | **High** | **Fixed:** only user-confirmed traits reach the model; every field is phrased as a guess tied to what they said, growth ends with a question, next focus is an open question; UI labels say "guesses — you're the judge" | done |
| B3 ✅ | `src/components/journey/PersuasiveJourneyPrompt.tsx` | Emphasized embedded commands, fabricated "3x faster", clinical "insecure attachment", a made-up testimonial. *Correction: the first pass called this dead code — it is used by `/journey-start` (an unlinked route).* | Medium | **Fixed:** open reflection questions, plain descriptions of what each journey covers, testimonial removed, honest upgrade copy | done |
| B4 ✅ | `src/lib/peterService.ts:234` (morning story prompt) | "Use one presupposition that assumes forward movement" applied to a daily action Peter picked, not the user | Medium | Presuppose only the user's chosen direction; bridge question as open invitation | 14 |
| B5 ✅ | `src/lib/peterService.ts:236, 224` | "The user should leave feeling… This is becoming like me" — identity reinforcement toward an identity the user didn't name | Medium | Tie identity lines to the user's North Star/identity statement when one exists; otherwise none | 14 |
| B6 ✅ | `src/lib/peterService.ts` (story "Today's Action"), daily micro-action | Daily action is assigned homework; §5 prefers user-created experiments | Medium | Offer the action as a suggestion with "or try your own" that can become an experiment + reason | 13–14 |
| B7 ✅ | `src/lib/peterService.ts` `PETER_SHARED_RULES` (Reflect mode) | Reflections offered directly ("I might be off, but…") without the permission step §5 now prefers for substantive interpretations; no explicit resistance protocol or "evoke reasons" | Medium | Add permission phrasing, resistance protocol (§6A), and "What makes this matter to you?" at Connect/Choose; run `docs/evals/resistance-handling.md` | 14 |
| B8 ✅ | `src/lib/server/pattern-hints.ts:165+` (`INSIGHT_SKELETONS`) | "I've noticed you tend to…" — now tentative and gated, but still stated observations rather than permission-first | Low | Wrap as "Want to hear something I've noticed?" | 14 |
| B9 ✅ | `src/lib/peterService.ts:276` (evening reflection prompt) | "A warm identity line that helps the user see their growth" — Peter-chosen identity | Low | Same rule as B5 | 14 |
| B10 ✅ | `src/lib/peterService.ts` + `trait-gaps.ts` steering hints | Story content steered to reveal trait signals, "don't make it obvious". Approved "quiet assessment" and passes the transparency test, but the wording invites covertness | Low | **Fixed:** "Story idea… it's still an ordinary story, not a test". Still open: a Trust Center line that stories vary to help Peter learn | done |
| B11 ✅ | `src/data/quizData.ts:23, 101, 242, 308` | Unsourced/overstated claims: "25% higher satisfaction", "feel closer within 24 hours", "#1 predictor", "even one session… increases felt closeness for days" (§5A Authority, §12) | Medium | **Fixed:** softened/hedged with real citations (Algoe 2012; Gottman, *The Relationship Cure*) | done |
| B12 ✅ | `src/components/journey/JourneyContentView.tsx:140, 146` | "The couples who transform… are the ones who…" (comparison) and "This kind of relational fluency is rare" (flattery/scarcity) | Low | **Fixed** | done |
| B13 ✅ | `src/pages/journeys/trust-rebuilding.tsx:172`, `src/data/starter-journeys/deepening-good.ts:117` | "Couples who successfully rebuild trust often report…", "The couples who last…" — unsourced social proof | Low | **Fixed:** "Some couples… That isn't everyone's path" / no comparison | done |
| B14 ✅ | `src/pages/journeys/fantasy-exploration.tsx:30` | "97% of adults have sexual fantasies" — plausibly real (Lehmiller, 2018) but uncited; used well (reduces shame) | Low | **Fixed:** cites Lehmiller (2018) | done |
| B15 ✅ | `src/pages/subscription.tsx:83` | "Conflict First Aid when things get hard" listed as a paid feature, while chat says it's always available — a de-escalation tool shouldn't look paywalled | Low | **Fixed:** listed as "Conflict First Aid, always free" | done |

| B16 ✅ | `src/pages/subscription.tsx` "What Our Users Are Saying" | Three made-up testimonials ("Chris & Pat", "Morgan & Jamie", "Alex & Jordan") with invented tenure — missed by the earlier testimonial clean-up (#20) and by the first audit pass | **High** | **Fixed:** section removed | done |

**Checked and compliant:** forgiving two-track streak copy in `daily-growth.tsx` (no loss framing; "N in a row" only while live); `SharePrompt` ("Do you want to keep it private…" is a correct *whether* question); onboarding openings ("tell me if I'm off"); `CsiTrajectoryCard` (explicitly no urgency); crisis/help-now flow; North Star ladder (distills the user's own words and asks "Did I get that right?"); growth-moment block ("never declare what it means").

---

## C. Other docs (archival — no edit, noted for readers)

| Where | Note |
|---|---|
| `CURRENT_STATE.md` streak "dopamine kick" (Master PRD decision 4) | Compatible with §10 only while a miss is never framed as a loss — current copy complies; any future "don't break your streak" copy would fail |
| `docs/superpowers/specs/2026-03-25-public-beta-readiness-design.md:35` | "Q6-Q9 lack presupposition" — pre-v1.1 critique; presupposition is now only for chosen directions |
| `OLD_PRD.md`, `SPARQ_MASTER_SPEC.md`, `Sparq_build_Spec.md`, `REFERENCE_UNIFIED_PRD.md` | Historical; the constitution wins where they disagree |

---

## D. Constitution v1.2 (2026-10-01) — what changes for this audit

v1.2 replaces v1.1's gate ("no influence before the user chooses") with **process influence** (any stage, open, in the user's interest) vs. **destination influence** (only toward a user-chosen target). Every B-item above concerned destination influence — assigned identities, presupposed directions, fabricated proof, urgency, assigned homework — so **none of the fixes is undone**; all remain required under v1.2. B6 (daily action as invitation) stays: v1.2 Real-World Missions are suggestions the user accepts or reshapes, not homework.

New alignment work for v1.2 (leading the path, values–behavior challenge, stabilization, setbacks, Deep Why chains, missions, identity evidence, priming tiers) is tracked in `docs/TRANSFORMATION_ENGINE.md` §3, not here. The two-track streak's consecutive "dopamine" track is flagged there for review (C12).

---

## Summary

- **16 guidance conflicts fixed** (A1–A16).
- **16 app findings** (B1–B16): all fixed (B1–B3, B10–B16 in the second pass; B4–B9 in the third).
- Next: run the 14 resistance cases against live Peter (needs an OpenRouter key), User-owned reasons (step 13), the rejected-hypothesis store (step 12) and the user-visible Insight Profile page (step 15, user-set part) shipped 2026-09-30; inferred Insight Profile facets wait for real usage data.

---

## D. v1.2 reconciliation (2026-10-02) — doctrine only

**Against:** `docs/CONSTITUTION.md` v1.2. **Changed:** documentation and skills only; no application code, migrations or UI.

| # | Conflict found | Where | Resolution |
|---|---|---|---|
| D1 | v1.1's gate allowed **no** influence before the user chose a goal — which forbade making reflection inviting, courage approachable or progress visible | constitution §1, §2, §5A, §6 (Act), §6A, §9 (Days 8–14), §13; language framework governing rule; `modalities-applied` §12 | Split into **process influence** (any stage, transparent, names the process state it serves) and **direction influence** (only toward a user-chosen destination, with provenance). "Agency before influence" kept with that precise meaning |
| D2 | Peter defined as a "guided-discovery engine", "not a persuader" — read as passive/agreeable | constitution §5 | Peter is a growth *guide* who **leads the path**; challenge, hard questions, missions and follow-up are expected. Advice-first stays a fallback; deciding destinations stays forbidden |
| D3 | Two competing loops: v1.1 "core product loop" and the psychology skill's Change Chain / Learn→Implement→Reflect | constitution §1; `sparq-psychology` | One unified Sparq loop (§1) + the Transformation Engine (§1A); the Change Chain and Daily Loop are documented as its compressed daily form |
| D4 | "Ethical Influence" listed as modality #12, a peer of the therapeutic frameworks | `CLAUDE.md`, `sparq-psychology` §2, `modalities-applied` | Modalities are the **foundation** (§1B); influence, behavioral observation, priming and behavior design are a **supplementary layer**. Row kept (for content tags) but labeled supplementary |
| D5 | "Users don't realize they're being assessed" | `sparq-psychology` §3 | Woven into content, not hidden: guesses are visible on the Insight Profile and explained on request |
| D6 | Day-14 "profile reveal — retention moment ('Here's what I've learned about you')" | `sparq-psychology` §3, §5 | Day-14 Growth Reveal = first milestone; evidence + guesses as maybes; user interprets; not a retention device |
| D7 | Partner reflections shared as "AI-synthesized blends"; partner synthesis described as live | `sparq-psychology` §6, `sparq-architecture` (flow + privacy constraint), `modalities-therapeutic`/`-applied` EFT & attachment | Corrected to constitution §8 / `RELATIONSHIP_MODEL.md`: nothing private reaches the partner, not even blended; cycles named in `/us` when both confirm |
| D8 | Peter claims human feelings ("I'm so proud of you", "I missed you", "I believe in you", "your relationship is feeling this") | `sparq-peter` SKILL (A15 had fixed only the copy library), `peter-poses.md`, two copy-library lines | Rewritten as evidence + question, or warm lines without emotion claims |
| D9 | Identity narrated by Peter ("I've watched you learn to wait with trust") | `sparq-psychology` §1, `modalities-therapeutic` EFT | Evidence first, then the user's meaning ("Does that change how you see yourself?") — §1A identity change |
| D10 | Seven Layers of Why wording | language framework | Superseded by Chris's 2026-10-01 decision, reconfirmed 2026-10-02: Peter asks "Why is that important to you?" seven times; the user can stop, and overwhelm ends it at once (constitution §5B) |
| D11 | Notification frequency set by Sparq per attachment style vs. "reminders the user chose, at times they chose" | `sparq-psychology` §4 vs `modalities-applied` | Column relabeled "suggested default — the user sets the real one" (push notifications remain out of beta) |
| D12 | Assigned archetype framing could outrank the user's own identity words | `sparq-psychology` §3 | Archetype is the user's revisable pick; their own identity statement / North Star takes priority |
| D13 | Return thought "What will I understand about myself today?" is insight-only | constitution §10 | Adds "What happened when I tried it?"; engagement from real-world success; time-in-app not a goal |
| D14 | Priming not acknowledged, while "no hidden commands" existed — unclear whether ambient design influence was allowed | constitution §5A; language framework | Priming explicitly allowed for process states and the chosen direction, open and explainable; hidden commands stay banned; never toward major life outcomes |
| D15 | No rule on major life outcomes | constitution | §5A: Sparq never steers stay/leave/forgive/reconcile/children/end-contact, openly or covertly; safety is not steering |
| D16 | DBT and Transactional Analysis reported as "not approved" | first v1.2 pass | Wrong: Chris approved both on 2026-10-01 (constitution §1B). "NLP" label stays retired; Polyvagal stays a lens |

**Checked and compatible (kept as is):** resistance protocol and `docs/evals/resistance-handling.md`; Behavioral Baseline and Insight Profile limits; reciprocity, social proof, authority, liking and scarcity rules (re-stated in v1.2 §5A, unchanged in substance); forgiving streak and return-after-absence language; private/shared boundaries; the user-owned-reasons model.

---

## E. v1.2 doctrine cleanup (2026-10-02, second pass) — doctrine and eval spec only

**Changed:** documentation, skills and eval specs only. No application code, migrations, UI or tests.

### Fixed

| # | Stale or conflicting guidance | Where | Resolution |
|---|---|---|---|
| E1 | "Never ask 'do you want to proceed?'", "Both options must move forward… no stay-stuck option" (the pre-v1.1 rule) | `sparq-ui` SKILL §1, §4 | Rewritten: "how" choices only after the user chose; otherwise a real "not now" |
| E2 | Eight deleted components documented as live, incl. StreakIndicator with "embedded command text" and streak-triggered upsells, PartnerSynthesisCard, HeartbeatButton | `sparq-ui/references/component-catalog.md`, `design-tokens.md` | Entries removed; replaced by a pointer to the real cards + card/progress/celebration doctrine |
| E3 | No visual-priming rules in the UI skill | `sparq-ui` SKILL | New "process yes, direction no" section; imagery rule aligned with `CLAUDE.md` (golden-hour metaphors, never people) and no outcome-implying imagery |
| E4 | Partner synthesis described as live; partner-visible RLS pattern for it; Mem0 as the memory system | `sparq-db` SKILL + `rls-policies.md` + `schema.md`; `sparq-architecture` SKILL + `architecture-overview.md`; `sparq-testing` SKILL + `test-fixtures.md`; `sparq-peter` poses + copy library; `sparq-skill-creator`; `modalities-therapeutic`/`-applied` | Rewritten to the `/us` model; deprecated tables named once as "never use"; memory is pgvector |
| E5 | RLS doc says partners can read each other's traits ("for conflict guidance") | `sparq-db/references/rls-policies.md` | Owner-only, citing the live boundary check (`rls_boundaries.sql`: B sees A traits = 0) |
| E6 | Realtime documented for partner presence and partner progress | `sparq-db` SKILL, `sparq-architecture` SKILL, `sparq-testing` | Not used today; if added, only for explicitly shared data — never a partner's private activity |
| E7 | Testing skill: "ALWAYS write tests — don't wait to be asked"; "Vitest NOT installed" | `sparq-testing` | Aligned with `CLAUDE.md`: propose, ask Chris before adding; Vitest is installed (`tests/`) |
| E8 | Fixtures/copy that declare traits or claim feelings ("your need for reassurance is actually a strength", "I'm not going anywhere", "I've been thinking about you") | `test-fixtures.md`, `sparq-testing`, `personality-adaptation-guide.md` | Guesses with questions; warm lines without feeling claims |
| E9 | Unsourced or overstated research ("3x more durable", "#1 predictor", bare 86%/33%, "research shows… significantly happier") | `exercise-templates`, `question-bank-patterns`, `modalities-therapeutic`, `personality-adaptation-guide` | Hedged and cited (Gottman & DeClaire 2001), or softened to what research suggests |
| E10 | `SPARQ_MASTER_SPEC.md` claims to be "the authoritative source of truth… takes precedence"; describes partner synthesis, a Couple's Cycle Map from both partners' private traits, Peter-narrated identity ("I've watched you… that's who you're becoming"), "silent" profiling, a Translator reading the partner's traits, and a Forgiveness Module framed as the "#1 blocker" | `SPARQ_MASTER_SPEC.md` | Precedence now defers to the constitution; sections rewritten to `/us`, evidence-led identity, transparent learning, user-typed Translator context, and an optional forgiveness path that never presumes forgiveness |
| E11 | `SPARQ-PSYCHOLOGY-MODALITIES.md` claims to be "the psychology source of truth"; influence-first positioning; public-commitment pressure; "therapist endorsements"; archetype identity lines; Day-14 retention moment | `SPARQ-PSYCHOLOGY-MODALITIES.md` | Demoted to background beneath the constitution and skill; conflicting lines rewritten |
| E12 | `SPARQ-VISION.md`: "Trojan Horse" onboarding, silent profiling, mastery-gated upsells, Translator using the partner's profile with clinical labels | `SPARQ-VISION.md` | Rewritten as a short v1.2-aligned brief |
| E13 | `architecture-overview.md` says the Master Spec wins over every file; `LAUNCH_CHECKLIST.md` / `IMPLEMENTATION_STATUS.md` name it "source of truth" | those files | Precedence corrected |
| E14 | Deleted streak components described as pending cleanup; streak framed as a "dopamine kick" | `CURRENT_STATE.md` | Marked deleted; reframed as a celebration beat (constitution §10) |
| E15 | Mission ownership required the user to state a reason before a suggestion became theirs | constitution §1A/§6/§6A/§9, `PERSON_MODEL.md` §8.5, `modalities-applied`, language framework, Peter skill | **Explicit choice** makes it theirs; a reason is connected when useful, never a toll gate |
| E16 | Process vs. direction influence defined only by example | constitution §5A (+ `CLAUDE.md`, language framework, `sparq-ui`) | Defined by what each *does*, with a per-surface table and a four-question test |
| E17 | Which documents give instructions was implicit | `CLAUDE.md` | One doctrine map: active rules → references → snapshots → historical |

### Decisions (Chris, 2026-10-02)

- **O1 → opt-in only.** A partner sees that the other completed a day only if that person opts in. (Nothing in the app shows it today.)
- **O2 → "Share with partner" button, never automatic.** Built: the day-complete screen offers `SharePrompt` with tonight's reflection; private by default.
- **Tests for the new Peter modes → approved.**

### Still open

| # | Question | Why it matters |
|---|---|---|
| O3 | **Relationship OS Score** / CSI trajectory: a score shown to the user is process influence (visible progress) if it is never a grade or comparison. Confirm wording and that it is never shown to the partner. | Progress displays vs. grading (§5A, §11) |
| O4 | Historical docs (`OLD_PRD.md`, `REFERENCE_UNIFIED_PRD.md`, `Sparq_build_Spec.md`, `audit_report_sprint1.md`, `docs/superpowers/`, `.planning/`) were classified as historical in `CLAUDE.md` but not rewritten. Archive them to a folder, or keep in place? | Fewer places for future agents to pick up superseded rules |
