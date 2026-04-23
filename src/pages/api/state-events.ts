import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

const VALID_STATE_TAGS = ['just_had_conflict', 'partner_shared_good_news', 'feeling_disconnected', 'tense_anxious'] as const;
type StateTag = typeof VALID_STATE_TAGS[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { state_tag } = (req.body || {}) as { state_tag?: StateTag };
  if (!state_tag || !VALID_STATE_TAGS.includes(state_tag)) {
    return res.status(400).json({ error: 'Invalid state_tag' });
  }

  const { error } = await ctx.supabase.from('user_state_events').insert({
    user_id: ctx.userId,
    state_tag,
  });

  if (error) {
    return res.status(500).json({ error: 'Failed to log state event' });
  }

  return res.status(200).json({ ok: true });
}
