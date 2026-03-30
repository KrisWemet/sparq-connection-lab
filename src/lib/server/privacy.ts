import type { SupabaseClient } from '@supabase/supabase-js';

export const CURRENT_CONSENT_VERSION = '2026-03-20';

export type AiMemoryMode = 'off' | 'rolling_90_days' | 'indefinite';
export type MemoryWindow = 'none' | '90_days' | 'indefinite';
export type RelationshipMode = 'solo' | 'partnered';

export type PrivacyPreferences = {
  insights_visible: boolean;
  personalization_enabled: boolean;
  ai_memory_mode: AiMemoryMode;
  memory_window: MemoryWindow;
  relationship_mode: RelationshipMode;
  reminder_time: string | null;
  notifications_enabled: boolean;
  timezone: string | null;
};

export type PrivacyState = {
  preferences: PrivacyPreferences;
  consent: {
    has_consented: boolean;
    consent_given_at: string | null;
    consent_version: string | null;
    consent_source: string | null;
  };
  can_personalize: boolean;
  can_store_memories: boolean;
  can_analyze_profile: boolean;
};

type PreferenceRow = Partial<PrivacyPreferences> & {
  ai_memory_mode?: string | null;
  memory_window?: string | null;
  relationship_mode?: string | null;
};

const DEFAULT_PREFERENCES: PrivacyPreferences = {
  insights_visible: true,
  personalization_enabled: true,
  ai_memory_mode: 'rolling_90_days',
  memory_window: '90_days',
  relationship_mode: 'solo',
  reminder_time: '09:00',
  notifications_enabled: true,
  timezone: null,
};

export function deriveMemoryWindow(row?: PreferenceRow | null): MemoryWindow {
  if (row?.ai_memory_mode === 'off') return 'none';
  if (row?.ai_memory_mode === 'rolling_90_days') return '90_days';
  if (row?.ai_memory_mode === 'indefinite') return 'indefinite';
  if (row?.memory_window === 'none') return 'none';
  if (row?.memory_window === '90_days') return '90_days';
  if (row?.memory_window === 'indefinite') return 'indefinite';
  return DEFAULT_PREFERENCES.memory_window;
}

export function deriveAiMemoryMode(row?: PreferenceRow | null): AiMemoryMode {
  if (row?.ai_memory_mode === 'off') return 'off';
  if (row?.ai_memory_mode === 'rolling_90_days') return 'rolling_90_days';
  if (row?.ai_memory_mode === 'indefinite') return 'indefinite';
  if (row?.memory_window === 'none') return 'off';
  if (row?.memory_window === '90_days') return 'rolling_90_days';
  if (row?.memory_window === 'indefinite') return 'indefinite';
  return DEFAULT_PREFERENCES.ai_memory_mode;
}

export function normalizePrivacyPreferences(row?: PreferenceRow | null): PrivacyPreferences {
  return {
    insights_visible: row?.insights_visible ?? DEFAULT_PREFERENCES.insights_visible,
    personalization_enabled: row?.personalization_enabled ?? DEFAULT_PREFERENCES.personalization_enabled,
    ai_memory_mode: deriveAiMemoryMode(row),
    memory_window: deriveMemoryWindow(row),
    relationship_mode:
      row?.relationship_mode === 'partnered' ? 'partnered' : DEFAULT_PREFERENCES.relationship_mode,
    reminder_time: row?.reminder_time ?? DEFAULT_PREFERENCES.reminder_time,
    notifications_enabled: row?.notifications_enabled ?? DEFAULT_PREFERENCES.notifications_enabled,
    timezone: row?.timezone ?? DEFAULT_PREFERENCES.timezone,
  };
}

export async function loadPrivacyState(
  supabase: SupabaseClient,
  userId: string,
): Promise<PrivacyState> {
  const [preferencesResult, profileResult] = await Promise.all([
    supabase
      .from('user_preferences')
      .select(
        'insights_visible, personalization_enabled, ai_memory_mode, relationship_mode, memory_window, reminder_time, notifications_enabled, timezone'
      )
      .eq('user_id', userId)
      .maybeSingle(),
    loadConsentState(supabase, userId),
  ]);

  const preferences = normalizePrivacyPreferences(preferencesResult.data);
  const consentGivenAt = profileResult?.consent_given_at ?? null;
  const hasConsented = Boolean(consentGivenAt);

  return {
    preferences,
    consent: {
      has_consented: hasConsented,
      consent_given_at: consentGivenAt,
      consent_version: profileResult?.consent_version ?? null,
      consent_source: profileResult?.consent_source ?? null,
    },
    can_personalize: hasConsented && preferences.personalization_enabled,
    can_store_memories: hasConsented && preferences.personalization_enabled && preferences.memory_window !== 'none',
    can_analyze_profile: hasConsented && preferences.personalization_enabled,
  };
}

async function loadConsentState(supabase: SupabaseClient, userId: string) {
  const fullResult = await supabase
    .from('profiles')
    .select('consent_given_at, consent_version, consent_source')
    .eq('id', userId)
    .maybeSingle();

  if (!fullResult.error) {
    return {
      consent_given_at: fullResult.data?.consent_given_at ?? null,
      consent_version: fullResult.data?.consent_version ?? null,
      consent_source: fullResult.data?.consent_source ?? null,
    };
  }

  if (fullResult.error.code !== 'PGRST204') {
    throw fullResult.error;
  }

  const legacyResult = await supabase
    .from('profiles')
    .select('consent_given_at')
    .eq('id', userId)
    .maybeSingle();

  if (legacyResult.error) {
    throw legacyResult.error;
  }

  return {
    consent_given_at: legacyResult.data?.consent_given_at ?? null,
    consent_version: null,
    consent_source: null,
  };
}

export function getDefaultPrivacyPreferences(): PrivacyPreferences {
  return { ...DEFAULT_PREFERENCES };
}
