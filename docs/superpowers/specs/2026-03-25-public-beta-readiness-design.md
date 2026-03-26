# Public Beta Readiness — Unified Spec

**Date:** 2026-03-25
**Status:** Design approved
**Estimated effort:** ~15 hours across 4 active workstreams

---

## Overview

This spec covers everything needed to bring Sparq Connection from current state to public beta readiness. After deep exploration, the app is ~85% complete — most core systems (auth, journeys, daily sessions, growth loops, dashboard) are fully implemented and wired. The remaining work falls into 4 active workstreams.

### Workstream Summary

| # | Workstream | Status | Effort |
|---|---|---|---|
| 1 | Onboarding question rewrites | Needs work | ~4 hours |
| 2+3 | Dashboard + Growth Loops | ~90% done, needs polish | ~8 hours |
| 4 | Weekly Mirror | Done — no work needed | 0 |
| 5 | Journey Completion | Done — no work needed | 0 |
| 6 | Tech Debt Cleanup | Straightforward deletions | ~3 hours |

---

## Workstream 1: Onboarding Question Rewrites

### Problem

The 14-question conversational onboarding flow works mechanically but violates the NLP Language Framework in several ways:

1. **Q10 (Childhood Safety)** reads like a therapy intake form — too direct
2. **Options are transparent labels** — users can see they're being profiled (e.g., "I'd start wondering if something's wrong" = anxious attachment)
3. **Bridges are repetitive** — Q2 uses "Good to know. Let's keep going." for all 8 options
4. **Q14 does double duty** — growth goal + check-in frequency crammed into one question
5. **Q6-Q9 lack presupposition** — they describe experiences instead of pulling forward

Note: Having 4 options per question is acceptable for onboarding (profiling needs granularity). The framework's 2-3 option limit applies to daily exercises, not onboarding.

### Approach

Reframe options as **stories and felt experiences**, not self-descriptions. Users should recognize the experience, not categorize themselves.

### Changes

#### Q6: Emotional Speed

**Before:** "When something feels off between you — a short reply, a change in tone, a quiet night — how does it land for you?"

**After:** "Picture this — you get a one-word reply to something that mattered to you. What happens in your body first?"

Options (before → after):
- "It hits me fast and hard" → "Something drops in my stomach — I'm already running through what I did wrong"
- "I notice it, but I can usually breathe through it" → "I notice it — like a flicker — but I can let it pass"
- "I tend to go quiet" → "Honestly? I'd move on to something else without thinking much about it"

Bridges — each unique:
- "That feeling is your body caring before your brain catches up. Makes sense."
- "That pause between noticing and reacting — most people never build that."
- "Your nervous system knows how to protect your energy. That's not nothing."

#### Q7: Recovery Time

**Before:** "After a tough moment between you — how long does it usually take you to feel like yourself again?"

**After:** "After a hard conversation — the kind where you both go quiet — what does the next morning feel like?"

Options (before → after):
- "I bounce back pretty fast" → "I wake up and it's mostly behind me — I'm ready to reconnect"
- "A few hours / It can take a day or more" → "It's still there — like a weight I carry through the day"
- "I shut down and it takes a long time" → "I feel numb — like I've gone somewhere inside myself and I can't get back yet"

Bridges — each unique:
- "That kind of reset is a real gift to a relationship."
- "When it sticks like that, it means it matters to you. That's not a flaw."
- "That going-away feeling — your mind learned to do that to keep you safe. We'll work with it gently."

#### Q8: Abandonment Response

**Before:** "If [partner] went quiet for a whole day — nothing serious, just... quiet — what would probably go through your mind?"

**After:** "Say [partner] has a quiet Sunday — phone down, not much to say, nothing wrong. Where does your mind go by evening?"

Options (before → after):
- "I'd start wondering if something's wrong between us" → "I've already checked in twice and I'm rehearsing what to say when they finally look up"
- "I'd figure they're busy or tired" → "Part of me would wonder, but I'd talk myself out of making it a thing"
- "Honestly, I'd enjoy the space" → "I'd barely notice — I've got my own thing going on"
- "I'd notice it, but try not to make it mean something" → "I'd feel relieved honestly — quiet sounds nice"

