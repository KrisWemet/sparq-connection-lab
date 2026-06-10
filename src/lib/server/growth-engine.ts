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
  const latest = monthly[0].total_score; // monthly entries ordered newest-first
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
