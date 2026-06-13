# The Way Back (Relapse / Repair) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make returning after a 3+ day gap warm and shame-free: retire the streak-reset, detect the return, and give Peter a gap-aware greeting plus a welcome-back card.

**Architecture:** One migration rewrites the live `update_streak_on_session` trigger function (delete the reset branch) and adds a `get_return_state()` RPC (DB-basis date math, RLS-safe). A thin server module + GET endpoint expose return-state; PeterGreeting overrides the stale greeting on return; a WelcomeBackCard renders when returning. Deterministic warm copy, no LLM, all fail-soft.

**Tech Stack:** Supabase (Postgres trigger + RPC), Next.js Pages Router API, framer-motion, existing brand tokens.

**Spec:** `docs/superpowers/specs/2026-06-11-the-way-back-relapse-repair-design.md` — read first.

**Verification contract (NO automated tests, per CLAUDE.md):** tsc/lint/build + greps + live SQL trigger check + manual UAT. All commands from `/Users/chris/sparq-connection-lab`. Supabase project: `ujqdnyxdenadpowxrkjn`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260611140000_forgiving_streak_and_return_state.sql` | Create | Rewrite trigger fn (no reset) + add `get_return_state()` RPC. Apply live |
| `src/lib/welcome-back.ts` | Create | Pure copy helpers: `welcomeGreeting(firstName, daysAway)`, `welcomeCardCopy(practiceDays)`. Client-safe, no deps |
| `src/lib/server/return-state.ts` | Create | `getReturnState(supabase, userId)` → `{ returning, days_away, practice_days }`; calls the RPC; fail-soft |
| `src/pages/api/me/return-state.ts` | Create | GET endpoint wrapping the module |
| `src/components/dashboard/PeterGreeting.tsx` | Modify | Fetch return-state; override greeting with `welcomeGreeting` when returning |
| `src/components/dashboard/WelcomeBackCard.tsx` | Create | Renders when returning; celebrates practice_days; CTA to /daily-growth |
| `src/pages/dashboard.tsx` | Modify | Mount WelcomeBackCard above the daily CTA |

---

### Task 1: Migration — forgiving trigger + return-state RPC

**Files:**
- Create: `supabase/migrations/20260611140000_forgiving_streak_and_return_state.sql`

- [ ] **Step 1: Write the migration.** `CREATE OR REPLACE` the trigger function with the reset branch removed (everything else preserved verbatim from the live definition — SECURITY DEFINER, search_path, profiles mirror, longest_streak/total_sessions, the IS NULL first-session branch), and add the RPC:

```sql
-- The Way Back (Phase D): forgiving streak + return-state RPC.
-- Spec: docs/superpowers/specs/2026-06-11-the-way-back-relapse-repair-design.md

-- ── Forgiving streak: a gap no longer resets current_streak ──────────────────
-- Only change vs. the live definition: the ELSE "Streak broken, restart" branch
-- is removed; any last_session_date < CURRENT_DATE now increments. The IS NULL
-- first-session branch (current_streak = 1) is preserved.
CREATE OR REPLACE FUNCTION public.update_streak_on_session()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_streak RECORD;
BEGIN
  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date, total_sessions)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1);
  ELSIF v_streak.last_session_date = CURRENT_DATE THEN
    -- Already practiced today — no streak change, no double count
    NULL;
  ELSE
    -- Any earlier date (yesterday OR a longer gap): forgiving increment.
    -- Missed days are skipped, never punished (spec §2).
    UPDATE public.user_streaks SET
      current_streak = v_streak.current_streak + 1,
      longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
      last_session_date = CURRENT_DATE,
      total_sessions = v_streak.total_sessions + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Mirror to profiles (unchanged from live definition)
  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    discovery_day = NEW.discovery_day,
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$function$;

-- Trigger on_daily_session_created (AFTER INSERT) is unchanged — the function
-- replacement preserves it.

-- ── Return-state RPC: DB-basis date math, RLS-safe (SECURITY INVOKER) ─────────
-- Computes days_away in CURRENT_DATE basis so the streak and the greeting band
-- never disagree at a day boundary (spec §3). Reads the caller's own row only.
CREATE OR REPLACE FUNCTION public.get_return_state()
 RETURNS TABLE (days_away integer, practice_days integer)
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT
    COALESCE((CURRENT_DATE - last_session_date), 0)::integer AS days_away,
    COALESCE(total_sessions, 0)::integer AS practice_days
  FROM public.user_streaks
  WHERE user_id = auth.uid();
