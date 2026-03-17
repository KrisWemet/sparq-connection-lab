import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { resolveEntitlements } from '@/lib/server/entitlements';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const entitlements = await resolveEntitlements(ctx.supabase, ctx.userId);
  return res.status(200).json({
    tier: entitlements.tier,
    loop_allowance: entitlements.loop_limit_per_week,
    coach_message_cap: entitlements.coach_message_limit_per_day,
    starter_quests_cap: entitlements.starter_quests_limit,
    features: {
      conflict_first_aid: true,
      crisis_support: true,
      full_daily_engine: entitlements.tier === 'premium',
      full_quest_library: entitlements.tier === 'premium',
      unlimited_coach: entitlements.tier === 'premium',
      skill_dashboard: entitlements.tier === 'premium',
    },
  });
}
