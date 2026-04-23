# Sprint 1 Audit Report

Generated: 2026-04-22
Branch: sprint/1-framework-audit

---

## Summary

| Category | Hits | Files affected |
|---|---|---|
| NLP (direct brand name) | 13 | 8 files |
| NLP (technique sub-patterns: reframing, influence/persuasion, etc.) | 10 | 7 files |
| Polyvagal-related (polyvagal, Porges) | 3 | 3 files |
| Anchor references (all, classified below) | ~55 | 12 files |
| Framework/modality data structures | 9 | 6 files |
| PsychologyModality type definition | 1 | 1 file (`src/types/quiz.ts`) |

**Framework data structures to update:**
- `src/types/quiz.ts` — `PsychologyModality` type includes `"Influence & Persuasion"` (not yet in spec's revised eight pillars)
- `src/lib/onboarding/deriveProfile.ts` — derives modality lists; uses `EFT`, `DBT`, `ACT`, `IFS`, `Somatic`, `NVC`, `Gottman`, `Positive Psychology` (all fine per spec)
- `src/data/starter-journeys/types.ts` — `modalities: string[]` field on `StarterJourney` (untyped; safe but worth noting)
- `src/data/quizData.ts` — uses eight modality values (none are NLP); one `therapeuticIntent` uses "anchoring" in Preferred-state sense
- `SPARQ-PSYCHOLOGY-MODALITIES.md` — internal doc; lists "Influence & Persuasion" as modality 3.12 and contains one "Light NLP" mention
- `.claude/skills/sparq-psychology/references/modalities-applied.md` — skill file; lists Polyvagal Theory under Somatic; lists "Influence & Persuasion Psychology" as framework 12

**User-facing copy files to update:**
- `Path to Together/emotional-intelligence.md` — lists "Polyvagal Theory" as a journey foundation
- `public/Path to Together/emotional-intelligence.md` — same file, public copy
- `src/lib/peterService.ts` — Peter AI prompt includes "Reframing the Narrative" technique (needs retag to Cognitive Reappraisal)
- `SPARQ-PSYCHOLOGY-MODALITIES.md` — Porges citation as settled science in co-regulation content (line 739)

**Not in scope / excluded from audit:**
- `sparq_science_upgrade_package/` — the spec files themselves; they contain NLP/Polyvagal as subjects of discussion, not as live app claims
- `node_modules/`

---

## Detailed Findings

### NLP references

**Direct brand name "NLP"**

- `SPARQ_MASTER_SPEC.md:1401` — "Track specific micro-behaviors in evening reflections via NLP in profile-analysis" — NLP here means Natural Language Processing (text analysis), NOT Neuro-Linguistic Programming. Context: behavioral specificity feedback section tracking repair attempts, vulnerability, de-escalation. **CLASSIFY: NLP-AS-NATURAL-LANGUAGE-PROCESSING — no rebrand needed**

- `SPARQ-PSYCHOLOGY-MODALITIES.md:537` — "Light NLP: Identity reinforcement ('As a Growth Seeker, you...') — no embedded commands" — In the "Tone & Voice / Content Generation Rules" section. This IS a Neuro-Linguistic Programming reference. The technique itself (identity reinforcement / archetype framing) is valid and maps to "Identity-Based Habit Formation" per James Clear / Atomic Habits. **CLASSIFY: NLP-AS-BRAND — needs rebrand to "Identity-based framing (James Clear, Atomic Habits)"**

- `docs/superpowers/specs/2026-03-23-onboarding-design.md:111` — `growthGoal: string // free text, used for NLP intent` — Code comment in a schema definition; "NLP" likely means natural language processing (intent parsing). **CLASSIFY: NLP-AS-NATURAL-LANGUAGE-PROCESSING — no rebrand needed; if intent is to parse the text via AI, the comment is accurate**

- `OLD_PRD.md:369` — "Sentiment analysis and NLP pipelines" — In a technical AI/ML components section of the old PRD. NLP = Natural Language Processing. **CLASSIFY: NLP-AS-NATURAL-LANGUAGE-PROCESSING — no rebrand needed; document is OLD_PRD (archived)**

- `CLAUDE.md:19` — Table row: `| Language, copy, NLP patterns, voice | .claude/skills/sparq-psychology/references/nlp-language-framework |` — Refers to the skill file that implements Sparq's language design system. The file is titled "Sparq NLP & Language Framework" in the NLP-as-programming-of-mind sense. **CLASSIFY: NLP-AS-BRAND — the skill file name and CLAUDE.md reference both need updating per §2.1 of the upgrade spec**

- `CLAUDE.md:26` — "If you are writing any user-facing copy — also load the NLP language framework." **CLASSIFY: NLP-AS-BRAND — same as above; update after renaming the skill file**

- `CLAUDE.md:96` — "Language and tone for all session copy: see NLP language framework." **CLASSIFY: NLP-AS-BRAND — same**

- `CLAUDE.md:619` — "Load the NLP language framework (.claude/skills/sparq-psychology/references/nlp-language-framework) before writing any copy" **CLASSIFY: NLP-AS-BRAND — same**

- `CLAUDE.md:634` — "Full framework: .claude/skills/sparq-psychology/references/nlp-language-framework" **CLASSIFY: NLP-AS-BRAND — same**

- `docs/superpowers/plans/2026-03-26-public-beta-readiness.md:5` — "rewriting onboarding questions for NLP compliance" — Means compliance with Sparq's internal language framework (pull language, presuppositions). **CLASSIFY: NLP-AS-BRAND — historical plan doc; not a live code reference; low priority**

- `docs/superpowers/plans/2026-03-26-public-beta-readiness.md:320` — Git commit message: `"feat: rewrite onboarding questions for NLP compliance"` — Same as above. **CLASSIFY: NLP-AS-BRAND — historical plan doc; no action needed**

- `docs/superpowers/specs/2026-03-25-public-beta-readiness-design.md:29` — "violates the NLP Language Framework in several ways" **CLASSIFY: NLP-AS-BRAND — historical spec doc; no action needed**

- `.claude/skills/sparq-psychology/SKILL.md:153` — "Identity reinforcement through archetypes ... uses light NLP — no embedded commands" **CLASSIFY: NLP-AS-BRAND — skill file; needs update per upgrade spec §2.1.4**

- `.claude/skills/sparq-psychology/references/nlp-language-framework.md:1` — File title: "# Sparq NLP & Language Framework" **CLASSIFY: NLP-AS-BRAND — the primary skill reference file; its name and framing need updating**

- `.claude/skills/sparq-psychology/references/nlp-language-framework.md:60` — "This is one of the most powerful NLP tools in Sparq's language system." (referring to presupposition structures) **CLASSIFY: NLP-AS-BRAND — presupposition is valid linguistics/pragmatics; retag to "Linguistic framing / presupposition (standard pragmatics literature)"**

- `.claude/skills/sparq-ui/SKILL.md:537` — "For NLP language patterns and copy rules: see sparq-psychology/references/nlp-language-framework" **CLASSIFY: NLP-AS-BRAND — cross-reference in UI skill file; update after renaming the language framework skill**

**NLP technique sub-patterns**

- `SPARQ-PSYCHOLOGY-MODALITIES.md:74` — "Story reframing & journaling" as description for Narrative Therapy. In this context "reframing" is a general therapeutic term (cognitive reappraisal / narrative re-authoring), not specifically an NLP technique. Narrative Therapy's "externalization" and "re-authoring" map cleanly to validated constructs. **CLASSIFY: NARRATIVE-THERAPY-TERM — no action needed**

- `SPARQ-PSYCHOLOGY-MODALITIES.md:163` — "Cognitive defusion micro-practices (2-minute reframing exercises)" — ACT (Acceptance and Commitment Therapy) content. "Reframing" here = cognitive defusion, which is ACT's validated construct. **CLASSIFY: ACT-TERM — no action needed**

- `src/lib/peterService.ts:64` — "Reframing the Narrative: When a user shares a frustrating story, gently prompt them to rewrite it from the most generous possible interpretation." — This technique as described maps to **Cognitive Reappraisal** (Gross, 2002) and Narrative Therapy's perspective-taking. It is directly in Peter's AI prompt instructions. **CLASSIFY: NLP-ADJACENT — retag label from "Reframing the Narrative" to "Cognitive Reappraisal" in the prompt**

- `OLD_PRD.md:213` — "Reframing and perspective-taking" as a listed conversation capability. **CLASSIFY: ARCHIVE — OLD_PRD is archived; no action needed**

- `public/Path to Together/emotional-intelligence.md:202` — "Some approaches to managing emotions (like deep breathing or reframing)..." — Educational copy using "reframing" as a generic psychological term. **CLASSIFY: GENERIC-THERAPEUTIC-TERM — reframing here is colloquial/educational, not an NLP brand claim. Could optionally replace with "cognitive reappraisal" to align terminology, but not urgent**

- `public/Path to Together/emotional-intelligence.md:256` — "Reframing: 'This is challenging, but not catastrophic'" — Used as an example regulation strategy. Same as above. **CLASSIFY: GENERIC-THERAPEUTIC-TERM — low priority**

- `CLAUDE.md:632` — "Shadow reframing — honoring protective patterns and releasing them when no longer needed" — This is IFS-adjacent (Internal Family Systems). The word "reframing" here is used in a general sense, not as an NLP brand claim. **CLASSIFY: IFS-TERM — no action needed**

- `SPARQ-PSYCHOLOGY-MODALITIES.md:25` and `SPARQ-PSYCHOLOGY-MODALITIES.md:395` — "Influence & Persuasion Psychology" as a named modality (3.12). **CLASSIFY: FRAMEWORK-NAME — not in the revised eight pillars; the techniques within (Cialdini, BJ Fogg, habit formation) map to "Neuroplasticity + Habit Science" in the new architecture. The modality label needs retiring; the content stays.**

- `src/types/quiz.ts:66` — `PsychologyModality` type includes `| "Influence & Persuasion"` — TypeScript type used by quiz questions and weekend activities. **CLASSIFY: FRAMEWORK-NAME — this value is defined in the type but NOT used in any actual quiz question data (quizData.ts does not assign this modality to any question). Still needs removing from the type union to prevent future misuse.**

---

### Polyvagal references

- `Path to Together/emotional-intelligence.md:130` — "Polyvagal Theory: Understanding nervous system responses" — Listed as one of four psychological foundations for the Emotional Intelligence journey. This presents Polyvagal as a settled framework without qualification. **ACTION: Soften to "Nervous System Regulation (informed by Polyvagal Theory as a clinical framework)" per §2.2 of upgrade spec.**

- `public/Path to Together/emotional-intelligence.md:130` — Same as above, public copy. **ACTION: Same softening. This file is served to users.**

- `SPARQ-PSYCHOLOGY-MODALITIES.md:739` — "Research by Stephen Porges shows that co-regulation — calming ourselves through connection with a trusted person — is one of the most powerful ways to reduce stress and build security." — Inside a breathwork/co-regulation exercise. This presents Porges as settled science. **ACTION: Soften attribution — keep the co-regulation content but replace "Research by Stephen Porges shows" with "Decades of research on autonomic nervous system regulation show" and optionally add "(including the clinical work of Stephen Porges)" — this positions it as one lens among many rather than the definitive authority.**

- `.claude/skills/sparq-psychology/references/modalities-applied.md:185` — "Research basis: Peter Levine (Somatic Experiencing), Bessel van der Kolk ('The Body Keeps the Score'), Stephen Porges (Polyvagal Theory). Core insight: the body stores and processes emotional experience." — In the Somatic Approaches section of the skills file. The citation of Porges/Polyvagal here grounds the Window of Tolerance framework. **ACTION: Update to qualify per §2.2 — frame Polyvagal as a "widely-used clinical lens" rather than confirmed neuroscience. The WoT concept itself is well-validated through trauma research.**

---

### Anchor references (full disambiguation)

The word "anchor" appears in approximately 55 places. Below is the complete classification by occurrence category:

**Category A: PETER_ANCHOR — Rehearsal Room UI feature (KEEP — no rebrand needed)**
These are all part of the Rehearsal Room feature where Peter generates a "takeaway sentence" called an anchor. This is a product feature name, not an NLP technique reference.
- `docs/superpowers/specs/2026-04-04-rehearsal-room-design.md` — lines 110, 113, 115–120, 128, 130–131, 137, 150, 251, 255, 260, 265, 268, 288, 318, 330, 341
- `src/pages/rehearsal.tsx` — lines 74, 75, 327, 328, 355, 364, 366, 367, 368, 603, 608, 615, 616, 619, 622, 625
- `src/pages/api/peter/rehearsal/message.ts` — lines 454, 456, 466, 475, 477, 478, 480, 481, 486, 489, 492, 496, 499, 504
- `src/pages/api/peter/rehearsal/complete.ts` — lines 9, 21, 44, 55, 56
- `src/lib/server/generate-greeting.ts:10`

**Category B: GROUNDING-ANCHOR — Mindfulness / somatic grounding (KEEP — valid construct)**
These use "anchor" in the sense of a sensory focus point for attention, which aligns with Mindfulness-Based Stress Reduction and somatic practices. Not NLP anchoring in the classical conditioning sense.
- `src/data/starter-journeys/calm-before-closeness.ts:147` — Story where Nadia uses a cat's stillness as a grounding focus. **KEEP — this is mindfulness-based body awareness, not NLP anchoring**
- `src/data/starter-journeys/calm-before-closeness.ts:149` — "An anchor is anything steady your body can hold onto when your inside world gets loud." **KEEP — mindfulness/somatic grounding**
- `src/data/starter-journeys/calm-before-closeness.ts:153` — "Pick one small, steady thing you can see or feel right now. Let your attention rest on it for five slow breaths. That's your anchor for today." **KEEP — mindfulness**
- `src/data/starter-journeys/calm-before-closeness.ts:157` — "What did you choose as your anchor?" **KEEP — mindfulness**
- `src/data/starter-journeys/calm-before-closeness.ts:236` — "he hadn't told her about the breathing or the anchors" **KEEP — mindfulness**
- `src/data/starter-journeys/calm-before-closeness.ts:253` — "You've found anchors." **KEEP — mindfulness**
- `src/data/starter-journeys/staying-grounded.ts:32` — Day title: "The Storm and the Anchor" **KEEP — metaphor for emotional steadiness**
- `src/data/starter-journeys/staying-grounded.ts:37` — "It means knowing where your anchor is — and holding on." **KEEP — metaphor**
- `src/data/starter-journeys/staying-grounded.ts:39` — "it's about knowing what keeps you anchored." **KEEP — metaphor**
- `src/data/starter-journeys/staying-grounded.ts:47` — "What felt like an anchor for you today?" **KEEP — mindfulness**
- `src/pages/journeys/mindful-sexuality.tsx:57–62` — "Breath as Anchor" — using the breath as a sensory anchor during intimacy. **KEEP — mindfulness**
- `src/pages/journeys/mindful-sexuality.tsx:117` — "'anchor' technique: place your hand on your partner's heartbeat." **KEEP — somatic/mindfulness; note the scare quotes suggest it's being used informally**
- `src/content/journeys/mindful-sexuality.md:12` — "Physical sensations can anchor us in the present moment" **KEEP — mindfulness**

**Category C: HABIT-ANCHOR / VALUES-ANCHOR — Motivation design (KEEP — Wendy Wood / ACT territory)**
These use "anchor" in the habit science sense (ACT values anchoring, James Clear's behavioral cues) or in the sense of grounding motivation in deeper purpose.
- `SPARQ_MASTER_SPEC.md:133` — "'Why does this relationship matter to you at your deepest level?' is the anchor question" **KEEP — ACT values clarification**
- `SPARQ_MASTER_SPEC.md:156` — "Extrinsic motivation (streaks/badges) without intrinsic values anchoring" **KEEP — motivation science**
- `SPARQ_MASTER_SPEC.md:1241` — "Values clarification module — intrinsic motivation anchor" **KEEP — ACT/habit science**
- `SPARQ_MASTER_SPEC.md:1338` — "Anchors the user's daily practice to their deepest why — converting extrinsic motivation to intrinsic" **KEEP — habit science**
- `src/data/quizData.ts:48` — `therapeuticIntent: "Preferred-state anchoring — orienting toward what's possible"` — This is the one hit that sits on the edge. "Preferred-state anchoring" is NLP vocabulary. However, the underlying technique (orienting toward a desired state) maps cleanly to ACT's "valued direction" construct and Positive Psychology's "best possible self" exercise. **CLASSIFY: BORDERLINE — retag `therapeuticIntent` from "Preferred-state anchoring" to "Best possible self / valued direction (Positive Psychology + ACT)"**
- `src/data/quizData.ts:147` — "Behaviorally anchored — they ask about a specific recent moment" — Code comment using "anchored" in the psychometrics sense (behaviorally anchored rating scales). **KEEP — accurate technical term**

**Category D: IDENTITY-ARCHETYPE — "Calm Anchor" archetype (KEEP — no NLP connection)**
- `SPARQ-PSYCHOLOGY-MODALITIES.md:453` — "Calm Anchor — Stability-focused, grounding" — One of four user identity archetypes. This is a product label, not an NLP technique. **KEEP — no rebrand needed**

**Category E: PRODUCT/UI METAPHOR (KEEP)**
- `CLAUDE.md:71` — "Peter is the emotional anchor of the app." **KEEP — product metaphor**
- `src/components/PeterSpeechBubble.tsx:25` — "Peter avatar — small, anchored left" **KEEP — CSS layout comment**
- `src/pages/journeys/attachment-healing.tsx:5,117` — `import { Anchor } from 'lucide-react'` — Lucide icon import **KEEP — UI icon, no semantic meaning**

**Summary: No NLP-sense anchoring (classical conditioning / state triggers) exists in the codebase.** The one borderline case is `quizData.ts:48` ("Preferred-state anchoring") which should be retagged. All other anchor uses are KEEP.

---

### Framework data structures

Files that define or use framework/pillar/modality names as data:

- `src/types/quiz.ts` — Defines `PsychologyModality` as a TypeScript union type with 12 values including `"Influence & Persuasion"`. Used by `Question` and `WeekendActivity` interfaces. This is the canonical type definition for quiz modalities.

- `src/data/quizData.ts` — Uses `PsychologyModality` values on every question. Current values in actual data: `Positive Psychology`, `Mindfulness`, `Gottman Method`, `Emotional Focused Therapy`, `CBT`, `Narrative Therapy`, `Nonviolent Communication`, `Attachment Theory`. Note: `"Influence & Persuasion"` is in the type but NOT used in any actual quiz question data.

- `src/lib/onboarding/deriveProfile.ts` — Runtime function that builds `primaryModalities` string array from onboarding answers. Uses: `EFT`, `DBT`, `ACT`, `IFS`, `Somatic`, `NVC`, `Positive Psychology`, `Gottman`. All map to the new eight-pillar architecture. No NLP or Polyvagal values used.

- `src/data/starter-journeys/types.ts` — `StarterJourney` interface has `modalities: string[]` (untyped free string). No enforcement of the canonical framework list.

- `src/data/starter-journeys/*.ts` (9 journey files) — Each journey file specifies `modalities` array using lowercase shorthand values: `act`, `dbt`, `eft`, `ifs`, `gottman`, `nvc`, `somatic`, `positive-psychology`, `mindfulness`. None use `nlp`, `polyvagal`, or `influence`. All are compatible with the new eight-pillar spec.

- `src/pages/journeys/values.tsx:94` — "Practical frameworks for when your values pull you in opposite directions on a real decision" — Uses "frameworks" in a content copy context, not as a data structure. No action needed.

---

### .claude/skills/ findings

**Files searched:** All `.md` files under `/Users/chris/sparq-connection-lab/.claude/skills/`

**NLP hits:**

1. `.claude/skills/sparq-psychology/references/nlp-language-framework.md` — The primary language design skill file. Title: "Sparq NLP & Language Framework." Line 60 refers to "the most powerful NLP tools in Sparq's language system." This file encodes the presupposition, outcome framing, and pull-language system that Sparq's copy uses. The underlying techniques (presupposition = standard pragmatics, outcome framing = CBT/ACT, identity reinforcement = habit science) are all valid. **Only the NLP brand label needs removing. Proposed new title: "Sparq Language Framework" or "Sparq Conversational Design System." The §2.1 upgrade spec mapping covers this exactly.**

2. `.claude/skills/sparq-psychology/SKILL.md:153` — "Identity reinforcement through archetypes ... uses light NLP — no embedded commands." **Needs retagging to: "Identity-based habit formation (James Clear, Atomic Habits)" per upgrade spec §2.1.**

3. `.claude/skills/sparq-ui/SKILL.md:537` — Cross-reference: "For NLP language patterns and copy rules: see `sparq-psychology/references/nlp-language-framework`." **Update after renaming the language framework file.**

**Polyvagal hits:**

1. `.claude/skills/sparq-psychology/references/modalities-applied.md:185` — Under "Somatic Approaches," Polyvagal Theory is listed as a research basis alongside Peter Levine and Bessel van der Kolk. The Window of Tolerance diagram follows. **Needs softening per upgrade spec §2.2: frame Polyvagal as a "clinical lens" not confirmed neuroscience. Retain the WoT diagram — it's well-validated.**

No other skill files contain NLP or Polyvagal references.

---

## Recommended change sequence

The order below minimizes breakage risk. Changes in steps 1–3 are internal documentation only. Steps 4–6 touch TypeScript and require build verification.

**Step 1 — Internal skill files (no build impact)**
1a. Rename `.claude/skills/sparq-psychology/references/nlp-language-framework.md` to `language-framework.md` (or `conversational-design-system.md`)
1b. Update all cross-references to the old filename in: `CLAUDE.md` (×5 occurrences), `.claude/skills/sparq-psychology/SKILL.md`, `.claude/skills/sparq-ui/SKILL.md`
1c. Remove "NLP" brand references from within the renamed file (lines 1 and 60); replace "NLP tools" with "linguistic design techniques"
1d. Update `.claude/skills/sparq-psychology/SKILL.md:153` — replace "light NLP" with "identity-based habit formation (James Clear)"
1e. Update `.claude/skills/sparq-psychology/references/modalities-applied.md:185` — soften Porges/Polyvagal citation per §2.2

**Step 2 — Internal product documentation (no build impact)**
2a. `SPARQ-PSYCHOLOGY-MODALITIES.md:537` — replace "Light NLP: Identity reinforcement" with "Identity-based framing (James Clear, Atomic Habits)"
2b. `SPARQ-PSYCHOLOGY-MODALITIES.md:739` — soften Porges attribution (replace "Research by Stephen Porges shows" with "Research on autonomic nervous system regulation shows")
2c. `SPARQ-PSYCHOLOGY-MODALITIES.md:395` — retire "Influence & Persuasion Psychology" as a named modality label; redistribute its content under "Neuroplasticity + Habit Science" and "Positive Psychology / Relationship Science" headings per §2.3

**Step 3 — User-facing educational content (no build impact, does affect served markdown)**
3a. `Path to Together/emotional-intelligence.md:130` — soften Polyvagal to "Nervous System Regulation (clinical framework)"
3b. `public/Path to Together/emotional-intelligence.md:130` — same (this is the public-served copy)

**Step 4 — TypeScript type update (requires build check)**
4a. `src/types/quiz.ts:66` — remove `| "Influence & Persuasion"` from `PsychologyModality` union. Since no actual quiz data uses this value, removal is safe. Run `npm run build` to confirm.

**Step 5 — Source code retags (requires build check)**
5a. `src/data/quizData.ts:48` — update `therapeuticIntent` from "Preferred-state anchoring" to "Best possible self / valued direction (Positive Psychology + ACT)"
5b. `src/lib/peterService.ts:64` — retag "Reframing the Narrative" technique label in Peter's system prompt to "Cognitive Reappraisal" (or "Perspective Reappraisal") — this is the validated Gross (2002) construct

**Step 6 — SPARQ_MASTER_SPEC.md update (documentation)**
6a. `SPARQ_MASTER_SPEC.md:1401` — The "NLP" here means Natural Language Processing (text analysis). No rebrand needed, but add a clarifying code comment to prevent confusion with Neuro-Linguistic Programming during future audits.

**Step 7 — Old plan/spec docs (lowest priority)**
7a. `docs/superpowers/plans/2026-03-26-public-beta-readiness.md` and `docs/superpowers/specs/2026-03-25-public-beta-readiness-design.md` — historical docs referencing "NLP compliance." These are completed work records; no action required unless these docs are surfaced to users or external reviewers.

---

## Files NOT requiring changes

| File | Reason |
|---|---|
| `src/lib/onboarding/deriveProfile.ts` | All modality values are in the new eight-pillar set |
| `src/data/starter-journeys/*.ts` | All modality values (act, eft, dbt, ifs, gottman, nvc, somatic, positive-psychology, mindfulness) are in the new set |
| `src/data/starter-journeys/types.ts` | `modalities: string[]` — untyped; no framework labels embedded |
| `src/pages/api/peter/onboarding.ts` | Uses `profile.primaryModalities` from `deriveProfile.ts`; no NLP values |
| `src/pages/rehearsal.tsx` | All `anchor` refs are `peter_anchor` (product feature), not NLP |
| `src/pages/api/peter/rehearsal/*` | Same |
| `src/data/quizData.ts` (modality values) | Only valid modality values used; one `therapeuticIntent` label needs retagging (Step 5a) |
| `src/pages/journeys/attachment-healing.tsx` | `Anchor` import is a Lucide React icon component |
| `src/pages/journeys/mindful-sexuality.tsx` | Anchor usage is mindfulness/somatic, not NLP |
| `src/data/starter-journeys/calm-before-closeness.ts` | Anchor usage is mindfulness grounding |
| `src/data/starter-journeys/staying-grounded.ts` | Anchor usage is metaphor/mindfulness |
| `SPARQ_MASTER_SPEC.md:133,156,1241,1338` | Anchor usage is ACT values / habit science |
| `OLD_PRD.md` | Archived document; NLP here = Natural Language Processing |
| `docs/superpowers/specs/2026-03-23-onboarding-design.md:111` | NLP here = Natural Language Processing intent parsing |