$function$;
```

- [ ] **Step 2: Verify file** — `grep -c "CREATE OR REPLACE FUNCTION" supabase/migrations/20260611140000_forgiving_streak_and_return_state.sql` → `2`; confirm the string `Streak broken` does NOT appear (`! grep -q "Streak broken" ...`).

- [ ] **Step 3: Apply live** via Supabase MCP `apply_migration` (project `ujqdnyxdenadpowxrkjn`, name `forgiving_streak_and_return_state`).

- [ ] **Step 4: Live trigger gap-check (the load-bearing test).** Run via Supabase MCP `execute_sql` against a disposable real user id (pick one with an existing `user_streaks` row, snapshot its values first, restore after):

```sql
-- snapshot
SELECT current_streak, last_session_date, total_sessions FROM user_streaks WHERE user_id = '<TEST_UID>';
-- simulate a 4-day gap with streak at 5
UPDATE user_streaks SET current_streak = 5, last_session_date = CURRENT_DATE - 4 WHERE user_id = '<TEST_UID>';
-- fire the trigger by inserting a session dated today (use the real daily_sessions shape; minimal required cols)
-- NOTE: inspect daily_sessions columns first; insert a row for <TEST_UID> with today's session_local_date + a unique day_index
-- then assert:
SELECT current_streak FROM user_streaks WHERE user_id = '<TEST_UID>';  -- EXPECT 6, not 1
```

Expected: `current_streak = 6` (incremented across the gap, not reset). **Restore the snapshot and delete the test session row afterward.** If a clean disposable user isn't available, instead verify by reading the deployed function body (`SELECT pg_get_functiondef('public.update_streak_on_session'::regproc)`) and confirming the `Streak broken` branch is gone — but the insert test is preferred.

- [ ] **Step 5: Commit** — `git add supabase/migrations/20260611140000_forgiving_streak_and_return_state.sql && git commit -m "feat(way-back): forgiving streak trigger + return-state RPC (applied live)"`

---

### Task 2: Welcome copy helper

**Files:**
- Create: `src/lib/welcome-back.ts`

- [ ] **Step 1: Create** (pure, client-safe, no clinical language — Neff self-compassion implicit):

```typescript
// Deterministic welcome-back copy (spec §4). Pure functions, no LLM, no deps.
// Tone: glad you're back, nothing to catch up on, let's just begin.

/** Greeting line shown in PeterGreeting when a user returns after a gap. */
export function welcomeGreeting(firstName: string, daysAway: number): string {
  const name = firstName ? `, ${firstName}` : '';
  if (daysAway >= 14) {
    return `It's really good to see you again${name}. However long it's been, there's nothing to catch up on — we can just pick up gently from here.`;
  }
  if (daysAway >= 7) {
    return `Welcome back${name}. It's been a little while, and I'm genuinely glad you're here. No catching up needed — let's just begin.`;
  }
  // 3–6 days
  return `Hey${name} — good to see you back. A few days is nothing. Let's ease back in together.`;
}

/** Welcome-back card body, celebrating the lifetime practice-days count. */
export function welcomeCardCopy(practiceDays: number): { headline: string; body: string; cta: string } {
  return {
    headline: 'Welcome back',
    body: practiceDays > 0
      ? `You've shown up ${practiceDays} ${practiceDays === 1 ? 'day' : 'days'} so far. That doesn't go away. Want to make it ${practiceDays + 1}?`
      : `Today's a good day to begin. Just a few minutes, just you.`,
    cta: 'Pick up where we left off',
  };
}
```

- [ ] **Step 2: Verify + commit** — tsc 0; `! grep -niE "\\b(anxious|avoidant|trauma|relapse|lapse|disorder|diagnosis)\\b" src/lib/welcome-back.ts`. Commit `feat(way-back): deterministic welcome-back copy helpers`.

---

### Task 3: Return-state module + endpoint

**Files:**
- Create: `src/lib/server/return-state.ts`, `src/pages/api/me/return-state.ts`

- [ ] **Step 1: Module** (`src/lib/server/return-state.ts`):

```typescript
// Return-state (spec §3): derived from user_streaks via the get_return_state
// RPC (DB-basis date math). Never throws — fail-soft to not-returning.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReturnState {
  returning: boolean;
  days_away: number;
  practice_days: number;
}

const AWAY_THRESHOLD_DAYS = 3;

export async function getReturnState(
  supabase: SupabaseClient,
  _userId: string,
): Promise<ReturnState> {
  try {
    // RPC reads the caller's own row via auth.uid() (SECURITY INVOKER + RLS).
    const { data, error } = await supabase.rpc('get_return_state');
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return { returning: false, days_away: 0, practice_days: 0 };
    const days_away = Number(row.days_away ?? 0);
    const practice_days = Number(row.practice_days ?? 0);
    // returning only when there's real history (practice_days > 0) and a real gap
    const returning = practice_days > 0 && days_away >= AWAY_THRESHOLD_DAYS;
    return { returning, days_away, practice_days };
  } catch {
    return { returning: false, days_away: 0, practice_days: 0 };
  }
}
```

- [ ] **Step 2: Endpoint** (`src/pages/api/me/return-state.ts`):

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getReturnState } from '@/lib/server/return-state';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const state = await getReturnState(ctx.supabase, ctx.userId);
  return res.status(200).json(state);
}
```

- [ ] **Step 3: Verify + commit** — tsc 0. Commit `feat(way-back): return-state module + endpoint`.

