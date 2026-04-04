# Rehearsal Room — Design Spec

**Date:** 2026-04-04
**Status:** Draft v5
**Author:** Chris + Claude

---

## Problem

Users understand what to do after a Sparq session. But when the triggering moment arrives in real life — partner is defensive, emotions are elevated, old patterns kick in — the insight evaporates. The nervous system reverts. The gap between knowing and doing is where relationship growth dies.

Current Sparq teaches *about* difficult conversations. It never creates a *safe place to practice* them before they matter.

---

## Solution

The Rehearsal Room is a private space inside Sparq where users practice a hard conversation with Peter before having it in real life. Peter plays the partner — generating realistic resistance, deflection, or defensiveness calibrated to the user's specific situation — while staying within emotional safety guardrails.

By the time the real conversation happens, it's not the first time the user's nervous system has done it.

This is behavioral rehearsal — a core mechanism in CBT and exposure therapy — applied to relationship communication for the first time in a consumer app.

**Note on duration:** The Rehearsal Room is an intentional exception to Sparq's 5-minute promise. It is framed as "when you need it" not "every day." Peter names this upfront: *"This one takes a bit longer than your usual session — usually 5–8 minutes. Worth it."*

---

## Session Flow

### Phase 1 — Setup (60–90 seconds)

Peter asks three questions in sequence (one at a time, conversational):

1. *"What's the situation — what's been on your mind?"*
2. *"What do you most need them to hear?"*
3. *"What are you most afraid will happen when you bring it up?"*

**Minimum threshold:** If any answer is fewer than 10 characters or clearly placeholder text, Peter asks one gentle follow-up before accepting: *"Can you tell me a little more about that?"*

After the third answer is accepted, Peter adds a confidence baseline:

4. *"Before we begin — how ready do you feel to have this conversation right now?"* (1–5 tap)

This collects `confidence_before`. The value is stored in **client-side local state only** — it is not transmitted during any `/message` call. It is submitted only at `/complete` alongside `confidence_after`. The server then generates `situation_summary` and `topic_category` (single LLM call, see API section) and returns `{ next_phase: 'intensity_dial' }` to signal phase transition.

---

### Phase 2 — Intensity Dial (15 seconds)

Peter names what he is about to do and presents three options:

*"I'm going to step into your partner's shoes. I won't be perfect — but I'll be real. How much resistance do you want me to bring?"*

- **Gentle** — receptive, slightly guarded, low friction
- **Realistic** — distracted, mildly defensive, occasional interruption (default)
- **Challenging** — resistant, deflects, gets defensive under pressure

User selects one. The client calls `/message` with `{ session_id, phase: 'intensity_selection', message: intensity_level }`. The server stores `intensity_level` on the session row and generates Peter's role transition announcement. Response: `{ peter_message, next_phase: 'rehearsal' }`. No `exchange_count` increment.

Peter's announcement:

*"Okay. I'm going to be [partner name / 'your partner'] now. Remember — this is practice, and I'm on your side no matter what."*

UI shifts: a persistent banner appears at the top of the chat — "Peter is playing your partner" — with a small exit button ("End rehearsal"). Peter's message bubbles shift to a distinct visual treatment (different background color, no Peter avatar shown during this phase).

---

### Phase 3 — Rehearsal (2–5 minutes)

Peter plays the partner. The user says what they came to say. Peter responds.

The server tracks `exchange_count` on the `rehearsal_sessions` row. `exchange_count` increments only for user messages where `phase === 'rehearsal'` — not setup or debrief. Phase boundary is enforced server-side. One exchange = one user message.

**After 5 exchanges:** The server both (a) returns `suggested_close: true` in the API response AND (b) appends a system message to the conversation array: `{ role: 'system', content: 'The user may be ready to end the rehearsal. You may gently offer to close.' }` — same pattern as the onboarding forced-close injection. This makes Peter in-character aware of the opportunity to close. UI surfaces a dismissible prompt: *"Ready to debrief?"*

**User-initiated close:** User can tap "End rehearsal" in the banner at any time.

**AI constraint system — see full specification below.**

---

### Phase 4 — Debrief (60 seconds)

On close (user or soft-close), server returns `{ next_phase: 'debrief' }`.

UI resets: banner disappears, Peter avatar returns, bubble style reverts. Peter announces the transition explicitly:

*"I'm back as myself now."*

Peter names one specific thing he noticed during the rehearsal. Examples:
- *"You hesitated right before the second sentence. What was happening in your body there?"*
- *"You apologized before you finished your thought. Did you notice that?"*
- *"That second try was noticeably clearer than the first. What changed?"*