Bridges — each unique, opening forward threads:
- "That pull to close the gap — it comes from somewhere real. We'll get into that."
- "That noticing-but-not-acting — there's wisdom in it and sometimes a cost. Good to explore."
- "Having your own world is healthy. Sometimes it's also a shield — we'll figure out which."
- "Craving space isn't selfish. It's a signal worth listening to."

#### Q9: Inner Voice

**Before:** "When things get rocky between you, what does the voice inside your head usually sound like?"

**After:** "Everyone has a voice that shows up during a fight — even after it's over. What does yours tend to say?"

Options rewritten as direct quotes from the voice:
- "It says I'm probably the problem" → **"You messed this up. Again."**
- "It wonders if they're losing interest" → **"They're pulling away. You can feel it."**
- "It says we're both human" → **"This is hard, but you'll get through it together"**
- "It gets pretty loud" → **"It's just noise — loud, swirling, no clear words"**

Bridges — each unique:
- "That voice has been with you a long time, hasn't it. It's not the truth — but it feels like it."
- "When that voice speaks, it's hard to hear anything else. That's something we can work with."
- "That voice is rare. Most people have to build it — sounds like you've already started."
- "When everything gets loud at once, clarity is the first thing to go. That's your nervous system, not your character."

#### Q10: Childhood Safety (Major Rewrite)

**Before:** "Growing up — was home a place that felt mostly safe and steady for you?" (reads like a trauma screening questionnaire)

**After:** "The way we grew up shapes the way we love — whether we realize it or not. When you think about home growing up, what comes up?"

Options — felt experience, no self-awareness required:
- "Mostly yes" → **"Mostly good memories — I felt like I belonged there"**
- "It had its moments" → **"A mix — some good, some things I'd rather not repeat"**
- "It was complicated" / "Not really — it was hard" → **"It was hard — I learned early to take care of myself"**

Bridges:
- "That kind of ground under your feet — it carries forward into everything."
- "Most people land here. The fact that you can see both sides says a lot."
- "You built something out of that. We'll make sure it works for you here, not against you."

#### Q11: Conflict Style

**Before:** "When you and [partner] hit a rough patch, which sounds most like you?"

**After:** "Think about the last real disagreement you and [partner] had. Not the topic — just what you did. Which is closest?"

Options — actions with honest imperfection:
- "I bring it up" → **"I said what I was feeling — probably before I was ready to say it well"**
- "I need space to cool down" → **"I left the room — or at least went quiet until the charge wore off"**
- "I try to make sure we both feel heard" → **"I tried to hear their side first, even while I was upset"**

Bridges:
- "That instinct to speak even when it's messy — it means the silence scares you more than the conflict. That tells me something."
- "Leaving to come back calmer — that takes more discipline than people give it credit for."
- "Holding space while you're hurting — that's a muscle. And you've clearly been building it."

#### Q13: Life Context

**Before:** "What's life feeling like right now, outside the relationship?"

**After:** "Almost there. Outside your relationship — how much room do you have right now? Like, honestly."

Options — capacity-focused, collapsed from 4 to 3:
- "Pretty steady" → **"Things are calm enough — I've got bandwidth for this"**
- "Busy and stretched" → **"I'm juggling a lot — but I'm here because this matters"**
- "Big change" / "Heavy" → **"Honestly, life is a lot right now"**

Bridges — set pacing expectations:
- "Good — that means we can go a little deeper when you're ready."
- "Showing up when you're stretched — that's not nothing. We'll keep it light and doable."
- "Then we start with what's manageable and build from there. No pressure to be anywhere you're not."

#### Q14: Split Into Two Questions

**Before:** Single question asking for growth goal (free text) AND check-in frequency (buttons). The growth prompt ("the thing you can't quite put words to yet") may freeze users.

