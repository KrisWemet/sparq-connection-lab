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

## Summary

- **16 guidance conflicts fixed** (A1–A16).
- **16 app findings** (B1–B16): all fixed (B1–B3, B10–B16 in the second pass; B4–B9 in the third).
- Next: run the 14 resistance cases against live Peter (needs an OpenRouter key), then constitution §14 steps 12–13/15 (Insight Profile, user-owned reasons, rejected-hypothesis store).
