# A Different Pair of Eyes (Finkel Method) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Neutral Observer Reflection (Finkel 2013 protocol) by porting the finished sprint-3 implementation onto today's main with warm labeling, an encryption guard, and three triggers.

**Architecture:** Pure port + rewire. Five files copied from `.worktrees/sprint-3-finkel-method` (commit 8a134aa) with surgical adaptations; four small fresh integrations (due endpoint, dashboard card, conflict offer, nav entry); zero schema changes (table + scheduling column already live); no LLM anywhere in the flow.

**Tech Stack:** Next.js Pages Router, Supabase, node:crypto AES-256-GCM, framer-motion, existing brand tokens.

**Spec:** `docs/superpowers/specs/2026-06-11-finkel-neutral-observer-design.md` — read first.

**Verification contract (NO automated tests, per CLAUDE.md):** tsc/lint/build + greps + one-off crypto script + manual UAT. All commands from `/Users/chris/sparq-connection-lab`. Port source: `WT=.worktrees/sprint-3-finkel-method`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/lib/server/encryption.ts` | Port + guard | AES-256-GCM per-user encryption; NEW `isEncryptionConfigured()` |
| `src/pages/api/reflections/index.ts` | Port + guard | POST (encrypt + save + schedule advance), GET list (decrypt) |
| `src/pages/api/reflections/[id].ts` | Port + guard | GET single (decrypt, user-scoped) |
| `src/pages/api/reflections/due.ts` | Create | Lightweight `{ due: boolean }` from `profiles.next_neutral_observer_due` (never decrypts bodies) |
| `src/pages/neutral-observer.tsx` | Port + retitle | 3-screen flow; warm title; **fix trigger mapping** (`scheduled` was unmapped — quarterly completions would never advance the schedule) |
| `src/pages/neutral-observer/history.tsx` | Port verbatim | History list (all imports exist on main: PeterLoading, auth-context, api-auth) |
| `src/components/dashboard/NeutralObserverCard.tsx` | Create | Quarterly due card (CsiPulseCard conventions) |
| `src/pages/dashboard.tsx` | Modify | Mount card |
| `src/pages/conflict-first-aid.tsx` | Modify | End-of-tools-phase offer |
| `src/components/dashboard/HomeDestinationStrip.tsx` | Modify | 4th destination + `grid-cols-2` (4 items wrap badly in cols-3) |
| `src/pages/api/me/memory-settings.ts` | Modify | DELETE route gains `reflections` cascade |
| `.env.local` | Append | `REFLECTION_ENCRYPTION_KEY` (32-byte hex). **Vercel env = manual step for Chris** |

---

### Task 1: Port encryption module + missing-key guard

**Files:**
- Create: `src/lib/server/encryption.ts` (from `$WT/src/lib/server/encryption.ts`)

- [ ] **Step 1: Copy** — `cp .worktrees/sprint-3-finkel-method/src/lib/server/encryption.ts src/lib/server/encryption.ts`

- [ ] **Step 2: Add the guard.** After the `const MASTER_KEY = ...` line, insert:

```typescript
/**
 * True when REFLECTION_ENCRYPTION_KEY is set to a real 32-byte hex key.
 * The original silently encrypted with an empty master key when unset —
 * callers MUST check this and refuse (503) rather than store weak ciphertext.
 */
export function isEncryptionConfigured(): boolean {
  return MASTER_KEY.length === 32;
}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` exit 0; `grep -c "isEncryptionConfigured" src/lib/server/encryption.ts` → ≥1.

- [ ] **Step 4: Commit** — `git add src/lib/server/encryption.ts && git commit -m "feat(finkel): port encryption module with missing-key guard"`

---

### Task 2: Port reflections APIs + guards

**Files:**
- Create: `src/pages/api/reflections/index.ts`, `src/pages/api/reflections/[id].ts` (from `$WT` same paths)

- [ ] **Step 1: Copy both** (quote `[id].ts` — unquoted it's a zsh glob that errors; set WT inline — shell state doesn't persist):

```bash
WT=.worktrees/sprint-3-finkel-method
mkdir -p src/pages/api/reflections
cp "$WT/src/pages/api/reflections/index.ts" src/pages/api/reflections/
cp "$WT/src/pages/api/reflections/[id].ts" 'src/pages/api/reflections/[id].ts'
```

- [ ] **Step 2: Guard in `index.ts`.** Update the import to include `isEncryptionConfigured`; immediately after the auth check (`if (!ctx) ...`), insert:

```typescript
  // Refuse rather than store/serve weakly-encrypted text (spec §3/§5)
  if (!isEncryptionConfigured()) {
    return res.status(503).json({ error: 'Reflections are not available yet' });
  }
