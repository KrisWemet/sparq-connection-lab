import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { decryptText, isEncrypted } from '@/lib/server/encryption';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid reflection id' });
  }

  const { data, error } = await ctx.supabase
    .from('reflections')
    .select('id, screen_1_response, screen_2_response, screen_3_response, trigger_source, created_at')
    .eq('id', id)
    .eq('user_id', ctx.userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Reflection not found' });
  }

  return res.status(200).json({
    id: data.id,
    screen_1_response: data.screen_1_response && isEncrypted(data.screen_1_response)
      ? decryptText(data.screen_1_response, ctx.userId)
      : (data.screen_1_response ?? ''),
    screen_2_response: data.screen_2_response && isEncrypted(data.screen_2_response)
      ? decryptText(data.screen_2_response, ctx.userId)
      : (data.screen_2_response ?? ''),
    screen_3_response: data.screen_3_response && isEncrypted(data.screen_3_response)
      ? decryptText(data.screen_3_response, ctx.userId)
      : (data.screen_3_response ?? ''),
    trigger_source: data.trigger_source,
    created_at: data.created_at,
  });
}
