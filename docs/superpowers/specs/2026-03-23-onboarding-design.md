# Sparq Connection — Conversational Onboarding Design Spec
**Date:** 2026-03-23
**Status:** Approved
**Replaces:** `src/pages/onboarding-flow.tsx` — delete this file entirely

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

One page at `src/pages/onboarding.tsx` (served at `/onboarding`) manages all phases as a typed state machine. The old `src/pages/onboarding-flow.tsx` is deleted — no redirect needed, no users in production yet.

```
consent → questions [1–14] → scoring_transition → peter_session → journey_rec → journey_detail → /dashboard
```

| State | What happens | API calls | Persisted to |
|---|---|---|---|
| `consent` | Existing consent gate — user agrees to personalization | PATCH /api/preferences | profiles.consent_given_at |
| `questions` | 14 conversational questions. Client-side scoring only. Progress saved to `sparq_onboarding_progress` localStorage key on every answer. | None | localStorage |
| `scoring_transition` | `deriveProfile()` runs. If any free-text answers exist → POST /api/onboarding/score-freetext → adjusts raw scores. Profile written to DB directly via Supabase client. | 0–1 (conditional) | profiles.psychological_profile, profile_traits (3 key traits) |
| `peter_session` | Live 2–5 exchange conversation. Peter opens based on attachmentStyle. Peter signals when to close. Minimum 2 exchanges before close is allowed. | 2–5 × POST /api/peter/onboarding | — |
| `journey_rec` | Peter's closing sentence (stored from last peter_session response) + primary journey card + 2–3 alternatives | None | — |
| `journey_detail` | "Here's what you'll be doing" summary. User confirms. | POST /api/journeys/start | user_journeys, profiles.isonboarded |

### Back navigation

- **Within questions (states 1–14):** Back button is shown on all questions after Q1. Navigating back restores the previous answer and recalculates running scores from scratch by replaying all answers from Q1 to current position. localStorage is updated on every answer.
- **After questions (scoring_transition onward):** No back navigation. The flow is forward-only once scoring begins.

### Dropout recovery

If a user completes `peter_session` but exits before confirming a journey, their `profiles.psychological_profile` is already written. On next login, if `isonboarded = false` AND `psychological_profile` is not null, skip directly to `journey_rec` using the stored profile. If `psychological_profile` is null (dropped during questions), restart from `questions` — localStorage restores progress automatically.

### File Structure

```
src/pages/
  onboarding.tsx               ← NEW (replaces onboarding-flow.tsx, which is deleted)

src/components/onboarding/
  ConsentGate.tsx              ← extracted from old flow, behaviour unchanged
  QuestionFlow.tsx             ← 14 questions + conversational bridges + back nav
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

Written to `profiles.psychological_profile` (JSONB) at the end of `scoring_transition`. Also written: `profiles.name`, `profiles.partner_name`, `profiles.age_range`, `profiles.pronouns` as typed columns (direct Supabase client write — not via the preferences API, which handles preference settings not profile identity fields).

```typescript
interface DerivedProfile {
  // Identity
  firstName: string
  ageRange: string
  pronouns: string
  relationshipStatus: string
  partnerName: string | null        // null if relationshipStatus === 'complicated'
  relationshipLength: string | null // null if relationshipStatus === 'complicated'
  partnerUsing: string | null       // null if relationshipStatus === 'complicated'

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
  conflictStyle: 'volatile' | 'avoidant' | 'validating' | string
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

  // Peter's closing sentence (stored from last peter_session exchange, used in journey_rec)
  peterClosingSentence: string
}
```

---

## Database Migration

Single migration file. No new tables. No RLS changes needed — existing `profiles` RLS already scopes reads/writes to the owning user.

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age_range              text,
  ADD COLUMN IF NOT EXISTS pronouns               text,
  ADD COLUMN IF NOT EXISTS psychological_profile  jsonb;
```

The three existing trait rows (`attachment_style`, `love_language`, `conflict_style`) continue to be written to `profile_traits` using `onConflict: 'user_id,trait_key'` — same pattern as the existing onboarding flow.

---

## Phase 1 — The 14 Questions

### Design principles
- Peter's voice throughout — warm, curious, never clinical
- Each quick-reply option has a pre-written **conversational bridge**: 1–2 sentences Peter says reacting to the answer before the next question appears. The same ~1.5s delay applies to all bridges, including the generic "write my own" bridge.
- Every question has a "Write my own" escape hatch — free-text answers stored in `freeTextAnswers`, scored during `scoring_transition` if present
- "Write my own" always gets a generic warm acknowledgment bridge: *"I appreciate you putting that into your own words."*
- Progress saved to localStorage key `sparq_onboarding_progress` on every answer
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

