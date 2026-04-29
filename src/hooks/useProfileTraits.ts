import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Profile } from '@/lib/supabase';

export interface ProfileTrait {
  trait_key: string;
  inferred_value: string;
  confidence: number;
  effective_weight: number;
  user_feedback: string | null;
}

type ProfileWithArchetype = Profile & {
  archetype?: string | null;
  archetype_description?: string | null;
};

export function useProfileTraits() {
  const { user, profile } = useAuth();
  const [traits, setTraits] = useState<ProfileTrait[]>([]);
  const [accessToken, setAccessToken] = useState('');

  const refreshTraits = useCallback(async () => {
    if (!user) {
      setTraits([]);
      setAccessToken('');
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAccessToken('');
        return;
      }

      setAccessToken(session.access_token);

      const response = await fetch('/api/profile/traits', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();
      setTraits(json.traits || []);
    } catch {
      // Reflective surfaces fail softly while auth or traits data settles.
    }
  }, [user]);

  useEffect(() => {
    void refreshTraits();
  }, [refreshTraits]);

  const profileData = profile as ProfileWithArchetype | null;

  return {
    traits,
    accessToken,
    refreshTraits,
    archetype: profileData?.archetype ?? null,
    archetypeDescription: profileData?.archetype_description ?? null,
  };
}
