// journey-state.ts — the one place that reads and writes journey state
// (Journey audit, Phase 1). Server-side only.
//
// user_journeys holds one record per user per journey; at most one is active.
// user_insights.active_journey_id is kept in step as a pointer for older
// readers. Rules (what counts as a day, which status changes are allowed)
// live in src/lib/journeys/progress.ts; this file only persists them.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getCatalogJourney, stagedJourneyIds, STAGE_LENGTH } from '@/lib/journeys/catalog';
import {
  chooseStage,
  newJourneyState,
  parseBrowserProgress,
  recordStep,
  transition,
  type JourneyState,
  type StageId,
} from '@/lib/journeys/progress';
import { resolveEntitlements } from './entitlements';
import { trackEvent } from './analytics';
import { isMissingSchemaError } from './schema-fallback';

type Db = SupabaseClient;

const COLUMNS =
  'id, journey_id, status, stage, journey_day, progress, stage_progress, last_step_at, completed_at, paused_at, left_at, start_date, completion_synthesis';

export type JourneyRecord = JourneyState & {
  id: string | null;
  title: string;
  shape: 'daily' | 'staged';
  /** Days in the journey (daily) or in each stage (staged). */
  days: number;
  start_date: string | null;
  completion_synthesis: string | null;
};

export type JourneyError =
  | 'unknown_journey'
  | 'not_found'
  | 'journey_limit_reached'
  | 'stage_locked'
  | 'invalid_transition'
  | 'schema_not_ready'
  | 'db_error';

export type JourneyResult<T> = { ok: true; value: T } | { ok: false; error: JourneyError; limit?: number };

function fromRow(row: any): JourneyRecord | null {
  const entry = getCatalogJourney(row?.journey_id);
  if (!entry) return null;
  return {
    id: row.id ?? null,
    journey_id: row.journey_id,
    title: entry.title,
    shape: entry.shape.kind,
    days: entry.shape.kind === 'daily' ? entry.shape.length : entry.shape.stageLength,
    status: row.status ?? 'active',
    stage: row.stage ?? null,
    journey_day: Math.max(1, Number(row.journey_day) || 1),
    progress: Math.max(0, Number(row.progress) || 0),
    stage_progress: row.stage_progress && typeof row.stage_progress === 'object' ? row.stage_progress : {},
    last_step_at: row.last_step_at ?? null,
    completed_at: row.completed_at ?? null,
    paused_at: row.paused_at ?? null,
    left_at: row.left_at ?? null,
    start_date: row.start_date ?? null,
    completion_synthesis: row.completion_synthesis ?? null,
  };
}

function toColumns(state: JourneyState) {
  return {
    status: state.status,
    is_active: state.status === 'active',
    stage: state.stage,
    journey_day: state.journey_day,
    progress: state.progress,
    stage_progress: state.stage_progress,
    last_step_at: state.last_step_at,
    completed_at: state.completed_at,
    paused_at: state.paused_at,
    left_at: state.left_at,
    updated_at: new Date().toISOString(),
  };
}

async function setInsightsPointer(db: Db, userId: string, patch: Record<string, unknown>) {
  const { error } = await db.from('user_insights').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
  if (error) console.error('[journey-state] user_insights pointer update failed:', error.message);
}

async function loadRow(db: Db, userId: string, journeyId: string): Promise<JourneyResult<JourneyRecord | null>> {
  const { data, error } = await db.from('user_journeys').select(COLUMNS)
    .eq('user_id', userId).eq('journey_id', journeyId).maybeSingle();
  if (error) return { ok: false, error: isMissingSchemaError(error) ? 'schema_not_ready' : 'db_error' };
  return { ok: true, value: data ? fromRow(data) : null };
}

async function saveRow(db: Db, userId: string, record: JourneyRecord | null, state: JourneyState): Promise<JourneyResult<JourneyRecord>> {
  const columns = toColumns(state);
  const query = record?.id
    ? db.from('user_journeys').update(columns).eq('id', record.id).eq('user_id', userId)
    : db.from('user_journeys').insert({ user_id: userId, journey_id: state.journey_id, start_date: new Date().toISOString(), ...columns });
  const { data, error } = await query.select(COLUMNS).single();
  if (error || !data) {
    if (error) console.error('[journey-state] save failed:', error.message);
    return { ok: false, error: isMissingSchemaError(error) ? 'schema_not_ready' : 'db_error' };
  }
  return { ok: true, value: fromRow(data)! };
}

