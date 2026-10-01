// src/pages/onboarding.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { ConsentGate } from '@/components/onboarding/ConsentGate';
import { CsiBaseline } from '@/components/onboarding/CsiBaseline';
import { HabitAnchorPick } from '@/components/onboarding/HabitAnchorPick';
import { QuestionFlow } from '@/components/onboarding/QuestionFlow';
import { ScoringTransition } from '@/components/onboarding/ScoringTransition';
import { PeterSession } from '@/components/onboarding/PeterSession';
import { JourneyRecommendation } from '@/components/onboarding/JourneyRecommendation';
import { JourneyDetail } from '@/components/onboarding/JourneyDetail';
import type { DerivedProfile, OnboardingPhase, OnboardingProgress } from '@/lib/onboarding/types';

const STORAGE_KEY = 'sparq_onboarding_progress';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  // The auth context hands out a new user object on every token refresh.
  // Key the setup effects on the id so a refresh never restarts onboarding.
  const userId = user?.id ?? null;

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
  // Names given at signup — onboarding never asks for them again.
  const [knownNames, setKnownNames] = useState<{ firstName: string | null; partnerName: string | null }>({ firstName: null, partnerName: null });

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  // Names given at signup. Prefer auth metadata (what they typed); the
  // profile name falls back to the email prefix when no name was given, so
  // ignore it in that case rather than greeting them by their email.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, partner_name')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const meta = (user.user_metadata || {}) as { full_name?: string; partner_name?: string };
      const emailPrefix = (user.email || '').split('@')[0];
      const profileName = data?.name && data.name !== emailPrefix ? data.name : '';
      setKnownNames({
        firstName: (meta.full_name || profileName || '').trim() || null,
        partnerName: (meta.partner_name || data?.partner_name || '').trim() || null,
      });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
            // User completed scoring but never confirmed a journey. If they
            // never finished the Peter chat (no closing line yet), resume
            // there; otherwise go straight to the journey pick.
            const saved = profileData.psychological_profile as DerivedProfile;
            setProfile(saved);
            setPhase(saved.peterClosingSentence?.trim() ? 'journey_rec' : 'peter_session');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
      // PRD §4.2: sign-up → CSI-4 baseline → hook. Baseline is captured
      // BEFORE the profiling questions so it measures the relationship as it
      // was, untouched by anything Sparq has said.
      setPhase('csi_baseline');
    } catch {
      setConsentError('We could not save your consent. Please try again.');
    } finally {
      setConsentSaving(false);
    }
  }

  if (authLoading || (user && !consentChecked)) {
    return (
      <div className="min-h-dvh bg-brand-linen flex items-center justify-center">
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

  if (phase === 'csi_baseline') {
    return <CsiBaseline onComplete={() => setPhase('questions')} />;
  }

  if (phase === 'questions') {
    return (
      <QuestionFlow
        initialProgress={savedProgress}
        knownNames={knownNames}
        onComplete={(completedProgress) => {
          setSavedProgress(completedProgress);
          setPhase('scoring_transition');
        }}
      />
    );
  }

  // Scoring error fallback — checked before the scoring phase so it can show
  if (scoringError) {
    return (
      <div className="min-h-dvh bg-brand-linen flex flex-col items-center justify-center px-4 gap-4">
        <PeterAvatar mood="morning" size={64} />
        <p className="text-brand-text-secondary text-center text-sm">{scoringError}</p>
        <button
          onClick={() => {
            setScoringError('');
            // If savedProgress was lost (e.g. page remounted), fall back to questions
            setPhase(savedProgress ? 'scoring_transition' : 'questions');
          }}
          className="bg-brand-primary text-white rounded-2xl px-6 py-3 font-bold text-sm"
        >
          Try again
        </button>
      </div>
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
        // PRD §4.2 Day-1 hook: the Neutral Observer runs once on a live
        // recalled grievance as the trial's emotional proof point. Placed
        // AFTER journey confirm (not inside the Peter handoff) so the
        // hardened onboarding conversation stays untouched.
        onConfirm={() => setPhase('habit_anchor')}
      />
    );
  }

  // PRD gate 3 final beat: anchor pick, then the Day-1 Neutral Observer hook.
  if (phase === 'habit_anchor' && user) {
    return (
      <HabitAnchorPick
        userId={user.id}
        onComplete={() => router.push('/neutral-observer?trigger=hook')}
      />
    );
  }

  return null;
}
