// src/components/onboarding/JourneyDetail.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { supabase } from '@/lib/supabase';
import { journeys } from '@/data/journeys';
import type { DerivedProfile } from '@/lib/onboarding/types';

interface JourneyDetailProps {
  journeyId: string;
  peterNote: string;
  profile: DerivedProfile;
  onBack: () => void;
  onConfirm: () => void;
  userId: string;
}

export function JourneyDetail({ journeyId, peterNote, profile: _profile, onBack, onConfirm, userId }: JourneyDetailProps) {
  const [day1Preview, setDay1Preview] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const journey = journeys.find(j => j.id === journeyId);

  // Load Day 1 question from DB
  useEffect(() => {
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
  }, [journeyId, journey?.overview]);

  async function handleStart() {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      await fetch('/api/journeys/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ journey_id: journeyId }),
      });

      // Mark onboarded
      await supabase
        .from('profiles')
        .update({ isonboarded: true })
        .eq('id', userId);

      // Clear localStorage
      localStorage.removeItem('sparq_onboarding_progress');

      onConfirm();
    } catch (err) {
      console.error('Journey start error:', err);
      setIsStarting(false);
    }
  }

  if (!journey) return null;

  return (
    <div className="min-h-screen bg-brand-linen">
      <div className="container max-w-md mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#C0614A] text-sm font-semibold mb-6"
        >
          ← Back
        </button>

        {/* Header image placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-40 rounded-[20px] flex items-center justify-center text-5xl mb-6"
          style={{ background: 'linear-gradient(135deg, #C0614A, #7c3aed)' }}
        >
          ✨
        </motion.div>

        <h1 className="text-2xl font-bold text-[#1f2937] mb-1">{journey.title}</h1>
        <p className="text-sm text-[#6b7280] mb-6">{journey.duration} · Beginner · Starts today</p>

        {/* What you'll be doing */}
        <div className="bg-white rounded-[20px] p-5 mb-4" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C0614A] mb-4">
            Here&apos;s what you&apos;ll be doing
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Each day:</strong> one reflection question, one short insight from me, one small action to try in real life.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <strong>Takes about 5 minutes.</strong> No homework, no pressure — just one tiny move at a time.
              </p>
            </div>
            {day1Preview && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#C0614A] mt-1.5 flex-shrink-0" />
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
          className="w-full bg-[#C0614A] text-white rounded-2xl py-4 text-base font-semibold disabled:opacity-60 transition-colors"
        >
          {isStarting ? 'Starting...' : "Let's start →"}
        </button>
      </div>
    </div>
  );
}