/**
 * Before the journey_state migration runs, only starter journeys have state,
 * on user_insights. Rebuild it from there — with the day counted from that
 * journey's own completed sessions, not the global day counter.
 */
async function activeFromInsights(db: Db, userId: string): Promise<JourneyRecord | null> {
  const { data: insights } = await db.from('user_insights').select('active_journey_id').eq('user_id', userId).maybeSingle();
  const journeyId = insights?.active_journey_id ?? null;
  const entry = getCatalogJourney(journeyId);
  if (!journeyId || !entry) return null;
  const { data: done } = await db.from('daily_sessions').select('journey_day_index')
    .eq('user_id', userId).eq('journey_id', journeyId).eq('status', 'completed')
    .order('journey_day_index', { ascending: false }).limit(1);
  const lastDay = Number(done?.[0]?.journey_day_index) || 0;
  return {
    ...newJourneyState(journeyId, entry.shape),
    journey_day: lastDay + 1,
    progress: lastDay,
    id: null,
    title: entry.title,
    shape: entry.shape.kind,
    days: entry.shape.kind === 'daily' ? entry.shape.length : entry.shape.stageLength,
    start_date: null,
    completion_synthesis: null,
  };
}

export async function listJourneys(db: Db, userId: string): Promise<JourneyResult<JourneyRecord[]>> {
  const { data, error } = await db.from('user_journeys').select(COLUMNS).eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) {
    if (!isMissingSchemaError(error)) return { ok: false, error: 'db_error' };
    const active = await activeFromInsights(db, userId);
    return { ok: true, value: active ? [active] : [] };
  }
  return { ok: true, value: (data || []).map(fromRow).filter((r): r is JourneyRecord => Boolean(r)) };
}

export async function getActiveJourney(db: Db, userId: string): Promise<JourneyRecord | null> {
  const { data, error } = await db.from('user_journeys').select(COLUMNS)
    .eq('user_id', userId).eq('status', 'active').maybeSingle();
  if (error) {
    if (isMissingSchemaError(error)) return activeFromInsights(db, userId);
    console.error('[journey-state] active lookup failed:', error.message);
    return null;
  }
  return data ? fromRow(data) : null;
}

/**
 * Start, resume, or walk again. Switching journeys pauses the current one —
 * its place is kept — rather than refusing. A free plan can start a limited
 * number of different journeys; resuming one never counts against it.
 */
