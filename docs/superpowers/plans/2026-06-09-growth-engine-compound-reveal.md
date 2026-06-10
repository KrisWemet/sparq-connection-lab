# Growth Engine & Compound Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deterministic growth-detection engine that compares a user's present state to their stored past and emits verified growth moments, voiced by three read-only surfaces (Peter chat, Weekly Mirror, Day-14 Compound Reveal), plus CSI-4 outcome measurement.

**Architecture:** Code gates, LLM voices. The engine (`growth-engine.ts`) runs inside weekly Mirror generation, writes `growth_moments`; a separate consumer module (`growth-moments.ts`) is the only thing surfaces import — surfaces never compute. Baseline "before" snapshot is silently extracted by the existing profile-analysis hook. All writes fail-soft.

**Tech Stack:** Next.js Pages Router API routes, Supabase (Postgres + RLS), TypeScript strict, existing `peterChat` (OpenRouter) for voicing only.

**Spec:** `docs/superpowers/specs/2026-06-09-growth-engine-compound-reveal-design.md` — read it first.

**Verification contract (NO automated tests, per CLAUDE.md):** every task verifies via `npx tsc --noEmit`, `npm run lint`, grep assertions, and dev-mode prompt logging. Run all commands from repo root `/Users/chris/sparq-connection-lab`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260609120000_growth_engine.sql` | Create | 4 tables + RLS + extend `growth_thread.type` constraint + `graduation_reports.reveal` column |
| `src/lib/server/growth-engine.ts` | Create | Detection only: snapshot writer, expiry, 5 signals, trust bar, evidence. Imported ONLY by weekly-mirror/generate.ts |
| `src/lib/server/memory.ts` | Modify | Add `searchMemoriesBefore` (age-aware vector search via new RPC) |
| `src/lib/server/growth-moments.ts` | Create | Consumer reads: chat pick+mark, Day-14 read-all, prompt block copy |
| `src/lib/server/baseline-snapshot.ts` | Create | One-time silent "before" snapshot extraction |
| `src/lib/server/profile-analysis.ts` | Modify | Fire-and-forget baseline trigger after memory store |
| `src/pages/api/weekly-mirror/generate.ts` | Modify | Host the engine batch; voice verified moments; growth_thread type 'growth'; logFinalPrompt |
| `src/pages/api/peter/chat.ts` | Modify | Append one active growth-moment block; mark surfaced |
| `src/pages/api/me/graduation-report.ts` | Modify | Compound Reveal composition + effort fallback; logFinalPrompt |
| `src/components/onboarding/Day14Graduation.tsx` | Modify | Render reveal section |
| `src/pages/api/csi/pulse.ts` | Create | GET due-status, POST submit CSI-4 pulse |
| `src/components/dashboard/CsiPulseCard.tsx` | Create | Peter-voiced 4-item pulse card |
| `src/pages/dashboard.tsx` | Modify | Mount CsiPulseCard |
| `src/pages/api/me/memory-settings.ts` | Modify | Cascade delete to 4 new tables |

---

### Task 1: Migration — tables, RLS, constraint extension

**Files:**
- Create: `supabase/migrations/20260609120000_growth_engine.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Growth Engine & Compound Reveal (spec: docs/superpowers/specs/2026-06-09-growth-engine-compound-reveal-design.md)

-- 3.1 pattern_snapshots: weekly copy of the 8-dim state (the time axis profile_traits lacks)
CREATE TABLE IF NOT EXISTS pattern_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start  date NOT NULL,
  snapshot    jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
ALTER TABLE pattern_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY pattern_snapshots_own ON pattern_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.2 baseline_snapshots: the silent "before" snapshot, written once per user
CREATE TABLE IF NOT EXISTS baseline_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  quotes      jsonb NOT NULL DEFAULT '[]',
  summary     text,
  sources     jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE baseline_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY baseline_snapshots_own ON baseline_snapshots
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.3 growth_moments: engine output; status tracks CHAT consumption only
CREATE TABLE IF NOT EXISTS growth_moments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('pattern_shift', 'practice_consistency', 'tone_trend', 'csi_delta', 'moment_pair')),
  strength    text NOT NULL CHECK (strength IN ('strong', 'soft')),
  tentative   boolean NOT NULL DEFAULT false,
  evidence    jsonb NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'surfaced', 'expired')),
  surfaced_at timestamptz,
  week_start  date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_moments_user_status ON growth_moments (user_id, status);
ALTER TABLE growth_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY growth_moments_own ON growth_moments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3.4 csi_pulses: CSI-4 scores
CREATE TABLE IF NOT EXISTS csi_pulses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context     text NOT NULL CHECK (context IN ('baseline', 'monthly')),
  item_scores jsonb NOT NULL,
  total_score int NOT NULL CHECK (total_score BETWEEN 0 AND 21),
  measured_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS csi_pulses_user ON csi_pulses (user_id, measured_at DESC);
ALTER TABLE csi_pulses ENABLE ROW LEVEL SECURITY;
CREATE POLICY csi_pulses_own ON csi_pulses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- §5.2: extend growth_thread.type to allow 'growth' (existing CHECK rejects it;
-- fail-soft inserts would be silently swallowed forever without this)
ALTER TABLE growth_thread DROP CONSTRAINT IF EXISTS growth_thread_type_check;
ALTER TABLE growth_thread ADD CONSTRAINT growth_thread_type_check
  CHECK (type IN ('milestone', 'breakthrough', 'pattern', 'mirror', 'pinned', 'growth'));

-- §5.3: Compound Reveal payload on the immutable graduation report
ALTER TABLE graduation_reports ADD COLUMN IF NOT EXISTS reveal jsonb;

