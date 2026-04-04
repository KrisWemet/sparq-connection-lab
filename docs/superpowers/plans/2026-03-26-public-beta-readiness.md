# Public Beta Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Sparq Connection to public beta readiness by cleaning dead code, rewriting onboarding questions for NLP compliance, adding dashboard empty states, and fixing build warnings.

**Architecture:** 4 tasks executed sequentially. Task 1 (tech debt) cleans the codebase first. Task 2 (onboarding) rewrites a single file. Task 3 (dashboard) adds empty states to 3 components. Task 4 (final cleanup) sweeps console.logs and fixes build warnings.

**Tech Stack:** Next.js 13 (Pages Router), TypeScript, Tailwind CSS, Supabase, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-25-public-beta-readiness-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Delete | `src/lib/auth/` (entire directory) | Dead auth refactoring attempt |
| Delete | `src/lib/auth/hooks/` (subdirectory) | Dead auth hooks |
| Delete | `src/components/auth/ProtectedRoute.tsx` | Duplicate ProtectedRoute #1 |
| Delete | `src/components/ui/protected-route.tsx` | Duplicate ProtectedRoute #2 |
| Delete | `src/pages/test-page.tsx` | Debug page in production |
| Delete | `src/components/dashboard/DashboardContent.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/DashboardLayout.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/JourneyMapCard.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/LivingArtifact.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/PetersInsightCard.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/RelationshipScoreCard.tsx` | Unused dashboard component |
| Delete | `src/components/dashboard/TodaysFocusCard.tsx` | Unused dashboard component |
| Modify | `src/lib/onboarding/questions.ts` | Rewrite Q2 bridges, Q6-Q11, Q13, Q14 |
| Modify | `src/components/dashboard/GrowthThread.tsx:58` | Add empty state instead of returning null |
| Modify | `src/components/dashboard/JourneyArc.tsx:60` | Add empty state instead of returning null |
| Modify | `src/components/dashboard/WeeklyMirrorCard.tsx` | Add empty state for no-mirror case |

---

### Task 1: Tech Debt Cleanup

**Files:**
- Delete: `src/lib/auth/` (entire directory including `hooks/` subdirectory)
- Delete: `src/components/auth/ProtectedRoute.tsx`
- Delete: `src/components/ui/protected-route.tsx`
- Delete: `src/pages/test-page.tsx`
- Delete: `src/components/dashboard/DashboardContent.tsx`
- Delete: `src/components/dashboard/DashboardLayout.tsx`
- Delete: `src/components/dashboard/JourneyMapCard.tsx`
- Delete: `src/components/dashboard/LivingArtifact.tsx`
- Delete: `src/components/dashboard/PetersInsightCard.tsx`
- Delete: `src/components/dashboard/RelationshipScoreCard.tsx`
- Delete: `src/components/dashboard/TodaysFocusCard.tsx`

- [ ] **Step 1: Verify no imports reference the files to be deleted**

Search for imports of each file. None of these should be imported anywhere:

```bash
# Check for imports of the dead auth directory
grep -r "from.*lib/auth/" src/ --include="*.ts" --include="*.tsx" | grep -v "auth-context" | grep -v "node_modules"

# Check for imports of duplicate ProtectedRoutes
grep -r "from.*components/auth/ProtectedRoute" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*components/ui/protected-route" src/ --include="*.ts" --include="*.tsx"

# Check for imports of dead dashboard components
grep -r "DashboardContent\|DashboardLayout\|JourneyMapCard\|LivingArtifact\|PetersInsightCard\|RelationshipScoreCard\|TodaysFocusCard" src/ --include="*.ts" --include="*.tsx" | grep -v "src/components/dashboard/"
```

Expected: No results (confirming these files are unused).

If any file IS imported somewhere, do NOT delete it. Instead, note the dependency and skip that file.

- [ ] **Step 2: Delete the dead auth directory**

```bash
rm -rf src/lib/auth/
```

- [ ] **Step 3: Delete duplicate ProtectedRoute components**

```bash
rm src/components/auth/ProtectedRoute.tsx
rm src/components/ui/protected-route.tsx
```

