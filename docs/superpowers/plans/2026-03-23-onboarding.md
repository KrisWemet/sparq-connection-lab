# Conversational Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing 4-step onboarding flow with a 14-question conversational session with Peter, a live AI chat phase, and a personalised journey recommendation.

**Architecture:** Single `/onboarding` page as a typed state machine (`consent → questions → scoring_transition → peter_session → journey_rec → journey_detail → /dashboard`). Pure logic lives in `src/lib/onboarding/`. Two new API endpoints handle free-text scoring and the Phase 2 Peter session. All clinical scoring is invisible to the user.

**Tech Stack:** Next.js 13 Pages Router, TypeScript, Tailwind, Framer Motion, shadcn/ui, Supabase client, `buildAuthedHeaders` for API auth, `peterChat` from `@/lib/openrouter`, `detectCrisisIntent`/`buildCrisisResponse` from `@/lib/safety`, `getAuthedContext` from `@/lib/server/supabase-auth`.

**No automated tests in this project.** Verification steps describe manual checks via `npm run dev`.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `supabase/migrations/20260323000000_onboarding_profile_columns.sql` | Add age_range, pronouns, psychological_profile to profiles |
| Create | `src/lib/onboarding/types.ts` | DerivedProfile, RawScores, Question, QuestionOption interfaces |
| Create | `src/lib/onboarding/questions.ts` | All 14 question definitions with options, scoring weights, bridges |
| Create | `src/lib/onboarding/deriveProfile.ts` | Raw scores → DerivedProfile object |
| Create | `src/lib/onboarding/journeyMatcher.ts` | DerivedProfile → journey recommendation + reason copy |
| Create | `src/pages/api/onboarding/score-freetext.ts` | LLM-based free-text score adjustment |
| Create | `src/pages/api/peter/onboarding.ts` | Phase 2 Peter session (no entitlements, crisis detection on) |
| Create | `src/components/onboarding/ConsentGate.tsx` | Consent screen (extracted from old flow) |
| Create | `src/components/onboarding/QuestionFlow.tsx` | 14-question flow with bridges, back nav, localStorage |
| Create | `src/components/onboarding/ScoringTransition.tsx` | Loading state + profile write to DB |
| Create | `src/components/onboarding/PeterSession.tsx` | Live chat UI for Phase 2 |
| Create | `src/components/onboarding/JourneyRecommendation.tsx` | Primary card + alternatives |
| Create | `src/components/onboarding/JourneyDetail.tsx` | Journey summary + confirm |
| Replace | `src/pages/onboarding-flow.tsx` → `src/pages/onboarding.tsx` | State machine page |
| Delete | `src/pages/onboarding-flow.tsx` | Old flow — remove entirely |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260323000000_onboarding_profile_columns.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260323000000_onboarding_profile_columns.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_range              text,
  ADD COLUMN IF NOT EXISTS pronouns               text,
  ADD COLUMN IF NOT EXISTS psychological_profile  jsonb;
```

- [ ] **Step 2: Apply migration**

```bash
npx supabase db push
```

Expected: migration applies cleanly, no errors.

- [ ] **Step 3: Verify columns exist**

In Supabase dashboard → Table Editor → profiles table, confirm `age_range`, `pronouns`, and `psychological_profile` columns are present.

Also confirm whether the existing boolean column is named `isonboarded` (no underscore) or `is_onboarded` (with underscore). The codebase uses `isonboarded` throughout — if the live column name differs, update all `.update({ isonboarded: ... })` calls in `ScoringTransition.tsx` and `JourneyDetail.tsx` to match the actual column name before Task 10/13.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260323000000_onboarding_profile_columns.sql
git commit -m "feat: add age_range, pronouns, psychological_profile to profiles"
```

---

## Task 2: Core Types

**Files:**
- Create: `src/lib/onboarding/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/lib/onboarding/types.ts

export interface RawScores {
  anxious: number;
  avoidant: number;
  secure: number;
  disorganized: number;
  dysregulation: number;
  abandonment: number;
  selfWorth: number; // high = fragile, low = stable
  trauma: number;
}

export interface DerivedProfile {
  // Identity
  firstName: string;
  ageRange: string;
  pronouns: string;
  relationshipStatus: string;
  partnerName: string | null;
  relationshipLength: string | null;
  partnerUsing: string | null;

  // Clinical signals
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  dysregulationLevel: 'low' | 'moderate' | 'high';
  abandonmentFear: 'low' | 'moderate' | 'high';
  selfWorthPattern: 'stable' | 'conditional' | 'fragile';
  traumaFlag: boolean;

  // Modality routing
  primaryModalities: string[];
  toneMode: 'validation-first' | 'nurturing' | 'collaborative';

  // Preferences
  loveLanguage: string;
  conflictStyle: string;
  lifeContext: string;
  checkInFrequency: string;
  growthGoal: string;

  // Raw scores
  scores: RawScores;

  // Free-text answers from Phase 1 (questionIndex → text)
  freeTextAnswers: Record<number, string>;

  // Stored after Phase 2 completes
  peterClosingSentence: string;
}

export interface QuestionOption {
  label: string;
  scoreDeltas?: Partial<RawScores>;
  // For non-scoring fields
  sets?: {
    field: keyof DerivedProfile;
    value: string;
  };
  bridge: string;
  isFreeText?: true; // marks the "write my own" option
}

export interface Question {
  index: number;
  topic: string;
  // Peter's message — use {firstName} and {partnerName} as tokens, replaced at render time
  peterText: string | ((ctx: { firstName: string; partnerName: string | null }) => string);
  inputType: 'text' | 'quick-reply' | 'multi-part';
  options?: QuestionOption[];
  captures: (keyof DerivedProfile)[];
}

// State machine phases
export type OnboardingPhase =
  | 'consent'
  | 'questions'
  | 'scoring_transition'
  | 'peter_session'
  | 'journey_rec'
  | 'journey_detail';

// Persisted to localStorage under key 'sparq_onboarding_progress'
export interface OnboardingProgress {
  answers: Record<number, string | { ageRange: string; pronouns: string }>;
  freeTextAnswers: Record<number, string>;
  scores: RawScores;
  lastQuestionIndex: number;
  // Partial identity collected so far
  firstName: string;
  ageRange: string;
  pronouns: string;
  relationshipStatus: string;
  partnerName: string | null;
  relationshipLength: string | null;
  partnerUsing: string | null;
  loveLanguage: string;
  conflictStyle: string;
  lifeContext: string;
  checkInFrequency: string;
  growthGoal: string;
}

export const INITIAL_SCORES: RawScores = {
  anxious: 0,
  avoidant: 0,
  secure: 0,
  disorganized: 0,
  dysregulation: 0,
  abandonment: 0,
  selfWorth: 0,
  trauma: 0,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/onboarding/types.ts
git commit -m "feat: add onboarding types (DerivedProfile, Question, OnboardingProgress)"
```

---

## Task 3: Question Definitions

**Files:**
- Create: `src/lib/onboarding/questions.ts`

This file defines all 14 questions with Peter's copy, quick-reply options, scoring weights, and conversational bridges. Every `[partnerName]` in copy must be replaced at render time — use the `peterText` function form for questions that reference the partner name.

- [ ] **Step 1: Create questions file**