-- §4.1 signal 5: age-aware vector search. The existing match_memories RPC does
-- not return/filter created_at, and addMemory stores every evening reflection —
-- including the current one — so an age filter is REQUIRED to prevent the
-- moment_pair signal from self-matching today's reflection.
CREATE OR REPLACE FUNCTION match_memories_before(
  query_embedding vector(1536),
  match_user_id UUID,
  before_date TIMESTAMPTZ,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  memory TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.memory,
    m.metadata,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
    AND m.embedding IS NOT NULL
    AND m.created_at < before_date
    AND (m.expires_at IS NULL OR m.expires_at > now())
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

- [ ] **Step 2: Verify SQL syntax locally**

Run: `grep -c "CREATE TABLE IF NOT EXISTS" supabase/migrations/20260609120000_growth_engine.sql`
Expected: `4`

Run: `grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/20260609120000_growth_engine.sql`
Expected: `4`

- [ ] **Step 3: Apply to the linked Supabase project**

Use the Supabase MCP `apply_migration` tool (name: `growth_engine`) with the file's SQL, OR `npx supabase db push` if the CLI is linked. Confirm via `list_tables` that `pattern_snapshots`, `baseline_snapshots`, `growth_moments`, `csi_pulses` exist.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260609120000_growth_engine.sql
git commit -m "feat(growth): migration — 4 growth tables, RLS, growth_thread type extension, reveal column"
```

---

### Task 2: Detection engine — `src/lib/server/growth-engine.ts`

**Files:**
- Modify: `src/lib/server/memory.ts` (append `searchMemoriesBefore`)
- Create: `src/lib/server/growth-engine.ts`

The engine is deterministic (no LLM calls), never throws, and is imported ONLY by `weekly-mirror/generate.ts`.

- [ ] **Step 0: Append `searchMemoriesBefore` to `src/lib/server/memory.ts`**

After the existing `searchMemories` function, add:

```typescript
/**
 * Age-aware semantic search: only memories created BEFORE the given date.
 * Used by the growth engine's moment_pair signal (spec §4.1 #5) — the plain
 * searchMemories has no age filter and would self-match the current reflection.
 * Returns empty results (never throws, no recency fallback) when embeddings
 * are unavailable — an unfiltered fallback would reintroduce self-matching.
 */
export async function searchMemoriesBefore(
  userId: string,
  query: string,
  beforeIso: string,
  limit = 5,
): Promise<SearchResult> {
  const client = getServiceClient();
  const queryEmbedding = await embed(query);
  if (!queryEmbedding) return { results: [] };

  const { data, error } = await client.rpc('match_memories_before', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_user_id: userId,
    before_date: beforeIso,
    match_count: limit,
  });
  if (error || !data) return { results: [] };
  return {
    results: data.map((row: any) => ({
      id: row.id,
      memory: row.memory,
      metadata: row.metadata,
      score: row.similarity,
    })),
  };
}
```

- [ ] **Step 1: Create the module**

```typescript
// growth-engine.ts — deterministic growth detection (spec §4).
// Code gates, LLM voices. NO LLM calls in this module. Never throws.
// Imported ONLY by src/pages/api/weekly-mirror/generate.ts (grep-enforced).

import type { SupabaseClient } from '@supabase/supabase-js';
import { PATTERN_KEYS, buildPatternContext } from '@/lib/server/attachment-context';

export interface GrowthMomentRow {
  id: string;
  kind: 'pattern_shift' | 'practice_consistency' | 'tone_trend' | 'csi_delta' | 'moment_pair';
  strength: 'strong' | 'soft';
  tentative: boolean;
  evidence: Record<string, unknown>;
  week_start: string;
}

// ─── Tone valence lookup (spec §4.1 signal 4) ────────────────────────────────
// Fixed table, extended by hand, never by model. Unmapped words are EXCLUDED.
const TONE_VALENCE: Record<string, number> = {
  // positive (+1)
  hopeful: 1, calm: 1, grateful: 1, proud: 1, tender: 1, happy: 1, peaceful: 1,
  content: 1, warm: 1, connected: 1, encouraged: 1, lighter: 1, relieved: 1,
  joyful: 1, loving: 1, optimistic: 1, steady: 1,
  // neutral (0)
  okay: 0, fine: 0, neutral: 0, mixed: 0, thoughtful: 0, reflective: 0,
  // negative (-1)
  frustrated: -1, sad: -1, angry: -1, tense: -1, worried: -1, hurt: -1,
  lonely: -1, overwhelmed: -1, drained: -1, distant: -1, discouraged: -1,
  resentful: -1, stressed: -1, tired: -1, heavy: -1, defeated: -1,
};

type SessionRow = {
  session_local_date: string;
  practice_attempted: boolean | null;
  evening_emotional_tone: string | null;
  evening_reflection: string | null;
};

