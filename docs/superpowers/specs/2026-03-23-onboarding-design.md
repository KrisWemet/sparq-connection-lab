# Sparq Connection — Conversational Onboarding Design Spec
**Date:** 2026-03-23
**Status:** Approved
**Replaces:** `src/pages/onboarding-flow.tsx` (4-step flow — removed entirely)

---

## Overview

A single conversational onboarding session with Peter that replaces the existing 4-step onboarding flow. The user experiences a warm, curious conversation. What actually happens is a clinical profile being built silently in the background that shapes every downstream interaction — Peter's tone, question style, journey recommendations, session pacing, and therapeutic modality weighting.

The user never sees how they've been classified. They never see clinical language. They just feel like the app already knows them.

---

## What Success Looks Like

- User completes onboarding in one sitting (target: under 10 minutes)
- Profile object is accurate enough that Peter's Phase 2 opening feels like he already knows them
- User reaches journey recommendation and chooses one
- User completes Day 1 of their journey
- User returns for Day 2 without being prompted

---

## Architecture

### Page & State Machine

One page (`/onboarding`) manages all phases as a typed state machine. Replaces `onboarding-flow.tsx` entirely.

```
consent → questions [1–14] → scoring_transition → peter_session → journey_rec → journey_detail → /dashboard
```

| State | What happens | API calls | Persisted to |
|---|---|---|---|
| `consent` | Existing consent gate — user agrees to personalization | PATCH /api/preferences | profiles.consent_given_at |
| `questions` | 14 conversational questions. Client-side scoring only. Progress saved to localStorage on every answer. | None | localStorage |
| `scoring_transition` | `deriveProfile()` runs. If any free-text answers exist → POST /api/onboarding/score-freetext → adjusts raw scores. Profile written to DB. | 0–1 (conditional) | profiles.psychological_profile, profile_traits (3 key traits) |
| `peter_session` | Live 2–5 exchange conversation. Peter opens based on attachmentStyle. Peter signals when to close. | 2–5 × POST /api/peter/onboarding | — |
| `journey_rec` | Peter's closing sentence + primary journey card + 2–3 alternatives | None | — |
| `journey_detail` | "Here's what you'll be doing" summary. User confirms. | POST /api/journeys/start | user_journeys, profiles.isonboarded |

### File Structure

```
src/pages/
  onboarding-flow.tsx          ← replaced entirely (delete)

src/components/onboarding/
  ConsentGate.tsx              ← extracted from old flow, unchanged
  QuestionFlow.tsx             ← 14 questions + conversational bridges
  ScoringTransition.tsx        ← loading state + profile write
  PeterSession.tsx             ← live chat UI (2–5 exchanges)
  JourneyRecommendation.tsx    ← primary card + alternatives
  JourneyDetail.tsx            ← "here's what you'll do" + confirm

src/lib/onboarding/
  questions.ts                 ← question definitions, options, scoring maps, bridges
  deriveProfile.ts             ← raw scores → DerivedProfile object
  journeyMatcher.ts            ← DerivedProfile → journey recommendation

src/pages/api/
  peter/onboarding.ts          ← NEW: Phase 2 Peter session endpoint
  onboarding/score-freetext.ts ← NEW: free-text score adjustment endpoint
```

---

## Profile Object

Written to `profiles.psychological_profile` (JSONB) at the end of `scoring_transition`.

```typescript
interface DerivedProfile {
  // Identity
  firstName: string
  ageRange: string
  pronouns: string
  relationshipStatus: string
  partnerName: string | null
  relationshipLength: string | null
  partnerUsing: string | null

  // Clinical signals (derived silently)
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
  dysregulationLevel: 'low' | 'moderate' | 'high'
  abandonmentFear: 'low' | 'moderate' | 'high'
  selfWorthPattern: 'stable' | 'conditional' | 'fragile'
  traumaFlag: boolean

  // Modality routing
  primaryModalities: string[]   // e.g. ['EFT', 'DBT', 'IFS', 'Somatic']
  toneMode: 'validation-first' | 'nurturing' | 'collaborative'

  // Preferences
  loveLanguage: string
  conflictStyle: string
  lifeContext: string
  checkInFrequency: string
  growthGoal: string            // free text, used for NLP intent

  // Raw scores (kept for future recalibration)
  scores: {
    anxious: number
    avoidant: number
    secure: number
    disorganized: number
    dysregulation: number
    abandonment: number
    selfWorth: number           // high = fragile, low = stable
    trauma: number
  }

  // Free-text answers (passed to Peter in Phase 2)
  freeTextAnswers: Record<number, string>  // questionIndex → text
}
```

