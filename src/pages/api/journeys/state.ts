// /api/journeys/state — the user's journeys and every change to them.
//   GET  → { journeys, active }
//   POST { action: 'activate', journey_id, stage? }   start / resume / walk again
//        { action: 'pause' | 'leave', journey_id }     set aside; place is kept
//        { action: 'stage', journey_id, stage }        choose the stage to walk
//        { action: 'step', journey_id, day, stage?, responses? }  practiced a day
//        { action: 'import', journey_progress, tier_progress }    one-time browser import

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import {
  activateJourney,
  chooseJourneyStage,
  importBrowserJourneys,
  listJourneys,
  recordJourneyStep,
  setJourneyAside,
  type JourneyError,
} from '@/lib/server/journey-state';
import { isStageId } from '@/lib/journeys/progress';
import { isDailyJourney } from '@/lib/journeys/catalog';

const STATUS: Record<JourneyError, number> = {
  unknown_journey: 404,
  not_found: 404,
  journey_limit_reached: 403,
  stage_locked: 409,
  invalid_transition: 409,
  schema_not_ready: 503,
  db_error: 500,
};

const MESSAGE: Partial<Record<JourneyError, string>> = {
  journey_limit_reached: 'You reached your free-plan journey limit.',
  stage_locked: 'Finish the stage before this one first.',
};

function cleanResponses(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== 'object') return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>).slice(0, 10)) {
    if (typeof v === 'string' && v.trim()) out[k.slice(0, 40)] = v.trim().slice(0, 4000);
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;

  if (req.method === 'GET') {
    const listed = await listJourneys(db, ctx.userId);
    if (!listed.ok) return res.status(STATUS[listed.error]).json({ error: listed.error });
    return res.status(200).json({
      journeys: listed.value,
      active: listed.value.find(j => j.status === 'active') ?? null,
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (req.body || {}) as Record<string, unknown>;
  const action = body.action;
  const journeyId = typeof body.journey_id === 'string' ? body.journey_id : '';
  const stage = isStageId(body.stage) ? body.stage : null;

  const fail = (error: JourneyError, extra: Record<string, unknown> = {}) =>
    res.status(STATUS[error]).json({ error, ...(MESSAGE[error] ? { message: MESSAGE[error] } : {}), ...extra });

  if (action === 'import') {
    const result = await importBrowserJourneys(db, ctx.userId, {
      journeyProgress: body.journey_progress,
      tierProgress: body.tier_progress,
    });
    return result.ok ? res.status(200).json(result.value) : fail(result.error);
  }

  if (!journeyId) return res.status(400).json({ error: 'journey_id is required' });

  switch (action) {
    case 'activate': {
      const result = await activateJourney(db, ctx.userId, journeyId, { stage });
      if (!result.ok) return fail(result.error, result.limit != null ? { limit: result.limit } : {});
      return res.status(200).json({ journey: result.value.journey, paused_journey_id: result.value.pausedJourneyId });
    }
    case 'pause':
    case 'leave': {
      const result = await setJourneyAside(db, ctx.userId, journeyId, action);
      return result.ok ? res.status(200).json({ journey: result.value }) : fail(result.error);
    }
    case 'stage': {
      if (!stage) return res.status(400).json({ error: 'stage is required' });
      const result = await chooseJourneyStage(db, ctx.userId, journeyId, stage);
      return result.ok ? res.status(200).json({ journey: result.value }) : fail(result.error);
    }
    case 'step': {
      const day = Number(body.day);
      if (!Number.isInteger(day) || day < 1) return res.status(400).json({ error: 'day is required' });
      // Daily journeys advance only through the Daily Loop (session complete).
      if (isDailyJourney(journeyId)) return res.status(409).json({ error: 'invalid_transition' });
      const result = await recordJourneyStep(db, ctx.userId, journeyId, {
        day,
        stage,
        responses: cleanResponses(body.responses),
      });
      if (!result.ok) return fail(result.error);
      return res.status(200).json({
        journey: result.value.journey,
        advanced: result.value.advanced,
        stage_completed: result.value.stageCompleted,
        journey_completed: result.value.journeyCompleted,
      });
    }
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
}
