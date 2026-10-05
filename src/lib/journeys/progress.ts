// progress.ts — journey state and progress (Journey audit, Phase 1). Pure logic,
// shared by the API, the server helper and the browser-progress import.
//
// One record per user per journey (user_journeys). Two shapes:
//   daily  — the starter journeys: one day after another, N days.
//   staged — Roots → Growth → Bloom, a fixed number of days per stage.
// Progress counts days the user practiced, never content viewed, and never
// goes down. Pausing, leaving and coming back keep the user's place: setting a
// journey aside is a choice, not a failure.

export const STAGES = ['roots', 'growth', 'bloom'] as const;
export type StageId = typeof STAGES[number];

export type JourneyStatus = 'active' | 'paused' | 'completed' | 'left';

export type JourneyShape =
  | { kind: 'daily'; length: number }
  | { kind: 'staged'; stageLength: number };

export type StageProgress = Partial<Record<StageId, { next_day: number; completed_at?: string | null }>>;

export type JourneyState = {
  journey_id: string;
  status: JourneyStatus;
  /** Staged journeys only: the stage being walked. */
  stage: StageId | null;
  /** Next day to practice — within the stage (staged) or the journey (daily). */
  journey_day: number;
  /** Days practiced in total. Never decreases. */
  progress: number;
  stage_progress: StageProgress;
  last_step_at: string | null;
  completed_at: string | null;
  paused_at: string | null;
  left_at: string | null;
};

export function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

export function newJourneyState(journeyId: string, shape: JourneyShape): JourneyState {
  return {
    journey_id: journeyId,
    status: 'active',
    stage: shape.kind === 'staged' ? 'roots' : null,
    journey_day: 1,
    progress: 0,
    stage_progress: shape.kind === 'staged' ? { roots: { next_day: 1 } } : {},
    last_step_at: null,
    completed_at: null,
    paused_at: null,
    left_at: null,
  };
}

/** A stage can be walked once the stage before it is finished (Roots always). */
export function isStageOpen(state: Pick<JourneyState, 'stage_progress'>, stage: StageId): boolean {
  const i = STAGES.indexOf(stage);
  if (i <= 0) return true;
  return Boolean(state.stage_progress[STAGES[i - 1]]?.completed_at);
}

export function isStageFinished(state: Pick<JourneyState, 'stage_progress'>, stage: StageId): boolean {
  return Boolean(state.stage_progress[stage]?.completed_at);
}

export type StepResult = {
  state: JourneyState;
  /** False when this day was already counted (or isn't the next one): nothing changed. */
  advanced: boolean;
  stageCompleted: StageId | null;
  journeyCompleted: boolean;
};

/**
 * The user practiced `day` (and, for staged journeys, in `stage`). Counts it
 * once: only the next expected day advances, so a retried or duplicate
 * completion never double-counts and an old day never moves anyone backwards.
 */
export function recordStep(
  state: JourneyState,
  shape: JourneyShape,
  step: { day: number; stage?: StageId | null; at: string },
  opts: { creditSetAside?: boolean } = {},
): StepResult {
  const unchanged: StepResult = { state, advanced: false, stageCompleted: null, journeyCompleted: false };
  // A day the user started on this journey still counts for it if they
  // paused or left it before finishing that day (mid-day switch). Its status
  // stays as they set it, unless this day finishes the journey.
  const countable = state.status === 'active'
    || (opts.creditSetAside === true && (state.status === 'paused' || state.status === 'left'));
  if (!countable) return unchanged;

  if (shape.kind === 'daily') {
    if (step.day !== state.journey_day || step.day > shape.length) return unchanged;
    const done = step.day >= shape.length;
    return {
      state: {
        ...state,
        journey_day: step.day + 1,
        progress: state.progress + 1,
        last_step_at: step.at,
        ...(done ? { status: 'completed' as const, completed_at: step.at } : {}),
      },
      advanced: true,
      stageCompleted: null,
      journeyCompleted: done,
    };
  }

  const stage = step.stage ?? state.stage;
  if (!stage || stage !== state.stage) return unchanged;
  const current = state.stage_progress[stage] ?? { next_day: 1 };
  if (step.day !== current.next_day || step.day > shape.stageLength) return unchanged;

  const stageDone = step.day >= shape.stageLength;
  const journeyDone = stageDone && stage === STAGES[STAGES.length - 1];
  const nextStageProgress: StageProgress = {
    ...state.stage_progress,
    [stage]: { next_day: step.day + 1, completed_at: stageDone ? step.at : current.completed_at ?? null },
  };
  return {
    state: {
      ...state,
      journey_day: step.day + 1,
      progress: state.progress + 1,
      last_step_at: step.at,
      stage_progress: nextStageProgress,
      ...(journeyDone ? { status: 'completed' as const, completed_at: step.at } : {}),
    },
    advanced: true,
    stageCompleted: stageDone ? stage : null,
    journeyCompleted: journeyDone,
  };
}

