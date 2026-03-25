import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface SessionDay {
  day_index: number;
  status: string;
  evening_reflection: string | null;
  evening_emotional_tone: string | null;
}

// Map engagement depth: no reflection = 1, short = 2, deep = 3
function engagementDepth(session: SessionDay): number {
  if (!session.evening_reflection) return 1;
  const wordCount = session.evening_reflection.trim().split(/\s+/).length;
  if (wordCount < 15) return 1;
  if (wordCount < 40) return 2;
  return 3;
}

// Map emotional tone to warm color
function toneColor(tone: string | null): string {
  if (!tone) return 'bg-brand-primary/40';
  const warm = ['hopeful', 'grateful', 'proud', 'calm', 'tender'];
  const cool = ['frustrated', 'sad', 'anxious', 'stuck'];
  if (warm.some(w => tone.includes(w))) return 'bg-brand-growth';
  if (cool.some(c => tone.includes(c))) return 'bg-brand-sand';
  return 'bg-brand-primary/60';
}

interface JourneyArcProps {
  journeyDuration?: number;
}

export function JourneyArc({ journeyDuration = 14 }: JourneyArcProps) {
  const [sessions, setSessions] = useState<SessionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('daily_sessions')
          .select('day_index, status, evening_reflection, evening_emotional_tone')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('day_index', { ascending: true })
          .limit(journeyDuration);

        if (data) setSessions(data);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, [journeyDuration]);

  if (loading || sessions.length === 0) return null;

  // Build array for all days in journey
  const days = Array.from({ length: journeyDuration }, (_, i) => {
    const session = sessions.find(s => s.day_index === i + 1);
    return session || null;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary pl-1 mb-3">
        Journey Arc
      </p>

      <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5">
        <div className="flex items-end gap-1">
          {days.map((session, i) => {
            const depth = session ? engagementDepth(session) : 0;
            const height = depth === 0 ? 8 : depth === 1 ? 16 : depth === 2 ? 28 : 40;
            const color = session ? toneColor(session.evening_emotional_tone) : 'bg-brand-primary/10';

            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`flex-1 rounded-t-sm ${color} ${!session ? 'opacity-30' : ''}`}
                title={session ? `Day ${i + 1}` : `Day ${i + 1} (not yet)`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-brand-text-secondary">Day 1</span>
          <span className="text-[10px] text-brand-text-secondary">Day {journeyDuration}</span>
        </div>
      </div>
    </motion.div>
  );
}
