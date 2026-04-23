// src/pages/onboarding.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { ConsentGate } from '@/components/onboarding/ConsentGate';
import { QuestionFlow } from '@/components/onboarding/QuestionFlow';
import { ScoringTransition } from '@/components/onboarding/ScoringTransition';
import { PeterSession } from '@/components/onboarding/PeterSession';
import { JourneyRecommendation } from '@/components/onboarding/JourneyRecommendation';
import { JourneyDetail } from '@/components/onboarding/JourneyDetail';
import { HabitAnchorStep } from '@/components/onboarding/HabitAnchorStep';
import type { DerivedProfile, OnboardingPhase, OnboardingProgress } from '@/lib/onboarding/types';

const STORAGE_KEY = 'sparq_onboarding_progress';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<OnboardingPhase>('consent');
  const [hasConsent, setHasConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentError, setConsentError] = useState('');

  const [savedProgress, setSavedProgress] = useState<OnboardingProgress | null>(null);
  const [profile, setProfile] = useState<DerivedProfile | null>(null);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [selectedPeterNote, setSelectedPeterNote] = useState<string>('');
  const [scoringError, setScoringError] = useState('');

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  // Load consent + check for dropout recovery
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const resp = await fetch('/api/preferences', { headers });
        if (!resp.ok) throw new Error('Failed to load preferences');
        const payload = await resp.json();
        if (cancelled) return;

        const consented = Boolean(payload?.consent?.has_consented);
        setHasConsent(consented);

        if (consented) {
          // Check for dropout recovery
          const { data: profileData } = await supabase
            .from('profiles')
            .select('isonboarded, psychological_profile')
            .eq('id', user.id)
            .single();

          if (profileData?.isonboarded) {
            router.replace('/dashboard');
            return;
          }

          if (profileData && !profileData.isonboarded && profileData.psychological_profile) {
            // User completed scoring but never confirmed a journey — resume from journey_rec
            setProfile(profileData.psychological_profile as DerivedProfile);
            setPhase('journey_rec');
          } else {
            // Restore partial question progress from localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              try { setSavedProgress(JSON.parse(stored)); } catch {}
            }
            setPhase('questions');
          }
        }
      } catch (err) {
        console.error('Onboarding init error:', err);
      } finally {
        if (!cancelled) setConsentChecked(true);
      }
    })();

    return () => { cancelled = true; };
  }, [router, user]);

  async function handleConsentAgree() {
    if (!user || consentSaving) return;
    setConsentSaving(true);
    setConsentError('');

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const resp = await fetch('/api/preferences', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ grant_consent: true, consent_source: 'onboarding_flow' }),
      });
      if (!resp.ok) throw new Error('Failed to record consent');
      setHasConsent(true);
      setPhase('questions');
    } catch {
      setConsentError('We could not save your consent. Please try again.');
    } finally {
      setConsentSaving(false);
    }
  }

  if (authLoading || (user && !consentChecked)) {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PeterAvatar mood="morning" size={64} />
        </motion.div>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <ConsentGate
        onAgree={handleConsentAgree}
        onReviewTrust={() => router.push('/trust-center')}
        isSaving={consentSaving}
        error={consentError}
      />
    );
  }

  if (phase === 'questions') {
    return (
      <QuestionFlow
        initialProgress={savedProgress}
        onComplete={(completedProgress) => {
          setSavedProgress(completedProgress);
          setPhase('scoring_transition');
        }}
      />
    );
  }

  if (phase === 'scoring_transition' && savedProgress && user) {
    return (
      <ScoringTransition
        progress={savedProgress}
        userId={user.id}
        onComplete={(derivedProfile) => {
          setProfile(derivedProfile);
          setPhase('peter_session');
        }}
        onError={(msg) => setScoringError(msg)}
      />
    );
  }

  if (phase === 'peter_session' && profile && user) {
    return (
      <PeterSession
        profile={profile}
        userId={user.id}
        onComplete={(updatedProfile) => {
          setProfile(updatedProfile);
          setPhase('journey_rec');
        }}
      />
    );
  }

  if (phase === 'journey_rec' && profile) {
    return (
      <JourneyRecommendation
        profile={profile}
        onSelectJourney={(journeyId, peterNote) => {
          setSelectedJourneyId(journeyId);
          setSelectedPeterNote(peterNote);
          setPhase('journey_detail');
        }}
      />
    );
  }

  if (phase === 'journey_detail' && profile && selectedJourneyId && user) {
    return (
      <JourneyDetail
        journeyId={selectedJourneyId}
        peterNote={selectedPeterNote}
        profile={profile}
        userId={user.id}
        onBack={() => setPhase('journey_rec')}
        onConfirm={() => setPhase('habit_anchors')}
      />
    );
  }

  if (phase === 'habit_anchors' && user) {
    return (
      <HabitAnchorStep
        userId={user.id}
        onComplete={() => router.push('/dashboard?from=onboarding')}
      />
    );
  }

  // Scoring error fallback
  if (scoringError) {
    return (
      <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4 gap-4">
        <PeterAvatar mood="morning" size={64} />
        <p className="text-[#5B4A86] text-center text-sm">{scoringError}</p>
        <button
          onClick={() => {
            setScoringError('');
            // If savedProgress was lost (e.g. page remounted), fall back to questions
            setPhase(savedProgress ? 'scoring_transition' : 'questions');
          }}
          className="bg-[#8B5CF6] text-white rounded-2xl px-6 py-3 font-semibold text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