Note: Keep `src/components/ProtectedRoute.tsx` — that's the active one.

- [ ] **Step 4: Delete test page**

```bash
rm src/pages/test-page.tsx
```

- [ ] **Step 5: Delete dead dashboard components**

```bash
rm src/components/dashboard/DashboardContent.tsx
rm src/components/dashboard/DashboardLayout.tsx
rm src/components/dashboard/JourneyMapCard.tsx
rm src/components/dashboard/LivingArtifact.tsx
rm src/components/dashboard/PetersInsightCard.tsx
rm src/components/dashboard/RelationshipScoreCard.tsx
rm src/components/dashboard/TodaysFocusCard.tsx
```

- [ ] **Step 6: Delete useAuth re-export wrappers**

```bash
rm src/hooks/useAuth.ts
rm src/hooks/useAuth.tsx
```

These just re-export from `@/lib/auth-context`. Any file importing from `@/hooks/useAuth` should be updated to import from `@/lib/auth-context` instead. Search first:

```bash
grep -rn "from.*hooks/useAuth" src/ --include="*.ts" --include="*.tsx"
```

If any imports are found, update them to `import { useAuth } from '@/lib/auth-context'` before deleting.

- [ ] **Step 7: Verify build still passes**

```bash
npm run build
```

Expected: Build succeeds. If it fails, a deleted file was actually imported — restore it and remove from deletion list.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: delete dead code — unused auth directory, duplicate ProtectedRoutes, test page, 7 dead dashboard components, useAuth wrappers"
```

**Deferred to post-beta (intentionally not in this plan):**
- `src/pages/auth.tsx` vs `src/pages/login.tsx` consolidation — needs UX review
- `src/pages/ai-therapist.tsx` removal — needs product decision on whether to gate or delete

---

### Task 2: Onboarding Question Rewrites

**Files:**
- Modify: `src/lib/onboarding/questions.ts`

All changes are in this single file. The `scoreDeltas` values and `sets` fields remain unchanged — only `peterText`, `label`, and `bridge` strings change. Q14 splits into two question objects (Q14a index 13, Q14b index 14).

- [ ] **Step 1: Rewrite Q2 bridges**

In `src/lib/onboarding/questions.ts`, update the Q2 (Age + Pronouns) options. Change all bridges from `"Good to know. Let's keep going."` to:

- Age options (`Under 25`, `25–34`, `35–44`, `45+`): remove the `bridge` property entirely, or set to empty string if the type requires it. Check `QuestionOption` type — `bridge` is required (`bridge: string`), so set age bridges to `""` (empty string).
- Pronoun options (`She / Her`, `He / Him`, `They / Them`): set bridge to `"Got it."`
- `Something else` (free text): set bridge to `"Thanks for telling me."`

- [ ] **Step 2: Rewrite Q6 (Emotional Speed)**

Replace `peterText`:
```
"Picture this — you get a one-word reply to something that mattered to you. What happens in your body first?"
```

Replace options (keep same `scoreDeltas` values):
```typescript
{ label: "Something drops in my stomach — I'm already running through what I did wrong", scoreDeltas: { dysregulation: 3, anxious: 2 }, bridge: "That feeling is your body caring before your brain catches up. Makes sense." },
{ label: "I notice it — like a flicker — but I can let it pass", scoreDeltas: { dysregulation: 1, secure: 1 }, bridge: "That pause between noticing and reacting — most people never build that." },
{ label: "Honestly? I'd move on to something else without thinking much about it", scoreDeltas: { avoidant: 2 }, bridge: "Your nervous system knows how to protect your energy. That's not nothing." },
WRITE_MY_OWN,
```

- [ ] **Step 3: Rewrite Q7 (Recovery Time)**

Replace `peterText`:
```
"After a hard conversation — the kind where you both go quiet — what does the next morning feel like?"
```

Replace options. Note: the old Q7 had 4 scored options + WRITE_MY_OWN. The new version has 3 scored options + WRITE_MY_OWN. Merge the middle two score deltas — use `dysregulation: 2` for the middle option (average of old 1 and 3):
```typescript
{ label: "I wake up and it's mostly behind me — I'm ready to reconnect", scoreDeltas: { secure: 1 }, bridge: "That kind of reset is a real gift to a relationship." },
{ label: "It's still there — like a weight I carry through the day", scoreDeltas: { dysregulation: 2 }, bridge: "When it sticks like that, it means it matters to you. That's not a flaw." },
{ label: "I feel numb — like I've gone somewhere inside myself and I can't get back yet", scoreDeltas: { avoidant: 2, dysregulation: 2 }, bridge: "That going-away feeling — your mind learned to do that to keep you safe. We'll work with it gently." },
WRITE_MY_OWN,
```

- [ ] **Step 4: Rewrite Q8 (Abandonment Response)**

Replace `peterText` function:
```typescript
({ partnerName }) => {
  const name = partnerName ?? 'your partner';
  return `Say ${name} has a quiet Sunday — phone down, not much to say, nothing wrong. Where does your mind go by evening?`;
},
```

Replace options (keep same `scoreDeltas` values):
```typescript
{ label: "I've already checked in twice and I'm rehearsing what to say when they finally look up", scoreDeltas: { abandonment: 3, anxious: 3 }, bridge: "That pull to close the gap — it comes from somewhere real. We'll get into that." },
{ label: "Part of me would wonder, but I'd talk myself out of making it a thing", scoreDeltas: { abandonment: 1, anxious: 1 }, bridge: "That noticing-but-not-acting — there's wisdom in it and sometimes a cost. Good to explore." },
{ label: "I'd barely notice — I've got my own thing going on", scoreDeltas: { avoidant: 3 }, bridge: "Having your own world is healthy. Sometimes it's also a shield — we'll figure out which." },
{ label: "I'd feel relieved honestly — quiet sounds nice", scoreDeltas: { secure: 2 }, bridge: "Craving space isn't selfish. It's a signal worth listening to." },
WRITE_MY_OWN,
```

- [ ] **Step 5: Rewrite Q9 (Inner Voice)**

Replace `peterText`:
```
"Everyone has a voice that shows up during a fight — even after it's over. What does yours tend to say?"
```

Replace options (keep same `scoreDeltas` values):
```typescript
{ label: "\"You messed this up. Again.\"", scoreDeltas: { selfWorth: 3 }, bridge: "That voice has been with you a long time, hasn't it. It's not the truth — but it feels like it." },
{ label: "\"They're pulling away. You can feel it.\"", scoreDeltas: { selfWorth: 2, abandonment: 2 }, bridge: "When that voice speaks, it's hard to hear anything else. That's something we can work with." },
{ label: "\"This is hard, but you'll get through it together\"", scoreDeltas: {}, bridge: "That voice is rare. Most people have to build it — sounds like you've already started." },
{ label: "\"It's just noise — loud, swirling, no clear words\"", scoreDeltas: { selfWorth: 2, dysregulation: 1 }, bridge: "When everything gets loud at once, clarity is the first thing to go. That's your nervous system, not your character." },
WRITE_MY_OWN,
```

- [ ] **Step 6: Rewrite Q10 (Childhood Safety)**

Replace `peterText`:
```
"The way we grew up shapes the way we love — whether we realize it or not. When you think about home growing up, what comes up?"
```

Replace options. Note: old Q10 had 4 options + WRITE_MY_OWN. New version has 3 + WRITE_MY_OWN. For the merged "complicated + hard" option, use the higher `scoreDeltas` from the old "Not really — it was hard" (`trauma: 5, disorganized: 2`) but scale down slightly since it covers a broader range. Use `trauma: 4, disorganized: 1`:
```typescript
{ label: "Mostly good memories — I felt like I belonged there", scoreDeltas: {}, bridge: "That kind of ground under your feet — it carries forward into everything." },
{ label: "A mix — some good, some things I'd rather not repeat", scoreDeltas: { trauma: 2 }, bridge: "Most people land here. The fact that you can see both sides says a lot." },
{ label: "It was hard — I learned early to take care of myself", scoreDeltas: { trauma: 4, disorganized: 1 }, bridge: "You built something out of that. We'll make sure it works for you here, not against you." },
WRITE_MY_OWN,
```

- [ ] **Step 7: Rewrite Q11 (Conflict Style)**

Replace `peterText` function:
```typescript
({ partnerName }) =>
  partnerName
    ? `Think about the last real disagreement you and ${partnerName} had. Not the topic — just what you did. Which is closest?`
    : "Think about the last real disagreement with your partner. Not the topic — just what you did. Which is closest?",
