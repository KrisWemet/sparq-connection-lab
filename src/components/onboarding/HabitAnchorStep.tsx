import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { supabase } from '@/lib/supabase';

export type HabitAnchor =
  | 'morning_coffee'
  | 'commute_start'
  | 'lunch_break'
  | 'evening_winddown'
  | 'bedtime';

const ANCHOR_OPTIONS: { value: HabitAnchor; label: string; emoji: string }[] = [
  { value: 'morning_coffee', label: 'Morning coffee', emoji: '☕' },
  { value: 'commute_start', label: 'Start of commute', emoji: '🚌' },
  { value: 'lunch_break', label: 'Lunch break', emoji: '🥗' },
  { value: 'evening_winddown', label: 'Evening wind-down', emoji: '🌙' },
  { value: 'bedtime', label: 'Before bed', emoji: '🛌' },
];

interface HabitAnchorStepProps {
  userId: string;
  onComplete: () => void;
}

export function HabitAnchorStep({ userId, onComplete }: HabitAnchorStepProps) {
  const [selected, setSelected] = useState<HabitAnchor[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (anchor: HabitAnchor) => {
    setSelected(prev =>
      prev.includes(anchor) ? prev.filter(a => a !== anchor) : [...prev, anchor]
    );
  };

  const handleContinue = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          habit_anchors: selected,
          onboarding_anchor_set_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {
      // non-blocking — user can still proceed
    } finally {
      setIsSaving(false);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-10 space-y-8">

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PeterAvatar mood="morning" size={64} />
          <div className="text-center space-y-2">
            <h2 className="font-serif italic text-2xl text-brand-espresso leading-snug">
              When&apos;s your Sparq moment?
            </h2>
            <p className="text-sm text-brand-taupe leading-relaxed max-w-xs mx-auto">
              Pairing a short practice with something you already do every day makes it stick faster.
              Pick one or two that fit your life.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {ANCHOR_OPTIONS.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-espresso'
                    : 'border-brand-primary/10 bg-brand-parchment text-brand-espresso hover:bg-white/70'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
                {isSelected && (
                  <span className="ml-auto text-brand-primary text-xs font-semibold">✓</span>
                )}
              </button>
            );
          })}
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="w-full bg-brand-primary text-white font-semibold py-4 rounded-2xl hover:bg-brand-hover transition-colors text-base disabled:opacity-50"
          >
            {selected.length === 0 ? 'Skip for now' : 'Continue'}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
