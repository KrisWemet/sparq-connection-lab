import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { loadPrivacyState } from '@/lib/server/privacy';
import { addDistilledMemories } from '@/lib/server/memory';
import { trackEvent } from '@/lib/server/analytics';
import { cleanReason, saveExperimentReason } from '@/lib/server/reasons';
import { getActiveNorthStar } from '@/lib/server/north-star';
import { withSchemaFallback } from '@/lib/server/schema-fallback';
import {
  GOT_IN_THE_WAY_LABELS,
  capacityFromHistory,
  isDomain,
  isFelt,
  isGotInTheWay,
  isSkillKey,
  ladderStep,
  missionText,
  suggestMission,
  type MissionHistoryRow,
  type MissionLearning,
} from '@/lib/missions';

/**
 * Self-chosen experiments and Real-World Missions (constitution §5, §9 Days
 * 8–14, v1.2 §11A). GET lists open + recently resolved, the user's capacity
 * per practiced skill, and at most one mission idea tied to something they
 * chose. POST creates one in the user's words (or from an idea they
 * accepted). PATCH records what happened — as learning, never a grade — or
 * reshapes it into a new version.
 */
const STATUSES = ['tried', 'skipped', 'let_go', 'planned'] as const;
const OUTCOMES = ['helped', 'mixed', 'didnt_help'] as const;

// Columns added by 20261001100000_transformation_engine.sql. Every read and
// write falls back to the v1.1 shape until that migration has run.
const V12_OPEN = 'id, intention, origin, status, check_in_on, created_at, kind, cue, skill_key, difficulty_level, domain, reason:user_reasons(id, reason_text, still_true)';
const V11_OPEN = 'id, intention, origin, status, check_in_on, created_at, reason:user_reasons(id, reason_text, still_true)';
const V12_RECENT = 'id, intention, status, outcome, outcome_note, resolved_at, skill_key, difficulty_level, learning';
const V11_RECENT = 'id, intention, status, outcome, outcome_note, resolved_at';

