import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { loadPrivacyState } from '@/lib/server/privacy';
import { addDistilledMemories } from '@/lib/server/memory';
import { getAllGrowthMoments, describeMomentsForMirror } from '@/lib/server/growth-moments';
import { getActiveNorthStar } from '@/lib/server/north-star';
import { trackEvent } from '@/lib/server/analytics';

/**
 * Day 30: The Mirror (constitution §9, §11). Deterministic — it only cites
 * what the user said, discovered, tried and what the growth engine verified,
 * then the user writes the conclusion. No AI interpretation of who they are.
 */
const CONCLUSION_CONTEXT = 'Day 30 mirror';
const MIRROR_DAY = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('created_at, psychological_profile')
      .eq('id', ctx.userId)
      .maybeSingle();
    const createdAt = profile?.created_at ? new Date(profile.created_at) : null;
    const days = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 86_400_000) : 0;
    if (days < MIRROR_DAY) return res.status(200).json({ eligible: false, days });

    const [northStar, discoveries, tried, moments, conclusion] = await Promise.all([
      getActiveNorthStar(ctx.supabase, ctx.userId),
      ctx.supabase.from('self_discoveries').select('discovery, created_at').eq('user_id', ctx.userId)
        .eq('still_true', true).neq('context', CONCLUSION_CONTEXT).order('created_at', { ascending: true }).limit(5),
      ctx.supabase.from('experiments').select('intention, outcome, outcome_note').eq('user_id', ctx.userId)
        .eq('status', 'tried').order('resolved_at', { ascending: true }).limit(5),
      getAllGrowthMoments(ctx.supabase, ctx.userId),
      ctx.supabase.from('self_discoveries').select('discovery, created_at').eq('user_id', ctx.userId)
        .eq('context', CONCLUSION_CONTEXT).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const growthGoal = (profile?.psychological_profile as { growthGoal?: string } | null)?.growthGoal ?? null;
    return res.status(200).json({
      eligible: true,
      days,
      why_arrived: growthGoal && growthGoal.trim() ? growthGoal.trim() : null,
      north_star: northStar,
      discoveries: (discoveries.data || []).map(d => d.discovery),
      tried: tried.data || [],
      changing: describeMomentsForMirror(moments).slice(0, 4),
      conclusion: conclusion.data?.discovery ?? null,
    });
  }

  if (req.method === 'POST') {
    const text = typeof req.body?.conclusion === 'string' ? req.body.conclusion.trim().slice(0, 1000) : '';
    if (!text) return res.status(400).json({ error: 'conclusion is required' });

    // The conclusion is theirs regardless of memory settings: it is saved as
    // the answer they wrote. Only the Peter-recall copy honours memory mode.
    const { error } = await ctx.supabase.from('self_discoveries').insert({
      user_id: ctx.userId,
      discovery: text,
      context: CONCLUSION_CONTEXT,
      source: 'mirror',
    });
    if (error) return res.status(500).json({ error: 'Could not save your conclusion' });

    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
    if (privacy.can_store_memories) {
      const metadata: Record<string, any> = { source: 'thirty_day_mirror' };
      if (privacy.preferences.memory_window === '90_days') {
        metadata.expires_at = new Date(Date.now() + 90 * 86_400_000).toISOString();
      }
      await addDistilledMemories(
        ctx.userId,
        [{ text: `At day 30 they wrote about who they are becoming: ${text.slice(0, 280)}`, kind: 'discovery', importance: 0.9 }],
        metadata,
      ).catch(() => 0);
    }
    trackEvent(ctx.supabase, ctx.userId, 'thirty_day_mirror_concluded', {});
    return res.status(200).json({ saved: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
