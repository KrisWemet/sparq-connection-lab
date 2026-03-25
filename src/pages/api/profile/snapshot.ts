import type { NextApiRequest, NextApiResponse } from 'next';
import { confidenceLabel } from '@/lib/product';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { loadPrivacyState } from '@/lib/server/privacy';

const TRAIT_LABELS: Record<string, string> = {
  attachment_style: 'Connection Pattern',
  conflict_style: 'Conflict Pattern',
  love_language: 'Care Preference',
  emotional_state: 'Current State',
  tone_sensitivity: 'Tone Fit',
  prompt_style: 'Prompt Fit',
};

function formatTraitValue(key: string, value: string | null): string {
  if (!value) return 'Not enough info yet';
  if (key === 'attachment_style') {
    if (value === 'anxious') return 'Needs reassurance when stressed';
    if (value === 'avoidant') return 'Needs space and lower intensity';
    if (value === 'secure') return 'Generally steady and balanced';
    if (value === 'disorganized') return 'Mixed push-pull stress pattern';
  }
  if (key === 'conflict_style') {
    if (value === 'avoidant') return 'Tends to withdraw under tension';
    if (value === 'volatile') return 'Escalates quickly under stress';
    if (value === 'validating') return 'Usually engages with care';
  }
  if (key === 'love_language') {
    if (value === 'words') return 'Words of appreciation';
    if (value === 'acts') return 'Helpful actions';
    if (value === 'gifts') return 'Thoughtful gifts';
    if (value === 'time') return 'Quality time';
    if (value === 'touch') return 'Physical affection';
  }
  return value.replace(/_/g, ' ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const [insightsResult, privacy, traitsResult] = await Promise.all([
    ctx.supabase
      .from('user_insights')
      .select('attachment_style, conflict_style, love_language, emotional_state, onboarding_day, skill_tree_unlocked')
      .eq('user_id', ctx.userId)
      .maybeSingle(),
    loadPrivacyState(ctx.supabase, ctx.userId),
    ctx.supabase
      .from('profile_traits')
      .select('trait_key, inferred_value, confidence, user_feedback, effective_weight')
      .eq('user_id', ctx.userId),
  ]);

  const showInsights = privacy.preferences.insights_visible;

  const structuredTraits =
    showInsights && traitsResult.data && traitsResult.data.length > 0
      ? traitsResult.data.map(t => ({
          key: t.trait_key,
          label: TRAIT_LABELS[t.trait_key] || t.trait_key,
          value: formatTraitValue(t.trait_key, t.inferred_value),
          confidence_label: confidenceLabel(t.confidence),
          user_feedback: t.user_feedback || 'unsure',
        }))
      : showInsights
      ? [
          {
            key: 'attachment_style',
            label: TRAIT_LABELS.attachment_style,
            value: formatTraitValue('attachment_style', insightsResult.data?.attachment_style ?? null),
            confidence_label: insightsResult.data?.attachment_style ? 'Possible' : 'Not enough info yet',
            user_feedback: 'unsure',
          },
          {
            key: 'conflict_style',
            label: TRAIT_LABELS.conflict_style,
            value: formatTraitValue('conflict_style', insightsResult.data?.conflict_style ?? null),
            confidence_label: insightsResult.data?.conflict_style ? 'Possible' : 'Not enough info yet',
            user_feedback: 'unsure',
          },
          {
            key: 'love_language',
            label: TRAIT_LABELS.love_language,
            value: formatTraitValue('love_language', insightsResult.data?.love_language ?? null),
            confidence_label: insightsResult.data?.love_language ? 'Possible' : 'Not enough info yet',
            user_feedback: 'unsure',
          },
        ]
      : [];

  return res.status(200).json({
    traits: structuredTraits,
    progress: {
      onboarding_day: insightsResult.data?.onboarding_day ?? 1,
      skill_tree_unlocked: insightsResult.data?.skill_tree_unlocked ?? false,
    },
    preferences: {
      insights_visible: privacy.preferences.insights_visible,
      personalization_enabled: privacy.preferences.personalization_enabled,
      relationship_mode: privacy.preferences.relationship_mode,
    },
    consent: privacy.consent,
  });
}
