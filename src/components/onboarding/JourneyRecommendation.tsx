// src/components/onboarding/JourneyRecommendation.tsx
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-brand-linen">
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
            className="flex-1 bg-white rounded-2xl rounded-tl-sm p-4 text-[#1f2937] text-[15px] leading-relaxed font-serif italic"
            style={{ border: '1px solid #e5e7eb' }}
          >
            {profile.peterClosingSentence}
          </div>
        </motion.div>

        <div className="bg-[#fff7ed] border border-[#fdba74] rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-2">
            Solo-first start
          </p>
          <p className="text-sm text-[#5B4A86] leading-relaxed">
            You do not need your partner in the app to start. Pick the path that helps you stay calm, clear, and kind.
          </p>
        </div>

        {/* Primary recommendation */}
        <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-3">
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
            className="w-full text-left bg-white rounded-[20px] overflow-hidden shadow-sm mb-6"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div
              className="h-28 flex items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7c3aed)' }}
            >
              <span className="text-4xl">{primaryJourney.id === 'attachment-healing' ? '🧡' : '✨'}</span>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#8B5CF6] mb-1">
                Recommended for you
              </p>
              <p className="text-lg font-bold text-[#1f2937] mb-2">{primaryJourney.title}</p>
              <p className="text-sm text-[#6b7280] leading-relaxed italic">
                &quot;I think this one fits you best — {recommendation.primary.reason} Start here for yourself. Invite your partner later if it helps.&quot;
              </p>
            </div>
          </motion.button>
        )}

        {/* Alternatives */}
        {alternativeJourneys.length > 0 && (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9ca3af] mb-3">
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
                  className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 text-left opacity-80 hover:opacity-100 transition-opacity"
                  style={{ border: '1px solid #e5e7eb' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f3f4f6] flex items-center justify-center text-xl flex-shrink-0">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2937]">{alt.journey?.title}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{alt.journey?.duration}</p>
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