export async function activateJourney(
  db: Db,
  userId: string,
  journeyId: string,
  opts: { stage?: StageId | null } = {},
): Promise<JourneyResult<{ journey: JourneyRecord; pausedJourneyId: string | null }>> {
  const entry = getCatalogJourney(journeyId);
  if (!entry) return { ok: false, error: 'unknown_journey' };

  const existing = await loadRow(db, userId, journeyId);
  if (!existing.ok && existing.error === 'schema_not_ready' && entry.shape.kind === 'daily') {
    // Before the journey_state migration: starter journeys still work through
    // the user_insights pointer alone (activeFromInsights reads it back).
    await setInsightsPointer(db, userId, { active_journey_id: journeyId, journey_completion_state: null });
    const journey = await activeFromInsights(db, userId);
    if (!journey) return { ok: false, error: 'db_error' };
    return { ok: true, value: { journey, pausedJourneyId: null } };
  }
  if (!existing.ok) return existing;

  if (!existing.value) {
    const entitlements = await resolveEntitlements(db, userId);
    if (entitlements.starter_quests_limit != null) {
      const { count, error } = await db.from('user_journeys').select('id', { count: 'exact', head: true }).eq('user_id', userId);
      if (error) return { ok: false, error: 'db_error' };
      if ((count || 0) >= entitlements.starter_quests_limit) {
        return { ok: false, error: 'journey_limit_reached', limit: entitlements.starter_quests_limit };
      }
    }
  }

  const now = new Date().toISOString();
  let next = existing.value
    ? transition(existing.value, entry.shape, 'activate', now)
    : { ok: true as const, state: newJourneyState(journeyId, entry.shape) };
  if (!next.ok) return { ok: false, error: next.error };

  if (opts.stage && entry.shape.kind === 'staged') {
    const chosen = chooseStage(next.state, entry.shape, opts.stage);
    if (!chosen.ok) return { ok: false, error: chosen.error === 'stage_locked' ? 'stage_locked' : 'invalid_transition' };
    next = chosen;
  }

  // Only one active journey: set the current one aside first.
  let pausedJourneyId: string | null = null;
  const current = await getActiveJourney(db, userId);
  if (current && current.journey_id !== journeyId && current.id) {
    const currentEntry = getCatalogJourney(current.journey_id)!;
    const paused = transition(current, currentEntry.shape, 'pause', now);
    if (paused.ok) {
      const saved = await saveRow(db, userId, current, paused.state);
      if (!saved.ok) return saved;
      pausedJourneyId = current.journey_id;
    }
  }

  const saved = await saveRow(db, userId, existing.value, next.state);
  if (!saved.ok) return saved;

  await setInsightsPointer(db, userId, { active_journey_id: journeyId, journey_completion_state: null });
  await trackEvent(db, userId, existing.value ? 'journey_resumed' : 'journey_started', {
    journey_id: journeyId,
    from_status: existing.value?.status ?? null,
    paused_journey_id: pausedJourneyId,
  });
  return { ok: true, value: { journey: saved.value, pausedJourneyId } };
}

/** Pause (set aside for now) or leave (step away). Both keep their place and answers. */
export async function setJourneyAside(
  db: Db,
  userId: string,
  journeyId: string,
  action: 'pause' | 'leave',
): Promise<JourneyResult<JourneyRecord>> {
  const entry = getCatalogJourney(journeyId);
  if (!entry) return { ok: false, error: 'unknown_journey' };
  const existing = await loadRow(db, userId, journeyId);
  if (!existing.ok) return existing;
  if (!existing.value) return { ok: false, error: 'not_found' };

  const wasActive = existing.value.status === 'active';
  const next = transition(existing.value, entry.shape, action, new Date().toISOString());
  if (!next.ok) return { ok: false, error: next.error };
  const saved = await saveRow(db, userId, existing.value, next.state);
  if (!saved.ok) return saved;

  if (wasActive) await setInsightsPointer(db, userId, { active_journey_id: null });
  await trackEvent(db, userId, action === 'pause' ? 'journey_paused' : 'journey_left', {
    journey_id: journeyId,
    days_practiced: existing.value.progress,
  });
  return { ok: true, value: saved.value };
}

/** The user picks which stage to walk next (offered, never automatic). */
export async function chooseJourneyStage(
  db: Db,
  userId: string,
  journeyId: string,
  stage: StageId,
): Promise<JourneyResult<JourneyRecord>> {
  const entry = getCatalogJourney(journeyId);
  if (!entry) return { ok: false, error: 'unknown_journey' };
  const existing = await loadRow(db, userId, journeyId);
  if (!existing.ok) return existing;
  if (!existing.value) return { ok: false, error: 'not_found' };
  const chosen = chooseStage(existing.value, entry.shape, stage);
  if (!chosen.ok) return { ok: false, error: chosen.error === 'stage_locked' ? 'stage_locked' : 'invalid_transition' };
  return saveRow(db, userId, existing.value, chosen.state);
}

export type StepOutcome = {
  journey: JourneyRecord;
  advanced: boolean;
  stageCompleted: StageId | null;
  journeyCompleted: boolean;
};

/**
 * The user practiced a journey day. Counted once (see recordStep). For staged
 * journeys the written answers are kept privately in journey_step_entries.
 * Finishing the journey clears the active pointer and records the completion.
 */