```

Replace option labels and bridges (keep same `sets` and `scoreDeltas`):
```typescript
{ label: "I said what I was feeling — probably before I was ready to say it well", sets: { field: 'conflictStyle', value: 'volatile' }, bridge: "That instinct to speak even when it's messy — it means the silence scares you more than the conflict. That tells me something." },
{ label: "I left the room — or at least went quiet until the charge wore off", sets: { field: 'conflictStyle', value: 'avoidant' }, scoreDeltas: { avoidant: 1 }, bridge: "Leaving to come back calmer — that takes more discipline than people give it credit for." },
{ label: "I tried to hear their side first, even while I was upset", sets: { field: 'conflictStyle', value: 'validating' }, scoreDeltas: { secure: 1 }, bridge: "Holding space while you're hurting — that's a muscle. And you've clearly been building it." },
WRITE_MY_OWN,
```

- [ ] **Step 8: Rewrite Q13 (Life Context)**

Replace `peterText`:
```
"Almost there. Outside your relationship — how much room do you have right now? Like, honestly."
```

Replace options. Old Q13 had 4 options + WRITE_MY_OWN. New version has 3 + WRITE_MY_OWN. Merge "transition" and "heavy" into one option. For the merged option, use the higher scores: `trauma: 2, dysregulation: 1`:
```typescript
{ label: "Things are calm enough — I've got bandwidth for this", sets: { field: 'lifeContext', value: 'stable' }, bridge: "Good — that means we can go a little deeper when you're ready." },
{ label: "I'm juggling a lot — but I'm here because this matters", sets: { field: 'lifeContext', value: 'stressed' }, scoreDeltas: { dysregulation: 1 }, bridge: "Showing up when you're stretched — that's not nothing. We'll keep it light and doable." },
{ label: "Honestly, life is a lot right now", sets: { field: 'lifeContext', value: 'heavy' }, scoreDeltas: { trauma: 2, dysregulation: 1 }, bridge: "Then we start with what's manageable and build from there. No pressure to be anywhere you're not." },
WRITE_MY_OWN,
```

- [ ] **Step 9: Split Q14 into Q14a (Growth Goal) and Q14b (Check-in Frequency)**

Replace the single Q14 object (index 13) with two objects. The first keeps index 13, the second gets index 14:

```typescript
// ── Q14a: Growth Goal ────────────────────────────────────────────────────────
{
  index: 13,
  topic: 'Growth Goal',
  peterText: "Last one. If something shifted in your relationship over the next few weeks — something real — what would that look like for you?",
  inputType: 'text',
  captures: ['growthGoal'],
  options: [],
  // Bridge shown after text submission: "That's worth building toward. I'll remember that."
  // Check how Q1 (Name, also inputType: 'text') handles its bridge.
  // If bridges are rendered from the question object, add a textBridge or
  // handle in QuestionFlow.tsx where text submissions are processed.
},