**Debrief system prompt:** Debrief messages use Peter's base character prompt plus a lightweight debrief overlay:
```
You just completed a rehearsal with this user. You are back as yourself — Peter.
The rehearsal is over. Your job is to debrief warmly.

Situation context: [situation_summary]
Intensity played: [intensity_level]
Exchanges completed: [exchange_count]

First debrief exchange: Name ONE specific thing you observed during the rehearsal.
Ask one grounding question if it deepens the insight.
Keep it to 3–4 sentences.

Final debrief exchange: Close warmly, then end your response with:
ANCHOR: [one sentence the user can carry into the real conversation]
```

**Debrief exchange cap: 2 exchanges maximum.** The client tracks the debrief round in local state. On round 1: `phase: 'debrief'`. On round 2 (or when the user is ready to close): `phase: 'debrief_close'`. The server applies the ANCHOR: instruction only on `phase: 'debrief_close'`.

**ANCHOR: parsing:**
- `peter_anchor` = text on the same line after `"ANCHOR: "`, trimmed. Single line only.
- The `ANCHOR: [text]` line is stripped from `peter_message` before returning — it does not appear in the chat bubble.
- **Fallback:** If the LLM omits the `ANCHOR:` marker on a `debrief_close` call, the server uses the last sentence of `peter_message` (trimmed to 150 characters) as `peter_anchor`. The client always receives a `peter_anchor` value on `debrief_close` regardless.

The client stores `peter_anchor` in local state for submission at `/complete`.

---

### Phase 5 — Close (30 seconds)

Peter asks the confidence follow-up: *"How ready do you feel now?"* (1–5 tap). This collects `confidence_after`.

Peter's anchor is displayed as a persistent card below the chat:

> **Your anchor for this conversation:**
> *"[peter_anchor text]"* — [copy button]

This card remains visible until the user leaves the page. It is not automatically pinned anywhere else.

Peter closes: *"When you're ready, you'll know what to say. I'll check in with you tomorrow."*

Client calls `/api/peter/rehearsal/complete` with `{ session_id, confidence_before, confidence_after, peter_anchor }`. Server marks `completed: true`, fires greeting generation (fire-and-forget).

---

## Safety Gate

Crisis detection (`detectCrisisIntent()`) runs on **every message in every phase** — not only during setup. This mirrors the existing onboarding handler pattern.

If triggered:

1. Peter exits the partner role immediately (if in Phase 3): *"I need to step out of the rehearsal for a moment."*
2. Peter transitions to standard emotional support mode using `buildCrisisResponse()`.
3. Server returns `{ shouldClose: true }`. UI shows an "End rehearsal" button.
4. Session is marked `completed: false`. No `peter_anchor` generated.

Peter **never** plays a partner who is:
- Contemptuous or mocking
- Frightening or threatening
- Completely stonewalled with no crack of openness

Maximum intensity is realistic resistance. The rehearsal is practice for hard conversations, not trauma exposure.

---

## AI Constraint System (Hybrid)

### Layer 1 — Peter's base character prompt (existing, from `peterService.ts`)

### Layer 2 — Rehearsal overlay (new, appended for Phase 3 only)

```
You are currently playing the role of the user's partner in a safe rehearsal exercise.
Your job is to respond as a real person would — not as a therapist-coached ideal,
and not as an abusive worst-case. Realistic, human, imperfect.

Partner context: [attachment_style_descriptor — see sourcing below]
Situation: [situation_summary — max 500 chars, AI-generated from setup]
Your emotional register: [calibrated to intensity_level]

Hard rules:
1. No contempt, mockery, sarcasm, or character attacks.
2. No response that feels final, hopeless, or like the door is completely closed.
3. Every response must contain at least one signal of humanity or underlying openness —
   a question, an expression of feeling beneath the defensiveness, or an acknowledgment,
   even if small. Never end on pure rejection.
4. Keep responses concise — 2–4 sentences. Real partners don't monologue.
5. Match emotional intensity to the selected level:
   - gentle: receptive with mild hesitation
   - realistic: distracted, mildly defensive, occasionally redirects
   - challenging: resistant, deflects, pushes back — but still human underneath

[After 5 exchanges only]: You may gently signal readiness to close
by asking something like "Are we good?" or trailing off naturally.
```

**Token budget:** `maxTokens: 200`, `temperature: 0.8`

### Attachment style sourcing

Partner attachment style, used to calibrate the overlay:

1. **Partner linked + onboarding complete:** Use partner's stored attachment style from `user_insights`.
2. **Partner linked but no attachment data:** Use user's own attachment style as a proxy (relationships tend toward complementary or similar patterns).
3. **No partner linked (solo user):** Derive likely response pattern from setup question 3 (*"What are you most afraid will happen?"*). Peter defaults to: realistic defensiveness unless the user's fear describes something more specific.