function daysBetween(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

/**
 * Extract ONLY the user's words from addMemory's stored format
 * ("user: ...\nassistant: ..."). Quoting Peter's words back as the user's
 * own would fabricate evidence — never quote the assistant portion.
 */
export function extractUserText(memory: string): string | null {
  const m = memory.match(/(?:^|\n)user:\s*([\s\S]*?)(?=\nassistant:|$)/);
  const text = m?.[1]?.trim() ?? null;
  return text && text.length >= 20 ? text.slice(0, 200) : null;
}

// ─── Signal detectors (pure functions over fetched rows) ─────────────────────

/** Strong #1 — flip-and-hold across adjacent stored snapshots ≤21 days apart. */
export function detectPatternShifts(
  snapshots: Array<{ week_start: string; snapshot: Record<string, { value: string | null }> }>,
): Array<{ dimension: string; before_value: string; after_value: string }> {
  // snapshots ordered newest-first; need ≥3 rows
  if (snapshots.length < 3) return [];
  const [s0, s1] = snapshots;
  if (daysBetween(s0.week_start, s1.week_start) > 21) return [];
  const shifts: Array<{ dimension: string; before_value: string; after_value: string }> = [];
  for (const key of PATTERN_KEYS) {
    const now = s0.snapshot[key]?.value ?? null;
    const held = s1.snapshot[key]?.value ?? null;
    if (now === null || now !== held) continue; // must hold for 2 consecutive
    // find the most recent OLDER snapshot with a different non-null value
    for (let i = 2; i < snapshots.length; i++) {
      const old = snapshots[i].snapshot[key]?.value ?? null;
      if (old !== null && old !== now) {
        shifts.push({ dimension: key, before_value: old, after_value: now });
        break;
      }
      if (old === now) break; // value was already current further back — no shift
    }
  }
  return shifts;
}

/** Strong #2 — ≥5 attempted in current 7 days; prior 3-week baseline ≤3/week (≥6 sessions present, else abstain). */
export function detectPracticeConsistency(sessions: SessionRow[], today: Date): boolean {
  const ts = today.getTime();
  const inWindow = (s: SessionRow, fromDays: number, toDays: number) => {
    const d = new Date(s.session_local_date).getTime();
    return d <= ts - fromDays * 86400000 && d > ts - toDays * 86400000;
  };
  const current = sessions.filter(s => inWindow(s, 0, 7));
  const prior = sessions.filter(s => inWindow(s, 7, 28));
  if (prior.length < 6) return false; // abstain — not enough history
  const currentAttempted = current.filter(s => s.practice_attempted === true).length;
  const priorPerWeek = prior.filter(s => s.practice_attempted === true).length / 3;
  return currentAttempted >= 5 && priorPerWeek <= 3;
}

/** Strong #3 — latest monthly pulse ≥3 points above baseline. */
export function detectCsiDelta(
  pulses: Array<{ context: string; total_score: number }>,
): { baseline: number; latest: number } | null {
  const baseline = pulses.find(p => p.context === 'baseline');
  const monthly = pulses.filter(p => p.context === 'monthly');
  if (!baseline || monthly.length === 0) return null;
  const latest = monthly[0].total_score; // pulses ordered newest-first
  if (latest - baseline.total_score >= 3) {
    return { baseline: baseline.total_score, latest };
  }
  return null;
}

/** Soft #4 — improving weekly tone average; abstain unless ≥2 mapped points per week. */
export function detectToneTrend(sessions: SessionRow[], today: Date): boolean {
  const ts = today.getTime();
  const week = (s: SessionRow) => {
    const age = (ts - new Date(s.session_local_date).getTime()) / 86400000;
    return age <= 7 ? 0 : age <= 14 ? 1 : -1;
  };
  const buckets: number[][] = [[], []];
  for (const s of sessions) {
    const w = week(s);
    if (w === -1 || !s.evening_emotional_tone) continue;
    const v = TONE_VALENCE[s.evening_emotional_tone.toLowerCase().trim()];
    if (v === undefined) continue; // unmapped — excluded
    buckets[w].push(v);
  }
  if (buckets[0].length < 2 || buckets[1].length < 2) return false; // ≥4 mapped total
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return avg(buckets[0]) - avg(buckets[1]) >= 0.3;
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Runs the full weekly batch (spec §4): write this week's snapshot, expire
 * stale chat moments (mark-then-detect), detect signals, apply the trust bar,
 * attach evidence, insert at most 2 new moments. Returns the inserted moments
 * for the Mirror to voice. NEVER throws — returns [] on any failure.
 */
export async function runGrowthDetection(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
): Promise<GrowthMomentRow[]> {
  try {
    // 1. Snapshot current 8-dim state (full trait rows for confidence/weight)
    const { data: traitRows } = await supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, confidence, effective_weight')
      .eq('user_id', userId)
      .in('trait_key', [...PATTERN_KEYS]);
    const ctx = await buildPatternContext(supabase, userId);
    const snapshot: Record<string, { value: string | null; confidence: number | null; effective_weight: number | null }> = {};
    for (const key of PATTERN_KEYS) {
      const row = (traitRows || []).find(r => r.trait_key === key);
      snapshot[key] = {
        value: ctx[key],
        confidence: row?.confidence ?? null,
        effective_weight: row?.effective_weight ?? null,
      };
    }
    const { error: snapErr } = await supabase
      .from('pattern_snapshots')
      .upsert({ user_id: userId, week_start: weekStart, snapshot }, { onConflict: 'user_id,week_start' });
    if (snapErr) return []; // skip comparison rather than compare against bad data (spec §7)

    // 2. Expire stale chat-available moments (mark-then-detect, spec §3.3)
    const threeWeeksAgo = new Date(Date.now() - 21 * 86400000).toISOString();
    await supabase
      .from('growth_moments')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active')
      .lt('created_at', threeWeeksAgo);

    // 3. Fetch inputs
    const [snapsRes, sessionsRes, csiBaselineRes, csiMonthlyRes, baselineRes] = await Promise.all([
      supabase.from('pattern_snapshots').select('week_start, snapshot')
        .eq('user_id', userId).order('week_start', { ascending: false }).limit(8),
      supabase.from('daily_sessions')
        .select('session_local_date, practice_attempted, evening_emotional_tone, evening_reflection')
        .eq('user_id', userId).eq('status', 'completed')
        .order('session_local_date', { ascending: false }).limit(40),
      // Baseline fetched separately — a single recency-limited query would push
      // the baseline row out of the window after ~12 monthly pulses.
      supabase.from('csi_pulses').select('context, total_score')
        .eq('user_id', userId).eq('context', 'baseline').limit(1),
      supabase.from('csi_pulses').select('context, total_score')
        .eq('user_id', userId).eq('context', 'monthly')
        .order('measured_at', { ascending: false }).limit(1),
      supabase.from('baseline_snapshots').select('quotes')
        .eq('user_id', userId).maybeSingle(),
    ]);

    const snaps = (snapsRes.data || []) as Array<{ week_start: string; snapshot: Record<string, { value: string | null }> }>;
    const sessions = (sessionsRes.data || []) as SessionRow[];
    const pulses = [...(csiMonthlyRes.data || []), ...(csiBaselineRes.data || [])];
    const baselineQuote: string | null = baselineRes.data?.quotes?.[0]?.text ?? null;
    const today = new Date();
    const afterQuote: string | null = sessions[0]?.evening_reflection?.slice(0, 200) ?? null;

    // 4. Detect
    type Candidate = Omit<GrowthMomentRow, 'id'>;
    const strong: Candidate[] = [];
    const soft: Candidate[] = [];

    for (const shift of detectPatternShifts(snaps)) {
      strong.push({
        kind: 'pattern_shift', strength: 'strong', tentative: false, week_start: weekStart,
        evidence: { ...shift, before_quote: baselineQuote, after_quote: afterQuote },
      });
    }
    if (detectPracticeConsistency(sessions, today)) {
      const attempted = sessions.filter(s =>
        s.practice_attempted === true &&
        daysBetween(s.session_local_date, today.toISOString().slice(0, 10)) <= 7).length;
      strong.push({
        kind: 'practice_consistency', strength: 'strong', tentative: false, week_start: weekStart,
        evidence: { stats: { attempted_this_week: attempted }, after_quote: afterQuote },
      });
    }
    const csi = detectCsiDelta(pulses);
    if (csi) {
      strong.push({
        kind: 'csi_delta', strength: 'strong', tentative: false, week_start: weekStart,
        evidence: { stats: csi },
      });
    }
    if (detectToneTrend(sessions, today)) {
      soft.push({
        kind: 'tone_trend', strength: 'soft', tentative: true, week_start: weekStart,
        evidence: { after_quote: afterQuote },
      });
    }
    // moment_pair (soft #5): a >21-day-old memory semantically similar to the
    // latest reflection. MUST use the age-aware search — every evening reflection
    // is itself stored as a memory, so an unfiltered search self-matches today's
    // reflection at similarity ≈ 1.0 and fabricates growth.
    if (afterQuote) {
      const { searchMemoriesBefore } = await import('@/lib/server/memory');
      const cutoff = new Date(Date.now() - 21 * 86400000).toISOString();
      const found = await searchMemoriesBefore(userId, afterQuote, cutoff, 5)
        .catch(() => ({ results: [] as Array<{ memory: string; score?: number }> }));
      for (const candidate of found.results) {
        if ((candidate.score ?? 0) < 0.75) continue;
        const beforeText = extractUserText(candidate.memory);
        if (!beforeText) continue; // never quote Peter's words as the user's
        soft.push({
          kind: 'moment_pair', strength: 'soft', tentative: true, week_start: weekStart,
          evidence: { before_quote: beforeText, after_quote: afterQuote },
        });
        break;
      }
    }

    // 5. Trust bar (spec §4.2): ≥1 strong, or ≥2 agreeing soft. Max 2 per batch.
    let emit: Candidate[] = [];
    if (strong.length > 0) {
      emit = strong.slice(0, 2);
    } else if (soft.length >= 2) {
      emit = soft.slice(0, 2); // tentative stays true
    }
    if (emit.length === 0) return [];

    // 6. Insert
    const { data: inserted } = await supabase
      .from('growth_moments')
      .insert(emit.map(m => ({ user_id: userId, ...m })))
      .select('id, kind, strength, tentative, evidence, week_start');
    return (inserted || []) as GrowthMomentRow[];
  } catch (err) {
    console.error('Growth detection error (non-blocking):', err);
    return [];
  }
}
```

- [ ] **Step 2: Verify types + boundaries**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -rn "from '@/lib/server/growth-engine'" src | grep -v weekly-mirror | wc -l` — Expected: `0` (nothing imports it yet)
Run: `grep -c "peterChat\|openrouter" src/lib/server/growth-engine.ts` — Expected: `0` (no LLM calls)

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/growth-engine.ts src/lib/server/memory.ts
git commit -m "feat(growth): deterministic detection engine — 5 signals, trust bar, weekly batch"
```

---

### Task 3: Consumer module — `src/lib/server/growth-moments.ts`

**Files:**
- Create: `src/lib/server/growth-moments.ts`

- [ ] **Step 1: Create the module**

```typescript
// growth-moments.ts — read-only consumer helpers for growth_moments (spec §5).
// Surfaces import THIS module, never growth-engine.ts. No detection logic here.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface SurfaceMoment {
  id: string;
  kind: string;
  tentative: boolean;
  evidence: {
    dimension?: string;
    before_value?: string;
    after_value?: string;
    before_quote?: string | null;
    after_quote?: string | null;
    stats?: Record<string, number>;
  };
}

// Human-readable, non-clinical descriptions of what changed, per kind.
// Behavioral language only — these feed Peter's system prompt, never the UI raw.
function describeMoment(m: SurfaceMoment): string {
  switch (m.kind) {
    case 'pattern_shift':
      return `Their way of handling things has shifted: where they used to lean toward "${(m.evidence.before_value || '').replace(/_/g, ' ')}", lately they've been showing "${(m.evidence.after_value || '').replace(/_/g, ' ')}", and it has held for weeks.`;
    case 'practice_consistency':
      return `They have practiced ${m.evidence.stats?.attempted_this_week ?? 5} times this week — far more consistently than the weeks before.`;
    case 'csi_delta':
      return `Their own check-in scores about the relationship have meaningfully risen since they started.`;
    case 'tone_trend':
      return `Their evening reflections have been landing in a warmer place lately than they did two weeks ago.`;
    case 'moment_pair':
      return `A situation similar to one from weeks ago came up — and they handled it differently this time.`;
    default:
      return '';
  }
}

/** Chat surface (spec §5.1): oldest active moment, or null. Respects 7-day cooldown. */
export async function getActiveGrowthMomentForChat(
  supabase: SupabaseClient,
  userId: string,
): Promise<SurfaceMoment | null> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent } = await supabase
      .from('growth_moments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'surfaced')
      .gte('surfaced_at', sevenDaysAgo)
      .limit(1);
    if (recent && recent.length > 0) return null; // cooldown

    const { data } = await supabase
      .from('growth_moments')
      .select('id, kind, tentative, evidence')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    return (data as SurfaceMoment) || null;
  } catch {
    return null;
  }
}