```typescript
// src/lib/onboarding/questions.ts
import type { Question, QuestionOption } from './types';

const WRITE_MY_OWN: QuestionOption = {
  label: 'Write my own',
  isFreeText: true,
  bridge: "I appreciate you putting that into your own words.",
};

export const QUESTIONS: Question[] = [
  // ── Q1: Name ────────────────────────────────────────────────────────────────
  {
    index: 0,
    topic: 'Name',
    peterText: "Hi — I'm Peter. I'm going to be with you every step of the way. Let's start easy: what's your name?",
    inputType: 'text',
    options: [],
    captures: ['firstName'],
  },

  // ── Q2: Age + Pronouns ───────────────────────────────────────────────────────
  {
    index: 1,
    topic: 'Age + Pronouns',
    peterText: ({ firstName }) => `${firstName}, really good to meet you. Couple of quick ones—`,
    inputType: 'multi-part',
    captures: ['ageRange', 'pronouns'],
    // multi-part: rendered as two sets of options on one screen
    // 'options' contains all options; 'partLabel' groups them
    options: [
      { label: 'Under 25', sets: { field: 'ageRange', value: 'under-25' }, bridge: "Good to know. Let's keep going." },
      { label: '25–34',    sets: { field: 'ageRange', value: '25-34'   }, bridge: "Good to know. Let's keep going." },
      { label: '35–44',    sets: { field: 'ageRange', value: '35-44'   }, bridge: "Good to know. Let's keep going." },
      { label: '45+',      sets: { field: 'ageRange', value: '45-plus' }, bridge: "Good to know. Let's keep going." },
      { label: 'She / Her',   sets: { field: 'pronouns', value: 'she/her'   }, bridge: "Good to know. Let's keep going." },
      { label: 'He / Him',    sets: { field: 'pronouns', value: 'he/him'    }, bridge: "Good to know. Let's keep going." },
      { label: 'They / Them', sets: { field: 'pronouns', value: 'they/them' }, bridge: "Good to know. Let's keep going." },
      { label: 'Something else', isFreeText: true, sets: { field: 'pronouns', value: '' }, bridge: "Good to know. Let's keep going." },
    ],
  },

  // ── Q3: Relationship Status + Partner Name ───────────────────────────────────
  {
    index: 2,
    topic: 'Relationship Status',
    peterText: "Tell me a little about your relationship right now.",
    inputType: 'quick-reply',
    captures: ['relationshipStatus', 'partnerName'],
    options: [
      { label: 'Married or long-term committed', sets: { field: 'relationshipStatus', value: 'committed' }, bridge: "That's a real foundation to build on." },
      { label: 'In a serious relationship',       sets: { field: 'relationshipStatus', value: 'serious'   }, bridge: "That's a real foundation to build on." },
      { label: "It's been a complicated stretch", sets: { field: 'relationshipStatus', value: 'complicated' }, scoreDeltas: { dysregulation: 1 }, bridge: "I hear you — complicated is honest. I respect that." },
    ],
  },

  // ── Q4: Relationship Length ─────────────────────────────────────────────────
  {
    index: 3,
    topic: 'Relationship Length',
    peterText: ({ partnerName }) =>
      partnerName
        ? `How long have you and ${partnerName} been together?`
        : "How long have you two been together?",
    inputType: 'quick-reply',
    captures: ['relationshipLength'],
    options: [
      { label: 'Less than a year', sets: { field: 'relationshipLength', value: 'under-1' }, bridge: "Still early — there's a lot of good ahead of you." },
      { label: '1 to 3 years',     sets: { field: 'relationshipLength', value: '1-3'     }, bridge: "You're right in the thick of building something real." },
      { label: '3 to 7 years',     sets: { field: 'relationshipLength', value: '3-7'     }, bridge: "A few years in — you've seen a few seasons together." },
      { label: 'More than 7 years',sets: { field: 'relationshipLength', value: '7-plus'  }, bridge: "That's a long time. A lot of history, a lot of growth." },
    ],
  },

  // ── Q5: Partner Joining ─────────────────────────────────────────────────────
  {
    index: 4,
    topic: 'Partner Joining',
    peterText: ({ partnerName }) =>
      partnerName
        ? `Is ${partnerName} joining you on Sparq too, or are you the one leading the charge?`
        : "Are you starting Sparq with your partner, or is this just yours for now?",
    inputType: 'quick-reply',
    captures: ['partnerUsing'],
    options: [
      { label: "We're doing this together",       sets: { field: 'partnerUsing', value: 'yes'    }, bridge: "I love that. Two people showing up — that matters." },
      { label: "I'm going first — hoping they join", sets: { field: 'partnerUsing', value: 'maybe' }, bridge: "That takes courage. Leading the way says a lot about you." },
      { label: "Just me for now",                 sets: { field: 'partnerUsing', value: 'no'    }, bridge: "That's completely okay. This is yours." },
    ],
  },

  // ── Q6: Emotional Speed ─────────────────────────────────────────────────────
  {
    index: 5,
    topic: 'Emotional Speed',
    peterText: "When something feels off between you — a short reply, a change in tone, a quiet night — how does it land for you?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "It hits me fast and hard — I feel it right away", scoreDeltas: { dysregulation: 3, anxious: 2 }, bridge: "Yeah — when you care, it's hard not to feel it. That makes sense." },
      { label: "I notice it, but I can usually breathe through it", scoreDeltas: { dysregulation: 1, secure: 1 }, bridge: "That's actually a real skill, even when it doesn't feel like one." },
      { label: "I tend to go quiet and not think about it much",   scoreDeltas: { avoidant: 2 }, bridge: "Stepping back to process — there's a kind of wisdom in that too." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q7: Recovery Time ───────────────────────────────────────────────────────
  {
    index: 6,
    topic: 'Recovery Time',
    peterText: "And after a tough moment between you — how long does it usually take you to feel like yourself again?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "I bounce back pretty fast",                          scoreDeltas: { secure: 1 },                   bridge: "That resilience is going to serve you well here." },
      { label: "A few hours — I need to process a bit",             scoreDeltas: { dysregulation: 1 },            bridge: "Processing takes what it takes. Nothing wrong with that." },
      { label: "It can take a day or more",                         scoreDeltas: { dysregulation: 3 },            bridge: "That's real — sometimes the feelings need somewhere to go first." },
      { label: "I shut down and it takes a long time to come back", scoreDeltas: { avoidant: 2, dysregulation: 2 }, bridge: "That kind of shutting down makes sense. We'll work with that gently." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q8: Abandonment Response ────────────────────────────────────────────────
  {
    index: 7,
    topic: 'Abandonment Response',
    peterText: ({ partnerName }) => {
      const name = partnerName ?? 'your partner';
      return `If ${name} went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?`;
    },
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "I'd start wondering if something's wrong between us", scoreDeltas: { abandonment: 3, anxious: 3 }, bridge: "That checking instinct — it comes from caring. I hear you." },
      { label: "I'd figure they're busy or tired",                    scoreDeltas: { secure: 2 },                  bridge: "That kind of trust is a quiet strength." },
      { label: "Honestly, I'd enjoy the space",                      scoreDeltas: { avoidant: 3 },                bridge: "Nothing wrong with needing room to breathe." },
      { label: "I'd notice it, but try not to make it mean something", scoreDeltas: { abandonment: 1, anxious: 1 }, bridge: "That awareness is already a step most people skip." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q9: Inner Voice ─────────────────────────────────────────────────────────
  {
    index: 8,
    topic: 'Inner Voice',
    peterText: "When things get rocky between you, what does the voice inside your head usually sound like?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "It says I'm probably the problem",              scoreDeltas: { selfWorth: 3 },               bridge: "That voice is lying to you more than you know. We're going to work on that." },
      { label: "It says we're both human and we'll figure it out", scoreDeltas: {},                           bridge: "That's a grounded place to come from. I like that." },
      { label: "It wonders if they're losing interest in me",   scoreDeltas: { selfWorth: 2, abandonment: 2 }, bridge: "That fear makes sense. It doesn't make it true." },
      { label: "It gets pretty loud and hard to quiet",         scoreDeltas: { selfWorth: 2, dysregulation: 1 }, bridge: "When the volume goes up like that, it's hard to hear anything else. I get it." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q10: Childhood Safety ───────────────────────────────────────────────────
  {
    index: 9,
    topic: 'Childhood Safety',
    peterText: "Growing up — was home a place that felt mostly safe and steady for you?",
    inputType: 'quick-reply',
    captures: [],
    options: [
      { label: "Mostly yes",                    scoreDeltas: {},                              bridge: "That kind of foundation carries forward. Good to know." },
      { label: "It had its moments, but mostly okay", scoreDeltas: { trauma: 1 },            bridge: "Honest answer. Most people's childhoods had some of both." },
      { label: "It was complicated",            scoreDeltas: { trauma: 3 },                  bridge: "Thank you for trusting me with that. It helps me understand you better." },
      { label: "Not really — it was hard",      scoreDeltas: { trauma: 5, disorganized: 2 }, bridge: "That took courage to say. I'm glad you told me. We'll go gently." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q11: Conflict Style ─────────────────────────────────────────────────────
  {
    index: 10,
    topic: 'Conflict Style',
    peterText: ({ partnerName }) =>
      partnerName
        ? `When you and ${partnerName} hit a rough patch, which sounds most like you?`
        : "When you and your partner hit a rough patch, which sounds most like you?",
    inputType: 'quick-reply',
    captures: ['conflictStyle'],
    options: [
      // "volatile" = expressive/direct per Gottman taxonomy (not high-conflict)
      { label: "I bring it up — even when it's uncomfortable", sets: { field: 'conflictStyle', value: 'volatile'   }, bridge: "That directness — when it's timed right — is actually a gift to a relationship." },
      { label: "I need space to cool down before I can talk",  sets: { field: 'conflictStyle', value: 'avoidant'   }, scoreDeltas: { avoidant: 1 }, bridge: "Taking space before you speak is smarter than most people realise." },
      { label: "I try to make sure we both feel heard",        sets: { field: 'conflictStyle', value: 'validating' }, scoreDeltas: { secure: 1  }, bridge: "That instinct to hold space for both of you — that's rare." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q12: Love Language ──────────────────────────────────────────────────────
  {
    index: 11,
    topic: 'Love Language',
    peterText: ({ partnerName }) =>
      partnerName
        ? `What makes you feel most loved by ${partnerName}? Like, what really lands?`
        : "What makes you feel most loved in a relationship? Like, what really lands?",
    inputType: 'quick-reply',
    captures: ['loveLanguage'],
    options: [
      { label: "When they say it out loud — words really matter to me", sets: { field: 'loveLanguage', value: 'words' }, bridge: "Words of love are powerful. The right ones at the right moment change everything." },
      { label: "When they do something thoughtful without being asked",  sets: { field: 'loveLanguage', value: 'acts'  }, bridge: "When someone shows you instead of tells you — that lands deep." },
      { label: "When we just spend real, present time together",         sets: { field: 'loveLanguage', value: 'time'  }, bridge: "Undivided presence is one of the rarest things someone can give." },
      { label: "Physical closeness — a hug, a touch",                   sets: { field: 'loveLanguage', value: 'touch' }, bridge: "Physical connection is its own language. Some people feel it more than anything else." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q13: Life Context ───────────────────────────────────────────────────────
  {
    index: 12,
    topic: 'Life Context',
    peterText: "Last check-in before we really get going. What's life feeling like right now, outside the relationship?",
    inputType: 'quick-reply',
    captures: ['lifeContext'],
    options: [
      { label: "Pretty steady — things are okay",               sets: { field: 'lifeContext', value: 'stable'     }, bridge: "Good. That gives us something solid to build on." },
      { label: "Busy and a bit stretched thin",                 sets: { field: 'lifeContext', value: 'stressed'   }, scoreDeltas: { dysregulation: 1 }, bridge: "Got it — we'll keep things light and practical." },
      { label: "We're going through a big change right now",    sets: { field: 'lifeContext', value: 'transition' }, scoreDeltas: { dysregulation: 1 }, bridge: "Change takes a lot out of you. We'll work with where you are." },
      { label: "It's been heavy — loss, grief, or something really hard", sets: { field: 'lifeContext', value: 'heavy' }, scoreDeltas: { trauma: 2, dysregulation: 1 }, bridge: "I'm sorry. We'll go gently, and we'll start where you have the most energy." },
      WRITE_MY_OWN,
    ],
  },

  // ── Q14: Growth Goal + Check-in Frequency ───────────────────────────────────
  {
    index: 13,
    topic: 'Growth Goal + Check-in Frequency',
    peterText: "And what is it you're really hoping for — the thing you can't quite put words to yet, but you feel it?",
    inputType: 'multi-part', // free text first, then quick-reply for frequency
    captures: ['growthGoal', 'checkInFrequency'],
    options: [
      { label: 'Every day',           sets: { field: 'checkInFrequency', value: 'daily'           }, bridge: "Got it." },
      { label: 'A few times a week',  sets: { field: 'checkInFrequency', value: 'few-times-week'  }, bridge: "Got it." },
      { label: 'Once a week',         sets: { field: 'checkInFrequency', value: 'weekly'           }, bridge: "Got it." },
    ],
  },
];
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `src/lib/onboarding/questions.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/onboarding/questions.ts
git commit -m "feat: add 14 onboarding question definitions with scoring and bridges"
```

---

## Task 4: deriveProfile

**Files:**
- Create: `src/lib/onboarding/deriveProfile.ts`

- [ ] **Step 1: Create deriveProfile.ts**

```typescript
// src/lib/onboarding/deriveProfile.ts
import type { RawScores, DerivedProfile, OnboardingProgress } from './types';