export async function recordJourneyStep(
  db: Db,
  userId: string,
  journeyId: string,
  step: { day: number; stage?: StageId | null; responses?: Record<string, string> | null },
): Promise<JourneyResult<StepOutcome>> {
  const entry = getCatalogJourney(journeyId);
  if (!entry) return { ok: false, error: 'unknown_journey' };
  const existing = await loadRow(db, userId, journeyId);
  if (!existing.ok) return existing;
  if (!existing.value) return { ok: false, error: 'not_found' };

  const at = new Date().toISOString();
  const result = recordStep(existing.value, entry.shape, { day: step.day, stage: step.stage, at });

  // Answers are saved for the day they belong to, even when it was already
  // counted (the user went back and added to an earlier day).
  const stage = step.stage ?? existing.value.stage;
  const reachable = stage && step.day <= (existing.value.stage_progress[stage]?.next_day ?? 1);
  if (entry.shape.kind === 'staged' && stage && reachable && step.responses && Object.keys(step.responses).length > 0) {
    const { error } = await db.from('journey_step_entries').upsert(
      { user_id: userId, journey_id: journeyId, stage, day: step.day, responses: step.responses, completed_at: at },
      { onConflict: 'user_id,journey_id,stage,day' },
    );
    if (error) console.error('[journey-state] saving answers failed:', error.message);
  }

  if (!result.advanced) {
    return { ok: true, value: { journey: existing.value, advanced: false, stageCompleted: null, journeyCompleted: false } };
  }

  const saved = await saveRow(db, userId, existing.value, result.state);
  if (!saved.ok) return saved;

  if (result.journeyCompleted) {
    await setInsightsPointer(db, userId, {
      active_journey_id: null,
      last_completed_journey_id: journeyId,
      journey_completion_state: 'pending_decision',
    });
    await trackEvent(db, userId, 'journey_completed', { journey_id: journeyId, days_practiced: result.state.progress });
  } else if (result.stageCompleted) {
    await trackEvent(db, userId, 'journey_stage_completed', { journey_id: journeyId, stage: result.stageCompleted });
  }

  return {
    ok: true,
    value: { journey: saved.value, advanced: true, stageCompleted: result.stageCompleted, journeyCompleted: result.journeyCompleted },
  };
}

/**
 * One-time import of progress the browser kept before Phase 1. Never
 * overwrites what the server already has. Imported journeys arrive paused;
 * the most recent one becomes active only when the user has no active
 * journey, so an import never displaces the journey they're on.
 */
export async function importBrowserJourneys(
  db: Db,
  userId: string,
  raw: { journeyProgress: unknown; tierProgress: unknown },
): Promise<JourneyResult<{ imported: string[]; activated: string | null }>> {
  const now = new Date().toISOString();
  const parsed = parseBrowserProgress(raw.journeyProgress, raw.tierProgress, stagedJourneyIds, STAGE_LENGTH, now);
  if (parsed.length === 0) return { ok: true, value: { imported: [], activated: null } };

  const known = await listJourneys(db, userId);
  if (!known.ok) return known;
  const have = new Set(known.value.map(r => r.journey_id));
  let hasActive = known.value.some(r => r.status === 'active' && r.id);

  const imported: string[] = [];
  let activated: string | null = null;
  for (const item of parsed) {
    if (have.has(item.journey_id)) continue;
    let state = item.state;
    if (!hasActive && state.status === 'paused') {
      state = { ...state, status: 'active', paused_at: null };
      hasActive = true;
      activated = item.journey_id;
    }
    const saved = await saveRow(db, userId, null, state);
    if (!saved.ok) return saved;
    imported.push(item.journey_id);

    if (item.entries.length > 0) {
      const { error } = await db.from('journey_step_entries').upsert(
        item.entries.map(e => ({
          user_id: userId,
          journey_id: item.journey_id,
          stage: e.stage,
          day: e.day,
          responses: e.responses,
          completed_at: e.completed_at,
          source: 'browser_import',
        })),
        { onConflict: 'user_id,journey_id,stage,day', ignoreDuplicates: true },
      );
      if (error) console.error('[journey-state] importing answers failed:', error.message);
    }
  }

  if (activated) await setInsightsPointer(db, userId, { active_journey_id: activated, journey_completion_state: null });
  if (imported.length > 0) await trackEvent(db, userId, 'journey_browser_import', { count: imported.length, activated });
  return { ok: true, value: { imported, activated } };
}
