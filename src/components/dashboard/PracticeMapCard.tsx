import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface SessionDot {
  dayIndex: number;
  status: string | null;
  depth: 'deep' | 'light' | null;
  isToday: boolean;
}

export function PracticeMapCard({ totalDays = 14 }: { totalDays?: number }) {
  const [dots, setDots] = useState<SessionDot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [insightsResult, sessionsResult] = await Promise.all([
          supabase.from('user_insights').select('onboarding_day').eq('user_id', user.id).maybeSingle(),
          supabase
            .from('daily_sessions')
            .select('day_index, status, reflection_depth, evening_completed_at')
            .eq('user_id', user.id)
            .order('day_index', { ascending: true })
            .limit(totalDays),
        ]);

        const currentDay = insightsResult.data?.onboarding_day ?? 1;
        const sessions = sessionsResult.data ?? [];
        const sessionMap = new Map(sessions.map((s: any) => [s.day_index, s]));

        const builtDots: SessionDot[] = Array.from({ length: totalDays }, (_, i) => {
          const dayIndex = i + 1;
          const session = sessionMap.get(dayIndex) as any;
          const isCompleted = session?.evening_completed_at || session?.status === 'completed';
          return {
            dayIndex,
            status: isCompleted ? 'completed' : dayIndex < currentDay ? 'missed' : null,
            depth: session?.reflection_depth ?? null,
            isToday: dayIndex === currentDay,
          };
        });

        setDots(builtDots);
      } catch {
        setDots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [totalDays]);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm px-5 py-4"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-4">
        Practice map
      </p>

      <div className="flex items-center gap-1.5 flex-wrap">
        {dots.map((dot) => {
          let bg = 'bg-brand-primary/15'; // future / hollow
          let ring = '';

          if (dot.isToday) {
            bg = 'bg-brand-sand';
            ring = 'ring-2 ring-brand-sand/30 ring-offset-1 ring-offset-brand-parchment';
          } else if (dot.status === 'completed') {
            bg = dot.depth === 'deep' ? 'bg-brand-espresso' : dot.depth === 'light' ? 'bg-brand-primary/40' : 'bg-brand-primary';
          } else if (dot.status === 'missed') {
            bg = 'bg-brand-primary/15';
          }

          return (
            <motion.div
              key={dot.dayIndex}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: dot.dayIndex * 0.03, duration: 0.25 }}
              className={`w-4 h-4 rounded-full ${bg} ${ring} transition-all`}
              title={`Day ${dot.dayIndex}`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-[10px] text-[#5B4A86]/60">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block" />
          Completed
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#5B4A86]/60">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-espresso inline-block" />
          Deep
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#5B4A86]/60">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-sand inline-block" />
          Today
        </span>
      </div>
    </motion.div>
  );
}
