import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
// src/components/onboarding/JourneyRecommendation.tsx
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { matchJourney } from '@/lib/onboarding/journeyMatcher';
import { journeys } from '@/data/journeys';
import { getJourneyMeta } from '@/data/starter-journeys';
import { trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';
import type { DerivedProfile } from '@/lib/onboarding/types';

interface JourneyRecommendationProps {
  profile: DerivedProfile;
  onSelectJourney: (journeyId: string, peterNote: string) => void;
}

export function JourneyRecommendation({ profile, onSelectJourney }: JourneyRecommendationProps) {
  const recommendation = matchJourney(profile);

  const primaryJourney =
    journeys.find(j => j.id === recommendation.primary.journeyId) ??
    getJourneyMeta(recommendation.primary.journeyId);
  const alternativeJourneys = recommendation.alternatives
    .map(alt => ({
      ...alt,
      journey: journeys.find(j => j.id === alt.journeyId) ?? getJourneyMeta(alt.journeyId),
    }))
    .filter(a => a.journey);

  return (
    <div className="emotion-page min-h-dvh bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Peter's closing sentence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3 mb-8"
        >
          <PeterAvatar mood="celebrating" size={48} />
          <div
            className="flex-1 bg-popover rounded-2xl rounded-tl-sm p-4 text-foreground text-[15px] leading-relaxed font-serif italic"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {profile.peterClosingSentence?.trim() ||
              `${profile.firstName ? `Thanks, ${profile.firstName}. ` : ''}Here's where I think we could start. It's just a first guess, so pick whatever feels right to you.`}
          </div>
        </motion.div>

        <div className="bg-insight-subtle border border-insight/40 rounded-2xl p-4 mb-6">
          <p className="note-label mb-2">
            Solo-first start
          </p>
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            You do not need your partner in the app to start. Pick the path that helps you stay calm, clear, and kind.
          </p>
        </div>

        {/* Primary recommendation */}
        <p className="note-label mb-3">
          Your starting point
        </p>

        {primaryJourney && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => {
              void trackPrimaryPathClientEvent('beta_primary_journey_selected', {
                journey_id: primaryJourney.id,
                selection_rank: 'primary',
              });
              onSelectJourney(primaryJourney.id, recommendation.primary.peterNote);
            }}
            className="emotion-paper w-full text-left bg-popover rounded-[20px] overflow-hidden shadow-sm mb-6"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            <div className="emotion-surface relative h-32 overflow-hidden">
              <SceneAccent kind="bloom" className="h-full w-full" />
            </div>
            <div className="p-4">
              <p className="note-label mb-1">
                Recommended for you
              </p>
              <p className="text-lg font-bold text-foreground mb-2">{primaryJourney.title}</p>
              <p className="text-sm text-brand-text-secondary leading-relaxed italic">
                &quot;I think this one fits you best — {recommendation.primary.reason} Start here for yourself. Invite your partner later if it helps.&quot;
              </p>
            </div>
          </motion.button>
        )}

        {/* Alternatives */}
        {alternativeJourneys.length > 0 && (
          <>
            <p className="note-label text-brand-text-secondary mb-3">
              Other paths that fit you
            </p>
            <div className="flex flex-col gap-2">
              {alternativeJourneys.map((alt, i) => (
                <motion.button
                  key={alt.journeyId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                  onClick={() => {
                    void trackPrimaryPathClientEvent('beta_primary_journey_selected', {
                      journey_id: alt.journeyId,
                      selection_rank: 'alternative',
                    });
                    onSelectJourney(alt.journeyId, alt.peterNote);
                  }}
                  className="w-full flex items-center gap-3 bg-popover rounded-2xl p-3 text-left opacity-80 hover:opacity-100 transition-opacity"
                  style={{ border: '1px solid hsl(var(--border))' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Compass size={18} className="text-brand-text-secondary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{alt.journey?.title}</p>
                    <p className="text-xs text-brand-text-secondary mt-0.5">{typeof alt.journey?.duration === 'number' ? `${alt.journey.duration} days` : alt.journey?.duration}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