```

- [ ] **Step 3: Same guard in `[id].ts`** (same import + same insert after auth check).

- [ ] **Step 4: Verify** — `npx tsc --noEmit` exit 0; `grep -c "isEncryptionConfigured" src/pages/api/reflections/index.ts 'src/pages/api/reflections/[id].ts'` → 2 each (import + call; note the quoted glob).

- [ ] **Step 5: Commit** — `git add src/pages/api/reflections && git commit -m "feat(finkel): port encrypted reflections APIs with 503 guard"`

---

### Task 3: Due endpoint

**Files:**
- Create: `src/pages/api/reflections/due.ts`

- [ ] **Step 1: Create** (complete code):

```typescript
// Lightweight due-check for the quarterly card (spec §4). Returns only a
// boolean — never decrypts reflection bodies (no plaintext exposure for a
// dashboard ping). Due when the user is onboarded AND
// next_neutral_observer_due is null (never done) or in the past.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { data } = await ctx.supabase
    .from('profiles')
    .select('next_neutral_observer_due, isonboarded')
    .eq('id', ctx.userId)
    .maybeSingle();

  const onboarded = Boolean(data?.isonboarded);
  const dueAt = data?.next_neutral_observer_due ? new Date(data.next_neutral_observer_due).getTime() : null;
  const due = onboarded && (dueAt === null || dueAt <= Date.now());
  return res.status(200).json({ due });
}
```

- [ ] **Step 2: Verify + commit** — tsc exit 0; `git add src/pages/api/reflections/due.ts && git commit -m "feat(finkel): lightweight quarterly due endpoint"`

---

### Task 4: Port the flow + warm retitle + trigger-mapping fix

**Files:**
- Create: `src/pages/neutral-observer.tsx`, `src/pages/neutral-observer/history.tsx` (from `$WT`)

- [ ] **Step 1: Copy** —

```bash
WT=.worktrees/sprint-3-finkel-method
cp "$WT/src/pages/neutral-observer.tsx" src/pages/
mkdir -p src/pages/neutral-observer
cp "$WT/src/pages/neutral-observer/history.tsx" src/pages/neutral-observer/
```

- [ ] **Step 2: Fix the trigger mapping** (the ported page never maps `scheduled` — quarterly completions would save as `on_demand` and the schedule would never advance). Replace:

```typescript
  const triggerSource = router.query.trigger === 'conflict' ? 'state_tag' : 'on_demand';
```

with:

```typescript
  const triggerSource =
    router.query.trigger === 'conflict' ? 'state_tag'
    : router.query.trigger === 'scheduled' ? 'scheduled'
    : 'on_demand';
```

- [ ] **Step 3: Warm retitle (spec labeling decision — entry screen header block).** Replace the eyebrow/h1/subtitle trio:

```tsx
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-1">
                        Northwestern University Research
                      </p>
                      <h1 className="font-serif text-[28px] leading-tight text-brand-espresso">
                        The Finkel Method
                      </h1>
                      <p className="text-sm text-brand-taupe mt-1">
                        Three minutes. Based on peer-reviewed research.
                      </p>
```

with:

```tsx
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-1">
                        A quiet practice
                      </p>
                      <h1 className="font-serif text-[28px] leading-tight text-brand-espresso">
                        A Different Pair of Eyes
                      </h1>
                      <p className="text-sm text-brand-taupe mt-1">
                        90 seconds, just you. No one else sees this.
                      </p>
