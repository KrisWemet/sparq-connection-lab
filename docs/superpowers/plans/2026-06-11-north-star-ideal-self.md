# North Star (Ideal-Self Capture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture each user's emotional bedrock via an adaptive values ladder Peter runs inside the Day 2–4 evening check-in, distill it into a confirmed "who you're becoming" line, and orient the dashboard + Peter's prompts toward it.

**Architecture:** A server-side state module (`north-star.ts`) owns ladder state; `chat.ts` consults it on evening turns and swaps the evening prompt block for ladder instructions while open (turn-3 close suppressed, turn-8 hard cap). Capture is deterministic via `[[NORTH_STAR_*]]` markers parsed from raw LLM output before stripMarkdown. Lazy seeding from `psychological_profile.freeTextAnswers`. Same fail-soft contract as Phase 23 / growth engine: any error ⇒ normal evening check-in.

**Tech Stack:** Next.js Pages Router API routes, Supabase (Postgres + RLS), TypeScript strict, existing `peterChat` (OpenRouter).

**Spec:** `docs/superpowers/specs/2026-06-11-north-star-ideal-self-design.md` — read first.

**Verification contract (NO automated tests, per CLAUDE.md):** tsc/lint/build + grep assertions + `logFinalPrompt` + seeded manual UAT. Run all commands from `/Users/chris/sparq-connection-lab`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260611100000_north_stars.sql` | Create | `north_stars` table + RLS (apply live via Supabase MCP) |
| `src/lib/server/north-star.ts` | Create | Single owner of ladder state: eligibility, lazy seed, prompt blocks, marker parsing, orientation builder |
| `src/pages/api/peter/chat.ts` | Modify | Evening path: ladder swap, cap suppression, marker handling, `ladder_active` response field, orientation block |
| `src/pages/api/peter/morning.ts` | Modify | Orientation block |
| `src/pages/api/me/north-star.ts` | Create | GET active line; POST reaffirm / shift |
| `src/components/dashboard/NorthStarCard.tsx` | Create | Quiet serif placecard |
| `src/pages/dashboard.tsx` | Modify | Mount card |
| `src/pages/daily-growth.tsx` | Modify | Gate turn-cap state on `ladder_active` |
| `src/components/onboarding/Day14Graduation.tsx` | Modify | "Still true" / "It's shifting" buttons |
| `src/pages/api/me/memory-settings.ts` | Modify | Privacy cascade (full delete on DELETE; transcript-null on memory=none) |

**Spec deviation (documented):** the spec's turn-cap fix says to suspend the client low-effort interceptor while `ladder_active`. Reading `daily-growth.tsx:409-421`, the interceptor only fires at `eveningTurns === 0` — before any API call, therefore always before a ladder can open. No interceptor change is needed; only the turn-cap gating at lines 453–454 changes.

**Known limitation (spec-inherited, accepted):** users whose row reaches `declined` (3 deflected attempts) have no path to a north star — the graduation boundary card only renders when an active line exists. Spec §2 implies boundary moments could still offer one; deferred to a future phase (backlog: a gentle graduation-time offer for declined/never-captured users).

---

### Task 1: Migration — `north_stars`

**Files:**
- Create: `supabase/migrations/20260611100000_north_stars.sql`

- [ ] **Step 1: Write the migration**

```sql
-- North Star (Phase B): ideal-self capture via adaptive values laddering.
-- Spec: docs/superpowers/specs/2026-06-11-north-star-ideal-self-design.md §3.
-- History accumulates (no unique user_id); at most one non-retired row enforced in code.

