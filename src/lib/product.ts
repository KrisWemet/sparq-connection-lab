export type DailySessionStatus =
  | 'morning_ready'
  | 'morning_viewed'
  | 'evening_active'
  | 'completed';

export type TraitFeedback = 'yes' | 'not_really' | 'unsure';
export type ConfidenceLabel = 'Likely' | 'Possible' | 'Not enough info yet';
export type EntitlementTier = 'free' | 'premium';

// ---------------------------------------------------------------------------
// Trial logic — free users get 14 days of premium access on signup.
// Trait inference runs for ALL users regardless of tier, so when a free
// user converts, Peter already knows them.
// ---------------------------------------------------------------------------

export const TRIAL_DAYS = 14;

export function getTrialDaysRemaining(accountCreatedAt: string | null | undefined): number {
  if (!accountCreatedAt) return 0;
  const created = new Date(accountCreatedAt).getTime();
  const daysSince = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - daysSince);
}

export function isInTrial(accountCreatedAt: string | null | undefined): boolean {
  return getTrialDaysRemaining(accountCreatedAt) > 0;
}

/**
 * Returns the tier that should be used for content and entitlement decisions.
 * Trial users (within 14 days) receive premium access regardless of stored tier.
 */
export function getEffectiveTier(
  storedTier: EntitlementTier,
  accountCreatedAt: string | null | undefined,
): EntitlementTier {
  if (storedTier === 'premium') return 'premium';
  if (isInTrial(accountCreatedAt)) return 'premium';
  return storedTier;
}

export interface EntitlementShape {
  tier: EntitlementTier;
  loop_limit_per_week: number | null;
  coach_message_limit_per_day: number | null;
  starter_quests_limit: number | null;
}

export const FREE_ENTITLEMENTS: EntitlementShape = {
  tier: 'free',
  loop_limit_per_week: 3,
  coach_message_limit_per_day: 10,
  starter_quests_limit: 2,
};

export const PAID_ENTITLEMENTS: EntitlementShape = {
  tier: 'premium',
  loop_limit_per_week: null,
  coach_message_limit_per_day: null,
  starter_quests_limit: null,
};

export function normalizeEntitlementTier(
  value: string | null | undefined
): EntitlementTier {
  if (value === 'premium' || value === 'paid' || value === 'platinum' || value === 'ultimate') {
    return 'premium';
  }

  return 'free';
}

export function confidenceLabel(score?: number | null): ConfidenceLabel {
  if (score == null) return 'Not enough info yet';
  if (score >= 0.75) return 'Likely';
  if (score >= 0.4) return 'Possible';
  return 'Not enough info yet';
}
