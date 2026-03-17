export type DailySessionStatus =
  | 'morning_ready'
  | 'morning_viewed'
  | 'evening_active'
  | 'completed';

export type TraitFeedback = 'yes' | 'not_really' | 'unsure';
export type ConfidenceLabel = 'Likely' | 'Possible' | 'Not enough info yet';
export type EntitlementTier = 'free' | 'premium';

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