CREATE TABLE IF NOT EXISTS north_stars (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'seeded'
                    CHECK (status IN ('seeded', 'laddering', 'active', 'retired', 'declined')),
  seed_text       text,
  line            text,
  proposed_line   text,
  ladder_transcript jsonb NOT NULL DEFAULT '[]',
  attempt_count   int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  confirmed_at    timestamptz,
  reaffirmed_at   timestamptz,
  needs_reladder  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS north_stars_user_status ON north_stars (user_id, status);
ALTER TABLE north_stars ENABLE ROW LEVEL SECURITY;
CREATE POLICY north_stars_own ON north_stars
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Verify structure**

Run: `grep -c "CREATE TABLE IF NOT EXISTS\|ENABLE ROW LEVEL SECURITY" supabase/migrations/20260611100000_north_stars.sql`
Expected: `2`

- [ ] **Step 3: Apply live** via Supabase MCP `apply_migration` (project `ujqdnyxdenadpowxrkjn`, name `north_stars`); verify with a `SELECT count(*) FROM north_stars` probe (expect 0, no error).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260611100000_north_stars.sql
git commit -m "feat(north-star): migration — north_stars table with RLS"
```

---

### Task 2: State module — `src/lib/server/north-star.ts`

**Files:**
- Create: `src/lib/server/north-star.ts`

- [ ] **Step 1: Create the module** (complete code)

```typescript
// north-star.ts — single owner of North Star ladder state (spec §4).
// Adaptive values laddering: variable depth, what/how phrasing, bedrock
// detection, max 4 follow-ups. All functions fail-soft — a ladder failure
// must always degrade to a normal evening check-in, never a broken evening.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface NorthStarRow {
  id: string;
  status: 'seeded' | 'laddering' | 'active' | 'retired' | 'declined';
  seed_text: string | null;
  line: string | null;
  proposed_line: string | null;
  attempt_count: number;
  needs_reladder: boolean;
  last_attempt_at: string | null;
}

export interface NorthStarState {
  row: NorthStarRow | null;
  shouldLadderTonight: boolean;
  isReladder: boolean;
}

const MARKER_PROPOSED = /\[\[NORTH_STAR_PROPOSED:\s*([^\]]+?)\s*\]\]/;
const MARKER_CONFIRMED = /\[\[NORTH_STAR_CONFIRMED\]\]/;
const MARKER_DEFERRED = /\[\[NORTH_STAR_DEFERRED\]\]/;
const STRIP_ALL_MARKERS = /\s*\[\[NORTH_STAR[^\]]*\]\]\s*/g;

/** Fetch the current non-retired row (at most one by construction). */
async function getCurrentRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<NorthStarRow | null> {
  const { data } = await supabase
    .from('north_stars')
    .select('id, status, seed_text, line, proposed_line, attempt_count, needs_reladder, last_attempt_at')
    .eq('user_id', userId)
    .neq('status', 'retired')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as NorthStarRow) || null;
}

/**
 * Lazy seed (spec §4): derive seed_text from the user's own onboarding words
 * (psychological_profile.freeTextAnswers — verified persisted by deriveProfile)
 * and insert a 'seeded' row. Idempotent; null seed is valid (ladder opens
 * without the callback).
 */
async function seedNorthStar(
  supabase: SupabaseClient,
  userId: string,
): Promise<NorthStarRow | null> {
  try {
    let seed: string | null = null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('psychological_profile')
      .eq('id', userId)
      .maybeSingle();
    const freeText = profile?.psychological_profile?.freeTextAnswers;
    if (freeText && typeof freeText === 'object') {
      const answers = Object.values(freeText).filter(
        (v): v is string => typeof v === 'string' && v.trim().length >= 12,
      );
      // Longest answer = richest stated reason (deterministic)
      seed = answers.sort((a, b) => b.length - a.length)[0]?.trim().slice(0, 240) ?? null;
    }
    const { data } = await supabase
      .from('north_stars')
      .insert({ user_id: userId, status: 'seeded', seed_text: seed })
      .select('id, status, seed_text, line, proposed_line, attempt_count, needs_reladder, last_attempt_at')
      .single();
    return (data as NorthStarRow) || null;
  } catch {
    return null;
  }
}

/**
 * Eligibility (spec §4): ladder tonight when
 *  (continuation) status is 'laddering' — mid-ladder conversation; OR
 *  (a) first capture: day 2–4, no active/declined row, attempt_count < 3,
 *      last attempt ≥ 2 days ago; OR
 *  (b) re-ladder: active row with needs_reladder = true.
 * Privacy (can_personalize) is gated by the CALLER (chat.ts already checks).
 * Day source of truth: client-supplied eveningContext.day (consistent with
 * the existing evening path; daily_sessions idempotency bounds abuse).
 */