// ── Q14b: Check-in Frequency ─────────────────────────────────────────────────
{
  index: 14,
  topic: 'Check-in Frequency',
  peterText: "One practical thing — how often do you want to show up here?",
  inputType: 'quick-reply',
  captures: ['checkInFrequency'],
  options: [
    { label: "Every day — I want to build a real habit", sets: { field: 'checkInFrequency', value: 'daily' }, bridge: "Five minutes a day changes more than you'd think. Let's do it." },
    { label: "A few times a week — enough to keep it going", sets: { field: 'checkInFrequency', value: 'few-times-week' }, bridge: "Consistency beats intensity. A few times a week is plenty." },
    { label: "Once a week to start — let me ease in", sets: { field: 'checkInFrequency', value: 'weekly' }, bridge: "Starting where you are is always the right pace." },
  ],
},
```

Important: Q14a uses `inputType: 'text'` (not `multi-part`), and Q14b uses `inputType: 'quick-reply'`. The old combined question used `multi-part` which won't work now that they're separate.

Check that `QuestionFlow.tsx` handles `inputType: 'text'` for questions that aren't Q1 (Name). Read through `QuestionFlow.tsx` to verify — the text input rendering should work for any question with `inputType: 'text'`.

- [ ] **Step 10: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 11: Commit**

```bash
git add src/lib/onboarding/questions.ts
git commit -m "feat: rewrite onboarding questions for NLP compliance — story-based options, unique bridges, Q14 split"
```

---

### Task 3: Dashboard Empty States + Edge Case Fixes

**Files:**
- Modify: `src/components/dashboard/GrowthThread.tsx:58`
- Modify: `src/components/dashboard/JourneyArc.tsx:60`
- Modify: `src/components/dashboard/WeeklyMirrorCard.tsx`
- Verify: `src/pages/api/daily/session/complete.ts` (partner-synthesis error handling)
- Verify: `src/components/dashboard/PeterGreeting.tsx` (greeting fallback)

Currently, `GrowthThread` and `JourneyArc` return `null` when empty (invisible). Replace with warm Peter-driven empty states. Streak is already conditionally rendered (`streakCount > 0` check in Dashboard.tsx:321) — no change needed.

- [ ] **Step 1: Verify partner-synthesis error handling**

Read `src/pages/api/daily/session/complete.ts` around lines 316-350. The partner-synthesis dynamic import is already wrapped in a try-catch block. Verify that:
1. The catch block logs the error but does NOT re-throw
2. The function continues normally even if partner synthesis fails

If the try-catch is already correct (it should be — the exploration found `catch (err) { console.error(...) }`), no changes needed. Move on.

If it's NOT wrapped in try-catch, add one:
```typescript
try {
  const { generatePartnerSynthesis } = await import('@/lib/server/partner-synthesis');
  await generatePartnerSynthesis(...);
} catch (err) {
  console.error('Partner synthesis background error:', err);
}
```

- [ ] **Step 2: Verify greeting fallback on LLM failure**

Read `src/components/dashboard/PeterGreeting.tsx`. Verify it has a fallback when `next_greeting_text` is null/empty in the database. It should show a generic time-based greeting (e.g., "Good morning" / "Good evening"). If no fallback exists, add one.

- [ ] **Step 3: Read the current GrowthThread component**

Read `src/components/dashboard/GrowthThread.tsx` to understand the existing component structure, styling patterns, and where the empty check is.

- [ ] **Step 4: Add empty state to GrowthThread**

Find line 58 (or wherever `if (entries.length === 0) return null;` is) and replace with:

```tsx
if (entries.length === 0) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
        Your Growth Story
      </p>
      <p className="font-serif italic text-brand-text-secondary text-[15px] leading-relaxed">
        Your story starts here. After your first session, this is where your moments will live.
      </p>
    </motion.div>
  );
}
```

Make sure `motion` is imported from `framer-motion` (it likely already is in this file).

- [ ] **Step 5: Read the current JourneyArc component**

Read `src/components/dashboard/JourneyArc.tsx` to understand the existing structure.

- [ ] **Step 6: Add empty state to JourneyArc**

Find `if (loading || sessions.length === 0) return null;` and replace with:

```tsx
if (loading) return null;

