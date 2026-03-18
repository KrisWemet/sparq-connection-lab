import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

type PreferencesPatchBody = {
  insights_visible?: boolean;
  personalization_enabled?: boolean;
  ai_memory_mode?: 'rolling_90_days' | 'indefinite';
  relationship_mode?: 'solo' | 'partnered';
  reminder_time?: string | null;
  notifications_enabled?: boolean;
  timezone?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', ctx.userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to load preferences' });
    }
    // Return defaults if no preferences row exists yet
    return res.status(200).json({
      preferences: data || {
        user_id: ctx.userId,
        insights_visible: true,
        personalization_enabled: true,
        ai_memory_mode: 'rolling_90_days',
        relationship_mode: 'solo',
        reminder_time: '09:00',
        notifications_enabled: true,
        timezone: null,
      },
    });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as PreferencesPatchBody;
    const allowed: PreferencesPatchBody = {};

    if (typeof body.insights_visible === 'boolean') {
      allowed.insights_visible = body.insights_visible;
    }
    if (typeof body.personalization_enabled === 'boolean') {
      allowed.personalization_enabled = body.personalization_enabled;
    }
    if (body.ai_memory_mode === 'rolling_90_days' || body.ai_memory_mode === 'indefinite') {
      allowed.ai_memory_mode = body.ai_memory_mode;
    }
    if (body.relationship_mode === 'solo' || body.relationship_mode === 'partnered') {
      allowed.relationship_mode = body.relationship_mode;
    }
    if (typeof body.reminder_time === 'string' || body.reminder_time === null) {
      allowed.reminder_time = body.reminder_time;
    }
    if (typeof body.notifications_enabled === 'boolean') {
      allowed.notifications_enabled = body.notifications_enabled;
    }
    if (typeof body.timezone === 'string') {
      allowed.timezone = body.timezone;
    }

    const { data, error } = await ctx.supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: ctx.userId,
          ...allowed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    return res.status(200).json({ saved: true, preferences: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