**Attachment style evaluation order:**
1. Check disorganized threshold first (trauma ≥ 5 AND (anxious ≥ 4 OR avoidant ≥ 4)) — if met, `attachmentStyle = "disorganized"` regardless of other scores
2. Otherwise, highest of anxious / avoidant / secure wins
3. All low (< 3 on all three) → defaults to `"secure"`

### toneMode derivation

Evaluated in strict priority order — first match wins:

1. `abandonmentFear` high OR `selfWorthPattern` fragile OR `dysregulationLevel` high → `"validation-first"`
2. `attachmentStyle` anxious or disorganized → `"nurturing"`
3. else → `"collaborative"`

Note: anxious attachment almost always co-occurs with elevated abandonment scores (Q8 scores both simultaneously), so most anxious users land on `"validation-first"` rather than `"nurturing"`. This is intentional — anxious users with high abandonment need validation before anything else.

### primaryModalities derivation

Match against attachmentStyle first, then layer in additional signals. Max 4 modalities in the final list:

- anxious → EFT, DBT
- avoidant → ACT, IFS
- disorganized → Somatic, IFS, EFT
- secure → Positive Psychology, Gottman
- dysregulationLevel moderate/high → add DBT
- abandonmentFear moderate/high → add EFT, Attachment Theory
- traumaFlag → add Somatic, IFS
- conflictStyle avoidant → add Gottman, NVC
- conflictStyle volatile → add DBT, NVC

### The 14 Questions

---

**Q1 — Name**
*Topic: Identity*
Peter: *"Hi — I'm Peter. I'm going to be with you every step of the way. Let's start easy: what's your name?"*
Input: free text (captures `firstName`)
No back button on Q1.

---

**Q2 — Age + Pronouns**
*Topic: Identity*
Peter: *"[Name], really good to meet you. Couple of quick ones—"*

Both sets of options are shown on the same screen under one Peter message. Age options are shown first; pronouns options appear below them. The step is not complete until both are selected. No bridge fires until both are answered.

Age options:
- Under 25
- 25–34
- 35–44
- 45+

Pronouns options:
- She / Her
- He / Him
- They / Them
- Something else → free text input (no scoring)

Captures: `ageRange`, `pronouns`
Bridge (fires after both selected): *"Good to know. Let's keep going."*

---

**Q3 — Relationship Status + Partner Name**
*Topic: Identity — partner name appears inline if not "complicated"*
Peter: *"Tell me a little about your relationship right now."*

| Option | Scoring |
|---|---|
| Married or long-term committed | identity only |
| In a serious relationship | identity only |
| It's been a complicated stretch | dysregulation +1 |

If committed or serious → inline text input appears below: *"What's your partner's name?"* Step is not complete until name is entered (min 1 char). If "complicated" → no partner name collected; `partnerName` is set to null.

Captures: `relationshipStatus`, `partnerName`

**Bridges:**
- committed/serious: *"That's a real foundation to build on."*
- complicated: *"I hear you — complicated is honest. I respect that."*

---

**Q4 — Relationship Length**
*Topic: Identity*

If `partnerName` is not null:
Peter: *"How long have you and [partnerName] been together?"*

If `partnerName` is null (complicated):
Peter: *"How long have you two been together?"*

Options: Less than a year / 1 to 3 years / 3 to 7 years / More than 7 years
Captures: `relationshipLength`

**Bridges (adapted per range):**
- less than a year: *"Still early — there's a lot of good ahead of you."*
- 1–3 years: *"You're right in the thick of building something real."*
- 3–7 years: *"A few years in — you've seen a few seasons together."*
- 7+ years: *"That's a long time. A lot of history, a lot of growth."*

---

**Q5 — Partner Joining**
*Topic: Identity*

If `partnerName` is not null:
Peter: *"Is [partnerName] joining you on Sparq too, or are you the one leading the charge?"*

If `partnerName` is null:
Peter: *"Are you starting Sparq with your partner, or is this just yours for now?"*

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

If `partnerName` is not null:
Peter: *"If [partnerName] went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?"*

If `partnerName` is null:
Peter: *"If your partner went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?"*

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
| It says we're both human and we'll figure it out | no increment (stable indicator) |
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

If `partnerName` is not null:
Peter: *"When you and [partnerName] hit a rough patch, which sounds most like you?"*

If `partnerName` is null:
Peter: *"When you and your partner hit a rough patch, which sounds most like you?"*

| Option | Scoring | Note |
|---|---|---|
| I bring it up — even when it's uncomfortable | conflictStyle: `"volatile"` | "Volatile" here means expressive/direct per the Gottman taxonomy — not high-conflict. This label intentionally routes modalities like DBT and NVC to help the user channel directness skillfully. |
| I need space to cool down before I can talk | conflictStyle: `"avoidant"`, avoidant +1 | |
| I try to make sure we both feel heard | conflictStyle: `"validating"`, secure +1 | |
| Write my own | free text | |

