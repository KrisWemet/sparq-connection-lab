import type { SupabaseClient } from '@supabase/supabase-js';

const PLAYFUL_BETA_COHORT_CUTOFF = process.env.PLAYFUL_BETA_COHORT_CUTOFF?.trim() || '';

function parseCutoff(value: string): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export async function isPlayfulLayerEnabledForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const cutoff = parseCutoff(PLAYFUL_BETA_COHORT_CUTOFF);
  if (cutoff == null) return true;

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load playful rollout eligibility:', error);
    return false;
  }

  const createdAt = data?.created_at ? Date.parse(data.created_at) : NaN;
  if (!Number.isFinite(createdAt)) {
    console.error('Missing playful rollout created_at for user:', userId);
    return false;
  }

  return createdAt <= cutoff;
}
