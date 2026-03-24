// src/components/onboarding/ScoringTransition.tsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { deriveProfile } from '@/lib/onboarding/deriveProfile';
import type { DerivedProfile, OnboardingProgress, RawScores } from '@/lib/onboarding/types';

interface ScoringTransitionProps {
  progress: OnboardingProgress;
  onComplete: (profile: DerivedProfile) => void;
  onError: (error: string) => void;
  userId: string;
}

export function ScoringTransition({ progress, onComplete, onError, userId }: ScoringTransitionProps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    try {
      let finalScores: RawScores = { ...progress.scores };

      // Step 1: Adjust scores for free-text answers (if any).
      // Note: Q14 (growthGoal) is always stored as free text, so this API call fires for every user.
      const hasFreeText = Object.keys(progress.freeTextAnswers).length > 0;
      if (hasFreeText) {
        try {
          const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
          const resp = await fetch('/api/onboarding/score-freetext', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              freeTextAnswers: progress.freeTextAnswers,
              currentScores: progress.scores,
            }),
          });
          if (resp.ok) {
            const { scoreAdjustments } = await resp.json();
            for (const [key, val] of Object.entries(scoreAdjustments) as [keyof RawScores, number][]) {
              finalScores[key] = Math.max(0, (finalScores[key] ?? 0) + val);
            }
          }
        } catch {
          // Graceful degradation — continue with original scores
        }
      }

      // Step 2: Derive profile
      const adjustedProgress: OnboardingProgress = { ...progress, scores: finalScores };
      const profile = deriveProfile(adjustedProgress);

      // Step 3: Write to DB
      // 3a: Update profiles columns
      await supabase
        .from('profiles')
        .update({
          name: profile.firstName,
          partner_name: profile.partnerName,
          age_range: profile.ageRange,
          pronouns: profile.pronouns,
          psychological_profile: profile,
          isonboarded: false, // set to true after journey confirmed
        })
        .eq('id', userId);

      // 3b: Upsert profile_traits for the 3 key traits
      const traitUpserts = [
        profile.attachmentStyle && {
          user_id: userId,
          trait_key: 'attachment_style',
          inferred_value: profile.attachmentStyle,
          confidence: 0.7,
          effective_weight: 1.0,
        },
        profile.loveLanguage && {
          user_id: userId,
          trait_key: 'love_language',
          inferred_value: profile.loveLanguage,
          confidence: 0.7,
          effective_weight: 1.0,
        },
        profile.conflictStyle && {
          user_id: userId,
          trait_key: 'conflict_style',
          inferred_value: profile.conflictStyle,
          confidence: 0.7,
          effective_weight: 1.0,
        },
      ].filter(Boolean);

      if (traitUpserts.length > 0) {
        await supabase
          .from('profile_traits')
          .upsert(traitUpserts, { onConflict: 'user_id,trait_key' });
      }

      onComplete(profile);
    } catch (err) {
      console.error('ScoringTransition error:', err);
      onError('Something went wrong building your profile. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <PeterAvatar mood="morning" size={72} />
      </motion.div>
      <p className="text-[#6B4C3B] text-sm font-serif italic text-center">
        Give me just a moment...
      </p>
    </div>
  );
}