export type ChooseStageResult = { ok: true; state: JourneyState } | { ok: false; error: 'not_staged' | 'stage_locked' | 'not_active' };

/**
 * The user picks which stage to walk. Moving on is offered, never automatic:
 * finishing Roots opens Growth, and the user decides when (or whether) to
 * start it. Walking a finished stage again starts it from day 1.
 */
export function chooseStage(state: JourneyState, shape: JourneyShape, stage: StageId): ChooseStageResult {
  if (shape.kind !== 'staged') return { ok: false, error: 'not_staged' };
  if (state.status !== 'active') return { ok: false, error: 'not_active' };
  if (!isStageOpen(state, stage)) return { ok: false, error: 'stage_locked' };
  const existing = state.stage_progress[stage];
  const replay = Boolean(existing?.completed_at) && (existing?.next_day ?? 1) > shape.stageLength;
  const nextDay = replay ? 1 : existing?.next_day ?? 1;
  return {
    ok: true,
    state: {
      ...state,
      stage,
      journey_day: nextDay,
      stage_progress: { ...state.stage_progress, [stage]: { next_day: nextDay, completed_at: existing?.completed_at ?? null } },
    },
  };
}

export type JourneyAction = 'activate' | 'pause' | 'leave';

export type TransitionResult = { ok: true; state: JourneyState } | { ok: false; error: 'invalid_transition' };

/**
 * Status changes. Every one keeps the user's history:
 *   activate — start, resume a paused/left journey where they were, or walk a
 *              completed one again from the beginning.
 *   pause    — set aside for now; their place is kept.
 *   leave    — step away for good; still kept, and they can come back.
 */
export function transition(state: JourneyState, shape: JourneyShape, action: JourneyAction, at: string): TransitionResult {
  switch (action) {
    case 'activate': {
      if (state.status === 'active') return { ok: true, state };
      if (state.status === 'completed') {
        // Walk it again from the start. Finished stages stay finished (and
        // open); days practiced keep counting.
        const base = { ...state, status: 'active' as const, journey_day: 1, paused_at: null, left_at: null };
        if (shape.kind === 'daily') return { ok: true, state: base };
        const roots = state.stage_progress.roots;
        return {
          ok: true,
          state: { ...base, stage: 'roots', stage_progress: { ...state.stage_progress, roots: { next_day: 1, completed_at: roots?.completed_at ?? null } } },
        };
      }
      return { ok: true, state: { ...state, status: 'active' } };
    }
    case 'pause':
      if (state.status !== 'active') return { ok: false, error: 'invalid_transition' };
      return { ok: true, state: { ...state, status: 'paused', paused_at: at } };
    case 'leave':
      if (state.status !== 'active' && state.status !== 'paused') return { ok: false, error: 'invalid_transition' };
      return { ok: true, state: { ...state, status: 'left', left_at: at } };
  }
}

/**
 * One journey day per calendar day, in the user's own time zone. Computed on
 * the device (the server doesn't know the zone); `now` is injectable for tests.
 */
export function practicedToday(lastStepAt: string | null, now: Date = new Date()): boolean {
  if (!lastStepAt) return false;
  const last = new Date(lastStepAt);
  if (Number.isNaN(last.getTime())) return false;
  return last.getFullYear() === now.getFullYear()
    && last.getMonth() === now.getMonth()
    && last.getDate() === now.getDate();
}

// ── One-time import of progress kept in the browser before Phase 1 ────────

type LegacyEntry = { journey_id?: string; day?: number; completed?: boolean; responses?: Record<string, unknown>; created_at?: string };

export type ImportedEntry = { stage: StageId; day: number; responses: Record<string, string>; completed_at: string };

export type ImportedJourney = {
  journey_id: string;
  state: JourneyState;
  entries: ImportedEntry[];
};

