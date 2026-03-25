import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Sparkles } from 'lucide-react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { supabase } from '@/lib/supabase';
import { buildAuthedHeaders } from '@/lib/api-auth';

interface JourneyRec {
  journeyId: string;
  title: string;
  description: string;
  duration: number;
  peterReason: string;
}

interface JourneyCompletionProps {
  journeyId: string;
  journeyTitle?: string;
}

export function JourneyCompletion({ journeyId, journeyTitle }: JourneyCompletionProps) {
  const router = useRouter();
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<JourneyRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState<'continue' | 'rest' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch synthesis and recommendations
        const [synthResult, insightsResult] = await Promise.all([
          supabase
            .from('user_journeys')
            .select('completion_synthesis')
            .eq('user_id', user.id)
            .eq('journey_id', journeyId)
            .maybeSingle(),
          supabase
            .from('user_insights')
            .select('recommended_next_journeys')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (synthResult.data?.completion_synthesis) {
          setSynthesis(synthResult.data.completion_synthesis);
        }
        if (insightsResult.data?.recommended_next_journeys) {
          setRecommendations(insightsResult.data.recommended_next_journeys as JourneyRec[]);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [journeyId]);

  const handleRest = async () => {
    setChoice('rest');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_insights')
          .update({ journey_completion_state: 'resting' })
          .eq('user_id', user.id);
      }
    } catch {}
    // After a beat, go to dashboard
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  const handleContinue = () => {
    setChoice('continue');
  };

  const handleSelectJourney = async (rec: JourneyRec) => {
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/journeys/activate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ journey_id: rec.journeyId }),
      });
    } catch {}
    router.push('/dashboard');
  };

  const displayTitle = journeyTitle || journeyId.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-10 space-y-6">

        {/* Peter celebrating */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <PeterAvatar mood="celebrating" size={80} />
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-sand" />
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-sand">
              Journey Complete
            </p>
            <Sparkles size={18} className="text-brand-sand" />
          </div>
        </motion.div>

        {/* Journey title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-serif italic text-brand-espresso text-2xl text-center leading-snug capitalize"
        >
          {displayTitle}
        </motion.h2>

        {/* Synthesis */}
        {(synthesis || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
          >
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-brand-linen rounded w-full" />
                <div className="h-3 bg-brand-linen rounded w-5/6" />
                <div className="h-3 bg-brand-linen rounded w-4/6" />
              </div>
            ) : (
              <p className="font-serif italic text-brand-espresso text-[15px] leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                {synthesis}
              </p>
            )}
          </motion.div>
        )}

        {/* Choice: rest or continue */}
        {!choice && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            <p className="font-serif italic text-brand-text-secondary text-[15px] text-center leading-relaxed">
              Ready to keep going? Or would you like a day to let this settle?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
              >
                I am ready for the next one
              </button>
              <button
                onClick={handleRest}
                className="w-full p-4 rounded-2xl border-2 border-brand-primary/20 bg-brand-parchment text-brand-espresso font-medium text-left hover:border-brand-primary hover:bg-brand-primary/5 active:scale-[0.98] transition-all"
              >
                Let me sit with this for a day
              </button>
            </div>
          </motion.div>
        )}

        {/* Rest choice confirmation */}
        {choice === 'rest' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-serif italic text-brand-text-secondary text-[15px] text-center leading-relaxed"
          >
            Take your time. I will be here tomorrow with something new.
          </motion.p>
        )}

        {/* Continue: show recommendations */}
        {choice === 'continue' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary pl-1">
              Peter suggests
            </p>

            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <button
                  key={rec.journeyId}
                  onClick={() => handleSelectJourney(rec)}
                  className="w-full bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5 text-left hover:border-brand-primary/30 active:scale-[0.99] transition-all"
                >
                  <p className="font-semibold text-brand-espresso text-sm mb-1">
                    {rec.title}
                  </p>
                  <p className="text-xs text-brand-text-secondary mb-2">
                    {rec.duration} days
                  </p>
                  <p className="font-serif italic text-brand-text-secondary text-sm leading-relaxed">
                    {rec.peterReason}
                  </p>
                </button>
              ))
            ) : (
              <button
                onClick={() => router.push('/journeys')}
                className="w-full bg-brand-primary text-white font-semibold rounded-2xl py-4 text-base hover:bg-brand-hover transition-colors"
              >
                Browse all journeys
              </button>
            )}

            <button
              onClick={() => router.push('/journeys')}
              className="w-full text-brand-primary font-medium text-sm text-center py-2"
            >
              Or browse all journeys
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
