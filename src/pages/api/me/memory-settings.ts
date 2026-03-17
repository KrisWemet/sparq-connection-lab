import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { deleteUserMemories } from '@/lib/server/memory';

type MemoryWindow = 'none' | '90_days' | 'indefinite';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data } = await ctx.supabase
      .from('user_preferences')
      .select('memory_window')
      .eq('user_id', ctx.userId)
      .maybeSingle();

    return res.status(200).json({
      memory_window: data?.memory_window || 'indefinite',
    });
  }

  if (req.method === 'PATCH') {
    const { memory_window } = req.body as { memory_window: MemoryWindow };

    if (!['none', '90_days', 'indefinite'].includes(memory_window)) {
      return res.status(400).json({ error: 'Invalid memory_window value' });
    }

    await ctx.supabase.from('user_preferences').upsert(
      {
        user_id: ctx.userId,
        memory_window,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    // If set to "none", delete all existing memories
    if (memory_window === 'none') {
      try {
        await deleteUserMemories(ctx.userId);
      } catch (err) {
        console.error('Failed to delete memories on setting none:', err);
      }
    }

    return res.status(200).json({ memory_window });
  }

  if (req.method === 'DELETE') {
    // Explicit "delete all my memories" action
    try {
      await deleteUserMemories(ctx.userId);
      return res.status(200).json({ deleted: true });
    } catch (err) {
      console.error('Failed to delete user memories:', err);
      return res.status(500).json({ error: 'Failed to delete memories' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