```

(The Info tooltip with the full study story STAYS — it is exactly the "quiet credentials" vehicle.)

- [ ] **Step 4: Credential line.** Change the `It's your turn.` paragraph's `mb-7` → `mb-2` (the new line below takes over the pre-button gap), then immediately after it, before the Begin button, insert:

```tsx
                  <p className="text-[11px] text-brand-taupe/70 mb-7">
                    Backed by Northwestern research.
                  </p>
```

- [ ] **Step 5: Completion copy warm-up.** Replace:

```tsx
                    You&apos;ll get a Neutral Observer Reflection again in about 90 days — or anytime
                    you log a new conflict.
```

with:

```tsx
                    I&apos;ll bring this back around in about 90 days — or it&apos;s here anytime
                    you want a different pair of eyes.
```

- [ ] **Step 6: Verify** — tsc exit 0; `grep -c "Finkel" src/pages/neutral-observer.tsx` → expect ONLY tooltip mentions (the study story); `grep -c "A Different Pair of Eyes" src/pages/neutral-observer.tsx` → ≥1; `grep -c "'scheduled'" src/pages/neutral-observer.tsx` → ≥1.

- [ ] **Step 7: Commit** — `git add src/pages/neutral-observer.tsx src/pages/neutral-observer && git commit -m "feat(finkel): port 3-screen flow + history with warm labeling and scheduled-trigger fix"`

---

### Task 5: Quarterly dashboard card

**Files:**
- Create: `src/components/dashboard/NeutralObserverCard.tsx`
- Modify: `src/pages/dashboard.tsx`

- [ ] **Step 1: Create the card** (CsiPulseCard conventions — brand tokens, fail-soft):

```tsx
// Quarterly Neutral Observer card (spec §4). Appears only when due
// (study dosage: 3×/year). Launches with trigger=scheduled so completion
// advances next_neutral_observer_due +90d.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

export function NeutralObserverCard() {
  const router = useRouter();
  const [due, setDue] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/reflections/due', { headers });
        if (!res.ok) return;
        const payload = await res.json();
        if (!cancelled) setDue(Boolean(payload.due));
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!due) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <PeterAvatar mood="afternoon" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">A Different Pair of Eyes</p>
      </div>
      <p className="text-sm leading-relaxed text-brand-text-secondary mb-4 relative z-10">
        It&apos;s been a while since you stepped outside a disagreement and looked at it
        from somewhere new. 90 seconds, just you.
      </p>
      <button
        onClick={() => router.push('/neutral-observer?trigger=scheduled')}
        className="relative z-10 rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
      >
        Take a look
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2: Mount** — in `dashboard.tsx`, import next to NorthStarCard; render `<NeutralObserverCard />` directly after `<CsiPulseCard />`.

- [ ] **Step 3: Verify + commit** — tsc 0; `grep -c "NeutralObserverCard" src/pages/dashboard.tsx` → 2. `git add ... && git commit -m "feat(finkel): quarterly dashboard card"`

---

### Task 6: Post-conflict offer

**Files:**
- Modify: `src/pages/conflict-first-aid.tsx`

- [ ] **Step 1:** Read the tools-phase render (the `return (...)` after the somatic branch, line ~264 onward) and append, as the LAST content block inside the tools-phase main container (after the repair-starters section, before the container closes):

```tsx
        {/* A Different Pair of Eyes — post-conflict reappraisal offer (spec §4).
            Plain div — the parent <main> already provides max-w/px/space-y. */}
        <div>
          <div className="rounded-2xl border border-brand-primary/10 bg-brand-parchment p-5">
            <p className="text-sm leading-relaxed text-brand-espresso mb-1 font-medium">
              When you&apos;re ready
            </p>
            <p className="text-sm leading-relaxed text-brand-taupe mb-4">
              Sometimes it helps to see what happened through different eyes. 90 seconds, just you.
            </p>
            <button
              onClick={() => router.push('/neutral-observer?trigger=conflict')}
              className="rounded-full border border-brand-primary/20 px-4 py-2 text-xs font-medium text-brand-espresso hover:bg-brand-primary/10 transition-colors"
            >
              A different pair of eyes
            </button>
          </div>
        </div>
