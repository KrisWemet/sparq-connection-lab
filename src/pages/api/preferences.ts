import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import {
  CURRENT_CONSENT_VERSION,
  deriveMemoryWindow,
  getDefaultPrivacyPreferences,
  loadPrivacyState,
  type AiMemoryMode,
} from '@/lib/server/privacy';

type PreferencesPatchBody = {
  insights_visible?: boolean;
  personalization_enabled?: boolean;
  ai_memory_mode?: AiMemoryMode;
  relationship_mode?: 'solo' | 'partnered';
  reminder_time?: string | null;
  notifications_enabled?: boolean;
  timezone?: string;
  grant_consent?: boolean;
  consent_source?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);

    return res.status(200).json({
      preferences: {
        user_id: ctx.userId,
        ...privacy.preferences,
      },
      consent: privacy.consent,
    });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as PreferencesPatchBody;
    const allowed: Partial<PreferencesPatchBody> = {};
    const currentPrivacy = await loadPrivacyState(ctx.supabase, ctx.userId);

    if (typeof body.insights_visible === 'boolean') {
      allowed.insights_visible = body.insights_visible;
    }
    if (typeof body.personalization_enabled === 'boolean') {
      allowed.personalization_enabled = body.personalization_enabled;
    }
    if (
      body.ai_memory_mode === 'off' ||
      body.ai_memory_mode === 'rolling_90_days' ||
      body.ai_memory_mode === 'indefinite'
    ) {
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

    const defaults = getDefaultPrivacyPreferences();
    const nextAiMemoryMode = allowed.ai_memory_mode ?? currentPrivacy.preferences.ai_memory_mode ?? defaults.ai_memory_mode;
    const memoryWindow = deriveMemoryWindow({ ai_memory_mode: nextAiMemoryMode });

    const { data, error } = await ctx.supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: ctx.userId,
          ...defaults,
          ...currentPrivacy.preferences,
          ...allowed,
          ai_memory_mode: nextAiMemoryMode,
          memory_window: memoryWindow,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    if (body.grant_consent === true) {
      const consentPayload = {
        consent_given_at: new Date().toISOString(),
        consent_version: CURRENT_CONSENT_VERSION,
        consent_source: body.consent_source || 'preferences_api',
      };

      let consentError =
        (
          await ctx.supabase
            .from('profiles')
            .update(consentPayload)
            .eq('id', ctx.userId)
        ).error ?? null;

      if (consentError?.code === 'PGRST204') {
        consentError =
          (
            await ctx.supabase
              .from('profiles')
              .update({ consent_given_at: consentPayload.consent_given_at })
              .eq('id', ctx.userId)
          ).error ?? null;
      }

      if (consentError) {
        return res.status(500).json({ error: 'Failed to record consent' });
      }
    }

    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);

    return res.status(200).json({
      saved: true,
      preferences: {
        ...data,
        ai_memory_mode: privacy.preferences.ai_memory_mode,
        memory_window: privacy.preferences.memory_window,
      },
      consent: privacy.consent,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
