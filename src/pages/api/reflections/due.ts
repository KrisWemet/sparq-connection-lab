// Lightweight due-check for the quarterly card (spec §4). Returns only a
// boolean — never decrypts reflection bodies (no plaintext exposure for a
// dashboard ping). Due when the user is onboarded AND
// next_neutral_observer_due is null (never done) or in the past.

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { data } = await ctx.supabase
    .from('profiles')
    .select('next_neutral_observer_due, isonboarded')
    .eq('id', ctx.userId)
    .maybeSingle();

  const onboarded = Boolean(data?.isonboarded);
  const dueAt = data?.next_neutral_observer_due ? new Date(data.next_neutral_observer_due).getTime() : null;
  const due = onboarded && (dueAt === null || dueAt <= Date.now());
  return res.status(200).json({ due });
}