---

## Database Migration

Single migration file. No new tables. No RLS changes.

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_range              text,
  ADD COLUMN IF NOT EXISTS pronouns               text,
  ADD COLUMN IF NOT EXISTS psychological_profile  jsonb;
```

The three existing trait rows (`attachment_style`, `love_language`, `conflict_style`) continue to be written to `profile_traits` as before — no changes to the existing personalization pipeline.

---

## Phase 1 — The 14 Questions

### Design principles
- Peter's voice throughout — warm, curious, never clinical
- Each quick-reply option has a pre-written **conversational bridge**: 1–2 sentences Peter says reacting to the answer before the next question appears (~1.5s delay)
- Every question has a "Write my own" escape hatch — free-text answers stored in `freeTextAnswers`, scored during `scoring_transition` if present
- "Write my own" always gets a generic warm acknowledgment bridge: *"I appreciate you putting that into your own words."*
- Progress saved to localStorage on every answer (resilience against drop-off)
- Zero API calls in Phase 1

### Scoring dimensions

| Score | Derives | Threshold |
|---|---|---|
| `anxious` | `attachmentStyle` | Highest raw score wins |
| `avoidant` | `attachmentStyle` | Highest raw score wins |
| `secure` | `attachmentStyle` | Highest raw score wins |
| `disorganized` | `attachmentStyle` | Requires trauma ≥ 5 AND (anxious ≥ 4 OR avoidant ≥ 4) |
| `dysregulation` | `dysregulationLevel` | 0–3 low / 4–6 moderate / 7+ high |
| `abandonment` | `abandonmentFear` | 0–3 low / 4–6 moderate / 7+ high |
| `selfWorth` | `selfWorthPattern` | 0–3 stable / 4–6 conditional / 7+ fragile |
| `trauma` | `traumaFlag` | ≥ 5 → true |

All low (< 3 on all attachment scores) → defaults to `secure`.

### toneMode derivation
- `abandonmentFear` high OR `selfWorthPattern` fragile OR `dysregulationLevel` high → `"validation-first"`
- `attachmentStyle` anxious or disorganized → `"nurturing"` (unless already validation-first)
- else → `"collaborative"`

### primaryModalities derivation
Match against attachmentStyle first, then layer in signals:
- anxious → EFT, DBT
- avoidant → ACT, IFS
- disorganized → Somatic, IFS, EFT
- secure → Positive Psychology, Gottman
- dysregulationLevel moderate/high → add DBT
- abandonmentFear moderate/high → add EFT, Attachment Theory
- traumaFlag → add Somatic, IFS
- conflictStyle avoidant → add Gottman, NVC
- conflictStyle volatile → add DBT, NVC
- Max 4 modalities

### The 14 Questions

---

**Q1 — Name**
*Topic: Identity*
Peter: *"Hi — I'm Peter. I'm going to be with you every step of the way. Let's start easy: what's your name?"*
Input: free text (firstName)

---

**Q2 — Age + Pronouns**
*Topic: Identity — two quick-reply sets in one step*
Peter: *"[Name], really good to meet you. Couple of quick ones—"*

Age options:
- Under 25
- 25–34
- 35–44
- 45+

Pronouns options:
- She / Her
- He / Him
- They / Them
- Something else → free text

Captures: `ageRange`, `pronouns`

---

**Q3 — Relationship Status + Partner Name**
*Topic: Identity — partner name appears inline if partnered*
Peter: *"Tell me a little about your relationship right now."*

| Option | Scoring |
|---|---|
| Married or long-term committed | identity |
| In a serious relationship | identity |
| It's been a complicated stretch | dysregulation +1 |

If committed or serious → inline text input: *"What's your partner's name?"*
Captures: `relationshipStatus`, `partnerName`

**Bridges:**
- committed/serious: *"That's a real foundation to build on."*
- complicated: *"I hear you — complicated is honest. I respect that."*

---

**Q4 — Relationship Length**
*Topic: Identity*
Peter: *"How long have you and [partnerName] been together?"*

Options: Less than a year / 1 to 3 years / 3 to 7 years / More than 7 years
Captures: `relationshipLength`

**Bridge:** *"Got it. [X] years — you've been through some things together."* (adapted per range)

---

**Q5 — Partner Joining**
*Topic: Identity*
Peter: *"Is [partnerName] joining you on Sparq too, or are you the one leading the charge?"*

Options: We're doing this together / I'm going first — hoping they join / Just me for now
Captures: `partnerUsing`

**Bridges:**
- together: *"I love that. Two people showing up — that matters."*
- going first: *"That takes courage. Leading the way says a lot about you."*
- just me: *"That's completely okay. This is yours."*

---

**Q6 — Emotional Speed**
*Topic: Dysregulation signal — anxious / avoidant / secure*
Peter: *"When something feels off between you — a short reply, a change in tone, a quiet night — how does it land for you?"*

| Option | Scoring |
|---|---|
| It hits me fast and hard — I feel it right away | dysregulation +3, anxious +2 |
| I notice it, but I can usually breathe through it | dysregulation +1, secure +1 |
| I tend to go quiet and not think about it much | avoidant +2 |
| Write my own | free text |

**Bridges:**
- fast and hard: *"Yeah — when you care, it's hard not to feel it. That makes sense."*
- breathe through it: *"That's actually a real skill, even when it doesn't feel like one."*
- go quiet: *"Stepping back to process — there's a kind of wisdom in that too."*

---

**Q7 — Recovery Time**
*Topic: Dysregulation signal — avoidant / secure*
Peter: *"And after a tough moment between you — how long does it usually take you to feel like yourself again?"*

| Option | Scoring |
|---|---|
| I bounce back pretty fast | secure +1 |
| A few hours — I need to process a bit | dysregulation +1 |
| It can take a day or more | dysregulation +3 |
| I shut down and it takes a long time to come back | avoidant +2, dysregulation +2 |
| Write my own | free text |

**Bridges:**
- bounce back: *"That resilience is going to serve you well here."*
- few hours: *"Processing takes what it takes. Nothing wrong with that."*
- day or more: *"That's real — sometimes the feelings need somewhere to go first."*
- shut down: *"That kind of shutting down makes sense. We'll work with that gently."*

---

**Q8 — Abandonment Response**
*Topic: Abandonment + anxious / avoidant / secure*
Peter: *"If [partnerName] went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?"*

| Option | Scoring |
|---|---|
| I'd start wondering if something's wrong between us | abandonment +3, anxious +3 |
| I'd figure they're busy or tired | secure +2 |
| Honestly, I'd enjoy the space | avoidant +3 |
| I'd notice it, but try not to make it mean something | abandonment +1, anxious +1 |
| Write my own | free text |

**Bridges:**
- something's wrong: *"That checking instinct — it comes from caring. I hear you."*
- busy or tired: *"That kind of trust is a quiet strength."*
- enjoy the space: *"Nothing wrong with needing room to breathe."*
- try not to make it mean something: *"That awareness is already a step most people skip."*

---

**Q9 — Inner Voice**
*Topic: Self-worth + abandonment + dysregulation*
Peter: *"When things get rocky between you, what does the voice inside your head usually sound like?"*

| Option | Scoring |
|---|---|
| It says I'm probably the problem | selfWorth +3 |
| It says we're both human and we'll figure it out | no increment (stable) |
| It wonders if they're losing interest in me | selfWorth +2, abandonment +2 |
| It gets pretty loud and hard to quiet | selfWorth +2, dysregulation +1 |
| Write my own | free text |

**Bridges:**
- probably the problem: *"That voice is lying to you more than you know. We're going to work on that."*
- both human: *"That's a grounded place to come from. I like that."*
- losing interest: *"That fear makes sense. It doesn't make it true."*
- loud and hard to quiet: *"When the volume goes up like that, it's hard to hear anything else. I get it."*

---

**Q10 — Childhood Safety**
*Topic: Trauma signal + disorganized attachment*
Peter: *"Growing up — was home a place that felt mostly safe and steady for you?"*

| Option | Scoring |
|---|---|
| Mostly yes | no increment |
| It had its moments, but mostly okay | trauma +1 |
| It was complicated | trauma +3 |
| Not really — it was hard | trauma +5, disorganized +2 |
| Write my own | free text |

**Bridges:**
- mostly yes: *"That kind of foundation carries forward. Good to know."*
- had its moments: *"Honest answer. Most people's childhoods had some of both."*
- complicated: *"Thank you for trusting me with that. It helps me understand you better."*
- not really: *"That took courage to say. I'm glad you told me. We'll go gently."*

---

**Q11 — Conflict Style**
*Topic: conflictStyle field + minor avoidant / secure*
Peter: *"When you and [partnerName] hit a rough patch, which sounds most like you?"*

| Option | Scoring |
|---|---|
| I bring it up — even when it's uncomfortable | conflictStyle: volatile |
| I need space to cool down before I can talk | conflictStyle: avoidant, avoidant +1 |
| I try to make sure we both feel heard | conflictStyle: validating, secure +1 |
| Write my own | free text |

**Bridges:**
- bring it up: *"That directness — when it's timed right — is actually a gift to a relationship."*
- need space: *"Taking space before you speak is smarter than most people realise."*
- both feel heard: *"That instinct to hold space for both of you — that's rare."*

---

**Q12 — Love Language**
*Topic: loveLanguage field*
Peter: *"What makes you feel most loved by [partnerName]? Like, what really lands?"*

| Option | Captures |
|---|---|
| When they say it out loud — words really matter to me | words |
| When they do something thoughtful without being asked | acts |
| When we just spend real, present time together | time |
| Physical closeness — a hug, a touch | touch |
| Write my own → free text | stored as-is |

**Bridges:**
- words: *"Words of love are powerful. The right ones at the right moment change everything."*
- acts: *"When someone shows you instead of tells you — that lands deep."*
- time: *"Undivided presence is one of the rarest things someone can give."*
- touch: *"Physical connection is its own language. Some people feel it more than anything else."*

---

**Q13 — Life Context**
*Topic: lifeContext field + minor trauma / dysregulation*
Peter: *"Last check-in before we really get going. What's life feeling like right now, outside the relationship?"*

| Option | Scoring |
|---|---|
| Pretty steady — things are okay | lifeContext: stable |
| Busy and a bit stretched thin | lifeContext: stressed, dysregulation +1 |
| We're going through a big change right now | lifeContext: transition, dysregulation +1 |
| It's been heavy — loss, grief, or something really hard | lifeContext: heavy, trauma +2, dysregulation +1 |
| Write my own | free text |

**Bridges:**
- steady: *"Good. That gives us something solid to build on."*
- stretched thin: *"Got it — we'll keep things light and practical."*
- big change: *"Change takes a lot out of you. We'll work with where you are."*
- heavy: *"I'm sorry. We'll go gently, and we'll start where you have the most energy."*

---

**Q14 — Growth Goal + Check-in Frequency**
*Topic: growthGoal (free text, mandatory) + checkInFrequency*
Peter: *"And what is it you're really hoping for — the thing you can't quite put words to yet, but you feel it?"*

Input: free text (mandatory, min 3 chars) → captures `growthGoal`

Peter: *"Got it. How often would you like to check in with me?"*

Options: Every day / A few times a week / Once a week
Captures: `checkInFrequency`

**Bridge after growth goal entry:** *"That matters. Hold onto that — it's exactly why you're here."*

---

## Phase 1 → Phase 2 Transition (scoring_transition)

1. `deriveProfile()` runs client-side on raw scores → produces `DerivedProfile`
2. If `freeTextAnswers` has any entries → POST `/api/onboarding/score-freetext`
   - Sends all free-text answers + current raw scores
   - Server runs lightweight LLM call to infer score adjustments
   - Returns adjusted scores
   - `deriveProfile()` re-runs on adjusted scores
3. Profile written to DB:
   - `profiles.psychological_profile` ← full `DerivedProfile` JSONB
   - `profile_traits` rows ← `attachment_style`, `love_language`, `conflict_style` (existing pattern)
   - `profiles.age_range`, `profiles.pronouns` ← new columns
   - `profiles.partner_name`, `profiles.name` ← existing columns
4. Transition to `peter_session`

If no free-text answers: step 2 is skipped entirely (zero API calls in Phase 1 maintained).

---

## Phase 2 — Live Peter Session

### API endpoint: POST /api/peter/onboarding

**Request:**
```typescript
{
  messages: PeterMessage[]      // full conversation so far
  profile: DerivedProfile       // from deriveProfile()
  exchangeCount: number         // 1–5
}
```

**Response:**
```typescript
{
  message: string
  shouldClose: boolean          // Peter decided he has enough
  safety: { triggered: boolean }
}
```

**Behaviour:**
- No entitlement checks
- No usage caps
- No daily message counting
- Crisis detection: always on
- System prompt built from: `profile.attachmentStyle` + `profile.toneMode` + `profile.freeTextAnswers` + Peter's base character rules
- `shouldClose` is derived from a hidden `READY_TO_CLOSE` marker Peter includes in his response JSON when he has enough context. Stripped before rendering.
- Hard stop at 5 exchanges regardless

### Opening moves by attachmentStyle

**Anxious:** Names their hypervigilance gently. First question redirects external scanning inward.
> *"Hey [Name]. I feel like I've got a real sense of you now — and the way you feel things so quickly? That's not a flaw. That's how much you care. Here's something I'm curious about though. When things are calm between you and [partner] — really calm — do you trust it? Or does part of you wait for the other shoe to drop?"*

**Avoidant:** Acknowledges their strength first. First question asks them to locate the feeling right before they disconnect.
> *"Hey [Name]. I can already tell — you're someone who keeps it together. Probably the person in the relationship who stays calm when things get loud. I'm curious: right before you go quiet in a hard moment — what's actually happening inside? Like the half-second before you step back?"*

**Disorganized:** Pure validation first — no reframe. First question asks for evidence that safety has existed at least once.
> *"Hey [Name]. I hear you — and I just want to say first, before anything else: what you've carried makes sense. You're not broken. You learned to survive, and you did. Can I ask — is there one time you can remember feeling genuinely safe? Doesn't have to be in your relationship. Anywhere, anyone, any moment."*

**Secure:** Collaborative energy. First question explores what specific depth they're looking for.
> *"Hey [Name] — I like you already. You've got a real groundedness about you. So here's what I want to know: what kind of depth are you actually after here? Like if things got really good between you and [partner] — what would that actually look like for you?"*

### Closing

Every closing ends with: *"Let me show you where I think we start. 🦦"* — natural transition into journey recommendation.

---

## Phase 3 — Journey Recommendation

### Recommendation screen

- Peter's closing sentence (LLM-generated, the "how did he know that" moment)
- Primary journey card: visually dominant, includes Peter's personalised one-sentence reason
- 2–3 alternative journey cards: lower visual weight below
- Format: *"I think you'd get the most out of [Journey Name] — [one sentence why it fits them specifically]. But if something else speaks to you, go there instead."*

### Journey matching logic (journeyMatcher.ts)

| attachmentStyle | Primary | Alternatives |
|---|---|---|
| anxious | Attachment Healing | Trust Rebuilding, Clear Connection |
| avoidant | Emotional Intelligence | Values, Clear Connection |
| disorganized | Attachment Healing | Values, Mindful Sexuality |
| secure | Relationship Renewal | 5 Love Languages, Intimacy |

**Overrides:**
- `traumaFlag = true` → always include Attachment Healing as primary or alternative
- `lifeContext = "heavy"` → deprioritise Sexual Intimacy and Fantasy Exploration journeys

### Journey detail screen

Shown when user taps any journey card. Contains:
- Journey name + duration
- "Here's what you'll be doing" section: one reflection, one insight, one action per day — takes 5 minutes
- Day 1 preview (specific to the selected journey)
- Peter's personalised closing note
- "Let's start →" button

On confirm:
1. POST `/api/journeys/start` → writes `user_journeys` row
2. `profiles.isonboarded = true`
3. Navigate to `/dashboard?from=onboarding`

### Journey images
Journey card images will be generated with an AI image tool during final design phase. Spec uses gradient placeholders.

---

## Out of Scope for This Feature

- Journey tiers (Intermediate / Advanced) — Beginner only
- Partner-linked onboarding — post-beta
- pgvector long-term memory — deferred
- Push notifications
- Dashboard or analytics for onboarding completion
- New journeys (14 existing journeys only)