if (sessions.length === 0) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
        Journey Arc
      </p>
      <div className="flex items-end gap-1 h-16">
        <div className="w-3 rounded-t bg-brand-primary/30 h-8" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-3 rounded-t bg-brand-primary/10 h-4" />
        ))}
      </div>
      <p className="font-serif italic text-brand-text-secondary text-sm mt-3 leading-relaxed">
        Day 1 — your arc begins here.
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 7: Read the current WeeklyMirrorCard component**

Read `src/components/dashboard/WeeklyMirrorCard.tsx` to understand how it handles the no-data case.

- [ ] **Step 8: Add empty state to WeeklyMirrorCard**

Find where the component handles the case when there's no mirror data (may be returning null, showing a loading state, or something else). Add an empty state for when the user has fewer than 3 sessions this week:

```tsx
// If no mirror and not enough sessions, show the warm empty state
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
>
  <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
    Weekly Mirror
  </p>
  <p className="font-serif italic text-brand-text-secondary text-[15px] leading-relaxed">
    After a few sessions this week, I'll share what I'm noticing.
  </p>
</motion.div>
```

Adapt this to fit the component's existing structure and conditional rendering pattern.

- [ ] **Step 9: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/components/dashboard/GrowthThread.tsx src/components/dashboard/JourneyArc.tsx src/components/dashboard/WeeklyMirrorCard.tsx src/components/dashboard/PeterGreeting.tsx src/pages/api/daily/session/complete.ts
git commit -m "feat: add warm empty states to dashboard + verify edge case error handling"
```

Note: Only include files that were actually modified. If partner-synthesis and greeting fallback were already correct (no changes), omit those files from the git add.

---

### Task 4: Final Cleanup — Console.logs + Build Warnings

**Files:**
- Multiple files across `src/` (console.log sweep)
- `src/components/PeterAvatar.tsx:31` (img → Image warning)
- `src/components/journey/JourneyContentView.tsx:590` (unescaped apostrophes)
- `src/lib/auth-context.tsx:127` (useEffect dependency)
- `src/pages/onboarding.tsx:38` (useEffect dependency)

- [ ] **Step 1: Sweep console.log statements**

Find all console.log/debug statements:

```bash
grep -rn "console\.\(log\|debug\)" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v "console\.error\|console\.warn" | wc -l
```

Remove all `console.log` and `console.debug` statements. Keep `console.error` and `console.warn` — those are appropriate for production.

For files with many console.logs, use search-and-delete. Focus on the high-priority files first:
- `src/hooks/useAuthRedirect.ts`
- `src/hooks/useOnboardingRedirect.ts`
- `src/components/profile/PersonalInfoCard.tsx`
- `src/components/profile/PreferencesTab.tsx`

Then sweep remaining files.

- [ ] **Step 2: Fix build warning — PeterAvatar.tsx img tag**

In `src/components/PeterAvatar.tsx` around line 31, if there's an `<img>` tag, replace with Next.js `<Image>` component:

```tsx
import Image from 'next/image';