function deriveAttachmentStyle(scores: RawScores): DerivedProfile['attachmentStyle'] {
  // Disorganized is evaluated first as an override
  if (scores.trauma >= 5 && (scores.anxious >= 4 || scores.avoidant >= 4)) {
    return 'disorganized';
  }
  const max = Math.max(scores.anxious, scores.avoidant, scores.secure);
  if (max < 3) return 'secure'; // all low → default secure
  if (scores.anxious === max) return 'anxious';
  if (scores.avoidant === max) return 'avoidant';
  return 'secure';
}

function deriveLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'moderate';
  return 'high';
}

function deriveSelfWorth(score: number): 'stable' | 'conditional' | 'fragile' {
  if (score <= 3) return 'stable';
  if (score <= 6) return 'conditional';
  return 'fragile';
}

function deriveToneMode(
  attachmentStyle: DerivedProfile['attachmentStyle'],
  abandonmentFear: DerivedProfile['abandonmentFear'],
  selfWorthPattern: DerivedProfile['selfWorthPattern'],
  dysregulationLevel: DerivedProfile['dysregulationLevel'],
): DerivedProfile['toneMode'] {
  // Priority order: first match wins
  if (abandonmentFear === 'high' || selfWorthPattern === 'fragile' || dysregulationLevel === 'high') {
    return 'validation-first';
  }
  if (attachmentStyle === 'anxious' || attachmentStyle === 'disorganized') {
    return 'nurturing';
  }
  return 'collaborative';
}

function derivePrimaryModalities(
  attachmentStyle: DerivedProfile['attachmentStyle'],
  dysregulationLevel: DerivedProfile['dysregulationLevel'],
  abandonmentFear: DerivedProfile['abandonmentFear'],
  traumaFlag: boolean,
  conflictStyle: string,
): string[] {
  const modalities = new Set<string>();

  switch (attachmentStyle) {
    case 'anxious':      modalities.add('EFT'); modalities.add('DBT'); break;
    case 'avoidant':     modalities.add('ACT'); modalities.add('IFS'); break;
    case 'disorganized': modalities.add('Somatic'); modalities.add('IFS'); modalities.add('EFT'); break;
    case 'secure':       modalities.add('Positive Psychology'); modalities.add('Gottman'); break;
  }

  if (dysregulationLevel === 'moderate' || dysregulationLevel === 'high') modalities.add('DBT');
  if (abandonmentFear === 'moderate' || abandonmentFear === 'high') { modalities.add('EFT'); modalities.add('Attachment Theory'); }
  if (traumaFlag) { modalities.add('Somatic'); modalities.add('IFS'); }
  if (conflictStyle === 'avoidant') { modalities.add('Gottman'); modalities.add('NVC'); }
  if (conflictStyle === 'volatile') { modalities.add('DBT'); modalities.add('NVC'); }

  return Array.from(modalities).slice(0, 4);
}

