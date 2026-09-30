import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { buildPeterInstruction } from '@/lib/peterService';
import { stripMarkdown } from '@/lib/strip-markdown';

/**
 * Shared Peter (constitution §8). Offers the couple one question to talk
 * about together, built ONLY from what both partners explicitly shared
 * (shared_items + interaction_cycles, read through RLS). It never reads
 * either partner's private data and never decides whose account is true.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { data: spaceId } = await ctx.supabase.rpc('ensure_couple_space');
  if (typeof spaceId !== 'string') return res.status(409).json({ error: 'Link with your partner first.' });

  const [{ data: items }, { data: cycles }] = await Promise.all([
    ctx.supabase.from('shared_items').select('author_id, kind, body, created_at')
      .eq('couple_space_id', spaceId).order('created_at', { ascending: false }).limit(12),
    ctx.supabase.from('interaction_cycles').select('name, what_helps, status')
      .eq('couple_space_id', spaceId).neq('status', 'retired').limit(3),
  ]);
  if (!items || items.length === 0) {
    return res.status(200).json({ question: null, message: 'Share something first, and I can help you two talk about it.' });
  }

  // Authors are labelled as Partner 1 / Partner 2 — Peter reflects both
  // perspectives without ranking them.
  const authors = Array.from(new Set(items.map(i => i.author_id)));
  const label = (id: string) => `Partner ${authors.indexOf(id) + 1}`;
  const shared = items.map(i => `- ${label(i.author_id)} shared (${i.kind}): "${i.body}"`).join('\n');
  const cycleLines = (cycles || []).map(c => `- A pattern they ${c.status === 'confirmed' ? 'both named' : 'are considering'}: "${c.name}"${c.what_helps ? ` (what helps: ${c.what_helps})` : ''}`).join('\n');

  const task = `You are Shared Peter, helping a couple talk with each other. You only know what they chose to share:
${shared}
${cycleLines}

Offer ONE warm, open question they can talk about together tonight, plus one short sentence of why it might be worth asking.
- Build only on what they shared. Never guess at anything else.
- Hold both perspectives as true for each person. Never take a side or decide what really happened.
- The cycle between them is the problem, never either person.
- Do not use "Partner 1" or "Partner 2" in your reply. Speak to them as "you two".
Return JSON: {"question": "...", "why": "..."}`;

  try {
    const raw = await peterChat({ messages: [{ role: 'user', content: buildPeterInstruction(task) }], maxTokens: 220 });
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : null;
    const question = typeof parsed?.question === 'string' ? stripMarkdown(parsed.question) : null;
    const why = typeof parsed?.why === 'string' ? stripMarkdown(parsed.why) : null;
    return res.status(200).json({ question, why });
  } catch {
    return res.status(200).json({ question: 'What is one thing either of you shared here that you want to understand a little better?', why: null, fallback: true });
  }
}
