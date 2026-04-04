// src/components/onboarding/JourneyDetail.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { reportPrimaryPathClientError, trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';
import { shouldStartLegacyJourney } from '@/lib/journeys/legacyStartPolicy';
import {
  requireJourneyActivationSuccess,
  requireOnboardingProfilePersistenceSuccess,
  resolveJourneyDetailStartFailure,
} from '@/lib/onboarding/journeyDetailStartPolicy';
import { supabase } from '@/lib/supabase';
import { journeys } from '@/data/journeys';
import { starterJourneyMap } from '@/data/starter-journeys';
import type { DerivedProfile } from '@/lib/onboarding/types';

interface JourneyDetailProps {
  journeyId: string;
  peterNote: string;
  profile: DerivedProfile;
  onBack: () => void;
  onConfirm: () => void;
  userId: string;
  /** When true (post-journey completion context), show the Rehearsal Room CTA */
  showRehearsalCta?: boolean;
}

export function JourneyDetail({ journeyId, peterNote, profile: _profile, onBack, onConfirm, userId, showRehearsalCta = false }: JourneyDetailProps) {
  const router = useRouter();
  const [day1Preview, setDay1Preview] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const journey = journeys.find(j => j.id === journeyId);
  const starterJourney = starterJourneyMap.get(journeyId);

  // Load Day 1 preview — prefer static starter journey content, fall back to DB
  useEffect(() => {
    if (starterJourney?.days?.[0]) {
      setDay1Preview(starterJourney.days[0].action.prompt);
      return;
    }

    async function loadDay1() {
      const { data } = await supabase
        .from('journey_questions')
        .select('question_text')
        .eq('journey_id', journeyId)
        .eq('day_number', 1)
        .maybeSingle();

      setDay1Preview(data?.question_text ?? journey?.overview ?? null);
    }
    loadDay1();
  }, [journeyId, journey?.overview, starterJourney]);

  async function handleStart() {
    if (isStarting) return;
    setIsStarting(true);
    setStartError('');

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });

      // Starter journeys use the new content system directly.
      // Only UUID-backed legacy journeys should touch the old journey bootstrap route.
      if (shouldStartLegacyJourney(journeyId)) {
        const legacyStartResponse = await fetch('/api/journeys/start', {
          method: 'POST',
          headers,
          body: JSON.stringify({ journey_id: journeyId }),
        });
        await requireJourneyActivationSuccess(legacyStartResponse, {
          journeyId,
          activationType: 'legacy_start',
        });
      }

      // Activate starter journey content system (sets active_journey_id + resets day cursor)
      if (starterJourney) {
        const activateResponse = await fetch('/api/journeys/activate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ journey_id: journeyId }),
        });
        await requireJourneyActivationSuccess(activateResponse, {
          journeyId,
          activationType: 'starter_activate',
        });
      }

      // Mark onboarded
      const { error: profilePersistError } = await supabase
        .from('profiles')
        .update({ isonboarded: true })
        .eq('id', userId)
        .select('id')
        .single();
      requireOnboardingProfilePersistenceSuccess({
        journeyId,
        userId,
        error: profilePersistError,
      });

      // Clear localStorage
      localStorage.removeItem('sparq_onboarding_progress');

      void trackPrimaryPathClientEvent('beta_primary_onboarding_completed', {
        journey_id: journeyId,
        journey_title: displayTitle,
      });

      onConfirm();
    } catch (err) {
      const failure = resolveJourneyDetailStartFailure(err, { journey_id: journeyId });
      void reportPrimaryPathClientError(failure.stage, err, failure.context);
      console.error('Journey start error:', err);
      setStartError("We couldn't start your path. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  // Use starter journey data when available, fall back to old journey catalog
  const displayTitle = starterJourney?.title ?? journey?.title;
  const displayDuration = starterJourney
    ? `${starterJourney.duration} days`
    : journey?.duration;

  if (!journey && !starterJourney) return null;

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#8B5CF6] text-sm font-semibold mb-6"
        >
          ← Back
        </button>

        {/* Header image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-40 rounded-[20px] flex items-center justify-center text-5xl mb-6"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #7c3aed)' }}
        >
          ✨
        </motion.div>

        <h1 className="text-2xl font-bold text-[#1f2937] mb-1">{displayTitle}</h1>
        <p className="text-sm text-[#6b7280] mb-6">{displayDuration} · Beginner · Starts today</p>

        <div className="bg-[#fff7ed] rounded-[20px] p-5 mb-4" style={{ border: '1px solid #fdba74' }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-3">
            Solo-first path
          </p>
          <p className="text-sm text-[#5B4A86] leading-relaxed">
            This journey still works if your partner never joins. You will practice what you can control: your focus, your truth, your repairs, and your follow-through.
          </p>
        </div>

        {/* What you'll be doing */}
        <div className="bg-white rounded-[20px] p-5 mb-4" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-4">
            Here&apos;s what you&apos;ll be doing
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Each day:</strong> one reflection question, one short insight from me, one small action to try in real life.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Takes about 5 minutes.</strong> No homework, no pressure — just one tiny move at a time.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Partner optional.</strong> Some prompts may fit best with your partner, but each day can still help you listen, speak, and stay steady.
              </p>
            </div>
            {day1Preview && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 flex-shrink-0" />
                <p className="text-sm text-[#374151] leading-relaxed">
                  <strong>Day 1 today:</strong> {day1Preview}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Peter's note */}
        <div className="flex items-start gap-3 mb-8">
          <PeterAvatar mood="morning" size={40} />
          <div
            className="flex-1 bg-[#fef3c7] rounded-2xl rounded-tl-sm p-4 text-sm text-[#92400e] leading-relaxed font-serif italic"
            style={{ border: '1px solid #fbbf24' }}
          >
            {peterNote}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full bg-[#8B5CF6] text-white rounded-2xl py-4 text-base font-semibold disabled:opacity-60 transition-colors"
        >
          {isStarting ? 'Starting...' : "Let's start →"}
        </button>
        {startError ? (
          <p className="mt-3 text-center text-sm text-[#92400e]">
            {startError}
          </p>
        ) : null}

        {showRehearsalCta && (
          <button
            onClick={() => router.push('/rehearsal')}
            className="w-full mt-3 text-center text-sm text-[#8B5CF6] font-medium py-2"
          >
            Practice a conversation first →
          </button>
        )}
      </div>
    </div>
  );
}
