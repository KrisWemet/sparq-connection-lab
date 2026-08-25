// Habit anchor pick (Master PRD §4.3 + gate 3).
//
// Habit science (Wood/USC; Gollwitzer's implementation intentions): a new
// behavior sticks when it's welded to an EXISTING routine rather than to a
// time of day or willpower. This screen captures that one existing routine so
// every micro-prime can say "when you pour your coffee…" instead of "sometime
// today".
//
// Writes profiles.habit_anchors (text[]) + onboarding_anchor_set_at.
// Skippable — primes fall back to DEFAULT_ANCHOR.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';

const SUGGESTED_ANCHORS = [
  'you pour your morning coffee',
  'you get in the car after work',
  'you brush your teeth at night',
  'you sit down for dinner',
  'you close your laptop for the day',
  'you turn off your bedside light',
];

interface HabitAnchorPickProps {
  userId: string;
  onComplete: () => void;
}

export function HabitAnchorPick({ userId, onComplete }: HabitAnchorPickProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  const anchor = (custom.trim() || selected || '').trim();

  const save = async () => {
    if (!anchor) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          habit_anchors: [anchor],
          onboarding_anchor_set_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch {
      // fail-soft: primes fall back to the default anchor
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_rgba(46,38,32,0.10)]">
          <div className="mb-5 flex items-center gap-3">
            <PeterAvatar mood="morning" size={40} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60">
              One last thing
            </p>
          </div>

          <h2 className="mb-3 font-serif text-[24px] leading-snug text-brand-espresso">
            When should I find you?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-brand-taupe">
            New things stick better when they ride along with something you already
            do every day. Pick the moment that&apos;s most reliably yours — I&apos;ll
            aim for that.
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {SUGGESTED_ANCHORS.map((a) => (
              <button
                key={a}
                onClick={() => { setSelected(a); setCustom(''); }}
                className={`rounded-full border px-3.5 py-2 text-xs transition-colors ${
                  selected === a && !custom
                    ? 'border-brand-primary bg-brand-primary/15 text-brand-espresso'
                    : 'border-brand-primary/20 text-brand-espresso hover:bg-brand-primary/10'
                }`}
              >
                When {a}
              </button>
            ))}
          </div>

          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
            placeholder="Or describe your own moment…"
            className="mb-6 w-full rounded-xl border border-brand-primary/15 bg-white/70 px-4 py-3 text-sm text-brand-espresso placeholder-brand-taupe/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={save}
            disabled={!anchor || saving}
            className="w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'That\'s my moment'}
          </motion.button>

          <div className="mt-4 text-center">
            <button
              onClick={onComplete}
              disabled={saving}
              className="text-xs text-brand-taupe/70 underline underline-offset-2 hover:text-brand-taupe disabled:opacity-50"
            >
              I&apos;ll decide later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