function isoDatePlus(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const db = ctx.supabase;

  async function storeLearningMemory(text: string, importance: number) {
    const privacy = await loadPrivacyState(db, ctx!.userId);
    if (!privacy.can_store_memories) return;
    const metadata: Record<string, any> = { source: 'experiment' };
    if (privacy.preferences.memory_window === '90_days') {
      metadata.expires_at = new Date(Date.now() + 90 * 86_400_000).toISOString();
    }
    await addDistilledMemories(ctx!.userId, [{ text, kind: 'growth', importance }], metadata).catch(() => 0);
  }

  if (req.method === 'GET') {
    const today = isoDatePlus(0);
    const declined = typeof req.query.declined === 'string' ? req.query.declined.split(',').filter(Boolean) : [];
    const [openRes, recentRes, historyRes, northStarLine, reasonRes, prefsRes] = await Promise.all([
      withSchemaFallback<any[]>(
        () => db.from('experiments').select(V12_OPEN).eq('user_id', ctx.userId).eq('status', 'planned')
          .order('created_at', { ascending: false }).limit(10),
        () => db.from('experiments').select(V11_OPEN).eq('user_id', ctx.userId).eq('status', 'planned')
          .order('created_at', { ascending: false }).limit(10),
      ),
      withSchemaFallback<any[]>(
        () => db.from('experiments').select(V12_RECENT).eq('user_id', ctx.userId).neq('status', 'planned')
          .order('resolved_at', { ascending: false }).limit(10),
        () => db.from('experiments').select(V11_RECENT).eq('user_id', ctx.userId).neq('status', 'planned')
          .order('resolved_at', { ascending: false }).limit(10),
      ),
      db.from('experiments').select('skill_key, difficulty_level, status, outcome, learning, resolved_at')
        .eq('user_id', ctx.userId).not('skill_key', 'is', null)
        .order('resolved_at', { ascending: false }).limit(60),
      getActiveNorthStar(db, ctx.userId),
      db.from('user_reasons').select('reason_text').eq('user_id', ctx.userId).eq('still_true', true)
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('user_preferences').select('conversation_prefs').eq('user_id', ctx.userId).maybeSingle(),
    ]);
    // The user can turn mission ideas off ("Only when I ask") on their Insight Profile.
    const ideasOff = (prefsRes as any)?.data?.conversation_prefs?.ideas === 'ask_first';

    // Only a still-true reason is shown back to the user (retired ones are theirs to drop).
    const withReason = (openRes.data || []).map((e: any) => {
      const reason = Array.isArray(e.reason) ? e.reason[0] : e.reason;
      return { ...e, reason: reason?.still_true ? reason.reason_text : null, reason_id: reason?.still_true ? reason.id : null };
    });
    const due = withReason.filter(e => !e.check_in_on || e.check_in_on <= today);
    // The history query needs the v1.2 columns; before the migration there is no history.
    const history = ((historyRes as any).error ? [] : (historyRes as any).data || []) as MissionHistoryRow[];
    const suggestion = ideasOff ? null : suggestMission({
      northStarLine,
      ownReason: (reasonRes as any)?.data?.reason_text ?? null,
      openCount: withReason.length,
      history,
      declinedSkills: declined,
    });
    return res.status(200).json({
      due,
      open: withReason,
      recent: recentRes.data || [],
      capacity: capacityFromHistory(history),
      suggestion,
      identity_line: northStarLine,
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const fromSuggestion = body.from_suggestion && isSkillKey(body.from_suggestion.skill_key)
      ? { skill_key: body.from_suggestion.skill_key as string, level: Number(body.from_suggestion.difficulty_level) || 1 }
      : null;
    const cue = cleanText(body.cue, 200);
    let intention = cleanText(body.intention, 300);
    // An accepted idea the user didn't reshape: build its text from the ladder.
    if (!intention && fromSuggestion) {
      const step = ladderStep(fromSuggestion.skill_key as any, fromSuggestion.level);
      if (step) intention = missionText(step.cue, step.intention);
    }
    if (!intention) return res.status(400).json({ error: 'intention is required' });
    const reason = cleanReason(body.reason);
    const domain = isDomain(body.domain) ? body.domain : 'self';
    const base = {
      user_id: ctx.userId,
      intention,
      origin: fromSuggestion ? 'peter_suggested' : 'user',
      check_in_on: isoDatePlus(2),
    };
    const { data, error } = await withSchemaFallback<any>(
      () => db.from('experiments').insert({
        ...base,
        kind: fromSuggestion || cue ? 'mission' : 'experiment',
        cue,
        skill_key: fromSuggestion?.skill_key ?? null,
        difficulty_level: fromSuggestion ? fromSuggestion.level : null,
        domain,
        environment_note: cleanText(body.environment_note, 300),
        accepted_from_suggestion: Boolean(fromSuggestion),
      }).select('id, intention, status, check_in_on').single(),
      () => db.from('experiments').insert(base).select('id, intention, status, check_in_on').single(),
    );
    if (error || !data) return res.status(500).json({ error: 'Could not save your experiment' });
    // Self-persuasion (constitution v1.1): the user's own reason, in their words.
    const reasonId = reason ? await saveExperimentReason(db, ctx.userId, data.id, reason, 'experiment_card') : null;
    trackEvent(db, ctx.userId, 'experiment_created', {
      origin: base.origin, has_reason: Boolean(reasonId), domain, skill: fromSuggestion?.skill_key ?? null,
    });
    return res.status(200).json({ experiment: { ...data, reason: reasonId ? reason : null } });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as {
      id?: string; action?: string; status?: string; outcome?: string; outcome_note?: string;
      snooze_days?: number; reason?: string; learning?: MissionLearning; environment_note?: string;
      intention?: string; cue?: string; smaller?: boolean;
    };
    const { id, status, outcome, outcome_note, snooze_days, reason } = body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    // Add or rewrite the user's own reason without touching the experiment's status.
    if (reason !== undefined && status === undefined && body.action === undefined) {
      const text = cleanReason(reason);
      const { data: exp } = await db
        .from('experiments').select('id, reason_id').eq('id', id).eq('user_id', ctx.userId).maybeSingle();
      if (!exp) return res.status(404).json({ error: 'Experiment not found' });
      if (exp.reason_id) {
        // Rewriting retires the old reason and keeps a history (revised_at).
        await db.from('user_reasons')
          .update({ still_true: false, revised_at: new Date().toISOString() })
          .eq('id', exp.reason_id).eq('user_id', ctx.userId);
        await db.from('experiments').update({ reason_id: null }).eq('id', id).eq('user_id', ctx.userId);
      }
      const reasonId = text ? await saveExperimentReason(db, ctx.userId, id, text, 'experiment_card') : null;
      return res.status(200).json({ experiment: { id, reason: reasonId ? text : null } });
    }

    const gotInTheWay = isGotInTheWay(body.learning?.what_got_in_way) ? body.learning!.what_got_in_way as keyof typeof GOT_IN_THE_WAY_LABELS : null;

    // Reshape: a setback becomes a new, adapted version (§11A adaptation).
    if (body.action === 'revise') {
      const newIntention = cleanText(body.intention, 300);
      if (!newIntention) return res.status(400).json({ error: 'intention is required' });
      const { data: old } = await withSchemaFallback<any>(
        () => db.from('experiments').select('id, reason_id, skill_key, difficulty_level, domain').eq('id', id).eq('user_id', ctx.userId).maybeSingle(),
        () => db.from('experiments').select('id, reason_id').eq('id', id).eq('user_id', ctx.userId).maybeSingle(),
      );
      if (!old) return res.status(404).json({ error: 'Experiment not found' });
      const level = typeof old.difficulty_level === 'number'
        ? Math.max(1, old.difficulty_level - (body.smaller ? 1 : 0))
        : null;
      const base = { user_id: ctx.userId, intention: newIntention, origin: 'user', check_in_on: isoDatePlus(2), reason_id: old.reason_id ?? null };
      const { data: created, error } = await withSchemaFallback<any>(
        () => db.from('experiments').insert({
          ...base, kind: 'mission', cue: cleanText(body.cue, 200), revised_from: id,
          skill_key: old.skill_key ?? null, difficulty_level: level, domain: old.domain ?? 'self',
        }).select('id, intention, status, check_in_on').single(),
        () => db.from('experiments').insert(base).select('id, intention, status, check_in_on').single(),
      );
      if (error || !created) return res.status(500).json({ error: 'Could not save the new version' });
      const resolved = { resolved_at: new Date().toISOString() };
      await withSchemaFallback(
        () => db.from('experiments').update({ ...resolved, status: 'revised', learning: { what_got_in_way: gotInTheWay } })
          .eq('id', id).eq('user_id', ctx.userId),
        () => db.from('experiments').update({ ...resolved, status: 'let_go' }).eq('id', id).eq('user_id', ctx.userId),
      );
      trackEvent(db, ctx.userId, 'experiment_resolved', { status: 'revised', got_in_the_way: gotInTheWay, smaller: Boolean(body.smaller) });
      return res.status(200).json({ experiment: created, revised_from: id });
    }

    if (!STATUSES.includes(status as typeof STATUSES[number])) {
      return res.status(400).json({ error: 'a valid status is required' });
    }
    if (outcome != null && !OUTCOMES.includes(outcome as typeof OUTCOMES[number])) {
      return res.status(400).json({ error: 'Invalid outcome' });
    }
    const note = cleanText(outcome_note, 500);
    const learning: MissionLearning | null = body.learning
      ? {
          felt: isFelt(body.learning.felt) ? body.learning.felt : null,
          what_helped: cleanText(body.learning.what_helped, 300),
          what_got_in_way: gotInTheWay,
          surprise: cleanText(body.learning.surprise, 300),
        }
      : null;

    // "Not yet, keep it" re-plans the check-in instead of resolving.
    const v11Update =
      status === 'planned'
        ? { check_in_on: isoDatePlus(Math.min(7, Math.max(1, Number(snooze_days) || 2))) }
        : {
            status,
            outcome: status === 'tried' ? outcome ?? null : null,
            outcome_note: note,
            resolved_at: new Date().toISOString(),
          };
    const v12Extra = status === 'planned'
      ? (learning ? { learning } : {})
      : { learning, environment_note: cleanText(body.environment_note, 300) };

    const { data, error } = await withSchemaFallback<any>(
      () => db.from('experiments').update({ ...v11Update, ...v12Extra }).eq('id', id).eq('user_id', ctx.userId)
        .select('id, intention, status, outcome, outcome_note, reason_id').maybeSingle(),
      () => db.from('experiments').update(v11Update).eq('id', id).eq('user_id', ctx.userId)
        .select('id, intention, status, outcome, outcome_note, reason_id').maybeSingle(),
    );
    if (error) return res.status(500).json({ error: 'Could not update your experiment' });
    if (!data) return res.status(404).json({ error: 'Experiment not found' });

    // "It doesn't matter to me now" retires the reason everywhere: no reminder,
    // mission idea or Peter line may lean on it again (constitution §12).
    if (gotInTheWay === 'not_important_now' && data.reason_id) {
      await db.from('user_reasons')
        .update({ still_true: false, revised_at: new Date().toISOString() })
        .eq('id', data.reason_id).eq('user_id', ctx.userId);
    }

    // What happened is growth evidence (§4, §11) — including what got in the way.
    if (data.status === 'tried') {
      const how = data.outcome === 'helped' ? 'it helped' : data.outcome === 'mixed' ? 'it was mixed' : data.outcome === 'didnt_help' ? "it didn't help" : 'they tried it';
      const felt = learning?.felt === 'easy' ? ' It felt easy.' : learning?.felt === 'too_much' ? ' It felt like too much.' : learning?.felt === 'stretch' ? ' It was a stretch.' : '';
      await storeLearningMemory(
        `They tried "${data.intention.slice(0, 160)}" and ${how}${data.outcome_note ? `: ${data.outcome_note.slice(0, 160)}` : ''}.${felt}`,
        0.6,
      );
    } else if (gotInTheWay && gotInTheWay !== 'not_important_now') {
      await storeLearningMemory(
        `They planned "${data.intention.slice(0, 160)}" but it didn't happen yet — ${GOT_IN_THE_WAY_LABELS[gotInTheWay].toLowerCase()}. That's information, not failure.`,
        0.4,
      );
    }
    trackEvent(db, ctx.userId, 'experiment_resolved', { status: data.status, outcome: data.outcome, felt: learning?.felt ?? null, got_in_the_way: gotInTheWay });
    return res.status(200).json({ experiment: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
