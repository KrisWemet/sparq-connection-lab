# Growth Ecosystem — Living Dashboard Design Spec

**Date:** 2026-03-25
**Status:** Draft
**Author:** Chris + Claude

---

## Problem

After onboarding, users accept a journey and land on the Dashboard with a "Day 1" CTA pointing to the daily session. The daily session teaches and assigns micro-actions, but never closes the loop on whether users practiced. Users can't see their own patterns shifting over time. The result: information without transformation.

## Solution

Add three reinforcing growth loops and evolve the Dashboard from a static hub into a **Living Dashboard** that reflects the user's growth story.

---

## Three Growth Loops

### Loop 1 — Practice Loop (Daily)

| Phase | What happens |
|---|---|
| Morning | Learn + micro-action (existing) |
| Evening | Peter asks about the micro-action conversationally (NEW) |
| Next morning | Peter's greeting references yesterday's practice outcome |

**Evening check-in details:**
- Adaptive depth: short response → warm close (30 sec); rich sharing → Peter follows up (1-2 min total)
- Peter never judges whether they practiced or not
- Data captured: `practice_attempted` (new column), plus reuses existing `evening_reflection` and `evening_peter_response` columns in `daily_sessions`, adds `evening_emotional_tone` (new column)
- If Peter detects a significant moment → creates a Growth Thread entry

### Loop 2 — Pattern Loop (Weekly)

- Generated **lazily** — when the dashboard loads after Sunday and no mirror exists for the current week, the API generates one on-demand (matches existing `WeeklyMirrorCard` pattern via `/api/me/patterns`)
- Peter analyzes the week's sessions, evening check-ins, and emotional tone
- Output: 2-3 sentence narrative synthesis (not data summary)
- Example: *"You're noticing defensiveness before it takes over. That's the shift — awareness before reaction."*
- Appears as a dashboard card, replaces previous week's mirror
- Previous mirrors accessible in Growth Thread history

### Loop 3 — Growth Story Loop (Per Journey)

- Peter tracks thematic arcs across the journey
- Milestone reflections at Day 7 and journey completion
- Journey completion: Peter synthesizes Day 1 vs. now
- Peter asks: *"Ready to keep going? Or would you like a day to let this settle?"* (user decides)
- Peter recommends next 3 journeys based on what emerged (not just original profile)
- User can also browse all unlocked journeys

---

## Living Dashboard Layout

Top-to-bottom card order:

1. **Peter's Greeting** — Pre-generated at previous session end. Warm, contextual, references yesterday's practice.
2. **Today's Practice CTA** — Journey day + title + "Begin →". Most prominent card. Shows "Evening Check-in" CTA when morning session is complete.
3. **Identity Statement** — *"I am becoming someone who..."* (from onboarding)
4. **Growth Thread** — Timeline of significant moments. AI-curated + user-pinnable. Shows 3 most recent, "See all →" expands.
5. **Weekly Mirror** — Peter's narrative pattern synthesis. Practice stats below.
6. **Journey Arc** — Visual bar chart showing engagement depth per day.
7. **Streak** — Compact, centered at bottom.

### Peter's Greeting Logic

- Pre-generated when the previous session completes (morning or evening)
- Generated via a **fire-and-forget LLM call** at session completion (same pattern as `analyzeProfileTraits` in `complete.ts`)
- Inputs: yesterday's session data, current journey context, practice outcome, pattern signals
- Stored in `user_insights.next_greeting_text`
- Displayed immediately on dashboard load (no latency)
- **Fallback:** If generation fails, use a template greeting: "Welcome back, {name}. Ready for today's practice?"

### Growth Thread Entries

Entries are created by:

| Source | Type | Example |
|---|---|---|
| Journey start/midpoint/end | `milestone` | "Started Building Trust" |
| Evening check-in (AI-detected) | `breakthrough` | "First time pausing before reacting" |
| Cross-session analysis | `pattern` | "Vulnerability is becoming easier" |
| Weekly mirror | `mirror` | Key insight from the week |
| User action during session | `pinned` | User tapped "pin this" on something that resonated |