/** Mark a moment chat-consumed. Fire-and-forget safe. */
export async function markMomentSurfaced(
  supabase: SupabaseClient,
  momentId: string,
): Promise<void> {
  try {
    await supabase
      .from('growth_moments')
      .update({ status: 'surfaced', surfaced_at: new Date().toISOString() })
      .eq('id', momentId);
  } catch {
    // non-blocking
  }
}

/** Day-14 surface (spec §5.3): ALL moments in window, regardless of status. */
export async function getAllGrowthMoments(
  supabase: SupabaseClient,
  userId: string,
): Promise<SurfaceMoment[]> {
  try {
    const { data } = await supabase
      .from('growth_moments')
      .select('id, kind, tentative, evidence')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return (data || []) as SurfaceMoment[];
  } catch {
    return [];
  }
}

/**
 * System-prompt block for the chat surface — "name it, then hand it back"
 * (spec §5.1). Tentative moments get softer phrasing. The LLM may only voice
 * the change described; it must end by handing ownership back.
 */
export function buildGrowthMomentBlock(m: SurfaceMoment): string {
  const description = describeMoment(m);
  if (!description) return '';
  const evidence: string[] = [];
  if (m.evidence.before_quote) evidence.push(`Something they said back then: "${m.evidence.before_quote}"`);
  if (m.evidence.after_quote) evidence.push(`Something they said recently: "${m.evidence.after_quote}"`);
  const stance = m.tentative
    ? `Phrase it tentatively — "it feels like something's shifting" — never as a settled fact.`
    : `Name it plainly and specifically, grounded in the evidence.`;
  return (
    `\n\nVERIFIED GROWTH OBSERVATION (you may use this at most once, only if the moment fits naturally):\n` +
    `${description}\n` +
    (evidence.length > 0 ? evidence.join('\n') + '\n' : '') +
    `If you choose to voice it: ${stance} Then hand it back with a light question like "Do you feel that shift too?" ` +
    `Never declare what it means about who they are. If the conversation doesn't naturally invite it, stay silent about it.`
  );
}