**Bridges:**
- bring it up: *"That directness — when it's timed right — is actually a gift to a relationship."*
- need space: *"Taking space before you speak is smarter than most people realise."*
- both feel heard: *"That instinct to hold space for both of you — that's rare."*

---

**Q12 — Love Language**
*Topic: loveLanguage field*

If `partnerName` is not null:
Peter: *"What makes you feel most loved by [partnerName]? Like, what really lands?"*

If `partnerName` is null:
Peter: *"What makes you feel most loved in a relationship? Like, what really lands?"*

| Option | Captures |
|---|---|
| When they say it out loud — words really matter to me | `"words"` |
| When they do something thoughtful without being asked | `"acts"` |
| When we just spend real, present time together | `"time"` |
| Physical closeness — a hug, a touch | `"touch"` |
| Write my own → free text | stored as-is (may capture "gifts" or other) |

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
| Pretty steady — things are okay | lifeContext: `"stable"` |
| Busy and a bit stretched thin | lifeContext: `"stressed"`, dysregulation +1 |
| We're going through a big change right now | lifeContext: `"transition"`, dysregulation +1 |
| It's been heavy — loss, grief, or something really hard | lifeContext: `"heavy"`, trauma +2, dysregulation +1 |
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

Input: free text, mandatory (min 3 chars). Captures `growthGoal`.

Bridge after entry: *"That matters. Hold onto that — it's exactly why you're here."*

Peter: *"Got it. How often would you like to check in with me?"*

Options: Every day / A few times a week / Once a week
Captures: `checkInFrequency`

---

## Phase 1 → Phase 2 Transition (scoring_transition)

1. `deriveProfile()` runs client-side on raw scores → produces initial `DerivedProfile`
2. If `freeTextAnswers` has any entries → POST `/api/onboarding/score-freetext`:
   - **Request:** `{ freeTextAnswers: Record<number, string>, currentScores: RawScores }`
   - **Response:** `{ scoreAdjustments: Partial<RawScores> }` — delta values only, positive or negative
   - Server runs a single lightweight LLM call analysing all free-text answers together
   - Client applies deltas to `currentScores`, then re-runs `deriveProfile()`
3. Profile written to DB:
   - `profiles.psychological_profile` ← full `DerivedProfile` JSONB (direct Supabase client write)
   - `profiles.name` ← `firstName` (direct write)
   - `profiles.partner_name` ← `partnerName` (direct write, may be null)
   - `profiles.age_range` ← `ageRange` (direct write)
   - `profiles.pronouns` ← `pronouns` (direct write)
   - `profile_traits` ← upsert `attachment_style`, `love_language`, `conflict_style` rows using `onConflict: 'user_id,trait_key'`
4. `localStorage.removeItem('sparq_onboarding_progress')`
5. Transition to `peter_session`

If no free-text answers: step 2 is skipped (zero API calls in Phase 1 maintained for these users).

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
  message: string               // plain text, markdown stripped
  shouldClose: boolean          // Peter decided he has enough
  safety: { triggered: boolean }
}
```

**Behaviour:**
- No entitlement checks
- No usage caps or daily message counting
- Crisis detection: always on (same pattern as `/api/peter/chat`)
- Minimum 2 exchanges before `shouldClose` can be true — enforced server-side (`if exchangeCount < 2, force shouldClose: false`)
- Hard stop at exchange 5 — server forces `shouldClose: true`
- `shouldClose` is derived from a `READY_TO_CLOSE` sentinel: the system prompt instructs Peter to include the literal string `[[READY_TO_CLOSE]]` at the end of his response text when he has enough. The API strips this before returning `message`, and sets `shouldClose: true`.
- The base `PETER_SYSTEM_PROMPT` includes a "sign off with warmth, sometimes with otter-themed humor 🦦" rule. In the onboarding system prompt this is overridden: the 🦦 sign-off applies only to the closing exchange (when `[[READY_TO_CLOSE]]` is present). Add the instruction: "Only add a warm sign-off on your final message. Mid-session responses end cleanly without a sign-off."

**System prompt structure:**

```
{PETER_SYSTEM_PROMPT}  ← base character rules from peterService.ts

ONBOARDING CONTEXT (never reference this directly — just behave as someone who already understands):
- This person's name is {firstName}.
- Their partner's name is {partnerName or "their partner"}.
- toneMode: {toneMode} — shape all responses accordingly:
    validation-first: lead with full emotional validation before any reframe or question
    nurturing: warm, gentle, protective — never push
    collaborative: peer energy, curious, forward-looking