// Replace <img src={...} alt={...} /> with:
<Image src={...} alt={...} width={size} height={size} />
```

If the image is a data URI or dynamic SVG, the `<img>` tag may be intentional — in that case, suppress the warning with `{/* eslint-disable-next-line @next/next/no-img-element */}` above the line.

- [ ] **Step 3: Fix build warning — JourneyContentView.tsx unescaped apostrophes**

In `src/components/journey/JourneyContentView.tsx` around line 590, replace unescaped `'` with `&apos;` in JSX text content.

- [ ] **Step 4: Fix build warning — auth-context.tsx useEffect dependency**

In `src/lib/auth-context.tsx` around line 127, add `recoverFromStaleSession` to the useEffect dependency array. If `recoverFromStaleSession` is defined inside the component, wrap it in `useCallback` first to prevent infinite re-renders.

- [ ] **Step 5: Fix build warning — onboarding.tsx useEffect dependency**

In `src/pages/onboarding.tsx` around line 38, add `router` to the useEffect dependency array. `router` from `useRouter()` is stable across renders in Next.js, so this is safe.

- [ ] **Step 6: Verify build passes with 0 warnings**

```bash
npm run build 2>&1 | grep -i "warning\|error"
```

Expected: No warnings, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove console.logs and fix build warnings for production readiness"
```

---

## Post-Implementation Verification

After all 4 tasks are complete, verify the success criteria:

- [ ] `npm run build` succeeds with 0 warnings
- [ ] No `console.log` statements remain (only `console.error` and `console.warn`)
- [ ] Dead files are gone (verify `src/lib/auth/` directory doesn't exist)
- [ ] Dashboard shows empty states (manually check by loading dashboard for a new user — or check component code)
- [ ] Onboarding questions read the new language (check `src/lib/onboarding/questions.ts`)
