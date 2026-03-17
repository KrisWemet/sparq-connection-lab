import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';
import { trackEvent } from '@/lib/server/analytics';

type StartJourneyBody = {
  journey_id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { journey_id } = (req.body || {}) as StartJourneyBody;
  if (!journey_id) {
    return res.status(400).json({ error: 'journey_id is required' });
  }

  const { data: journey, error: journeyError } = await ctx.supabase
    .from('journeys')
    .select('id, title, premium_only')
    .eq('id', journey_id)
    .maybeSingle();

  if (journeyError) {
    console.error('Journey lookup failed:', journeyError);
    return res.status(500).json({ error: 'Failed to load journey' });
  }

  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }

  const { data: existing, error: existingError } = await ctx.supabase
    .from('user_journeys')
    .select('*')
    .eq('user_id', ctx.userId)
    .eq('journey_id', journey_id)
    .maybeSingle();

  if (existingError) {
    console.error('Journey progress lookup failed:', existingError);
    return res.status(500).json({ error: 'Failed to check existing journey progress' });
  }

  if (existing) {
    const { data: reactivated, error: reactivateError } = await ctx.supabase
      .from('user_journeys')
      .update({ is_active: true })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (reactivateError) {
      console.error('Journey reactivation failed:', reactivateError);
      return res.status(500).json({ error: 'Failed to reactivate journey' });
    }

    return res.status(200).json({ journey: reactivated, reused: true });
  }

  const entitlements = await resolveEntitlements(ctx.supabase, ctx.userId);
  if (journey.premium_only && entitlements.tier === 'free') {
    return res.status(403).json({
      error: 'premium_required',
      message: 'This journey requires Premium.',
    });
  }

  if (entitlements.starter_quests_limit != null) {
    const { count, error: countError } = await ctx.supabase
      .from('user_journeys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ctx.userId);

    if (countError) {
      console.error('Journey count failed:', countError);
      return res.status(500).json({ error: 'Failed to check starter quest allowance' });
    }

    if ((count || 0) >= entitlements.starter_quests_limit) {
      return res.status(403).json({
        error: 'starter_quest_limit_reached',
        message: 'You reached your free-plan journey limit.',
        limit: entitlements.starter_quests_limit,
      });
    }
  }

  const { data: created, error: createError } = await ctx.supabase
    .from('user_journeys')
    .insert({
      user_id: ctx.userId,
      journey_id,
      progress: 0,
      is_active: true,
      start_date: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (createError || !created) {
    console.error('Journey start failed:', createError);
    return res.status(500).json({ error: 'Failed to start journey' });
  }

  await trackEvent(ctx.supabase, ctx.userId, 'journey_started', {
    journey_id,
    journey_title: journey.title,
    premium_only: !!journey.premium_only,
    tier: entitlements.tier,
  });

  return res.status(200).json({ journey: created, reused: false });
}