Solo users may use the Rehearsal Room. The feature is not gated on partner-linked status. Peter acknowledges this when solo: *"I don't know your partner the way you do — I'll play based on what you've described. Tell me if I'm off."*

### Prompt injection mitigation

The `situation_summary` injected into the system prompt is AI-generated by Peter during the setup phase (not raw user text). This reduces injection risk. Additionally: validate `situation_summary` is ≤500 characters before system prompt injection. Raw user messages in Phase 3 are handled as conversational turns (same pattern as existing Peter chat), not injected into the system prompt.

---

## Entry Points

**Dashboard (primary):**
Peter surfaces the Rehearsal Room contextually — not as a permanent nav item. Triggers:
- User has completed 3+ sessions in a communication or conflict-related journey
- User's evening check-in contains language suggesting an unresolved moment
- User explicitly mentions wanting to say something in any Peter interaction

Example Peter prompts:
- *"Is there something you've been wanting to say to [name]? I can help you practice before it matters."*
- *"You've been working on [journey topic]. Is there a real conversation you've been putting off? We could rehearse it."*

**Journey sessions (secondary):**
After specific lessons in communication, conflict resolution, or needs-expression journeys, Peter offers the rehearsal as an optional next step: *"Want to practice saying that before it counts?"*

Entry point lives in journey session completion handler. No journey content is modified — only the completion screen gains an optional CTA.

**Direct access:**
`/rehearsal` is accessible directly. No permanent nav link in beta.

---

## Technical Architecture

### Route
`/rehearsal` — full dedicated page (not a modal). The focus and intimacy of this experience requires its own space.

### API Endpoints

**`POST /api/peter/rehearsal/start`**
- Auth: `getAuthedContext()`
- Body: `{}`
- Response: `{ session_id, peter_message }` — Peter's first setup question
- Creates a new `rehearsal_sessions` row with `completed: false`
- Rate limit: hard daily cap of 3 sessions per user per UTC day. **All rows count toward the cap** — including abandoned and crisis-exited sessions (LLM calls are incurred on every `/start`). Query: `COUNT(*) WHERE user_id = ? AND DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE`. On 4th attempt: HTTP 429 `{ error: 'daily_limit_reached', message: "You've done 3 rehearsals today. Come back tomorrow — you've prepared enough for now." }`
- All other errors: `{ error: 'Peter is having a moment. Please try again.' }`

**`POST /api/peter/rehearsal/message`**
- Auth: `getAuthedContext()`
- Body: `{ session_id, phase, message, intensity_level? }`
- Phase values: `'setup' | 'intensity_selection' | 'rehearsal' | 'debrief' | 'debrief_close'`
- Response: `{ peter_message, next_phase?, suggested_close?, shouldClose?, peter_anchor? }`
- `next_phase` present when phase transition is ready
- `suggested_close: true` + system message injected after 5 rehearsal exchanges
- `shouldClose: true` if crisis detected (any phase)
- `peter_anchor` present only on `debrief_close` phase (always set — fallback to last sentence if LLM omits marker)
- Runs `detectCrisisIntent()` on every call regardless of phase
- `intensity_selection` phase: updates row `intensity_level`, returns Peter's transition announcement, `next_phase: 'rehearsal'`, no `exchange_count` increment
- `rehearsal` phase: applies two-layer system prompt; increments `exchange_count`
- After setup phase complete: generates `situation_summary` and infers `topic_category` in a **single LLM call**. Input: the 3 setup message exchanges. The prompt requests structured JSON output: `{ "summary": "...(≤500 chars)...", "category": "communication|conflict|needs|intimacy|trust|boundaries|other" }`. Parsing: `JSON.parse()` the response; if parsing fails or category is not a valid enum value, set `topic_category = 'other'` and continue — the session is never blocked by classification failure. Updates the row with both values.
- `debrief_close` phase: applies debrief overlay with ANCHOR: instruction; parses and strips marker
- All errors: `{ error: 'Peter is having a moment. Please try again.' }` — client shows error toast, session remains intact, user may retry

**`POST /api/peter/rehearsal/complete`**
- Auth: `getAuthedContext()`
- Request body: `{ session_id: string, confidence_before: number, confidence_after: number, peter_anchor: string }`
- Response: `{ success: true }`
- Updates `rehearsal_sessions` row: `completed: true`, writes all four fields
- Fire-and-forget: calls `generateGreeting()` with `{ situation_summary, peter_anchor, confidence_delta }` as context. `peter_anchor` is passed explicitly so the greeting can reference what the user is carrying into the real conversation. Overwrites `user_insights.next_greeting_text`. **Rehearsal takes precedence:** if the user's daily session for today was already completed, rehearsal still overwrites — it is more recent context.
- `confidence_delta` = `confidence_after` minus `confidence_before`