- Primary modalities to draw from: {primaryModalities.join(', ')}
- What you know about them (never quote back directly):
    {Object.entries(freeTextAnswers).map(([q, a]) => `Q${q}: "${a}"`).join('\n')}

OPENING MOVE:
{attachmentStyle-specific opening from spec}

SESSION RULES:
- Maximum 5 exchanges total. You are on exchange {exchangeCount}.
- Ask at most one question per response.
- Never reference the onboarding questions directly.
- Never use clinical language.
- When you have enough to close warmly, end your response with [[READY_TO_CLOSE]].
- Your closing sentence must be one specific, accurate observation about this person — the "how did he know that" moment. Store it as peterClosingSentence.
- Always end the closing with: "Let me show you where I think we start. 🦦"
```

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

The sentence before *"Let me show you where I think we start. 🦦"* is the personalised closing. It is stored as `profile.peterClosingSentence` in client state when `shouldClose: true` is received, and displayed at the top of the `journey_rec` screen.

**Persistence:** `peterClosingSentence` is written to the database after Phase 2 completes — as a second PATCH to `profiles.psychological_profile` (merge the closing sentence into the existing JSONB blob). This happens in `PeterSession.tsx` after `shouldClose: true` is received, before transitioning to `journey_rec`. It is not part of the `scoring_transition` write (which runs before Phase 2 begins).

---

## Phase 3 — Journey Recommendation

### Recommendation screen

- Peter's `peterClosingSentence` at the top (stored from last peter_session response — no additional API call)
- Primary journey card: visually dominant. Includes a one-sentence recommendation reason. This sentence is pre-written in `journeyMatcher.ts` per journey per attachmentStyle — not LLM-generated. Format: *"I think you'd get the most out of [Journey Name] — [one sentence why it fits them specifically]. But if something else speaks to you, go there instead."*
- 2–3 alternative journey cards: lower visual weight below

### Journey matching logic (journeyMatcher.ts)

Journey IDs reference `src/data/journeys.ts` and the existing journeys table.

| attachmentStyle | Primary journey ID | Alternative journey IDs |
|---|---|---|
| anxious | `attachment-healing` | `trust-rebuilding`, `communication` |
| avoidant | `emotional-intelligence` | `values`, `communication` |
| disorganized | `attachment-healing` | `values`, `mindful-sexuality` |
| secure | `relationship-renewal` | `love-languages`, `intimacy` |

**Overrides:**
- `traumaFlag = true` → always include `attachment-healing` as primary or first alternative
- `lifeContext = "heavy"` → remove `sexual-intimacy` and `fantasy-exploration` from all slots

### Journey detail screen

Shown when user taps any journey card.

- Journey name + duration
- "Here's what you'll be doing": one reflection, one insight, one action per day — takes 5 minutes
- **Day 1 preview:** pulled from `journey_questions` table where `journey_id = selectedJourney.id AND day_number = 1`. Display the `question_text` field as the Day 1 reflection preview. If the row is missing, fall back to the journey's `overview` field from `src/data/journeys.ts`.
- Peter's note: one sentence from `journeyMatcher.ts` keyed to the selected journey + attachmentStyle (pre-written, not LLM-generated)
- "Let's start →" button

On confirm:
1. POST `/api/journeys/start` → writes `user_journeys` row (endpoint already exists)
2. Direct Supabase write: `profiles.isonboarded = true`
3. `localStorage.removeItem('sparq_onboarding_progress')` (belt-and-suspenders)
4. Navigate to `/dashboard?from=onboarding`

### Journey images
Journey card images will be generated with an AI image generation tool during the final design phase. Implementation uses gradient placeholders until then.

---

## /api/onboarding/score-freetext

POST endpoint. Auth required (uses `getAuthedContext`). Called at most once per user during onboarding.

**Request:**
```typescript
{
  freeTextAnswers: Record<number, string>  // questionIndex → answer text
  currentScores: {
    anxious: number; avoidant: number; secure: number; disorganized: number;
    dysregulation: number; abandonment: number; selfWorth: number; trauma: number;
  }
}
```

**Response:**
```typescript
{
  scoreAdjustments: {
    anxious?: number; avoidant?: number; secure?: number; disorganized?: number;
    dysregulation?: number; abandonment?: number; selfWorth?: number; trauma?: number;
  }
}
```

System prompt instructs the LLM to: read all free-text answers in context of which question they answered, identify any clinical signals present, return only a JSON object of score deltas (positive or negative integers, typically ±1 to ±3). Never return a full score replacement — only deltas. If no signal is present, return an empty object `{}`.

---

## Out of Scope for This Feature

- Journey tiers (Intermediate / Advanced) — Beginner only at launch
- Partner-linked onboarding — post-beta
- pgvector long-term memory — deferred
- Push notifications
- Dashboard or analytics for onboarding completion rates
- New journeys — 14 existing journeys only