const MAX_IMPORT_DAYS = 60;

function cleanResponses(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== 'object') return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim() && Object.keys(out).length < 10) out[k.slice(0, 40)] = v.trim().slice(0, 4000);
  }
  return out;
}

function validIso(value: unknown, fallback: string): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : fallback;
}

/**
 * Turns the old localStorage blobs (`sparq_journey_progress`,
 * `sparq_tier_progress`) into journey records for staged journeys. Unknown
 * ids, malformed rows and days past the stage are dropped. Every imported
 * journey arrives paused (or completed): the server decides whether one may
 * become active, so an import never displaces the journey the user is on.
 */
export function parseBrowserProgress(
  journeyProgress: unknown,
  tierProgress: unknown,
  stagedIds: ReadonlySet<string>,
  stageLength: number,
  now: string,
): ImportedJourney[] {
  const byJourney = new Map<string, { entries: ImportedEntry[]; flags: Partial<Record<StageId, boolean>> }>();
  const bucket = (id: string) => {
    if (!byJourney.has(id)) byJourney.set(id, { entries: [], flags: {} });
    return byJourney.get(id)!;
  };

  if (journeyProgress && typeof journeyProgress === 'object') {
    for (const [key, rows] of Object.entries(journeyProgress as Record<string, unknown>)) {
      const match = /^(.*?)(?:_(roots|growth|bloom))?$/.exec(key);
      const id = match?.[1] ?? '';
      const stage = (match?.[2] as StageId | undefined) ?? 'roots';
      if (!stagedIds.has(id) || !Array.isArray(rows)) continue;
      for (const row of (rows as LegacyEntry[]).slice(0, MAX_IMPORT_DAYS)) {
        const day = Number(row?.day);
        if (!row?.completed || !Number.isInteger(day) || day < 1 || day > stageLength) continue;
        const entries = bucket(id).entries;
        if (entries.some(e => e.stage === stage && e.day === day)) continue;
        entries.push({ stage, day, responses: cleanResponses(row.responses), completed_at: validIso(row.created_at, now) });
      }
    }
  }

  if (tierProgress && typeof tierProgress === 'object') {
    for (const [id, tiers] of Object.entries(tierProgress as Record<string, unknown>)) {
      if (!stagedIds.has(id) || !tiers || typeof tiers !== 'object') continue;
      for (const stage of STAGES) {
        const t = (tiers as Record<string, { completed?: unknown; currentDay?: unknown }>)[stage];
        if (t?.completed === true || Number(t?.currentDay) >= stageLength) bucket(id).flags[stage] = true;
      }
    }
  }

  const out: ImportedJourney[] = [];
  for (const [id, { entries, flags }] of byJourney) {
    const stageProgress: StageProgress = {};
    let lastAt: string | null = null;
    let lastStage: StageId | null = null;
    for (const stage of STAGES) {
      const days = entries.filter(e => e.stage === stage);
      const highest = days.reduce((m, e) => Math.max(m, e.day), 0);
      const finished = flags[stage] || highest >= stageLength;
      if (!highest && !finished) continue;
      const stageLast = days.map(e => e.completed_at).sort().pop() ?? null;
      stageProgress[stage] = {
        next_day: finished ? stageLength + 1 : highest + 1,
        completed_at: finished ? stageLast ?? now : null,
      };
      if (stageLast && (!lastAt || stageLast > lastAt)) { lastAt = stageLast; lastStage = stage; }
    }
    const stages = STAGES.filter(s => stageProgress[s]);
    if (stages.length === 0) continue;
    const stage = lastStage ?? stages[stages.length - 1];
    const allDone = Boolean(stageProgress.bloom?.completed_at);
    out.push({
      journey_id: id,
      entries,
      state: {
        journey_id: id,
        status: allDone ? 'completed' : 'paused',
        stage,
        journey_day: stageProgress[stage]!.next_day,
        progress: entries.length,
        stage_progress: stageProgress,
        last_step_at: lastAt,
        completed_at: allDone ? stageProgress.bloom!.completed_at ?? now : null,
        paused_at: allDone ? null : now,
        left_at: null,
      },
    });
  }
  // Most recently practiced first: the server makes that one active if the
  // user has no active journey yet.
  return out.sort((a, b) => (b.state.last_step_at ?? '').localeCompare(a.state.last_step_at ?? ''));
}
