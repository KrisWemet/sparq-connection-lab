import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { knowledgeLevel } from '@/lib/server/trait-revision';
import { cleanPrefs, describeGuess, GUESS_TOPICS, isValidPref } from '@/lib/server/insight-profile';
import { trackEvent } from '@/lib/server/analytics';
import { capacityFromHistory, type MissionHistoryRow } from '@/lib/missions';

/**
 * "How I see things most clearly" — the user-visible Insight Profile
 * (constitution v1.1 §3: user-visible and user-correctable; docs/PERSON_MODEL.md §8).
 *
 * GET   → { prefs, guesses, rejected, reasons, conditions, practice }
 * PATCH → { action: 'set_pref', key, value|null }
 *       | { action: 'unreject', id }        (bring a rejected guess back)
 *       | { action: 'retire_reason', id }   (a reason that isn't true anymore)
 *       | { action: 'clear_condition', id } (remove an "easier or harder" note)
 * Trait "does this fit?" answers go to PATCH /api/profile/traits.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const [prefsRow, traits, rejected, reasons, practiceRows] = await Promise.all([
      ctx.supabase.from('user_preferences').select('conversation_prefs').eq('user_id', ctx.userId).maybeSingle(),
      ctx.supabase.from('profile_traits')
        .select('trait_key, inferred_value, confidence, status, source, sensitivity, user_feedback, last_evidence_at, updated_at')
        .eq('user_id', ctx.userId)
        .in('trait_key', Object.keys(GUESS_TOPICS)),
      ctx.supabase.from('rejected_hypotheses')
        .select('id, offered_text, user_response, created_at')
        .eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(20),
      ctx.supabase.from('user_reasons')
        .select('id, reason_text, attached_type, attached_id, created_at')
        .eq('user_id', ctx.userId).eq('still_true', true).order('created_at', { ascending: false }).limit(20),
      // v1.2 environment notes (§3, §11A) and practice history (capacity).
      // Errors (before the v1.2 migration) just mean "nothing yet".
      ctx.supabase.from('experiments')
        .select('id, intention, environment_note, skill_key, difficulty_level, status, outcome, learning, resolved_at')
        .eq('user_id', ctx.userId).neq('status', 'planned')
        .order('resolved_at', { ascending: false }).limit(60),
    ]);
    const practice = (practiceRows.error ? [] : practiceRows.data || []) as Array<MissionHistoryRow & { id: string; intention: string; environment_note?: string | null }>;

    // Name the experiment each reason belongs to.
    const expIds = (reasons.data || []).filter(r => r.attached_type === 'experiment' && r.attached_id).map(r => r.attached_id);
    const { data: exps } = expIds.length
      ? await ctx.supabase.from('experiments').select('id, intention').in('id', expIds)
      : { data: [] as Array<{ id: string; intention: string }> };
    const intentionById = new Map((exps || []).map(e => [e.id, e.intention]));

    const guesses = (traits.data || [])
      .map(t => {
        const text = describeGuess(t.trait_key, t.inferred_value);
        if (!text) return null;
        const level = knowledgeLevel(t);
        return {
          trait_key: t.trait_key,
          topic: GUESS_TOPICS[t.trait_key],
          text,
          level, // told | evidence | wondering | excluded
          status: t.status,
          user_feedback: t.user_feedback,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      prefs: cleanPrefs(prefsRow.data?.conversation_prefs),
      guesses,
      rejected: rejected.data || [],
      reasons: (reasons.data || []).map(r => ({
        id: r.id,
        reason_text: r.reason_text,
        for_what: r.attached_type === 'north_star'
          ? 'who you want to become'
          : r.attached_id ? intentionById.get(r.attached_id) ?? null : null,
      })),
      // In their own words, never summarised (environment is data, not a judgment).
      conditions: practice.filter(p => p.environment_note).slice(0, 8)
        .map(p => ({ id: p.id, note: p.environment_note, for_what: p.intention })),
      practice: capacityFromHistory(practice),
    });
  }

  if (req.method === 'PATCH') {
    const { action, key, value, id } = (req.body || {}) as { action?: string; key?: string; value?: string | null; id?: string };

    if (action === 'set_pref') {
      if (!key || !isValidPref(key, value ?? null)) return res.status(400).json({ error: 'Invalid preference' });
      const { data: row } = await ctx.supabase.from('user_preferences').select('conversation_prefs').eq('user_id', ctx.userId).maybeSingle();
      const prefs = cleanPrefs(row?.conversation_prefs);
      if (value) prefs[key] = value; else delete prefs[key];
      const { error } = await ctx.supabase.from('user_preferences')
        .upsert({ user_id: ctx.userId, conversation_prefs: prefs, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) return res.status(500).json({ error: 'Could not save that' });
      trackEvent(ctx.supabase, ctx.userId, 'conversation_pref_set', { key, cleared: !value });
      return res.status(200).json({ prefs });
    }

    if (action === 'unreject' && id) {
      const { data: row } = await ctx.supabase.from('rejected_hypotheses')
        .select('hypothesis_ref').eq('id', id).eq('user_id', ctx.userId).maybeSingle();
      const { error } = await ctx.supabase.from('rejected_hypotheses').delete().eq('id', id).eq('user_id', ctx.userId);
      if (error) return res.status(500).json({ error: 'Could not update that' });
      // A rejected trait becomes an open guess again (the user can confirm it on this page).
      if (row?.hypothesis_ref?.startsWith('trait:')) {
        await ctx.supabase.from('profile_traits')
          .update({ status: 'hypothesis', user_feedback: null, effective_weight: 1.0, confirmed_at: null, updated_at: new Date().toISOString() })
          .eq('user_id', ctx.userId).eq('trait_key', row.hypothesis_ref.slice('trait:'.length)).eq('status', 'rejected');
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'retire_reason' && id) {
      const { error } = await ctx.supabase.from('user_reasons')
        .update({ still_true: false, revised_at: new Date().toISOString() })
        .eq('id', id).eq('user_id', ctx.userId);
      if (error) return res.status(500).json({ error: 'Could not update that' });
      return res.status(200).json({ ok: true });
    }

    if (action === 'clear_condition' && id) {
      const { error } = await ctx.supabase.from('experiments')
        .update({ environment_note: null }).eq('id', id).eq('user_id', ctx.userId);
      if (error) return res.status(500).json({ error: 'Could not update that' });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