/** Mirror narrative lines (spec §5.2) — the LLM may reference ONLY these. */
export function describeMomentsForMirror(moments: SurfaceMoment[]): string[] {
  return moments.map(describeMoment).filter(d => d.length > 0);
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -c "from '@/lib/server/growth-engine'" src/lib/server/growth-moments.ts` — Expected: `0` (no engine import; match the import path, not the bare word — the header comment mentions the filename)
Run: `grep -niE "\b(anxious|avoidant|disorganized|trauma|toxic|disorder|diagnosis)\b" src/lib/server/growth-moments.ts | wc -l` — Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add src/lib/server/growth-moments.ts
git commit -m "feat(growth): consumer module — chat pick/mark, Day-14 read-all, prompt blocks"
```

---

### Task 4: Baseline snapshot extraction

**Files:**
- Create: `src/lib/server/baseline-snapshot.ts`
- Modify: `src/lib/server/profile-analysis.ts` (after the `addMemory` block, ~line 156)

- [ ] **Step 1: Create the extraction module**

```typescript
// baseline-snapshot.ts — one-time silent "before" snapshot (spec §3.2).
// Verbatim quotes: deterministic selection from the first 3 evening reflections
// + free-text fields of profiles.psychological_profile. Structured answers
// inform the LLM summary ONLY — never presented as the user's words.

import type { SupabaseClient } from '@supabase/supabase-js';
import { peterChat } from '@/lib/openrouter';

// Scope note (spec §3.2): verbatim quotes are sourced from reflections ONLY.
// The spec also permits quotes from free-text psychological_profile fields,
// but onboarding answers are structured choices in practice — they feed the
// LLM summary instead. Deliberate, reviewed scope reduction.
type Quote = { text: string; source: string; captured_at: string };

/** Longest sentences are the most emotionally salient proxy — deterministic. */
function selectQuotes(reflections: Array<{ text: string; date: string; day: number }>): Quote[] {
  const quotes: Quote[] = [];
  for (const r of reflections) {
    const sentences = r.text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 40 && s.length <= 240);
    const longest = sentences.sort((a, b) => b.length - a.length)[0];
    if (longest) {
      quotes.push({ text: longest, source: `daily_sessions.day_${r.day}`, captured_at: r.date });
    }
  }
  return quotes;
}

/**
 * Fire-and-forget: extracts the baseline once a user has ≥3 completed evening
 * reflections and no baseline_snapshot yet. Gated on can_store_memories by the
 * caller (profile-analysis). Never throws.
 */
export async function maybeExtractBaseline(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('baseline_snapshots')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (existing) return;

    const { data: sessions } = await supabase
      .from('daily_sessions')
      .select('day_index, evening_reflection, session_local_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('evening_reflection', 'is', null)
      .order('day_index', { ascending: true })
      .limit(3);
    if (!sessions || sessions.length < 3) return;

    // NOTE: profiles is keyed by `id` in the live personalization paths
    // (chat.ts:114, morning.ts:101) — use `id`, not `user_id`. A mismatch
    // degrades silently to a context-free summary, so verify once in dev.
    const { data: profile } = await supabase
      .from('profiles')
      .select('psychological_profile')
      .eq('id', userId)
      .maybeSingle();

    const reflections = sessions.map(s => ({
      text: s.evening_reflection as string,
      date: s.session_local_date as string,
      day: s.day_index as number,
    }));
    const quotes = selectQuotes(reflections);
    const sources = sessions.map(s => ({ table: 'daily_sessions', day_index: s.day_index }));

    // LLM distills the summary ONLY (never quoted back as the user's words)
    let summary: string | null = null;
    try {
      const raw = await peterChat({
        messages: [{
          role: 'user',
          content:
            `Summarize where this person is starting from in their relationship growth, in 2-3 plain sentences. ` +
            `Use warm, everyday words — no clinical terms, no labels. Mention what feels hard for them and what they hope for.\n\n` +
            `Their first reflections:\n${reflections.map(r => `- "${r.text.slice(0, 300)}"`).join('\n')}\n\n` +
            (profile?.psychological_profile ? `Onboarding context: ${JSON.stringify(profile.psychological_profile).slice(0, 500)}\n\n` : '') +
            `Return only the summary text.`,
        }],
        maxTokens: 200,
      });
      summary = raw.trim().slice(0, 600);
    } catch {
      summary = null; // quotes alone are still a valid baseline
    }

    await supabase.from('baseline_snapshots').insert({
      user_id: userId,
      quotes,
      summary,
      sources,
    });
  } catch (err) {
    console.error('Baseline extraction error (non-blocking):', err);
  }
}
```

- [ ] **Step 2: Wire the trigger into profile-analysis.ts**

In `src/lib/server/profile-analysis.ts`, inside the `if (privacy.can_store_memories) { ... }` block, AFTER the existing `addMemory(...)` call's try/catch closes (after line ~156), add:

```typescript
      // Phase: Growth Engine — one-time baseline extraction (spec §3.2).
      // Fire-and-forget; runs only until a baseline_snapshot exists.
      maybeExtractBaseline(supabase, userId).catch(() => {});
```

And add the import at the top with the other imports:

```typescript
import { maybeExtractBaseline } from '@/lib/server/baseline-snapshot';
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -n "maybeExtractBaseline" src/lib/server/profile-analysis.ts | wc -l` — Expected: `2` (import + call)
Run: `grep -n "can_store_memories" src/lib/server/profile-analysis.ts` — confirm the new call sits INSIDE that gated block

- [ ] **Step 4: Commit**

```bash
git add src/lib/server/baseline-snapshot.ts src/lib/server/profile-analysis.ts
git commit -m "feat(growth): silent baseline snapshot extraction after 3rd reflection"
```

---

### Task 5: Host the engine in Weekly Mirror generation

**Files:**
- Modify: `src/pages/api/weekly-mirror/generate.ts`

- [ ] **Step 1: Add imports** (top of file)

```typescript
import { runGrowthDetection, type GrowthMomentRow } from '@/lib/server/growth-engine';
import { describeMomentsForMirror } from '@/lib/server/growth-moments';
import { logFinalPrompt } from '@/lib/server/dev-prompt-log';
import { loadPrivacyState } from '@/lib/server/privacy';
```

- [ ] **Step 2: Run the batch after the sessions fetch, before the prompt build**

After the `if (!sessions || sessions.length < 3)` guard returns, insert. **Privacy gate required** (spec §6): the engine writes pattern snapshots and growth moments, and the Mirror voices them — none of that may happen for users who opted out of personalization:

```typescript
  // Growth Engine weekly batch (spec §4): snapshot → expire → detect.
  // Gated on can_personalize (spec §6); fail-soft — Mirror proceeds regardless.
  let growthMoments: GrowthMomentRow[] = [];
  try {
    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
    if (privacy.can_personalize) {
      growthMoments = await runGrowthDetection(ctx.supabase, ctx.userId, weekStart);
    }
  } catch {
    // fail-soft: no growth lines this week
  }
  const growthLines = describeMomentsForMirror(growthMoments);
```

- [ ] **Step 3: Feed verified moments into the narrative prompt**

In the `const prompt = \`...\`` template, after the `Practices attempted: ${practicesAttempted}` line, add:

```
${growthLines.length > 0 ? `\nVERIFIED growth this week (you may reference ONLY these growth moments; do not infer or invent others):\n${growthLines.map(l => `- ${l}`).join('\n')}` : '\nNo verified growth moments this week — do NOT claim any specific change; reflect honestly on the practice itself.'}
```

- [ ] **Step 4: Log the final prompt + write growth_thread entries**

Immediately before the `peterChat` call:

```typescript
  logFinalPrompt('weekly-mirror/generate', prompt);
```

After the existing `growth_thread` mirror insert (the `if (keyPatterns.length > 0)` block), add:

```typescript
    // Growth moments land on the thread as their own type (constraint extended
    // in migration). MUST await: supabase-js builders are lazy — an un-awaited
    // .insert() never executes (the existing un-awaited 'mirror' insert at
    // generate.ts:138 has this latent bug; do not copy it).
    for (const line of growthLines) {
      await ctx.supabase.from('growth_thread').insert({
        user_id: ctx.userId,
        date: weekStart,
        label: line.slice(0, 80),
        type: 'growth',
        detail: line,
      });
    }
```

Also fix the existing latent bug while here: prepend `await` to the existing `ctx.supabase.from('growth_thread').insert({ ... type: 'mirror' ... })` call in the `if (keyPatterns.length > 0)` block (it currently never executes for the same reason).

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -rn "from '@/lib/server/growth-engine'" src | wc -l` — Expected: `1` (ONLY weekly-mirror/generate.ts)
Run: `grep -n "logFinalPrompt" src/pages/api/weekly-mirror/generate.ts | wc -l` — Expected: `2` (import + call)

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/weekly-mirror/generate.ts
git commit -m "feat(growth): host weekly detection batch in Mirror generation; voice verified moments"
```

---

### Task 6: Chat surface

**Files:**
- Modify: `src/pages/api/peter/chat.ts`

- [ ] **Step 1: Add imports**

```typescript
import { getActiveGrowthMomentForChat, markMomentSurfaced, buildGrowthMomentBlock } from '@/lib/server/growth-moments';
```

- [ ] **Step 2: Fetch + append the moment block**

Inside the `if (privacy.can_personalize)` block, the Phase 23 code currently ends with the `insightLines` append. Immediately after it (still inside the block), add:

```typescript
          // Growth Engine (spec §5.1): at most one verified moment per conversation.
          // Known tradeoff: the moment is marked consumed when APPENDED to the
          // prompt, but the block allows Peter to stay silent — a moment can be
          // consumed without being voiced. Acceptable: it still appears in the
          // Mirror and Day-14 reveal, and output inspection isn't available.
          const growthMoment = await getActiveGrowthMomentForChat(authed.supabase, authed.userId);
          if (growthMoment) {
            const block = buildGrowthMomentBlock(growthMoment);
            if (block) {
              systemPrompt += block;
              // Mark chat-consumed (fire-and-forget; 7-day cooldown enforced on read)
              markMomentSurfaced(authed.supabase, growthMoment.id);
            }
          }
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -n "getActiveGrowthMomentForChat\|markMomentSurfaced" src/pages/api/peter/chat.ts | wc -l` — Expected: `3` (import + 2 calls)
Run: `grep -c "growth-engine" src/pages/api/peter/chat.ts` — Expected: `0` (chat never imports the engine)

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/peter/chat.ts
git commit -m "feat(growth): chat surface — one verified growth moment per conversation, name-then-hand-back"
```

---

### Task 7: CSI-4 pulse API

**Files:**
- Create: `src/pages/api/csi/pulse.ts`

- [ ] **Step 1: Create the endpoint**

```typescript
// CSI-4 pulse (spec §5.4). GET → due status; POST → submit scores.
// Standard CSI-4: item 1 scored 0-6, items 2-4 scored 0-5. Total 0-21.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

const ITEM_MAX = [6, 5, 5, 5];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data: pulses } = await ctx.supabase
      .from('csi_pulses')
      .select('context, measured_at')
      .eq('user_id', ctx.userId)
      .order('measured_at', { ascending: false })
      .limit(1);

    if (!pulses || pulses.length === 0) {
      return res.status(200).json({ due: 'baseline' });
    }
    const last = new Date(pulses[0].measured_at).getTime();
    const due = Date.now() - last >= 30 * 86400000 ? 'monthly' : null;
    return res.status(200).json({ due });
  }

  if (req.method === 'POST') {
    const { item_scores } = (req.body || {}) as { item_scores?: number[] };
    if (!Array.isArray(item_scores) || item_scores.length !== 4 ||
        item_scores.some((s, i) => !Number.isInteger(s) || s < 0 || s > ITEM_MAX[i])) {
      return res.status(400).json({ error: 'item_scores must be 4 integers within CSI-4 ranges' });
    }
    const total_score = item_scores.reduce((a, b) => a + b, 0);

    const { data: existing } = await ctx.supabase
      .from('csi_pulses')
      .select('id')
      .eq('user_id', ctx.userId)
      .limit(1);
    const context = !existing || existing.length === 0 ? 'baseline' : 'monthly';

    const { error } = await ctx.supabase.from('csi_pulses').insert({
      user_id: ctx.userId,
      context,
      item_scores,
      total_score,
    });
    if (error) return res.status(500).json({ error: 'Failed to store pulse' });
    return res.status(200).json({ ok: true, context, total_score });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/csi/pulse.ts
git commit -m "feat(growth): CSI-4 pulse endpoint — baseline + monthly due logic"
```

---

### Task 8: CSI pulse card + dashboard mount

**Files:**
- Create: `src/components/dashboard/CsiPulseCard.tsx`
- Modify: `src/pages/dashboard.tsx`

- [ ] **Step 1: Create the card** (follow the visual conventions of `src/components/dashboard/WeeklyMirrorCard.tsx` — read it first for the card chrome, auth header pattern, and motion wrapper)

```tsx
// CSI-4 pulse card (spec §5.4). Peter-voiced, 4 questions, ~30 seconds.
// Appears only when a pulse is due; disappears after submission.
// Scores are never shown as grades.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const QUESTIONS: Array<{ text: string; options: string[] }> = [
  {
    text: 'All things considered, how happy do things feel in your relationship right now?',
    options: ['Really hard', 'Hard', 'A bit unhappy', 'Even', 'Pretty happy', 'Very happy', 'Wonderfully happy'],
  },
  {
    text: 'How warm and comfortable does your relationship feel day to day?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Almost always', 'Completely'],
  },
  {
    text: 'How rewarding does your relationship feel?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Very', 'Completely'],
  },
  {
    text: 'Overall, how satisfied are you with your relationship?',
    options: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Very', 'Completely'],
  },
];

