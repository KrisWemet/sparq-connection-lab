import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { generateGreeting } from '@/lib/server/generate-greeting';

type CompleteBody = {
  session_id: string;
  confidence_before: number;
  confidence_after: number;
  peter_anchor: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body || {}) as CompleteBody;
  const { session_id, confidence_before, confidence_after, peter_anchor } = body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const { data: session, error: findError } = await ctx.supabase
    .from('rehearsal_sessions')
    .select('*')
    .eq('id', session_id)
    .eq('user_id', ctx.userId)
    .single();

  if (findError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { error: updateError } = await ctx.supabase
    .from('rehearsal_sessions')
    .update({
      completed: true,
      confidence_before,
      confidence_after,
      peter_anchor,
    })
    .eq('id', session_id)
    .eq('user_id', ctx.userId);

  if (updateError) {
    console.error('Rehearsal complete update error:', updateError);
    return res.status(500).json({ error: 'Peter is having a moment. Please try again.' });
  }

  // Fire-and-forget: generate Peter's greeting referencing the rehearsal
  // Pass peter_anchor as the "reflection" so tomorrow's greeting can reference it
  generateGreeting(ctx.supabase, ctx.userId, peter_anchor ?? '', 0, null);

  return res.status(200).json({ success: true });
}
