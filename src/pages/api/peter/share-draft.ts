import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { buildPeterInstruction } from '@/lib/peterService';
import { stripMarkdown } from '@/lib/strip-markdown';

/**
 * "Help me put this into words" (constitution §8). The user hands Peter one
 * of their own private thoughts; Peter drafts a short first-person message
 * they can edit. NOTHING is stored or shared here — sharing is a separate,
 * explicit POST /api/couple by the user after they've read and edited it.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const text = typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 1000) : '';
  if (!text) return res.status(400).json({ error: 'text is required' });

  const { data: profile } = await ctx.supabase.from('profiles').select('partner_name').eq('id', ctx.userId).maybeSingle();
  const partner = profile?.partner_name?.trim() || 'your partner';

  const task = `The user wants help sharing one of their own private thoughts with ${partner}. Here is what they wrote privately:
"""
${text}
"""
Write a short message (2-3 sentences) they could send to ${partner}, in the user's own voice, first person ("I").
- Keep their meaning and as many of their words as you can. Do not add feelings or facts they did not say.
- Soft and honest. Talk about "I" and "us", never blame or "you always".
- No advice, no request for a reply unless they asked for one, no emoji, no sign-off.
Return only the message text.`;

  try {
    const draft = await peterChat({ messages: [{ role: 'user', content: buildPeterInstruction(task) }], maxTokens: 200 });
    return res.status(200).json({ draft: stripMarkdown(draft).replace(/^"|"$/g, '').trim() });
  } catch {
    // Fail-soft: their own words are always a valid draft.
    return res.status(200).json({ draft: text, fallback: true });
  }
}
