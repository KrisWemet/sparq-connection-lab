import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EntitlementShape,
  FREE_ENTITLEMENTS,
  normalizeEntitlementTier,
  PAID_ENTITLEMENTS,
} from '@/lib/product';

export async function resolveEntitlements(
  supabase: SupabaseClient,
  userId: string
): Promise<EntitlementShape> {
  const explicit = await loadExplicitEntitlements(supabase, userId);

  if (explicit) {
    return {
      tier: normalizeEntitlementTier(explicit.tier),
      loop_limit_per_week: explicit.loop_limit_per_week,
      coach_message_limit_per_day: explicit.coach_message_limit_per_day,
      starter_quests_limit: explicit.starter_quests_limit,
    } as EntitlementShape;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .maybeSingle();

  const profileTier = normalizeEntitlementTier(profile?.subscription_tier);
  if (profileTier === 'premium') {
    return PAID_ENTITLEMENTS;
  }

  return FREE_ENTITLEMENTS;
}

type ExplicitEntitlementsRow = {
  tier: string | null;
  loop_limit_per_week: number | null;
  coach_message_limit_per_day: number | null;
  starter_quests_limit: number | null;
};

async function loadExplicitEntitlements(
  supabase: SupabaseClient,
  userId: string
): Promise<ExplicitEntitlementsRow | null> {
  const selectColumns =
    'tier, loop_limit_per_week, coach_message_limit_per_day, starter_quests_limit';

  const { data: canonical, error: canonicalError } = await supabase
    .from('user_entitlements')
    .select(selectColumns)
    .eq('user_id', userId)
    .maybeSingle();

  if (!canonicalError) {
    return canonical;
  }

  if (canonicalError.code !== 'PGRST205' && canonicalError.code !== '42P01') {
    console.error('Failed loading user_entitlements:', canonicalError);
  }

  const { data: legacy, error: legacyError } = await supabase
    .from('entitlements')
    .select(selectColumns)
    .eq('user_id', userId)
    .maybeSingle();

  if (!legacyError) {
    return legacy;
  }

  if (legacyError.code !== 'PGRST205' && legacyError.code !== '42P01') {
    console.error('Failed loading legacy entitlements:', legacyError);
  }

  return null;
}