export function CsiPulseCard() {
  const [due, setDue] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/csi/pulse', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await res.json();
        if (!cancelled) setDue(payload.due);
      } catch {
        // fail-soft: card simply doesn't show
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const answer = async (value: number) => {
    const next = [...scores, value];
    if (next.length < QUESTIONS.length) {
      setScores(next);
      setStep(step + 1);
      return;
    }
    setDone(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/csi/pulse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ item_scores: next }),
      });
    } catch {
      // fail-soft
    }
  };

  if (!due) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.p
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            Thank you for trusting me with that. I&apos;ll keep it safe.
          </motion.p>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <p className="mb-1 text-xs text-muted-foreground">
              30 seconds, just between us — there are no grades here. ({step + 1}/4)
            </p>
            <p className="mb-3 text-sm font-medium">{QUESTIONS[step].text}</p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONS[step].options.map((label, i) => (
                <button
                  key={label}
                  onClick={() => answer(i)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2: Mount on the dashboard**

In `src/pages/dashboard.tsx`: add `import { CsiPulseCard } from '@/components/dashboard/CsiPulseCard';` and render `<CsiPulseCard />` adjacent to the existing `<DailySparkCard ... />` (around line 271) — match the surrounding layout wrapper.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -n "CsiPulseCard" src/pages/dashboard.tsx | wc -l` — Expected: `2` (import + render)

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/CsiPulseCard.tsx src/pages/dashboard.tsx
git commit -m "feat(growth): CSI-4 pulse card on dashboard — Peter-voiced, appears when due"
```

---

### Task 9: Day-14 Compound Reveal

**Files:**
- Modify: `src/pages/api/me/graduation-report.ts`
- Modify: `src/components/onboarding/Day14Graduation.tsx`

- [ ] **Step 1: Compose the reveal in graduation-report.ts**

Add imports:

```typescript
import { getAllGrowthMoments } from '@/lib/server/growth-moments';
import { logFinalPrompt } from '@/lib/server/dev-prompt-log';
```

After the `traitsData` fetch, add the reveal-inputs fetch:

```typescript
  // Compound Reveal inputs (spec §5.3): baseline + ALL moments regardless of status
  const [{ data: baseline }, allMoments] = await Promise.all([
    ctx.supabase.from('baseline_snapshots').select('quotes, summary').eq('user_id', ctx.userId).maybeSingle(),
    getAllGrowthMoments(ctx.supabase, ctx.userId),
  ]);
  const beforeQuote: string | null = baseline?.quotes?.[0]?.text ?? null;
  const strongMoment = allMoments.find(m => !m.tentative) || null;
  const afterQuote: string | null =
    (strongMoment?.evidence.after_quote as string | undefined) ??
    (sessions && sessions.length > 0 ? (sessions[sessions.length - 1].evening_reflection || '').slice(0, 200) : null);
  const daysShowedUp = (sessions || []).length;
```

Extend the LLM prompt's JSON contract with a `reveal` field. Replace the `Generate JSON with exactly this shape:` block's closing `}` portion so the shape becomes:

```
{
  "what_i_learned": "...",
  "biggest_growth": "...",
  "relationship_superpower": "...",
  "focus_next": "...",
  "reveal_narrative": "<2-3 sentences. ${strongMoment && beforeQuote ? 'A verified change happened — name it plainly using ONLY the evidence provided, then hand ownership back with a light question.' : `NO verified change is on record — honor effort with the real number: they showed up ${daysShowedUp} of 14 days. Never claim a change that is not in the evidence.`}>"
}
```

And append to the prompt body, before the Rules section:

```
Verified evidence for the reveal (use ONLY this — never invent):
${beforeQuote ? `What they said when they started: "${beforeQuote}"` : '(no baseline quote on record)'}
${afterQuote ? `What they said recently: "${afterQuote}"` : '(no recent quote on record)'}
${strongMoment ? `Verified change: ${strongMoment.kind.replace(/_/g, ' ')}` : 'Verified change: NONE — use the effort fallback.'}
Days they showed up: ${daysShowedUp} of 14
```

Before the `peterChat` call add: `logFinalPrompt('me/graduation-report', prompt);`

In the insert payload add:

```typescript
        reveal: {
          narrative: parsed.reveal_narrative || '',
          before_quote: strongMoment && beforeQuote ? beforeQuote : null,
          after_quote: strongMoment && afterQuote ? afterQuote : null,
          verified: Boolean(strongMoment),
          days_showed_up: daysShowedUp,
        },
```

(Also include the same `reveal` object in the race-condition fallback response so the UI always receives it.)

- [ ] **Step 2: Render in Day14Graduation.tsx**

Read the component first. Extend its `GraduationReport` interface with:

```typescript
  reveal?: {
    narrative: string;
    before_quote: string | null;
    after_quote: string | null;
    verified: boolean;
    days_showed_up: number;
  } | null;
```

Add a reveal section in the render, before the recommended-track section. Match the component's existing card/typography classes:

```tsx
{report.reveal?.narrative && (
  <div className="rounded-2xl border border-border bg-card p-5">
    {report.reveal.verified && report.reveal.before_quote && (
      <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
        &ldquo;{report.reveal.before_quote}&rdquo;
        <span className="mt-1 block not-italic text-xs">— you, when we started</span>
      </blockquote>
    )}
    {report.reveal.verified && report.reveal.after_quote && (
      <blockquote className="mb-3 border-l-2 border-primary pl-3 text-sm italic">
        &ldquo;{report.reveal.after_quote}&rdquo;
        <span className="mt-1 block not-italic text-xs text-muted-foreground">— you, this week</span>
      </blockquote>
    )}
    <p className="text-sm">{report.reveal.narrative}</p>
  </div>
)}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `npm run lint` — Expected: exit 0
Run: `grep -n "logFinalPrompt" src/pages/api/me/graduation-report.ts | wc -l` — Expected: `2`
Run: `grep -c "growth-engine" src/pages/api/me/graduation-report.ts` — Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/me/graduation-report.ts src/components/onboarding/Day14Graduation.tsx
git commit -m "feat(growth): Day-14 Compound Reveal — verbatim before/after quotes with effort fallback"
```

---

### Task 10: Privacy cascade

**Files:**
- Modify: `src/pages/api/me/memory-settings.ts`

- [ ] **Step 1: Extend both delete paths**

Read the file. At BOTH existing `deleteUserMemories(ctx.userId)` call sites (lines ~42 and ~54), add immediately after:

```typescript
      // Growth Engine cascade (spec §6): baseline quotes ARE stored memories;
      // growth/snapshot/pulse rows are derived from them.
      await Promise.all([
        ctx.supabase.from('baseline_snapshots').delete().eq('user_id', ctx.userId),
        ctx.supabase.from('growth_moments').delete().eq('user_id', ctx.userId),
        ctx.supabase.from('pattern_snapshots').delete().eq('user_id', ctx.userId),
        ctx.supabase.from('csi_pulses').delete().eq('user_id', ctx.userId),
      ]);
```

(If the two call sites share a code path, add it once at the shared point — read the file and use judgment; the requirement is: every route that wipes memories also wipes the four growth tables.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` — Expected: exit 0
Run: `grep -c "baseline_snapshots" src/pages/api/me/memory-settings.ts` — Expected: ≥1

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/me/memory-settings.ts
git commit -m "feat(growth): Trust Center delete-all cascades to growth tables"
```

---

### Task 11: Final verification sweep

- [ ] **Step 1: Boundary + safety greps (all must pass)**

```bash
# Engine imported ONLY by mirror generation
grep -rn "from '@/lib/server/growth-engine'" src | grep -v weekly-mirror | wc -l   # → 0
# No LLM in the engine
grep -c "peterChat\|openrouter" src/lib/server/growth-engine.ts                     # → 0
# No detection logic in surfaces (no growth_moments INSERTs outside engine)
grep -rn "from('growth_moments')" src --include="*.ts" | grep -i "insert" | grep -v growth-engine | wc -l  # → 0
# No clinical labels in new user-facing copy
grep -rniE "\b(anxious|avoidant|disorganized|trauma|toxic|disorder|diagnosis)\b" src/lib/server/growth-moments.ts src/components/dashboard/CsiPulseCard.tsx | wc -l  # → 0
```

- [ ] **Step 2: Full build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all exit 0

- [ ] **Step 3: Seeded manual UAT (spec §8)**

With `npm run dev` running and a dev user authenticated:
1. Seed 3 synthetic weeks: `pattern_snapshots` rows showing a `repair_style` flip-and-hold, ≥6 completed `daily_sessions` across the prior 3 weeks with `practice_attempted` mixed, recent week ≥5 attempted, and 2 `memories` >21 days old.
2. POST `/api/weekly-mirror/generate` → confirm console shows `[Phase23 prompt-log] weekly-mirror/generate` with the verified-moments block, and `growth_moments` has ≤2 new rows with correct kinds.
3. Open Peter chat → confirm logged system prompt contains `VERIFIED GROWTH OBSERVATION`, then the moment's status becomes `surfaced`. Send a second message → no second growth block (cooldown).
4. GET `/api/me/graduation-report` (fresh user with baseline) → confirm `reveal` payload present; for a user with no moments, confirm effort-fallback narrative with real day count.
5. Dashboard → CSI card shows for a pulse-less user; submit 4 answers → row in `csi_pulses` with `context='baseline'`; card gone on reload.

- [ ] **Step 4: Commit any UAT fixes, then final commit**

```bash
git add -A && git commit -m "feat(growth): Growth Engine & Compound Reveal — final verification pass"
```