---

### Task 4: PeterGreeting gap-aware override

**Files:**
- Modify: `src/components/dashboard/PeterGreeting.tsx`

- [ ] **Step 1: Imports** — add:

```typescript
import { buildAuthedHeaders } from '@/lib/api-auth';
import { welcomeGreeting } from '@/lib/welcome-back';
```

- [ ] **Step 2: State** — alongside `const [greeting, setGreeting] = useState<string | null>(null);` add:

```typescript
  const [welcome, setWelcome] = useState<string | null>(null);
```

- [ ] **Step 3: Fetch return-state** — inside the existing `useEffect`'s async IIFE, after the `next_greeting_text` read (before the `catch`), add a return-state fetch that sets the welcome line when returning:

```typescript
        try {
          const headers = await buildAuthedHeaders();
          const res = await fetch('/api/me/return-state', { headers });
          if (res.ok) {
            const rs = await res.json();
            if (rs.returning) setWelcome(welcomeGreeting(firstName, rs.days_away));
          }
        } catch {
          // fail-soft: no welcome override
        }
```

- [ ] **Step 4: Prefer the welcome line** — change the display resolution:

```typescript
  const displayText = welcome || greeting || fallback;
```

(When returning, the warm welcome-back line replaces the stale `next_greeting_text`; otherwise behavior is unchanged.)

- [ ] **Step 5: Verify + commit** — tsc 0; `grep -c "welcomeGreeting" src/components/dashboard/PeterGreeting.tsx` → 2 (import + call). Commit `feat(way-back): gap-aware welcome greeting overrides stale line`.

---

### Task 5: WelcomeBackCard + dashboard mount

**Files:**
- Create: `src/components/dashboard/WelcomeBackCard.tsx`
- Modify: `src/pages/dashboard.tsx`

- [ ] **Step 1: Create the card** (CsiPulseCard/NorthStarCard conventions; fail-soft; renders only when returning):

```tsx
// Welcome-back card (spec §4). Renders only after a 3+ day gap. Celebrates the
// lifetime practice-days count; one gentle CTA into the normal loop.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { welcomeCardCopy } from '@/lib/welcome-back';

export function WelcomeBackCard() {
  const router = useRouter();
  const [copy, setCopy] = useState<{ headline: string; body: string; cta: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/me/return-state', { headers });
        if (!res.ok) return;
        const rs = await res.json();
        if (!cancelled && rs.returning) setCopy(welcomeCardCopy(rs.practice_days));
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!copy) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <PeterAvatar mood="morning" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">{copy.headline}</p>
      </div>
      <p className="text-sm leading-relaxed text-brand-text-secondary mb-4 relative z-10">{copy.body}</p>
      <button
        onClick={() => router.push('/daily-growth')}
        className="relative z-10 rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
      >
        {copy.cta}
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2: Mount** — in `src/pages/dashboard.tsx`, import `WelcomeBackCard` next to the other dashboard card imports; render `<WelcomeBackCard />` as the FIRST card after `<PeterGreeting .../>` / above the TODAY'S PRACTICE CTA block, so the welcome frames the day (read the file's card region; place it immediately before the "TODAY'S PRACTICE CTA" motion block).

- [ ] **Step 3: Verify + commit** — tsc 0; `grep -c "WelcomeBackCard" src/pages/dashboard.tsx` → 2. Commit `feat(way-back): welcome-back dashboard card`.

---

### Task 6: Final verification sweep

- [ ] **Step 1: Greps**

```bash
# return-state read only via its module/endpoint/surfaces
grep -rn "get_return_state\|getReturnState" src --include="*.ts" --include="*.tsx" | wc -l   # → ≥3 (module, endpoint, 2 surfaces import the helper not the rpc directly)
# no clinical/relapse language in user-facing copy
grep -rniE "\b(anxious|avoidant|disorganized|trauma|relapse|lapse|disorder|diagnosis|toxic)\b" src/lib/welcome-back.ts src/components/dashboard/WelcomeBackCard.tsx | wc -l   # → 0
# user_streaks still mutated only by the trigger (no app-code writes)
grep -rn "from('user_streaks')" src --include="*.ts" --include="*.tsx" | grep -iE "update|insert|upsert|delete" | wc -l   # → 0
```

- [ ] **Step 2: Full build** — `npx tsc --noEmit && npm run lint && npm run build` all exit 0.

- [ ] **Step 3: Manual UAT (dev)** — with a dev user that has a `user_streaks` row: set `last_session_date = CURRENT_DATE - 4`, `total_sessions = 12` → dashboard shows WelcomeBackCard ("shown up 12 days… make it 13") + PeterGreeting shows the 3–6-day welcome line + streak intact (non-zero). Set `last_session_date = CURRENT_DATE - 1` → no card, normal greeting. Complete a session after the gap → confirm `current_streak` incremented (not reset).

- [ ] **Step 4: Final commit** — `git add -A && git commit -m "feat(way-back): The Way Back relapse/repair — final verification pass"`
