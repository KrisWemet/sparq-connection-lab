import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { encryptText, decryptText, isEncrypted } from '@/lib/server/encryption';

type SaveBody = {
  screen_1: string;
  screen_2: string;
  screen_3: string;
  trigger_source?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const body = (req.body || {}) as SaveBody;
    if (!body.screen_1 || !body.screen_2 || !body.screen_3) {
      return res.status(400).json({ error: 'All three screen responses are required' });
    }

    const triggerSource = body.trigger_source ?? 'scheduled';
    const isScheduled = triggerSource === 'scheduled' || triggerSource === 'recurring';

    const { data, error } = await ctx.supabase
      .from('reflections')
      .insert({
        user_id: ctx.userId,
        prime_type: 'neutral_observer_reflection',
        screen_1_response: encryptText(body.screen_1, ctx.userId),
        screen_2_response: encryptText(body.screen_2, ctx.userId),
        screen_3_response: encryptText(body.screen_3, ctx.userId),
        trigger_source: triggerSource,
      })
      .select('id, created_at')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save reflection' });
    }

    // Advance quarterly schedule only for scheduled (not on-demand/conflict-triggered) completions
    if (isScheduled) {
      await ctx.supabase
        .from('profiles')
        .update({ next_neutral_observer_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', ctx.userId);
    }

    return res.status(201).json(data);
  }

  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('reflections')
      .select('id, screen_1_response, screen_2_response, screen_3_response, trigger_source, created_at')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }

    const decrypted = (data ?? []).map((row) => ({
      id: row.id,
      screen_1_response: row.screen_1_response && isEncrypted(row.screen_1_response)
        ? decryptText(row.screen_1_response, ctx.userId)
        : (row.screen_1_response ?? ''),
      screen_2_response: row.screen_2_response && isEncrypted(row.screen_2_response)
        ? decryptText(row.screen_2_response, ctx.userId)
        : (row.screen_2_response ?? ''),
      screen_3_response: row.screen_3_response && isEncrypted(row.screen_3_response)
        ? decryptText(row.screen_3_response, ctx.userId)
        : (row.screen_3_response ?? ''),
      trigger_source: row.trigger_source,
      created_at: row.created_at,
    }));

    return res.status(200).json(decrypted);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