```

Constraint: purely additive UI — do NOT touch the auto-resolve-on-leave handlers (`resolveEpisode`, beforeunload/visibility listeners). Navigation via `router.push` fires those naturally, which is correct (the conflict episode resolves, then the reflection opens).

- [ ] **Step 2: Verify + commit** — tsc 0; `grep -c "neutral-observer?trigger=conflict" src/pages/conflict-first-aid.tsx` → 1. Commit `feat(finkel): post-conflict reappraisal offer`.

---

### Task 7: Menu entry

**Files:**
- Modify: `src/components/dashboard/HomeDestinationStrip.tsx`

- [ ] **Step 1:** Add `Eye` to the lucide import; add a 4th destination:

```typescript
  {
    href: "/neutral-observer",
    label: "Fresh Eyes",
    description: "See it from outside",
    icon: Eye,
  },
```

and change `grid-cols-3` → `grid-cols-2` (4 items in cols-3 wraps 3+1; 2×2 reads as a set).

- [ ] **Step 2: Verify + commit** — tsc 0; `grep -c "Fresh Eyes" src/components/dashboard/HomeDestinationStrip.tsx` → 1. Commit `feat(finkel): Fresh Eyes destination in home strip`.

---

### Task 8: Privacy cascade

**Files:**
- Modify: `src/pages/api/me/memory-settings.ts`

- [ ] **Step 1:** In the DELETE route only, after the `north_stars` delete, add:

```typescript
      // Reflections are deliberate private journaling — wiped on delete-all,
      // NOT on memory=none (their privacy contract is the encryption, spec §4).
      await ctx.supabase.from('reflections').delete().eq('user_id', ctx.userId);
```

- [ ] **Step 2: Verify + commit** — tsc 0; `grep -c "reflections" src/pages/api/me/memory-settings.ts` → ≥1. Commit `feat(finkel): delete-all cascades reflections`.

---

### Task 9: Encryption key

- [ ] **Step 1:** `grep -q REFLECTION_ENCRYPTION_KEY .env.local 2>/dev/null || echo "REFLECTION_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env.local` (idempotent; never print the key).
- [ ] **Step 2:** Document the manual step in the completion report: **Chris must add the same var in Vercel → Settings → Environment Variables** (generate a separate value for prod: `openssl rand -hex 32`). Until then, prod returns the soft 503 state by design.

---

### Task 10: Final verification sweep

- [ ] **Step 1: Greps (all must pass)**

```bash
grep -c "isEncryptionConfigured" src/pages/api/reflections/index.ts 'src/pages/api/reflections/[id].ts'   # → 2 each (quoted glob)
grep -rn "peterChat\|openrouter" src/pages/neutral-observer.tsx src/pages/neutral-observer/ src/pages/api/reflections/ | wc -l   # → 0 (no LLM)
grep -rn "from('reflections')" src --include="*.ts" --include="*.tsx" | grep -v "api/reflections" | grep -v memory-settings | wc -l   # → 0
grep -rn "Finkel" src --include="*.tsx" | grep -v trust-center | grep -v neutral-observer | wc -l   # → 0 (warm-label check; the flow's tooltip story and the Trust Center are the only allowed mentions — the card comment uses "study dosage" specifically so this passes)
```

- [ ] **Step 2: Crypto round-trip (one-off tsx script, not committed)** — with a test key in env: encrypt→decrypt identity; tampered tag throws; `isEncryptionConfigured()` false with empty env, true with 64-hex-char env.

- [ ] **Step 3: Full build** — `npx tsc --noEmit && npm run lint && npm run build` all exit 0.

- [ ] **Step 4: Manual UAT (dev)** — due card visible for onboarded user with null `next_neutral_observer_due` → full flow via card → row in `reflections` with `iv:data:tag` ciphertext + `trigger_source='scheduled'` → `next_neutral_observer_due` advanced ~90d → card gone → history decrypts → conflict-path completion (`?trigger=conflict`) saves `state_tag` and does NOT advance the date → delete-all wipes rows.

- [ ] **Step 5: Final commit** — `git add -A && git commit -m "feat(finkel): A Different Pair of Eyes — final verification pass"`