export async function getNorthStarState(
  supabase: SupabaseClient,
  userId: string,
  eveningDay: number,
): Promise<NorthStarState> {
  try {
    let row = await getCurrentRow(supabase, userId);

    if (row?.status === 'laddering') {
      // Mid-ladder continuation — but guard against abandonment: a 'laddering'
      // row whose last attempt is >1 day old means the user closed the app
      // mid-conversation. Treat as deferred (graceful, honors cooldown intent)
      // instead of reopening every evening forever.
      const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
      if (Date.now() - last > 86400000) {
        await supabase.from('north_stars').update({
          status: row.needs_reladder ? 'active' : (row.attempt_count >= 3 ? 'declined' : 'seeded'),
          proposed_line: null,
        }).eq('id', row.id);
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      return { row, shouldLadderTonight: true, isReladder: row.needs_reladder };
    }
    if (row?.status === 'active' && row.needs_reladder) {
      // Re-ladder eligibility (b) — same courtesy rules as first capture:
      // attempt cap and 2-day cooldown, so a deferred re-ladder retries
      // "on a later evening", never nightly (spec deflection decision).
      if (row.attempt_count >= 3) {
        await supabase.from('north_stars')
          .update({ needs_reladder: false }).eq('id', row.id); // give up; old line stays active
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
      if (last && Date.now() - last < 2 * 86400000) {
        return { row, shouldLadderTonight: false, isReladder: false };
      }
      return { row, shouldLadderTonight: true, isReladder: true };
    }
    if (row?.status === 'active' || row?.status === 'declined') {
      return { row, shouldLadderTonight: false, isReladder: false };
    }

    // First-capture path
    if (eveningDay < 2 || eveningDay > 4) {
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    if (!row) {
      row = await seedNorthStar(supabase, userId); // lazy seed (spec §4)
    }
    if (!row) return { row: null, shouldLadderTonight: false, isReladder: false };
    if (row.attempt_count >= 3) {
      await supabase.from('north_stars').update({ status: 'declined' }).eq('id', row.id);
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    const last = row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0;
    if (Date.now() - last < 2 * 86400000) {
      return { row, shouldLadderTonight: false, isReladder: false };
    }
    return { row, shouldLadderTonight: true, isReladder: false };
  } catch {
    return { row: null, shouldLadderTonight: false, isReladder: false };
  }
}

/**
 * The evening system-prompt replacement for ladder turns (spec §2 + §4).
 * Voice rules: what/how phrasing only — NEVER the pattern "why is that
 * important" (triggers justification, not feeling). Fourth-grade level.
 */
export function buildLadderPromptBlock(
  state: NorthStarState,
  turnNumber: number,
  day: number,
): string {
  const row = state.row;
  const opening = state.isReladder
    ? `At their graduation they told you their "becoming" line ("${row?.line ?? ''}") might be shifting. Tonight, gently ask what feels true now.`
    : row?.seed_text
      ? `When you first met, they said they wanted: "${row.seed_text}". Tonight, after warmly receiving their reflection, get genuinely curious: ask what having that would actually give them.`
      : `Tonight, after warmly receiving their reflection, get genuinely curious about what they're really here for — ask what they're hoping changes, then what that would give them.`;

  const hardClose = turnNumber >= 7
    ? `\nThis conversation has gone long. Warmly wrap up NOW: thank them, no more questions, end with [[NORTH_STAR_DEFERRED]].`
    : '';

  return `\n\nTONIGHT'S SPECIAL FOCUS (Day ${day} — values conversation, woven into the evening check-in):
${opening}

How to ladder (one step per reply, at most 4 ladder questions total):
- Reflect a few of their own words back, then ask ONE gentle deeper question.
- Use "what" and "how" questions only: "What would that give you?", "What does that feel like?", "What happens for you in those moments?" NEVER ask "why is that important" — never interrogate.
- You are listening for bedrock: feeling words, shorter answers, a sentence about who they are or fear becoming ("I don't want to shut down like my dad"), or "I don't know how to say it." When you hear bedrock, STOP asking.
- At bedrock: distill it into one warm identity sentence in THEIR language — "So it sounds like you're becoming someone who ___." Ask "Did I get that right?" and end that message with the hidden line [[NORTH_STAR_PROPOSED: someone who ___]].
- If they confirm (yes / that's it / exactly): respond warmly, bridge into one short normal reflection question about their day, and end the message with [[NORTH_STAR_CONFIRMED]].
- If they adjust your wording: re-distill ONCE using their adjustment, end with a new [[NORTH_STAR_PROPOSED: ...]].
- If they deflect or stay on the surface twice in a row: let it go completely with warmth ("That's okay — it'll come when it comes"), continue as a normal evening reflection, and end that message with [[NORTH_STAR_DEFERRED]].
- The hidden [[...]] lines are for the system, not the user — always place them at the very end of the message.${hardClose}`;
}

export interface LadderTurnResult {
  visibleMessage: string;
  ladderOpen: boolean;
}

/**
 * Parse markers from RAW LLM output (before stripMarkdown — spec §4), advance
 * state, return the marker-stripped message. canStoreTranscript=false ⇒ state
 * advances via status/markers only; transcript never written (spec §7).
 */
export async function processLadderTurn(
  supabase: SupabaseClient,
  userId: string,
  state: NorthStarState,
  rawOutput: string,
  userMessage: string,
  canStoreTranscript: boolean,
  turnNumber: number,
): Promise<LadderTurnResult> {
  // Collapse only horizontal runs — \n\n paragraph breaks must survive
  const visibleMessage = rawOutput
    .replace(STRIP_ALL_MARKERS, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
  try {
    let row = state.row;
    if (!row) return { visibleMessage, ladderOpen: false };

    // DETERMINISTIC hard cap (spec §4 safety net): at turn >= 8 the ladder
    // closes regardless of what the LLM emitted. Without this, one
    // marker-less wrap-up strands ladder_active=true and the client can
    // never set canCompleteDay — streak loss from a disobedient LLM turn.
    const forceClose = turnNumber >= 8;

    // First ladder turn: open the attempt. Re-ladders ALSO move through
    // 'laddering' (line preserved on the row; needs_reladder stays true as
    // the re-ladder flag) so continuation works identically for both paths
    // and eligibility (b)'s cooldown can't kill a mid-conversation ladder.
    if (row.status === 'seeded' || (row.status === 'active' && row.needs_reladder)) {
      await supabase
        .from('north_stars')
        .update({
          status: 'laddering',
          attempt_count: row.attempt_count + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      row = { ...row, status: 'laddering', attempt_count: row.attempt_count + 1 };
    }

    if (canStoreTranscript) {
      const { data: cur } = await supabase
        .from('north_stars').select('ladder_transcript').eq('id', row.id).maybeSingle();
      const transcript = Array.isArray(cur?.ladder_transcript) ? cur.ladder_transcript : [];
      transcript.push({ role: 'user', content: userMessage.slice(0, 500) });
      transcript.push({ role: 'assistant', content: visibleMessage.slice(0, 500) });
      await supabase.from('north_stars')
        .update({ ladder_transcript: transcript }).eq('id', row.id);
    }

    const proposed = rawOutput.match(MARKER_PROPOSED);
    if (proposed && !forceClose) {
      await supabase.from('north_stars')
        .update({ proposed_line: proposed[1].slice(0, 300) }).eq('id', row.id);
      return { visibleMessage, ladderOpen: true };
    }

    if (MARKER_CONFIRMED.test(rawOutput)) {
      const { data: cur } = await supabase
        .from('north_stars').select('proposed_line').eq('id', row.id).maybeSingle();
      const line = cur?.proposed_line || null;
      if (line) {
        if (state.isReladder && row.line) {
          // retire-and-replace (spec §2): old row keeps history
          await supabase.from('north_stars')
            .update({ status: 'retired', needs_reladder: false }).eq('id', row.id);
          await supabase.from('north_stars').insert({
            user_id: userId,
            status: 'active',
            line,
            confirmed_at: new Date().toISOString(),
          });
        } else {
          await supabase.from('north_stars').update({
            status: 'active',
            line,
            confirmed_at: new Date().toISOString(),
            needs_reladder: false,
          }).eq('id', row.id);
        }
        return { visibleMessage, ladderOpen: false };
      }
      // CONFIRMED without a stored proposal — fall through to deferral
      // (never invent a line)
    }

    if (MARKER_DEFERRED.test(rawOutput) || MARKER_CONFIRMED.test(rawOutput) || forceClose) {
      // Graceful exit. Re-ladder: old line returns to 'active', needs_reladder
      // stays true — eligibility (b)'s cooldown + attempt cap govern the
      // retry, so it resumes "on a later evening", never nightly, and gives
      // up entirely after 3 attempts (eligibility clears the flag).
      // First capture: back to 'seeded' (cooldown applies) or 'declined' at cap.
      const update = state.isReladder
        ? { status: 'active' as const, proposed_line: null }
        : {
            status: row.attempt_count >= 3 ? ('declined' as const) : ('seeded' as const),
            proposed_line: null,
          };
      await supabase.from('north_stars').update(update).eq('id', row.id);
      return { visibleMessage, ladderOpen: false };
    }

    return { visibleMessage, ladderOpen: true };
  } catch {
    return { visibleMessage, ladderOpen: false };
  }
}

/** Active line for surfaces (placecard, orientation). Null-safe, fail-soft. */
export async function getActiveNorthStar(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('north_stars')
      .select('line')
      .eq('user_id', userId)
      .eq('status', 'active')
      .not('line', 'is', null)
      .order('confirmed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.line ?? null;
  } catch {
    return null;
  }
}

/** Orientation block (spec §5) — identical Phase 23 insertion pattern. */
export function buildNorthStarOrientation(line: string): string {
  return (
    `\n\nThis person is becoming: "${line}" (their own confirmed words). ` +
    `Never quote this at them or mention you know it; let it quietly shape ` +
    `what you notice, the stories you choose, and what you encourage.`
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `grep -c "why is that important" src/lib/server/north-star.ts` — Expected: `1` (only inside the NEVER-ask instruction)
Run: `grep -c "peterChat\|openrouter" src/lib/server/north-star.ts` — Expected: `0` (no LLM calls — pure state + prompt text)

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/north-star.ts
git commit -m "feat(north-star): ladder state module — eligibility, lazy seed, prompts, marker capture"
```

---

### Task 3: chat.ts integration (ladder swap + cap suppression + orientation)

**Files:**
- Modify: `src/pages/api/peter/chat.ts`

- [ ] **Step 1: Imports** — add after the growth-moments import:

```typescript
import { getNorthStarState, buildLadderPromptBlock, processLadderTurn, getActiveNorthStar, buildNorthStarOrientation, type NorthStarState } from '@/lib/server/north-star';
```

- [ ] **Step 2: Hoisted state + ladder resolution** — declare BEFORE the personalization block (so they're visible at the post-LLM site):

```typescript
    // North Star state (spec §4/§5) — resolved inside the personalization
    // block (single loadPrivacyState), consumed at the evening block and
    // post-LLM marker site.
    let ladderState: NorthStarState | null = null;
    let privacyCanStoreMemories = false;
```

Then inside the existing personalization `try`, immediately after `const privacy = await loadPrivacyState(...)`:

```typescript
        privacyCanStoreMemories = privacy.can_store_memories;
```

and inside `if (privacy.can_personalize) { ... }`, BEFORE the `Promise.all` fan-out:

```typescript
          if (eveningContext) {
            const st = await getNorthStarState(authed.supabase, authed.userId, eveningContext.day);
            if (st.shouldLadderTonight) ladderState = st;
          }
```

(The whole personalization block is already wrapped in try/catch fail-soft — a `getNorthStarState` error degrades to a normal evening, per contract.)

- [ ] **Step 3: Orientation block** — inside `privacy.can_personalize`, immediately after the growth-moment block ends, add (skipped on ladder nights — the ladder block quotes the old line directly, and the orientation's "never quote this" instruction would contradict it):

```typescript
          // North Star orientation (spec §5) — quiet ideal-self shaping.
          // Skipped while a ladder is open (the ladder block handles the line).
          if (!ladderState) {
            const northStarLine = await getActiveNorthStar(authed.supabase, authed.userId);
            if (northStarLine) {
              systemPrompt += buildNorthStarOrientation(northStarLine);
            }
          }
```

- [ ] **Step 4: Swap the evening block** — wrap the existing `if (eveningContext) { ... }` body:

```typescript
    if (eveningContext) {
      if (ladderState) {
        // Ladder night: replace the normal evening context entirely.
        // Turn-3 forced close is suppressed; buildLadderPromptBlock enforces
        // its own bounds and a turn-7 hard wrap (spec §4 turn-cap extension).
        systemPrompt += buildLadderPromptBlock(ladderState, eveningContext.turnNumber, eveningContext.day);
      } else {
        // ... existing eveningContext code, UNCHANGED ...
      }
    }
```

- [ ] **Step 5: Marker processing + response field** — replace the post-LLM message handling:

Current:
```typescript
    const rawMessage = await peterChat({ ... });
    const message = stripMarkdown(rawMessage);
```

New:
```typescript
    const rawMessage = await peterChat({ ... });

    // North Star markers parse on RAW output before stripMarkdown (spec §4).
    // turnNumber drives the deterministic turn-8 hard close — the ladder can
    // never stay open past it regardless of what the LLM emitted.
    let ladderActive = false;
    let preStripped = rawMessage;
    if (ladderState && authed && eveningContext) {
      const result = await processLadderTurn(
        authed.supabase, authed.userId, ladderState, rawMessage,
        latestUserMessage, privacyCanStoreMemories, eveningContext.turnNumber,
      );
      preStripped = result.visibleMessage;
      ladderActive = result.ladderOpen;
    }
    const message = stripMarkdown(preStripped);
```

(`ladderState` and `privacyCanStoreMemories` were hoisted in Step 2.)

- [ ] **Step 6: Response payload** — add `ladder_active: ladderActive` to the success JSON:

```typescript
    return res.status(200).json({
      message,
      safety: { triggered: false },
      ladder_active: ladderActive,
      usage: { remaining_daily_messages: remainingDailyMessages, limit_reached: false },
    });
```

- [ ] **Step 7: logFinalPrompt label** — on ladder nights the existing `logFinalPrompt('peter/chat', systemPrompt)` call suffices (the ladder block is visible in it). No change.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `grep -n "NORTH_STAR" src/pages/api/peter/chat.ts | wc -l` — Expected: `0` (markers live only in north-star.ts)
Run: `grep -c "ladder_active" src/pages/api/peter/chat.ts` — Expected: `1`

- [ ] **Step 9: Commit**

```bash
git add src/pages/api/peter/chat.ts
git commit -m "feat(north-star): evening ladder integration — block swap, marker capture, ladder_active flag, orientation"
```

---

### Task 4: morning.ts orientation

**Files:**
- Modify: `src/pages/api/peter/morning.ts`

- [ ] **Step 1:** Add import `import { getActiveNorthStar, buildNorthStarOrientation } from '@/lib/server/north-star';`. Inside the `privacy.can_personalize` block, after `systemPrompt = buildPersonalizedPrompt(...)`:

```typescript
          const northStarLine = await getActiveNorthStar(authed.supabase, authed.userId);
          if (northStarLine) {
            systemPrompt += buildNorthStarOrientation(northStarLine);
          }
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` — exit 0.
```bash
git add src/pages/api/peter/morning.ts
git commit -m "feat(north-star): morning story orientation toward the becoming-line"
```

---

### Task 5: `/api/me/north-star` endpoint

**Files:**
- Create: `src/pages/api/me/north-star.ts`

- [ ] **Step 1: Create** (complete code)

```typescript
// North Star surface endpoint (spec §5/§6). GET → active line for the
// placecard; POST → graduation boundary actions (reaffirm / shift).

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getActiveNorthStar } from '@/lib/server/north-star';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const line = await getActiveNorthStar(ctx.supabase, ctx.userId);
    return res.status(200).json({ line });
  }

  if (req.method === 'POST') {
    const { action } = (req.body || {}) as { action?: string };
    if (action !== 'reaffirm' && action !== 'shift') {
      return res.status(400).json({ error: "action must be 'reaffirm' or 'shift'" });
    }
    const update = action === 'reaffirm'
      ? { reaffirmed_at: new Date().toISOString() }
      // Spec §4(b): "attempt counter treated as reset" — each user-initiated
      // shift earns a fresh set of (max 3, cooldown-spaced) re-ladder attempts.
      // Without the reset, a lifetime counter at cap makes this button
      // permanently inert.
      : { needs_reladder: true, attempt_count: 0, last_attempt_at: null };
    const { error } = await ctx.supabase
      .from('north_stars')
      .update(update)
      .eq('user_id', ctx.userId)
      .eq('status', 'active');
    if (error) return res.status(500).json({ error: 'Failed to update' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` — exit 0.
```bash
git add src/pages/api/me/north-star.ts
git commit -m "feat(north-star): placecard + boundary endpoint (GET line, POST reaffirm/shift)"
```

---

### Task 6: Dashboard placecard

**Files:**
- Create: `src/components/dashboard/NorthStarCard.tsx`
- Modify: `src/pages/dashboard.tsx`

- [ ] **Step 1: Create the card** (quiet — line only, no heading, no buttons; brand tokens per WeeklyMirrorCard/CsiPulseCard conventions)

```tsx
// North Star placecard (spec §6): the user's confirmed "becoming" line.
// Quiet by design — no label, no chrome, no edit affordance (editing happens
// through Peter at journey boundaries). Renders nothing until a line exists.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';

export function NorthStarCard() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/me/north-star', { headers });
        if (!res.ok) return;
        const payload = await res.json();
        if (!cancelled && payload.line) setLine(payload.line);
      } catch {
        // fail-soft: no card
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!line) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm px-6 py-4"
    >
      <p className="font-serif italic text-brand-espresso text-sm leading-relaxed text-center">
        {line}
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Mount** in `src/pages/dashboard.tsx`: import `NorthStarCard` next to the CsiPulseCard import; render `<NorthStarCard />` directly ABOVE the main daily CTA card block (it is the first thing under the greeting — the becoming-line frames the day). Place it as the first child of the cards container.

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` — exit 0. `grep -c "NorthStarCard" src/pages/dashboard.tsx` — Expected: `2`.
```bash
git add src/components/dashboard/NorthStarCard.tsx src/pages/dashboard.tsx
git commit -m "feat(north-star): dashboard placecard — the becoming-line, quiet serif"
```

---

### Task 7: Client turn-cap gating — `daily-growth.tsx`

**Files:**
- Modify: `src/pages/daily-growth.tsx:448-454`

- [ ] **Step 1:** In `handleEveningMessage`, replace:

```typescript
      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };
      setEveningMessages([...updated, peterMsg]);

      if (newTurn >= 2) setCanCompleteDay(true);
      if (newTurn >= 3) setReflectionClosed(true);
```

with:

```typescript
      const peterMsg: PeterMessage = { role: 'assistant', content: data.message };
      setEveningMessages([...updated, peterMsg]);

      // North Star ladder nights (spec §4 turn-cap extension): while the
      // server reports an open ladder, suspend the turn-cap close so the
      // conversation can reach bedrock. Normal nights are unchanged. The
      // turn-0 low-effort interceptor needs no gating — it always precedes
      // the first API call, so a ladder can never be open when it fires.
      if (!data.ladder_active) {
        if (newTurn >= 2) setCanCompleteDay(true);
        if (newTurn >= 3) setReflectionClosed(true);
      }
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` — exit 0. `grep -c "ladder_active" src/pages/daily-growth.tsx` — Expected: `1`.
```bash
git add src/pages/daily-growth.tsx
git commit -m "feat(north-star): suspend evening turn-cap while ladder is open"
```

---

### Task 8: Graduation boundary buttons — `Day14Graduation.tsx`

**Files:**
- Modify: `src/components/onboarding/Day14Graduation.tsx`

- [ ] **Step 1:** Add state + fetch (alongside the existing report fetch):

```typescript
const [northStar, setNorthStar] = useState<string | null>(null);
const [boundaryDone, setBoundaryDone] = useState(false);
```

In the existing report-fetch `useEffect` (after `setReport`), add a second fetch:

```typescript
                const nsRes = await fetch('/api/me/north-star', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (nsRes.ok) {
                    const ns = await nsRes.json();
                    if (ns.line) setNorthStar(ns.line);
                }
```

Add the handler:

```typescript
    const answerBoundary = async (action: 'reaffirm' | 'shift') => {
        setBoundaryDone(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            await fetch('/api/me/north-star', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ action }),
            });
        } catch { /* fail-soft */ }
    };
```

- [ ] **Step 2:** Render the boundary card AFTER the Compound Reveal block, before "What Peter Noticed":

```tsx
                        {/* North Star boundary beat (spec §2/§5) */}
                        {northStar && (
                            <div className="rounded-2xl bg-white border border-indigo-100 p-4 shadow-sm">
                                <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                    When we started, you told me:
                                </p>
                                <p className="text-sm italic text-gray-800 mb-3">&ldquo;{northStar}&rdquo;</p>
                                {boundaryDone ? (
                                    <p className="text-xs text-gray-500">Thank you. I&apos;ll keep that close. 🦦</p>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => answerBoundary('reaffirm')}
                                            className="flex-1 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800 hover:bg-teal-100"
                                        >
                                            Still true
                                        </button>
                                        <button
                                            onClick={() => answerBoundary('shift')}
                                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                        >
                                            It&apos;s shifting
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` — exit 0.
```bash
git add src/components/onboarding/Day14Graduation.tsx
git commit -m "feat(north-star): graduation boundary — still-true / it's-shifting buttons"
```

---

### Task 9: Privacy cascade — `memory-settings.ts`

**Files:**
- Modify: `src/pages/api/me/memory-settings.ts`

- [ ] **Step 1:** Per spec §7 the transcript is memory-class data but the line itself was consented in-conversation. **Leave `deleteGrowthData` untouched** — putting the `north_stars` delete inside the shared helper would delete confirmed lines on the PATCH memory=none path, violating spec §7. Instead:

- DELETE route (delete ALL my data): immediately after the existing `deleteGrowthData(...)` call, add:

```typescript
      await ctx.supabase.from('north_stars').delete().eq('user_id', ctx.userId);
```

- PATCH memory_window='none' route: after the existing deletes, null transcripts but KEEP lines:

```typescript
        // North Star: transcript is memory-class (wipe); the confirmed line
        // was consented in-conversation and is preserved (spec §7).
        await ctx.supabase
          .from('north_stars')
          .update({ ladder_transcript: [] })
          .eq('user_id', ctx.userId);
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` — exit 0. `grep -c "north_stars" src/pages/api/me/memory-settings.ts` — Expected: `2`.
```bash
git add src/pages/api/me/memory-settings.ts
git commit -m "feat(north-star): privacy — full delete on delete-all; transcript wipe on memory-off"
```

---

### Task 10: Final verification sweep

- [ ] **Step 1: Boundary + safety greps**

```bash
grep -rn "from('north_stars')" src --include="*.ts" --include="*.tsx" | grep -v "north-star.ts" | grep -v "memory-settings" | grep -v "api/me/north-star" | wc -l   # → 0 (table touched only by owners)
grep -rn "NORTH_STAR_" src | grep -v "north-star.ts" | wc -l                       # → 0 (markers only in the module)
grep -c "why is that important" src/lib/server/north-star.ts                        # → 1 (the NEVER instruction only)
grep -rniE "\b(anxious|avoidant|disorganized|trauma|toxic|disorder|diagnosis)\b" src/lib/server/north-star.ts src/components/dashboard/NorthStarCard.tsx | wc -l  # → 0
```

- [ ] **Step 2: Full build**

Run: `npx tsc --noEmit && npm run lint && npm run build` — all exit 0.

- [ ] **Step 3: Logic verification (one-off tsx script, not committed)** — exercise the pure pieces: marker regexes (PROPOSED extraction incl. multiline guard, CONFIRMED, DEFERRED, strip-all), `buildLadderPromptBlock` variants (seed/no-seed/re-ladder/turn-7 hard close), `buildNorthStarOrientation`. Expected: all checks pass.

- [ ] **Step 4: Seeded manual UAT (dev server)**
1. Fresh dev user with `psychological_profile.freeTextAnswers` → simulate Day 3 evening (`eveningContext.day = 3`) → confirm `[Phase23 prompt-log]` shows TONIGHT'S SPECIAL FOCUS block; `north_stars` row goes `seeded → laddering`.
2. Walk to bedrock → confirm PROPOSED stored in `proposed_line`, marker absent from UI message, `ladder_active: true` in response.
3. Confirm → row `active` with `line`; next chat + morning prompts contain "This person is becoming"; dashboard shows placecard.
4. Deflect twice on a fresh user → DEFERRED → status back to `seeded`, cooldown respected next evening.
5. Graduation page → boundary card with buttons → "It's shifting" → `needs_reladder = true` → next evening re-ladder opens with shift context.

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "feat(north-star): North Star ideal-self capture — final verification pass"
```