### Database

**New table: `rehearsal_sessions`**

```sql
CREATE TABLE rehearsal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  topic_category text CHECK (topic_category IN (
    'communication', 'conflict', 'needs', 'intimacy', 'trust', 'boundaries', 'other'
  )),
  situation_summary text,          -- AI-generated condensation, not verbatim transcript
  intensity_level text CHECK (intensity_level IN ('gentle', 'realistic', 'challenging')),
  confidence_before integer CHECK (confidence_before BETWEEN 1 AND 5),
  confidence_after integer CHECK (confidence_after BETWEEN 1 AND 5),
  exchange_count integer DEFAULT 0,
  completed boolean DEFAULT false,
  peter_anchor text,               -- nullable; null if session abandoned before Phase 5
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rehearsal_sessions_user_id
  ON rehearsal_sessions (user_id, created_at DESC);

ALTER TABLE rehearsal_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rehearsal sessions"
  ON rehearsal_sessions FOR ALL
  USING (auth.uid() = user_id);
```

`topic_category` is inferred by Peter (AI) from the setup conversation summary during Phase 1 completion. It is assigned server-side, not chosen by the user.

`situation_summary` is PII-sensitive. Retained for 90 days, then nullified. Not encrypted beyond Supabase default (consistent with `evening_reflection` and similar fields).

**Nullification mechanism:** A pg_cron job added via migration runs nightly at 02:00 UTC:
```sql
SELECT cron.schedule(
  'nullify-old-rehearsal-summaries',
  '0 2 * * *',
  $$UPDATE rehearsal_sessions
    SET situation_summary = NULL
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND situation_summary IS NOT NULL$$
);
```

`peter_anchor` is nullable. NULL if session abandoned before Phase 5 or if crisis gate fires.

### Session abandonment

If a session row has `completed: false` and `created_at` > 30 minutes ago, it is considered abandoned. On the next visit to `/rehearsal`, Peter opens with:

*"Last time we started a rehearsal. Looks like you didn't finish — want to start fresh with a new one, or try a different approach to the same topic?"*

Two tappable options: **"Start fresh"** | **"Different topic"** — both create a new session row. There is no true mid-session resume (message history is not persisted). The abandoned row is retained. Abandoned sessions do not feed the Growth Thread.

### Multiple sessions per day

No limit beyond the 3-session soft rate limit. Each session creates a new row. Previous sessions' `peter_anchor` values are not surfaced automatically in subsequent sessions.

### Existing Code Reused

| Component | Reuse |
|---|---|
| `PeterSession.tsx` | Chat UI pattern (message bubbles, input, typing indicator) |
| `src/lib/peterService.ts` | OpenRouter → Claude Haiku pipeline |
| `src/lib/server/supabase-auth.ts` | API authentication (`getAuthedContext()`) |
| `detectCrisisIntent()` | Crisis detection (runs every message) |
| `buildCrisisResponse()` | Crisis response generation |
| `generateGreeting()` | **To be extracted** as part of this feature. Extract the inline greeting IIFE from `complete.ts` (lines ~383–425) into a shared utility at `src/lib/server/generate-greeting.ts` with signature: `generateGreeting(userId: string, context: { session_type: 'daily' \| 'rehearsal', situation_summary?: string, peter_anchor?: string, confidence_delta?: number }): Promise<void>`. Writes directly to `user_insights.next_greeting_text` fire-and-forget. Update `complete.ts` to call the extracted utility; `/api/peter/rehearsal/complete` calls the same utility. |
| `user_insights.next_greeting_text` | Greeting storage |

---

## Post-Completion Integration

**Morning greeting:** Peter's next greeting references the rehearsal: *"How did that conversation go?"* Powered by existing `next_greeting_text` mechanism.

**Growth Thread:** If user shares a real conversation outcome in the morning check-in AND Peter detects a reference to the rehearsal, a `breakthrough` type Growth Thread entry may be created. This is handled by the existing morning check-in flow in `complete.ts` — not by the rehearsal API. The rehearsal API does not write to `growth_thread` directly.

---

## Out of Scope

- Storing rehearsal conversation transcripts
- Partner-visible rehearsal sessions
- Multiplayer rehearsal (both partners in the same session)
- Therapist review of rehearsal content
- Push notification prompts for rehearsal
- Historical rehearsal browsing UI

---

## Success Signals (Beta)

- **Confidence delta:** `confidence_after` > `confidence_before` in >70% of completed sessions
- **Completion rate:** >60% of started sessions reach Phase 5
- **Qualitative:** Users report having the real conversation within 48 hours (measured via morning check-in language)
- **Retention:** Users who complete a rehearsal return within 3 days at higher rate than baseline