Each entry: `date`, `label`, `type`, `journey_id`, `detail` (Peter's longer observation, shown on tap)

**API surface:**
- `GET /api/growth-thread` — returns user's growth thread entries (paginated)
- `POST /api/growth-thread/pin` — user pins a moment during a session
- Breakthrough/pattern entries are created as side effects in `complete.ts` and the weekly mirror generator
- Max 2 AI-generated entries per day to prevent noise

---

## Evening Practice Check-in Flow

1. User opens dashboard after completing morning session
2. Dashboard shows "Evening Check-in" CTA (alongside practice CTA)
3. CTA navigates to `/daily-growth` which handles the evening check-in flow (reuses existing Peter chat infrastructure)
4. Peter opens: *"Hey — how did the [specific action] go today?"*
5. User responds (free text)
6. **Adaptive logic:**
   - Short/brief response → Peter closes warmly, done
   - Rich/detailed response → Peter asks one follow-up, then closes
7. Peter's closing connects to tomorrow's content
8. System generates and stores tomorrow's greeting

**Not a full session — max 2 minutes.**

---

## Journey Completion Flow

1. User completes final day of journey
2. Peter delivers journey synthesis — what shifted from Day 1 to now
3. Growth Thread gets a completion milestone entry
4. Peter asks: *"Ready to keep going? Or would you like a day to let this settle?"*
5. **If continuing:** Peter recommends 3 journeys using `next-journey-recommender.ts` (`src/lib/server/next-journey-recommender.ts`) which already handles filtering completed journeys, scoring by attachment style, and suggesting rest after trauma-adjacent journeys
6. **If resting:** Dashboard shows a reflective state for one day, then recommendations. `user_insights.journey_completion_state` set to `resting`.
7. Dashboard updates: greeting reflects completion, CTA shifts to "Choose Next Journey"

**Journey completion state:** Add `journey_completion_state` to `user_insights` with values: `null` (in journey), `pending_decision` (completed, awaiting choice), `resting` (user chose rest day). The completion handler sets `pending_decision` instead of immediately clearing `active_journey_id`.

---

## Data Architecture

### New Tables

**`growth_thread`**
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES profiles(id) NOT NULL,
date date NOT NULL,
label text NOT NULL,
type text NOT NULL CHECK (type IN ('milestone', 'breakthrough', 'pattern', 'mirror', 'pinned')),
journey_id text,
detail text,
created_at timestamptz DEFAULT now()
```

**`weekly_mirrors`**
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES profiles(id) NOT NULL,
week_start date NOT NULL,
narrative_text text NOT NULL,
practice_count integer DEFAULT 0,
practices_felt_natural integer DEFAULT 0,
key_patterns jsonb,
created_at timestamptz DEFAULT now()
```

`practices_felt_natural`: count of evening check-ins where the user described the practice as feeling comfortable or natural (derived from Peter's AI analysis of evening reflection text).

### Extended Columns

**`daily_sessions`** (add — reuse existing `evening_reflection` and `evening_peter_response` for check-in text):
- `practice_attempted` boolean
- `evening_emotional_tone` text

**`user_insights`** (add):
- `next_greeting_text` text
- `journey_completion_state` text CHECK (value IN ('pending_decision', 'resting'))
- `recommended_next_journeys` jsonb

**`user_journeys`** (add — per-journey data):
- `completion_synthesis` text

### RLS Policies

All new tables: users can only read/write their own rows (same pattern as existing tables).

---

## Design Principles

- **Solo-first, partner-ready** — all features work for one person; partner features plug in later
- **Pull, don't push** — user has agency (pin moments, decide rest vs continue, choose journey)
- **5-minute promise respected** — evening check-in is 30 sec to 2 min max
- **Growth is visible where you already look** — dashboard, not hidden behind extra navigation
- **Narrative over data** — Peter tells stories about patterns, not charts

---

## Edge Cases

**Skipped evening check-in:** Session remains incomplete (existing behavior). Next morning, a new session starts. Peter's greeting does not guilt — it simply welcomes them back. `practice_attempted` defaults to `null` (not `false`).

**Missed days:** No session rows exist for missed days. Growth Thread and Weekly Mirror gracefully handle gaps. Weekly Mirror adjusts narrative for partial weeks (e.g., "You showed up 3 times this week — each time mattered.").

**First week (insufficient data for Weekly Mirror):** Follow existing `WeeklyMirrorCard` pattern — show a warm Peter message: "As you keep showing up, I'm learning how you grow. Come back after a few sessions to see your first mirror." Generate the first Weekly Mirror only after 3+ completed sessions exist.

**Dashboard is a redesign:** The current dashboard layout (Identity above CTA, inline streak, no Peter greeting) is restructured. This is not additive — the card order changes.

---

## Out of Scope

- Partner-specific growth features (post-beta)
- Push notifications for evening check-in (post-beta)
- Historical weekly mirror browsing UI (Growth Thread covers this)
- Gamification of practice completion
- Comparison between partners' growth