**After Q14a (Growth Goal):** "Last one. If something shifted in your relationship over the next few weeks — something real — what would that look like for you?"
- Free text input
- Bridge: "That's worth building toward. I'll remember that."

**After Q14b (Check-in Frequency):** "One practical thing — how often do you want to show up here?"
- "Every day — I want to build a real habit" → Bridge: "Five minutes a day changes more than you'd think. Let's do it."
- "A few times a week — enough to keep it going" → Bridge: "Consistency beats intensity. A few times a week is plenty."
- "Once a week to start — let me ease in" → Bridge: "Starting where you are is always the right pace."

#### Q2: Bridge Fix

Replace "Good to know. Let's keep going." x8 with:
- Age options: no bridge needed, flow to pronouns seamlessly
- Pronoun options: "Got it." (short, clean — demographic questions don't need warmth)
- "Something else" (free text): "Thanks for telling me."

### Score Deltas

All `scoreDeltas` values remain unchanged. The rewrite changes language, not scoring. The same attachment/dysregulation/trauma signals are captured through different words.

### Files to Modify

- `src/lib/onboarding/questions.ts` — all changes in this single file

---

## Workstreams 2+3: Dashboard + Growth Loops

### Current State

The dashboard and growth loop infrastructure is ~90% implemented:

**Fully working:**
- All 9 dashboard cards wired in spec order (PeterGreeting, Practice CTA, Evening CTA, Identity Statement, Growth Thread, Weekly Mirror, Journey Arc, Partner Connect, Streak)
- Session completion fires: growth thread milestone entries, journey synthesis, next journey recommendations, next greeting generation, profile trait analysis
- Evening check-in: emotional tone extraction, breakthrough detection, growth thread entry creation
- Weekly mirror: LLM narrative synthesis, pattern detection, lazy generation
- Growth thread API: paginated GET + rate-limited PIN (2/day)
- Journey recommender: attachment-style affinity scoring, rest suggestions
- DB migration: all tables and columns created with RLS

### Remaining Work

#### 1. Fix broken partner-synthesis import

`src/pages/api/daily/session/complete.ts` imports from `@/lib/server/partner-synthesis` — this file may not exist. If a partner has also completed their session the same day, this will crash at runtime.

**Fix:** Either create a minimal `partner-synthesis.ts` stub that returns gracefully, or wrap the import/call in a try-catch so it degrades silently. Partner synthesis is post-beta scope — it should not block the session completion flow.

#### 2. Dashboard empty states

Day 1 users see: no growth thread entries, no weekly mirror, no journey arc data, no streak. Each card component needs a warm empty state that invites rather than shows blank space.

**Design principles for empty states:**
- Peter-driven — each empty state should feel like Peter acknowledging where the user is
- Forward-looking — point toward what will appear here, not what's missing
- Never feel broken or incomplete

**Empty states needed:**
- **Growth Thread (no entries):** "Your story starts here. After your first session, this is where your moments will live."
- **Weekly Mirror (no mirror yet):** "After a few sessions this week, I'll share what I'm noticing." (Show after first week with <3 sessions)
- **Journey Arc (no sessions):** Show a subtle placeholder arc with Day 1 highlighted
- **Streak (0 days):** Don't show the streak section at all until streak > 0

#### 3. Delete dead dashboard components

Remove 7 unused files from `src/components/dashboard/`:
- `DashboardContent.tsx`
- `DashboardLayout.tsx`
- `JourneyMapCard.tsx`
- `LivingArtifact.tsx`
- `PetersInsightCard.tsx`
- `RelationshipScoreCard.tsx`
- `TodaysFocusCard.tsx`

#### 4. Verify edge cases

- What happens if the LLM call for next greeting fails? (Should fall back to generic time-based greeting)
- What happens if weekly mirror generation fails? (Should show empty state, not error)
- What happens when a user has completed all available journeys? (Should show "browse all" with appropriate messaging)

### Files to Modify

- `src/pages/api/daily/session/complete.ts` — partner-synthesis fix
- `src/components/dashboard/GrowthThread.tsx` — empty state
- `src/components/dashboard/WeeklyMirrorCard.tsx` — empty state
- `src/components/dashboard/JourneyArc.tsx` — empty state
- `src/pages/Dashboard.tsx` — conditional streak visibility

### Files to Delete

- `src/components/dashboard/DashboardContent.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/dashboard/JourneyMapCard.tsx`
- `src/components/dashboard/LivingArtifact.tsx`
- `src/components/dashboard/PetersInsightCard.tsx`
- `src/components/dashboard/RelationshipScoreCard.tsx`
- `src/components/dashboard/TodaysFocusCard.tsx`

---

## Workstream 4: Weekly Mirror — No Work Needed

Fully implemented end-to-end:
- `POST /api/weekly-mirror/generate` — LLM synthesis with min 3 sessions requirement
- `WeeklyMirrorCard` component — fetches, displays narrative + stats
- Growth thread integration — creates `mirror` type entries
- Lazy generation on dashboard load after Sunday

---

## Workstream 5: Journey Completion — No Work Needed

Fully implemented end-to-end:
- `JourneyCompletion.tsx` — synthesis display, rest/continue choice, 3 recommended journeys
- `session/complete.ts` — fires synthesis generation, recommendations, growth thread milestone
- `next-journey-recommender.ts` — attachment-style affinity scoring, rest suggestions
- `POST /api/journeys/activate` — activates selected journey

---

## Workstream 6: Tech Debt Cleanup

### High Priority (Delete)

| File/Directory | Reason |
|---|---|
| `src/lib/auth/` (entire directory + hooks/) | Dead refactoring attempt. 0 real imports. Never wired into _app.tsx. |
| `src/components/auth/ProtectedRoute.tsx` | Duplicate #1. Unused. Keep `src/components/ProtectedRoute.tsx`. |
| `src/components/ui/protected-route.tsx` | Duplicate #2. Unused. |
| `src/pages/test-page.tsx` | Debug page accessible in production. |

### Medium Priority (Delete)

7 dead dashboard components listed in Workstream 2+3 above.

### Low Priority (Cleanup)

| Item | Action |
|---|---|
| `src/hooks/useAuth.ts` + `useAuth.tsx` | Remove re-export wrappers. Standard import: `@/lib/auth-context`. |
| 253 console.log statements | Sweep before beta. Keep only error/warn cases. |
| 5 build warnings | Fix: `<img>` → `<Image>`, unescaped apostrophes, useEffect deps. |
| `src/pages/auth.tsx` vs `src/pages/login.tsx` | Review — may be redundant. Consolidate if so. |
| `src/pages/ai-therapist.tsx` | Out of beta scope. Remove or gate behind feature flag. |

### What's Already Clean (No Action Needed)

- No security issues — `.env.local` is gitignored, no API keys in source
- Build compiles successfully
- No `import.meta.env` remaining (Vite migration complete)
- No `react-router-dom` usage (Next.js migration complete)
- `vercel.json` correctly set to `"framework": "nextjs"`
- All imports resolve correctly
- Supabase client migration complete (canonical client used everywhere)

---

## Implementation Order

1. **Tech debt cleanup first** — delete dead code so we're working in a clean codebase
2. **Onboarding rewrites** — update questions.ts with approved language
3. **Dashboard polish** — empty states, partner-synthesis fix, edge case verification
4. **Console.log sweep + build warning fixes** — final cleanup pass

---

## Success Criteria

The app is public beta ready when:

- [ ] All dead code deleted (auth directory, duplicate components, test page)
- [ ] Onboarding questions rewritten per approved designs
- [ ] Dashboard shows warm empty states for Day 1 users
- [ ] Partner-synthesis import doesn't crash session completion
- [ ] Build compiles with 0 warnings
- [ ] No console.log statements in production code (except error/warn)
- [ ] End-to-end flow works: signup → onboarding → first daily session → evening check-in → dashboard shows growth thread entry
