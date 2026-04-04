import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getPlayfulConnectionToday } from '@/lib/server/playful-connection';
import { isPlayfulLayerEnabledForUser } from '@/lib/server/playful-rollout';

function localDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const enabled = await isPlayfulLayerEnabledForUser(ctx.supabase, ctx.userId);
  if (!enabled) {
    return res.status(200).json({
      dateKey: localDateString(),
      dailySpark: null,
      favoriteUs: null,
    });
  }

  const payload = getPlayfulConnectionToday({
    userId: ctx.userId,
    dateKey: localDateString(),
    dailySparkOffset: req.query.dailySparkOffset,
    favoriteUsOffset: req.query.favoriteUsOffset,
  });

  return res.status(200).json(payload);
}