export function deriveProfile(progress: OnboardingProgress): DerivedProfile {
  const scores = progress.scores;

  const attachmentStyle = deriveAttachmentStyle(scores);
  const dysregulationLevel = deriveLevel(scores.dysregulation);
  const abandonmentFear = deriveLevel(scores.abandonment);
  const selfWorthPattern = deriveSelfWorth(scores.selfWorth);
  const traumaFlag = scores.trauma >= 5;
  const toneMode = deriveToneMode(attachmentStyle, abandonmentFear, selfWorthPattern, dysregulationLevel);
  const primaryModalities = derivePrimaryModalities(
    attachmentStyle, dysregulationLevel, abandonmentFear, traumaFlag, progress.conflictStyle
  );

  return {
    firstName: progress.firstName,
    ageRange: progress.ageRange,
    pronouns: progress.pronouns,
    relationshipStatus: progress.relationshipStatus,
    partnerName: progress.partnerName,
    relationshipLength: progress.relationshipLength,
    partnerUsing: progress.partnerUsing,
    attachmentStyle,
    dysregulationLevel,
    abandonmentFear,
    selfWorthPattern,
    traumaFlag,
    primaryModalities,
    toneMode,
    loveLanguage: progress.loveLanguage,
    conflictStyle: progress.conflictStyle,
    lifeContext: progress.lifeContext,
    checkInFrequency: progress.checkInFrequency,
    growthGoal: progress.growthGoal,
    scores,
    freeTextAnswers: progress.freeTextAnswers,
    peterClosingSentence: '',
  };
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Open browser console on any page with access to the app's dev environment and call `deriveProfile` with a mock `OnboardingProgress` to verify output. Alternatively, add a temporary `console.log` call and verify in dev server logs.

- [ ] **Step 4: Commit**

```bash
git add src/lib/onboarding/deriveProfile.ts
git commit -m "feat: add deriveProfile scoring engine"
```

---

## Task 5: journeyMatcher

**Files:**
- Create: `src/lib/onboarding/journeyMatcher.ts`

- [ ] **Step 1: Create journeyMatcher.ts**

```typescript
// src/lib/onboarding/journeyMatcher.ts
import type { DerivedProfile } from './types';

export interface JourneyMatch {
  journeyId: string;
  reason: string; // Peter's one-sentence recommendation copy
  peterNote: string; // Peter's note shown on the Journey Detail screen
}

export interface JourneyRecommendation {
  primary: JourneyMatch;
  alternatives: JourneyMatch[];
}

// Pre-written recommendation reasons keyed by [attachmentStyle][journeyId]
const REASONS: Record<string, Record<string, string>> = {
  anxious: {
    'attachment-healing': "it works with the part of you that learned to watch instead of rest.",
    'trust-rebuilding':   "building trust from the inside out is exactly what you need right now.",
    'communication':      "learning to say what's true before the worry takes over will change everything.",
    'emotional-intelligence': "understanding your own emotional patterns is the first step to steadying them.",
    'relationship-renewal':   "sometimes the freshest thing you can do is see what's already there.",
    'values':                 "knowing what you're actually moving toward makes every step feel more solid.",
  },
  avoidant: {
    'emotional-intelligence': "understanding your inner world is the first bridge to letting someone else in.",
    'values':                 "knowing what you actually want makes it easier to move toward it.",
    'communication':          "learning to speak before you step back is quiet, powerful work.",
    'attachment-healing':     "the wall you built was smart once — this work helps you choose when to open the door.",
    'relationship-renewal':   "reconnecting doesn't have to mean overwhelming — it can start with one small thing.",
  },
  disorganized: {
    'attachment-healing': "we're going to work with the part of you that wants closeness and safety at the same time.",
    'values':             "getting clear on what you actually believe creates ground under your feet.",
    'mindful-sexuality':  "this journey starts with your relationship to your own body — the safest place to begin.",
    'emotional-intelligence': "naming what you feel is how you stop being ruled by it.",
  },
  secure: {
    'relationship-renewal':   "you're not here because something is broken — you're here because you want more of what's good.",
    'love-languages':         "you already have the foundation; this helps you speak each other's language more fluently.",
    'intimacy':               "deeper intimacy doesn't require a crisis — just intention and a little practice.",
    'communication':          "even secure couples have communication edges worth sharpening.",
  },
};

const DEFAULT_REASON = "this journey will give you real tools you can use right away.";

function getReason(attachmentStyle: string, journeyId: string): string {
  return REASONS[attachmentStyle]?.[journeyId] ?? DEFAULT_REASON;
}

// Peter's note on the Journey Detail screen — keyed by journeyId
const PETER_NOTES: Record<string, string> = {
  'attachment-healing':     "This is where your real work starts. Come back tomorrow and I'll have something ready for you. 🦦",
  'emotional-intelligence': "Understanding yourself from the inside is the whole game. I'll be right there with you. 🦦",
  'trust-rebuilding':       "Trust gets built one small moment at a time. Tomorrow we start with one. 🦦",
  'communication':          "Saying the true thing — that's the practice. You're ready for it. 🦦",
  'relationship-renewal':   "There's more here than you think. Let's find it together. 🦦",
  'love-languages':         "Speaking their language changes everything. Day 1 starts tomorrow. 🦦",
  'intimacy':               "Depth is built slowly and on purpose. You're in the right place. 🦦",
  'values':                 "Knowing what you're moving toward makes every step lighter. Let's go. 🦦",
  'mindful-sexuality':      "This starts with you — the safest and best place to begin. 🦦",
};

const DEFAULT_PETER_NOTE = "This is where your real work starts. Come back tomorrow and I'll have something ready for you. 🦦";

function getPeterNote(journeyId: string): string {
  return PETER_NOTES[journeyId] ?? DEFAULT_PETER_NOTE;
}

// Journey routing table
const ROUTING: Record<string, { primary: string; alternatives: string[] }> = {
  anxious:      { primary: 'attachment-healing',     alternatives: ['trust-rebuilding', 'communication'] },
  avoidant:     { primary: 'emotional-intelligence', alternatives: ['values', 'communication'] },
  disorganized: { primary: 'attachment-healing',     alternatives: ['values', 'mindful-sexuality'] },
  secure:       { primary: 'relationship-renewal',   alternatives: ['love-languages', 'intimacy'] },
};

// Journeys to deprioritise when lifeContext is heavy
const HEAVY_CONTEXT_EXCLUDE = new Set(['sexual-intimacy', 'fantasy-exploration']);

export function matchJourney(profile: DerivedProfile): JourneyRecommendation {
  const route = ROUTING[profile.attachmentStyle] ?? ROUTING.secure;
  let primary = route.primary;
  let alternatives = [...route.alternatives];

  // Override: traumaFlag always surfaces attachment-healing
  if (profile.traumaFlag && primary !== 'attachment-healing') {
    // Bump attachment-healing to first alternative if not already primary
    alternatives = ['attachment-healing', ...alternatives.filter(id => id !== 'attachment-healing')].slice(0, 3);
  }

  // Override: heavy life context removes explicit content journeys
  if (profile.lifeContext === 'heavy') {
    if (HEAVY_CONTEXT_EXCLUDE.has(primary)) {
      primary = alternatives[0] ?? 'attachment-healing';
      alternatives = alternatives.slice(1);
    }
    alternatives = alternatives.filter(id => !HEAVY_CONTEXT_EXCLUDE.has(id));
  }

  return {
    primary: { journeyId: primary, reason: getReason(profile.attachmentStyle, primary), peterNote: getPeterNote(primary) },
    alternatives: alternatives.slice(0, 3).map(id => ({
      journeyId: id,
      reason: getReason(profile.attachmentStyle, id),
      peterNote: getPeterNote(id),
    })),
  };
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/onboarding/journeyMatcher.ts
git commit -m "feat: add journey matcher with attachment-based routing"
```

---

## Task 6: Free-Text Score API

**Files:**
- Create: `src/pages/api/onboarding/score-freetext.ts`

- [ ] **Step 1: Create the endpoint**

```typescript
// src/pages/api/onboarding/score-freetext.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import type { RawScores } from '@/lib/onboarding/types';

const SYSTEM_PROMPT = `You are a clinical scoring assistant for a relationship app. Your job is to read free-text answers from an onboarding questionnaire and infer score adjustments for psychological dimensions.

You receive:
- A list of free-text answers with the question number they answered
- The current raw scores before adjustment

Return ONLY a JSON object of score deltas (positive or negative integers, typically ±1 to ±3 per dimension).
Return an empty object {} if no clear signals are present.
Never return replacement scores — only deltas.

Dimensions:
- anxious: attachment anxiety (higher = more anxious)
- avoidant: avoidant attachment (higher = more avoidant)
- secure: secure attachment (higher = more secure)
- dysregulation: emotional dysregulation (higher = more dysregulated)
- abandonment: abandonment fear (higher = more fearful)
- selfWorth: self-worth fragility (higher = more fragile)
- trauma: trauma indicators (higher = more present)
- disorganized: disorganized attachment (higher = more disorganized)

Be conservative. Require clear signal before adjusting. If ambiguous, return {}.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { freeTextAnswers, currentScores } = req.body as {
    freeTextAnswers: Record<string, string>;
    currentScores: RawScores;
  };

  if (!freeTextAnswers || typeof freeTextAnswers !== 'object') {
    return res.status(400).json({ error: 'freeTextAnswers required' });
  }

  const answerLines = Object.entries(freeTextAnswers)
    .map(([q, a]) => `Question ${q}: "${a}"`)
    .join('\n');

  const userMessage = `Free-text answers:\n${answerLines}\n\nCurrent scores: ${JSON.stringify(currentScores)}`;

  try {
    const raw = await peterChat({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      maxTokens: 200,
    });

    // Parse JSON from response — strip any surrounding text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const scoreAdjustments: Partial<RawScores> = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return res.status(200).json({ scoreAdjustments });
  } catch (err) {
    console.error('score-freetext error:', err);
    // Graceful fallback — return empty adjustments rather than failing onboarding
    return res.status(200).json({ scoreAdjustments: {} });
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Manual test**

Start dev server (`npm run dev`). Use a REST client (curl or browser fetch) to POST to `/api/onboarding/score-freetext` with a valid auth header and sample body:

```json
{
  "freeTextAnswers": { "5": "I completely freeze and can't stop checking my phone" },
  "currentScores": { "anxious": 2, "avoidant": 0, "secure": 1, "disorganized": 0, "dysregulation": 1, "abandonment": 0, "selfWorth": 0, "trauma": 0 }
}
```

Expected: response contains `scoreAdjustments` JSON with plausible deltas (e.g. `{ "anxious": 2, "dysregulation": 1 }`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/onboarding/score-freetext.ts
git commit -m "feat: add free-text score adjustment API endpoint"
```

---

## Task 7: Peter Onboarding API

**Files:**
- Create: `src/pages/api/peter/onboarding.ts`

- [ ] **Step 1: Create the endpoint**

```typescript
// src/pages/api/peter/onboarding.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT, type PeterMessage } from '@/lib/peterService';
import { buildCrisisResponse, detectCrisisIntent, resolveCountryCode } from '@/lib/safety';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { stripMarkdown } from '@/lib/strip-markdown';
import type { DerivedProfile } from '@/lib/onboarding/types';

const READY_TO_CLOSE_MARKER = '[[READY_TO_CLOSE]]';

const ATTACHMENT_OPENINGS: Record<string, string> = {
  anxious: `Hey {firstName}. I feel like I've got a real sense of you now — and the way you feel things so quickly? That's not a flaw. That's how much you care. Here's something I'm curious about though. When things are calm between you and {partnerRef} — really calm — do you trust it? Or does part of you wait for the other shoe to drop?`,
  avoidant: `Hey {firstName}. I can already tell — you're someone who keeps it together. Probably the person in the relationship who stays calm when things get loud. I'm curious: right before you go quiet in a hard moment — what's actually happening inside? Like the half-second before you step back?`,
  disorganized: `Hey {firstName}. I hear you — and I just want to say first, before anything else: what you've carried makes sense. You're not broken. You learned to survive, and you did. Can I ask — is there one time you can remember feeling genuinely safe? Doesn't have to be in your relationship. Anywhere, anyone, any moment.`,
  secure: `Hey {firstName}. I like you already. You've got a real groundedness about you. So here's what I want to know: what kind of depth are you actually after here? Like if things got really good between you and {partnerRef} — what would that actually look like for you?`,
};

function buildOnboardingSystemPrompt(profile: DerivedProfile): string {
  const partnerRef = profile.partnerName ?? 'your partner';
  const opening = (ATTACHMENT_OPENINGS[profile.attachmentStyle] ?? ATTACHMENT_OPENINGS.secure)
    .replace(/{firstName}/g, profile.firstName)
    .replace(/{partnerRef}/g, partnerRef);

  const freeTextContext = Object.entries(profile.freeTextAnswers)
    .map(([q, a]) => `Q${q}: "${a}"`)
    .join('\n');

  const toneModeInstructions: Record<string, string> = {
    'validation-first': 'Lead with full emotional validation before any reframe or question. Never rush past the feeling.',
    'nurturing':        'Warm, gentle, protective in tone. Never push. Create safety first.',
    'collaborative':    'Peer energy. Curious and forward-looking. Treat them as a capable partner in the work.',
  };

  return `${PETER_SYSTEM_PROMPT}

ONBOARDING CONTEXT (never reference this directly — just behave as someone who already understands):
- This person's name is ${profile.firstName}.
- Their partner's name is ${partnerRef}.
- Tone mode: ${profile.toneMode} — ${toneModeInstructions[profile.toneMode]}
- Primary modalities to draw from: ${profile.primaryModalities.join(', ')}
${freeTextContext ? `- What they wrote in their own words:\n${freeTextContext}` : ''}

OPENING MOVE (use this exactly for your first message):
${opening}

SESSION RULES:
- Maximum 5 exchanges total.
- Ask at most one question per response.
- Never reference the onboarding questions directly.
- Never use clinical language (no "attachment style", "avoidant", "anxious", "trauma", "dysregulation").
- Only add a warm sign-off on your final message. Mid-session responses end cleanly without a sign-off.
- When you have enough context to close warmly and make a journey recommendation, end your response with ${READY_TO_CLOSE_MARKER}
- Your final closing message MUST be formatted as exactly two lines separated by a newline (\\n):
  Line 1: One specific, accurate observation about this person — the "how did he know that" moment. No sign-off on this line.
  Line 2: "Let me show you where I think we start. 🦦"
- The client extracts line 1 as the closing sentence displayed in the journey recommendation screen. Line 2 is stripped.`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, profile, exchangeCount } = req.body as {
    messages: PeterMessage[];
    profile: DerivedProfile;
    exchangeCount: number;
  };

  if (!messages || !Array.isArray(messages) || !profile) {
    return res.status(400).json({ error: 'messages and profile are required' });
  }

  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

  // Auth required — check before LLM call
  const authed = await getAuthedContext(req);
  if (!authed) return res.status(401).json({ error: 'Unauthorized' });

  // Crisis detection always on
  const crisisDetection = await detectCrisisIntent(latestUserMessage);

  if (crisisDetection.triggered) {
    const countryCode = resolveCountryCode(req);
    return res.status(200).json({
      message: buildCrisisResponse(countryCode, crisisDetection.types),
      shouldClose: false,
      safety: { triggered: true },
    });
  }

  // Enforce minimum 2 exchanges before allowing close
  const forceClose = exchangeCount >= 5;
  const allowClose = exchangeCount >= 2;

  const systemPrompt = buildOnboardingSystemPrompt(profile);

  try {
    const rawMessage = await peterChat({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        ...(forceClose
          ? [{ role: 'system' as const, content: `This is exchange 5 of 5 — your final message. Close warmly with your specific observation about this person, then end with ${READY_TO_CLOSE_MARKER} and "Let me show you where I think we start. 🦦"` }]
          : []),
      ],
      maxTokens: 512,
    });

    const shouldClose = allowClose && rawMessage.includes(READY_TO_CLOSE_MARKER);
    const message = stripMarkdown(rawMessage.replace(READY_TO_CLOSE_MARKER, '').trim());

    return res.status(200).json({
      message,
      shouldClose: forceClose || shouldClose,
      safety: { triggered: false },
    });
  } catch (err) {
    console.error('peter/onboarding error:', err);
    return res.status(500).json({ error: 'Peter is taking a nap — try again in a moment 🦦' });
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Manual test**

POST to `/api/peter/onboarding` with a sample profile and `messages: []`, `exchangeCount: 1`. Verify the response contains Peter's attachment-appropriate opening message, `shouldClose: false`, and no `[[READY_TO_CLOSE]]` in the `message` field.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/peter/onboarding.ts
git commit -m "feat: add Peter onboarding session API endpoint"
```

---

## Task 8: ConsentGate Component

**Files:**
- Create: `src/components/onboarding/ConsentGate.tsx`

This is extracted directly from the consent screen in `onboarding-flow.tsx` (lines 358–418). Pull it out as a standalone component with a clean interface.

- [ ] **Step 1: Create ConsentGate.tsx**

```tsx
// src/components/onboarding/ConsentGate.tsx
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

interface ConsentGateProps {
  onAgree: () => void;
  onReviewTrust: () => void;
  isSaving: boolean;
  error: string;
}

export function ConsentGate({ onAgree, onReviewTrust, isSaving, error }: ConsentGateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-brand-linen">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-[28px] p-7"
        style={{ backgroundColor: '#EDE4D8' }}
      >
        <div className="flex justify-center mb-4">
          <PeterAvatar mood="morning" size={72} />
        </div>

        <h1 className="text-center text-[#2C1A14] text-2xl font-serif italic mb-3">
          Before we begin
        </h1>
        <p className="text-center text-[#6B4C3B] text-sm leading-6 mb-5">
          Sparq uses AI to shape your daily practice and remember only what you allow.
        </p>

        <div
          className="rounded-2xl p-4 mb-5 text-sm space-y-2.5"
          style={{ backgroundColor: 'rgba(192,97,74,0.06)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A]">
            What you&apos;re agreeing to
          </p>
          <p className="text-[#6B4C3B] leading-6">
            Peter can use what you share to tailor your morning and evening guidance.
          </p>
          <p className="text-[#6B4C3B] leading-6">
            You can turn personalization off or change memory settings in Trust Center.
          </p>
          <p className="text-[#6B4C3B] leading-6">
            Sparq is coaching, not therapy or crisis care. Safety resources come first when needed.
          </p>
        </div>

        {error && (
          <p className="text-sm text-rose-600 mb-3 text-center">{error}</p>
        )}

        <button
          onClick={onAgree}
          disabled={isSaving}
          className="w-full rounded-2xl py-3.5 text-base font-semibold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#C0614A' }}
        >
          {isSaving ? 'Saving...' : "I agree, let's start"}
        </button>
        <button
          onClick={onReviewTrust}
          className="mt-3 w-full rounded-2xl border-2 border-[#C0614A]/20 py-3 text-sm font-medium text-[#6B4C3B] transition-colors hover:bg-[#C0614A]/5"
        >
          Review trust settings first
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/ConsentGate.tsx
git commit -m "feat: extract ConsentGate component from old onboarding flow"
```

---

## Task 9: QuestionFlow Component

**Files:**
- Create: `src/components/onboarding/QuestionFlow.tsx`

This is the most complex component. It renders all 14 questions as a conversation, manages client-side scoring, bridges, back navigation, and localStorage persistence.

- [ ] **Step 1: Create QuestionFlow.tsx**

```tsx
// src/components/onboarding/QuestionFlow.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { QUESTIONS } from '@/lib/onboarding/questions';
import { INITIAL_SCORES } from '@/lib/onboarding/types';
import type { OnboardingProgress, RawScores, QuestionOption } from '@/lib/onboarding/types';

const STORAGE_KEY = 'sparq_onboarding_progress';
const BRIDGE_DELAY_MS = 1500;

function interpolate(text: string, firstName: string, partnerName: string | null): string {
  return text
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{partnerName\}/g, partnerName ?? 'your partner');
}

function getPeterText(
  question: typeof QUESTIONS[number],
  firstName: string,
  partnerName: string | null,
): string {
  if (typeof question.peterText === 'function') {
    return question.peterText({ firstName, partnerName });
  }
  return interpolate(question.peterText, firstName, partnerName);
}

interface QuestionFlowProps {
  initialProgress?: OnboardingProgress | null;
  onComplete: (progress: OnboardingProgress) => void;
}

const EMPTY_PROGRESS: OnboardingProgress = {
  answers: {},
  freeTextAnswers: {},
  scores: { ...INITIAL_SCORES },
  lastQuestionIndex: 0,
  firstName: '',
  ageRange: '',
  pronouns: '',
  relationshipStatus: '',
  partnerName: null,
  relationshipLength: null,
  partnerUsing: null,
  loveLanguage: '',
  conflictStyle: '',
  lifeContext: '',
  checkInFrequency: '',
  growthGoal: '',
};

export function QuestionFlow({ initialProgress, onComplete }: QuestionFlowProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(initialProgress ?? EMPTY_PROGRESS);
  const [currentIndex, setCurrentIndex] = useState(initialProgress?.lastQuestionIndex ?? 0);
  const [textInput, setTextInput] = useState('');
  const [multiPartState, setMultiPartState] = useState<{ ageRange?: string; pronouns?: string }>({});
  const [activeBridge, setActiveBridge] = useState<string | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  // For Q3: partner name inline input
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [awaitingPartnerName, setAwaitingPartnerName] = useState(false);
  // For Q14: awaiting frequency after growth goal
  const [growthGoalSubmitted, setGrowthGoalSubmitted] = useState(false);

  const question = QUESTIONS[currentIndex];

  // Persist to localStorage on every progress change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, lastQuestionIndex: currentIndex }));
  }, [progress, currentIndex]);

  function applyScoreDeltas(scores: RawScores, deltas: Partial<RawScores> | undefined): RawScores {
    if (!deltas) return scores;
    const next = { ...scores };
    for (const [key, val] of Object.entries(deltas) as [keyof RawScores, number][]) {
      next[key] = (next[key] ?? 0) + val;
    }
    return next;
  }

  function playBridge(bridgeText: string, then: () => void) {
    setActiveBridge(bridgeText);
    setIsBridging(true);
    setTimeout(() => {
      setActiveBridge(null);
      setIsBridging(false);
      then();
    }, BRIDGE_DELAY_MS);
  }

  function advanceQuestion(updatedProgress: OnboardingProgress) {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      onComplete({ ...updatedProgress, lastQuestionIndex: nextIndex });
    } else {
      setCurrentIndex(nextIndex);
      setProgress(updatedProgress);
      setTextInput('');
      setMultiPartState({});
      setPartnerNameInput('');
      setAwaitingPartnerName(false);
      setGrowthGoalSubmitted(false);
    }
  }

  function handleOptionSelect(option: QuestionOption, updatedFields?: Partial<OnboardingProgress>) {
    if (isBridging) return;

    let newProgress: OnboardingProgress = {
      ...progress,
      scores: applyScoreDeltas(progress.scores, option.scoreDeltas),
      answers: { ...progress.answers, [currentIndex]: option.label },
      ...updatedFields,
    };

    if (option.sets) {
      (newProgress as any)[option.sets.field] = option.sets.value;
    }

    playBridge(option.bridge, () => advanceQuestion(newProgress));
  }

  function handleFreeTextSubmit(text: string, fieldOverride?: keyof OnboardingProgress) {
    if (!text.trim()) return;
    const field = fieldOverride ?? question.captures[0];
    const newProgress: OnboardingProgress = {
      ...progress,
      freeTextAnswers: { ...progress.freeTextAnswers, [currentIndex]: text.trim() },
      answers: { ...progress.answers, [currentIndex]: text.trim() },
      ...(field ? { [field]: text.trim() } : {}),
    };
    playBridge("I appreciate you putting that into your own words.", () => advanceQuestion(newProgress));
  }

  function handleBack() {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    // Clear the answer at prevIndex so the user starts fresh at that question.
    // Then replay scores for all answers before prevIndex.
    let replayedScores = { ...INITIAL_SCORES };
    for (let i = 0; i < prevIndex; i++) {
      const q = QUESTIONS[i];
      const answer = progress.answers[i];
      if (answer && q.options) {
        const opt = q.options.find(o => o.label === answer);
        if (opt?.scoreDeltas) replayedScores = applyScoreDeltas(replayedScores, opt.scoreDeltas);
      }
    }
    setProgress(prev => {
      const updatedAnswers = { ...prev.answers };
      delete updatedAnswers[prevIndex];
      const updatedFreeText = { ...prev.freeTextAnswers };
      delete updatedFreeText[prevIndex];
      return { ...prev, scores: replayedScores, answers: updatedAnswers, freeTextAnswers: updatedFreeText };
    });
    setCurrentIndex(prevIndex);
    setTextInput('');
    setActiveBridge(null);
    setIsBridging(false);
  }

  const peterText = getPeterText(question, progress.firstName, progress.partnerName);
  const showBack = currentIndex > 0 && !isBridging;

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="h-1 w-full rounded-full" style={{ backgroundColor: '#EDE4D8' }}>
            <motion.div
              className="h-1 rounded-full"
              style={{ backgroundColor: '#C0614A' }}
              animate={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#6B4C3B]">
            {currentIndex + 1} of {QUESTIONS.length}
          </p>
        </div>

        {/* Peter avatar + question bubble */}
        <div className="flex items-start gap-3 mb-6">
          <PeterAvatar mood="curious" size={48} />
          <div
            className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[15px] leading-relaxed font-serif italic"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {peterText}
          </div>
        </div>

        {/* Bridge message */}
        <AnimatePresence>
          {activeBridge && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 mb-6"
            >
              <PeterAvatar mood="celebrating" size={48} />
              <div
                className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[14px] leading-relaxed"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {activeBridge}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Q1: text input */}
        {question.index === 0 && !isBridging && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Your first name..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] placeholder-[#6B4C3B]/50 focus:outline-none focus:border-[#C0614A] transition-colors text-base"
              onKeyDown={e => e.key === 'Enter' && textInput.trim() && handleFreeTextSubmit(textInput, 'firstName')}
              autoFocus
            />
            <button
              disabled={textInput.trim().length < 1}
              onClick={() => handleFreeTextSubmit(textInput, 'firstName')}
              className="w-full bg-[#C0614A] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q2: multi-part age + pronouns */}
        {question.index === 1 && !isBridging && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-2">How old are you?</p>
              <div className="flex flex-col gap-2">
                {['Under 25', '25–34', '35–44', '45+'].map(label => (
                  <button
                    key={label}
                    onClick={() => setMultiPartState(s => ({ ...s, ageRange: label }))}
                    className={`w-full p-3 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                      multiPartState.ageRange === label
                        ? 'border-[#C0614A] bg-[#C0614A]/5 text-[#2C1A14]'
                        : 'border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-2">Your pronouns</p>
              <div className="flex flex-col gap-2">
                {['She / Her', 'He / Him', 'They / Them'].map(label => (
                  <button
                    key={label}
                    onClick={() => setMultiPartState(s => ({ ...s, pronouns: label.toLowerCase().replace(' / ', '/') }))}
                    className={`w-full p-3 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                      multiPartState.pronouns === label.toLowerCase().replace(' / ', '/')
                        ? 'border-[#C0614A] bg-[#C0614A]/5 text-[#2C1A14]'
                        : 'border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Something else..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] text-sm focus:outline-none focus:border-[#C0614A]"
                  onChange={e => e.target.value && setMultiPartState(s => ({ ...s, pronouns: e.target.value }))}
                />
              </div>
            </div>
            <button
              disabled={!multiPartState.ageRange || !multiPartState.pronouns}
              onClick={() => {
                if (!multiPartState.ageRange || !multiPartState.pronouns) return;
                // Map display label to value
                const ageMap: Record<string, string> = { 'Under 25': 'under-25', '25–34': '25-34', '35–44': '35-44', '45+': '45-plus' };
                const newProgress: OnboardingProgress = {
                  ...progress,
                  ageRange: ageMap[multiPartState.ageRange] ?? multiPartState.ageRange,
                  pronouns: multiPartState.pronouns,
                  answers: { ...progress.answers, [1]: `${multiPartState.ageRange} / ${multiPartState.pronouns}` },
                };
                playBridge("Good to know. Let's keep going.", () => advanceQuestion(newProgress));
              }}
              className="w-full bg-[#C0614A] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q3: relationship status + conditional partner name */}
        {question.index === 2 && !isBridging && !awaitingPartnerName && (
          <div className="flex flex-col gap-2">
            {question.options?.filter(o => !o.isFreeText).map(option => (
              <button
                key={option.label}
                onClick={() => {
                  if (option.sets?.value === 'complicated') {
                    handleOptionSelect(option, { partnerName: null, relationshipLength: null, partnerUsing: null });
                  } else {
                    // Show bridge first, then reveal partner name input after it clears
                    setProgress(p => ({ ...p, relationshipStatus: option.sets?.value ?? '' }));
                    setActiveBridge(option.bridge);
                    setTimeout(() => { setActiveBridge(null); setAwaitingPartnerName(true); }, BRIDGE_DELAY_MS);
                  }
                }}
                className="w-full p-4 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] text-left text-sm font-medium hover:border-[#C0614A]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {question.index === 2 && !isBridging && awaitingPartnerName && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold tracking-widest uppercase text-[#C0614A]">
              Partner&apos;s name
            </label>
            <input
              autoFocus
              type="text"
              value={partnerNameInput}
              onChange={e => setPartnerNameInput(e.target.value)}
              placeholder="What should we call them?"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] placeholder-[#6B4C3B]/50 focus:outline-none focus:border-[#C0614A] transition-colors text-base"
            />
            <button
              disabled={partnerNameInput.trim().length < 1}
              onClick={() => {
                const newProgress: OnboardingProgress = {
                  ...progress,
                  partnerName: partnerNameInput.trim(),
                  answers: { ...progress.answers, [2]: `${progress.relationshipStatus} / ${partnerNameInput.trim()}` },
                };
                advanceQuestion(newProgress);
              }}
              className="w-full bg-[#C0614A] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Q14: growth goal free text + check-in frequency */}
        {question.index === 13 && !isBridging && !growthGoalSubmitted && (
          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Type anything that comes to mind..."
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] placeholder-[#6B4C3B]/50 focus:outline-none focus:border-[#C0614A] transition-colors text-base resize-none"
            />
            <button
              disabled={textInput.trim().length < 3}
              onClick={() => {
                setProgress(p => ({
                  ...p,
                  growthGoal: textInput.trim(),
                  freeTextAnswers: { ...p.freeTextAnswers, [13]: textInput.trim() },
                }));
                // Bridge first, then show frequency buttons after it clears
                playBridge("That matters. Hold onto that — it's exactly why you're here.", () => {
                  setGrowthGoalSubmitted(true);
                });
              }}
              className="w-full bg-[#C0614A] text-white rounded-2xl py-3 font-semibold disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        )}

        {question.index === 13 && !isBridging && growthGoalSubmitted && (
          <div className="flex flex-col gap-3">
            <p className="text-[#6B4C3B] text-sm font-serif italic mb-2">
              Got it. How often would you like to check in with me?
            </p>
            {question.options?.map(option => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option)}
                className="w-full p-4 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] text-left text-sm font-medium hover:border-[#C0614A]"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Standard quick-reply questions (Q4–Q13 except Q14) */}
        {question.inputType === 'quick-reply' && question.index >= 3 && question.index <= 12 && !isBridging && (
          <div className="flex flex-col gap-2">
            {question.options?.map(option => (
              <button
                key={option.label}
                onClick={() => {
                  if (option.isFreeText) {
                    // Show free-text input — handled by a simple inline state
                    setTextInput('__freetext__');
                  } else {
                    handleOptionSelect(option);
                  }
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                  option.isFreeText
                    ? 'border-dashed border-[#C0614A]/30 bg-transparent text-[#6B4C3B] text-xs italic'
                    : 'border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] hover:border-[#C0614A]'
                }`}
              >
                {option.label}
              </button>
            ))}
            {/* Free-text input for "write my own" */}
            {textInput === '__freetext__' && (
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  rows={2}
                  autoFocus
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#C0614A]/20 bg-[#EDE4D8] text-[#2C1A14] placeholder-[#6B4C3B]/50 focus:outline-none focus:border-[#C0614A] text-sm resize-none"
                  onChange={e => setTextInput(e.target.value === '' ? '__freetext__' : e.target.value)}
                />
                <button
                  disabled={textInput === '__freetext__' || textInput.trim().length < 2}
                  onClick={() => handleFreeTextSubmit(textInput)}
                  className="w-full bg-[#C0614A] text-white rounded-2xl py-3 font-semibold disabled:opacity-40 text-sm"
                >
                  Continue →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="mt-6 text-[#6B4C3B] text-sm font-medium px-2 py-1"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Manual test in browser**

Run `npm run dev`, navigate to `/onboarding`. Complete the consent gate, then work through all 14 questions:
- Verify Peter's question text renders correctly
- Verify back navigation restores previous question and recalculates scores correctly
- Edge case: answer Q5, go back to Q4, change your answer, then go back again — confirm scores reflect the updated Q4 answer not the original
- Verify bridge messages appear after each quick-reply selection
- Check `localStorage` key `sparq_onboarding_progress` is written after each answer (browser devtools → Application → Local Storage)
- Verify Q2 requires both age AND pronouns before continuing
- Verify Q3 shows partner name input for committed/serious, skips it for complicated
- Verify Q14 shows growth goal textarea first, then frequency buttons after submission

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/QuestionFlow.tsx
git commit -m "feat: add 14-question conversational flow with bridges and back navigation"
```

---

## Task 10: ScoringTransition Component

**Files:**
- Create: `src/components/onboarding/ScoringTransition.tsx`

Runs `deriveProfile()`, conditionally calls the free-text scoring API, writes the profile to Supabase, then calls `onComplete`.

- [ ] **Step 1: Create ScoringTransition.tsx**

```tsx
// src/components/onboarding/ScoringTransition.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { deriveProfile } from '@/lib/onboarding/deriveProfile';
import type { DerivedProfile, OnboardingProgress, RawScores } from '@/lib/onboarding/types';

interface ScoringTransitionProps {
  progress: OnboardingProgress;
  onComplete: (profile: DerivedProfile) => void;
  onError: (error: string) => void;
  userId: string;
}

export function ScoringTransition({ progress, onComplete, onError, userId }: ScoringTransitionProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    run();
  }, []);

  async function run() {
    try {
      let finalScores: RawScores = { ...progress.scores };

      // Step 1: Adjust scores for free-text answers (if any).
      // Note: Q14 (growthGoal) is always stored as free text, so this API call fires for every user.
      const hasFreeText = Object.keys(progress.freeTextAnswers).length > 0;
      if (hasFreeText) {
        try {
          const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
          const resp = await fetch('/api/onboarding/score-freetext', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              freeTextAnswers: progress.freeTextAnswers,
              currentScores: progress.scores,
            }),
          });
          if (resp.ok) {
            const { scoreAdjustments } = await resp.json();
            for (const [key, val] of Object.entries(scoreAdjustments) as [keyof RawScores, number][]) {
              finalScores[key] = Math.max(0, (finalScores[key] ?? 0) + val);
            }
          }
        } catch {
          // Graceful degradation — continue with original scores
        }
      }

      // Step 2: Derive profile
      const adjustedProgress: OnboardingProgress = { ...progress, scores: finalScores };
      const profile = deriveProfile(adjustedProgress);

      // Step 3: Write to DB
      // 3a: Update profiles columns
      await supabase
        .from('profiles')
        .update({
          name: profile.firstName,
          partner_name: profile.partnerName,
          age_range: profile.ageRange,
          pronouns: profile.pronouns,
          psychological_profile: profile,
          isonboarded: false, // set to true after journey confirmed
        })
        .eq('id', userId);

      // 3b: Upsert profile_traits for the 3 key traits
      const traitUpserts = [
        profile.attachmentStyle && {
          user_id: userId,
          trait_key: 'attachment_style',
          inferred_value: profile.attachmentStyle,
          confidence: 0.7,
          effective_weight: 1.0,
        },
        profile.loveLanguage && {
          user_id: userId,
          trait_key: 'love_language',
          inferred_value: profile.loveLanguage,
          confidence: 0.7,
          effective_weight: 1.0,
        },
        profile.conflictStyle && {
          user_id: userId,
          trait_key: 'conflict_style',
          inferred_value: profile.conflictStyle,
          confidence: 0.7,
          effective_weight: 1.0,
        },
      ].filter(Boolean);

      if (traitUpserts.length > 0) {
        await supabase
          .from('profile_traits')
          .upsert(traitUpserts, { onConflict: 'user_id,trait_key' });
      }

      onComplete(profile);
    } catch (err) {
      console.error('ScoringTransition error:', err);
      onError('Something went wrong building your profile. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <PeterAvatar mood="morning" size={72} />
      </motion.div>
      <p className="text-[#6B4C3B] text-sm font-serif italic text-center">
        Give me just a moment...
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/ScoringTransition.tsx
git commit -m "feat: add ScoringTransition component (derive profile + write to DB)"
```

---

## Task 11: PeterSession Component

**Files:**
- Create: `src/components/onboarding/PeterSession.tsx`

- [ ] **Step 1: Create PeterSession.tsx**

```tsx
// src/components/onboarding/PeterSession.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';
import type { DerivedProfile } from '@/lib/onboarding/types';
import type { PeterMessage } from '@/lib/peterService';

interface PeterSessionProps {
  profile: DerivedProfile;
  onComplete: (updatedProfile: DerivedProfile) => void;
  userId: string;
}

export function PeterSession({ profile, onComplete, userId }: PeterSessionProps) {
  const [messages, setMessages] = useState<PeterMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const hasInitialized = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fire the first Peter message on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    sendMessage(null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(userText: string | null) {
    setIsLoading(true);

    const nextMessages: PeterMessage[] = userText
      ? [...messages, { role: 'user', content: userText }]
      : messages;

    if (userText) {
      setMessages(nextMessages);
      setUserInput('');
    }

    const nextExchangeCount = exchangeCount + 1;

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/peter/onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: nextMessages,
          profile,
          exchangeCount: nextExchangeCount,
        }),
      });

      if (!resp.ok) throw new Error('Peter request failed');

      const { message, shouldClose, safety } = await resp.json();

      setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      setExchangeCount(nextExchangeCount);

      if (shouldClose) {
        // Extract just the personalised observation sentence (first line before sign-off).
        // The system prompt instructs Peter to put the closing observation on its own first line
        // followed by "Let me show you where I think we start. 🦦" on the next line.
        const closingObservation = message.split('\n')[0].trim() || message;
        const updatedProfile: DerivedProfile = { ...profile, peterClosingSentence: closingObservation };

        // Second PATCH to psychological_profile to add closing sentence
        await supabase
          .from('profiles')
          .update({
            psychological_profile: updatedProfile,
          })
          .eq('id', userId);

        // Pause briefly so user reads the closing message before transition
        setTimeout(() => onComplete(updatedProfile), 2500);
      }
    } catch (err) {
      console.error('PeterSession error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a moment — give me a second and try again. 🦦",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const canSend = userInput.trim().length > 0 && !isLoading && exchangeCount < 5;

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32 max-w-md mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && <PeterAvatar mood="curious" size={40} />}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-white border border-[#e5e7eb] text-[#1f2937] rounded-tl-sm font-serif italic'
                    : 'bg-[#C0614A] text-white rounded-tr-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <PeterAvatar mood="morning" size={40} />
            <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-tl-sm px-4 py-3">
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#C0614A]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {messages.length > 0 && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#f5ede4] border-t border-[#e5e7eb] px-4 py-3">
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSend && sendMessage(userInput)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#C0614A]/20 bg-white text-[#2C1A14] placeholder-[#6B4C3B]/50 focus:outline-none focus:border-[#C0614A] text-sm"
            />
            <button
              onClick={() => sendMessage(userInput)}
              disabled={!canSend}
              className="bg-[#C0614A] text-white rounded-2xl px-4 py-3 font-semibold text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/PeterSession.tsx
git commit -m "feat: add PeterSession live chat component for onboarding Phase 2"
```

---

## Task 12: JourneyRecommendation Component

**Files:**
- Create: `src/components/onboarding/JourneyRecommendation.tsx`

- [ ] **Step 1: Create JourneyRecommendation.tsx**

```tsx
// src/components/onboarding/JourneyRecommendation.tsx
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { matchJourney } from '@/lib/onboarding/journeyMatcher';
import { journeys } from '@/data/journeys';
import type { DerivedProfile } from '@/lib/onboarding/types';

interface JourneyRecommendationProps {
  profile: DerivedProfile;
  onSelectJourney: (journeyId: string, peterNote: string) => void;
}

export function JourneyRecommendation({ profile, onSelectJourney }: JourneyRecommendationProps) {
  const recommendation = matchJourney(profile);

  const primaryJourney = journeys.find(j => j.id === recommendation.primary.journeyId);
  const alternativeJourneys = recommendation.alternatives
    .map(alt => ({ ...alt, journey: journeys.find(j => j.id === alt.journeyId) }))
    .filter(a => a.journey);

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Peter's closing sentence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3 mb-8"
        >
          <PeterAvatar mood="celebrating" size={48} />
          <div
            className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[15px] leading-relaxed font-serif italic"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {profile.peterClosingSentence}
          </div>
        </motion.div>

        {/* Primary recommendation */}
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-3">
          Your starting point
        </p>

        {primaryJourney && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => onSelectJourney(primaryJourney.id, recommendation.primary.peterNote)}
            className="w-full text-left bg-white rounded-[20px] overflow-hidden shadow-sm mb-6"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div
              className="h-28 flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg, #C0614A, #7c3aed)' }}
            >
              {/* Placeholder gradient until AI images are generated */}
              <span className="text-4xl">{primaryJourney.id === 'attachment-healing' ? '🧡' : '✨'}</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-1">
                Recommended for you
              </p>
              <p className="text-lg font-bold text-[#1f2937] mb-2">{primaryJourney.title}</p>
              <p className="text-sm text-[#6b7280] leading-relaxed italic">
                "I think you'd get the most out of this one — {recommendation.primary.reason} But if something else speaks to you, go there instead."
              </p>
            </div>
          </motion.button>
        )}

        {/* Alternatives */}
        {alternativeJourneys.length > 0 && (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9ca3af] mb-3">
              Other paths that fit you
            </p>
            <div className="flex flex-col gap-2">
              {alternativeJourneys.map((alt, i) => (
                <motion.button
                  key={alt.journeyId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                  onClick={() => onSelectJourney(alt.journeyId, alt.peterNote)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 text-left opacity-80 hover:opacity-100 transition-opacity"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] flex items-center justify-center text-xl flex-shrink-0">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2937]">{alt.journey?.title}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{alt.journey?.duration}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/JourneyRecommendation.tsx
git commit -m "feat: add JourneyRecommendation component"
```

---

## Task 13: JourneyDetail Component

**Files:**
- Create: `src/components/onboarding/JourneyDetail.tsx`

- [ ] **Step 1: Create JourneyDetail.tsx**

```tsx
// src/components/onboarding/JourneyDetail.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';
import { journeys } from '@/data/journeys';
import type { DerivedProfile } from '@/lib/onboarding/types';

interface JourneyDetailProps {
  journeyId: string;
  peterNote: string;
  profile: DerivedProfile;
  onBack: () => void;
  onConfirm: () => void;
  userId: string;
}

export function JourneyDetail({ journeyId, peterNote, profile, onBack, onConfirm, userId }: JourneyDetailProps) {
  const [day1Preview, setDay1Preview] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const journey = journeys.find(j => j.id === journeyId);

  // Load Day 1 question from DB
  useEffect(() => {
    async function loadDay1() {
      const { data } = await supabase
        .from('journey_questions')
        .select('question_text')
        .eq('journey_id', journeyId)
        .eq('day_number', 1)
        .maybeSingle();

      setDay1Preview(data?.question_text ?? journey?.overview ?? null);
    }
    loadDay1();
  }, [journeyId]);

  async function handleStart() {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/journeys/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ journey_id: journeyId }),
      });

      // Mark onboarded
      await supabase
        .from('profiles')
        .update({ isonboarded: true })
        .eq('id', userId);

      // Clear localStorage
      localStorage.removeItem('sparq_onboarding_progress');

      onConfirm();
    } catch (err) {
      console.error('Journey start error:', err);
      setIsStarting(false);
    }
  }

  if (!journey) return null;

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#C0614A] text-sm font-semibold mb-6"
        >
          ← Back
        </button>

        {/* Header image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-40 rounded-[20px] flex items-center justify-center text-5xl mb-6"
          style={{ background: 'linear-gradient(135deg, #C0614A, #7c3aed)' }}
        >
          ✨
        </motion.div>

        <h1 className="text-2xl font-bold text-[#1f2937] mb-1">{journey.title}</h1>
        <p className="text-sm text-[#6b7280] mb-6">{journey.duration} · Beginner · Starts today</p>

        {/* What you'll be doing */}
        <div className="bg-white rounded-[20px] p-5 mb-4" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-4">
            Here&apos;s what you&apos;ll be doing
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Each day:</strong> one reflection question, one short insight from me, one small action to try in real life.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Takes about 5 minutes.</strong> No homework, no pressure — just one tiny move at a time.
              </p>
            </div>
            {day1Preview && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
                <p className="text-sm text-[#374151] leading-relaxed">
                  <strong>Day 1 today:</strong> {day1Preview}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Peter's note */}
        <div className="flex items-start gap-3 mb-8">
          <PeterAvatar mood="morning" size={40} />
          <div
            className="flex-1 bg-[#fef3c7] rounded-2xl rounded-tl-sm p-4 text-sm text-[#92400e] leading-relaxed font-serif italic"
            style={{ border: '1px solid #fbbf24' }}
          >
            {peterNote}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full bg-[#C0614A] text-white rounded-2xl py-4 text-base font-semibold disabled:opacity-60 transition-colors"
        >
          {isStarting ? 'Starting...' : "Let's start →"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/JourneyDetail.tsx
git commit -m "feat: add JourneyDetail component with Day 1 preview and confirm"
```

---

## Task 14: Main Onboarding Page

**Files:**
- Create: `src/pages/onboarding.tsx`
- Delete: `src/pages/onboarding-flow.tsx`

This is the state machine that wires all components together and handles the consent gate, dropout recovery, and routing.

- [ ] **Step 1: Create onboarding.tsx**

```tsx
// src/pages/onboarding.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { ConsentGate } from '@/components/onboarding/ConsentGate';
import { QuestionFlow } from '@/components/onboarding/QuestionFlow';
import { ScoringTransition } from '@/components/onboarding/ScoringTransition';
import { PeterSession } from '@/components/onboarding/PeterSession';
import { JourneyRecommendation } from '@/components/onboarding/JourneyRecommendation';
import { JourneyDetail } from '@/components/onboarding/JourneyDetail';
import type { DerivedProfile, OnboardingPhase, OnboardingProgress } from '@/lib/onboarding/types';

const STORAGE_KEY = 'sparq_onboarding_progress';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<OnboardingPhase>('consent');
  const [hasConsent, setHasConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentError, setConsentError] = useState('');

  const [savedProgress, setSavedProgress] = useState<OnboardingProgress | null>(null);
  const [profile, setProfile] = useState<DerivedProfile | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [selectedPeterNote, setSelectedPeterNote] = useState<string>('');
  const [scoringError, setScoringError] = useState('');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  // Load consent + check for dropout recovery
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const resp = await fetch('/api/preferences', { headers });
        if (!resp.ok) throw new Error('Failed to load preferences');
        const payload = await resp.json();
        if (cancelled) return;

        const consented = Boolean(payload?.consent?.has_consented);
        setHasConsent(consented);

        if (consented) {
          // Check for dropout recovery
          const { data: profileData } = await supabase
            .from('profiles')
            .select('isonboarded, psychological_profile')
            .eq('id', user.id)
            .single();

          if (profileData && !profileData.isonboarded && profileData.psychological_profile) {
            // User completed scoring but never confirmed a journey — resume from journey_rec
            setProfile(profileData.psychological_profile as DerivedProfile);
            setPhase('journey_rec');
          } else {
            // Restore partial question progress from localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              try { setSavedProgress(JSON.parse(stored)); } catch {}
            }
            setPhase('questions');
          }
        }
      } catch (err) {
        console.error('Onboarding init error:', err);
      } finally {
        if (!cancelled) setConsentChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  async function handleConsentAgree() {
    if (!user || consentSaving) return;
    setConsentSaving(true);
    setConsentError('');

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/preferences', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ grant_consent: true, consent_source: 'onboarding_flow' }),
      });
      if (!resp.ok) throw new Error('Failed to record consent');
      setHasConsent(true);
      setPhase('questions');
    } catch {
      setConsentError('We could not save your consent. Please try again.');
    } finally {
      setConsentSaving(false);
    }
  }

  if (authLoading || (user && !consentChecked)) {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PeterAvatar mood="morning" size={64} />
        </motion.div>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <ConsentGate
        onAgree={handleConsentAgree}
        onReviewTrust={() => router.push('/trust-center')}
        isSaving={consentSaving}
        error={consentError}
      />
    );
  }

  if (phase === 'questions') {
    return (
      <QuestionFlow
        initialProgress={savedProgress}
        onComplete={(completedProgress) => {
          setSavedProgress(completedProgress);
          setPhase('scoring_transition');
        }}
      />
    );
  }

  if (phase === 'scoring_transition' && savedProgress && user) {
    return (
      <ScoringTransition
        progress={savedProgress}
        userId={user.id}
        onComplete={(derivedProfile) => {
          setProfile(derivedProfile);
          setPhase('peter_session');
        }}
        onError={(msg) => setScoringError(msg)}
      />
    );
  }

  if (phase === 'peter_session' && profile && user) {
    return (
      <PeterSession
        profile={profile}
        userId={user.id}
        onComplete={(updatedProfile) => {
          setProfile(updatedProfile);
          setPhase('journey_rec');
        }}
      />
    );
  }

  if (phase === 'journey_rec' && profile) {
    return (
      <JourneyRecommendation
        profile={profile}
        onSelectJourney={(journeyId, peterNote) => {
          setSelectedJourneyId(journeyId);
          setSelectedPeterNote(peterNote);
          setPhase('journey_detail');
        }}
      />
    );
  }

  if (phase === 'journey_detail' && profile && selectedJourneyId && user) {
    return (
      <JourneyDetail
        journeyId={selectedJourneyId}
        peterNote={selectedPeterNote}
        profile={profile}
        userId={user.id}
        onBack={() => setPhase('journey_rec')}
        onConfirm={() => router.push('/dashboard?from=onboarding')}
      />
    );
  }

  // Scoring error fallback
  if (scoringError) {
    return (
      <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4 gap-4">
        <PeterAvatar mood="morning" size={64} />
        <p className="text-[#6B4C3B] text-center text-sm">{scoringError}</p>
        <button
          onClick={() => {
            setScoringError('');
            // If savedProgress was lost (e.g. page remounted), fall back to questions
            setPhase(savedProgress ? 'scoring_transition' : 'questions');
          }}
          className="bg-[#C0614A] text-white rounded-2xl px-6 py-3 font-semibold text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/onboarding.tsx
git commit -m "feat: add onboarding state machine page (/onboarding)"
```

---

## Task 15: Cleanup and Routing

**Files:**
- Delete: `src/pages/onboarding-flow.tsx`
- Verify: routing references

- [ ] **Step 1: Delete the old onboarding flow**

```bash
git rm src/pages/onboarding-flow.tsx
```

- [ ] **Step 2: Search for any remaining references to onboarding-flow**

```bash
grep -r "onboarding-flow" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: no results. If any found, update the references to point to `/onboarding`.

- [ ] **Step 3: Verify auth redirect in auth-context points to /onboarding**

Check `src/lib/auth-context.tsx` — look for where it redirects new users after registration. If it currently redirects to `/onboarding-flow`, update to `/onboarding`.

```bash
grep -n "onboarding" src/lib/auth-context.tsx
```

Update any `onboarding-flow` references to `onboarding`.

- [ ] **Step 4: Full build verification**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or lint errors.

- [ ] **Step 5: End-to-end manual test**

Start `npm run dev`. Create a fresh test account (or use an account with `isonboarded = false`). Navigate to `/onboarding`. Walk through the complete flow:

1. Consent gate appears → click "I agree, let's start"
2. Q1–Q14 complete — answer with a mix of quick replies and "write my own" on at least 2 questions
3. Scoring transition shows Peter loading animation
4. Peter session opens with attachment-appropriate opening — exchange 2–3 messages
5. Journey recommendation screen shows Peter's closing sentence + primary + 2 alternatives
6. Tap primary journey → detail screen shows with Day 1 preview
7. Tap "Let's start →" → navigates to `/dashboard?from=onboarding`
8. In Supabase dashboard, verify:
   - `profiles.psychological_profile` is populated with full JSON
   - `profiles.age_range` and `profiles.pronouns` are set
   - `profiles.isonboarded` is `true`
   - `profile_traits` has rows for attachment_style, love_language, conflict_style
   - `user_journeys` has a row for the selected journey

- [ ] **Step 6: Test dropout recovery**

Start onboarding, answer 5+ questions, then close the browser tab. Reopen → navigate to `/onboarding`. Verify it resumes from where you left off (localStorage restoration).

Complete through Peter's session, then close again. Reopen → verify it skips straight to journey recommendation (DB dropout recovery path).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: complete conversational onboarding — replaces old 4-step flow

- 14-question conversational flow with Peter
- Silent clinical scoring engine (attachmentStyle, dysregulation, etc.)
- deriveProfile() produces full psychological profile
- Free-text score adjustment via /api/onboarding/score-freetext
- Live Peter session via /api/peter/onboarding (no entitlements, crisis on)
- Journey recommendation with attachment-based matching
- Journey detail with Day 1 preview and confirm
- Dropout recovery via localStorage + DB
- Single migration adds age_range, pronouns, psychological_profile to profiles"
```
