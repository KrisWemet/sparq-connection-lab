import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { loadPrivacyState } from '@/lib/server/privacy';
import { addDistilledMemories } from '@/lib/server/memory';
import { trackEvent } from '@/lib/server/analytics';

/**
 * The user completes the mirror's interpretation (constitution §9, §11).
 * Their answer is saved on the mirror and as a self-discovery — a conclusion
 * they reached themselves, which Peter weighs above his own guesses.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { week_start, reflection } = (req.body || {}) as { week_start?: string; reflection?: string };
  const text = typeof reflection === 'string' ? reflection.trim().slice(0, 1000) : '';
  if (!week_start || !/^\d{4}-\d{2}-\d{2}$/.test(week_start) || !text) {
    return res.status(400).json({ error: 'week_start and reflection are required' });
  }

  const { data: mirror, error } = await ctx.supabase
    .from('weekly_mirrors')
    .update({ user_reflection: text, user_reflected_at: new Date().toISOString() })
    .eq('user_id', ctx.userId)
    .eq('week_start', week_start)
    .select('id, mirror_question')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not save your reflection' });
  if (!mirror) return res.status(404).json({ error: 'Mirror not found' });

  const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
  if (privacy.can_store_memories) {
    await ctx.supabase.from('self_discoveries').insert({
      user_id: ctx.userId,
      discovery: text.slice(0, 300),
      context: mirror.mirror_question ? `Weekly mirror: ${mirror.mirror_question}` : 'Weekly mirror',
      source: 'mirror',
    });
    const metadata: Record<string, any> = { source: 'weekly_mirror' };
    if (privacy.preferences.memory_window === '90_days') {
      metadata.expires_at = new Date(Date.now() + 90 * 86_400_000).toISOString();
    }
    await addDistilledMemories(
      ctx.userId,
      [{ text: `Looking back at their week, they concluded: ${text.slice(0, 280)}`, kind: 'discovery', importance: 0.8 }],
      metadata,
    ).catch(() => 0);
  }

  trackEvent(ctx.supabase, ctx.userId, 'mirror_reflected', { week_start });
  return res.status(200).json({ saved: true });
}
