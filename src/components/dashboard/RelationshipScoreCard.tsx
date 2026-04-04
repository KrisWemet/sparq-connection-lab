import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface ScoreData {
  score: {
    overall_score: number;
    communication_quality: number;
    repair_speed: number;
    emotional_safety: number;
    ritual_consistency: number;
  } | null;
  building: boolean;
  history: { overall_score: number; computed_at: string }[];
}

const DIMENSION_LABELS: Record<string, string> = {
  communication_quality: 'Communication',
  repair_speed: 'Repair Speed',
  emotional_safety: 'Emotional Safety',
  ritual_consistency: 'Daily Ritual',
};

const DIMENSION_COLORS: Record<string, string> = {
  communication_quality: 'bg-blue-500',
  repair_speed: 'bg-green-500',
  emotional_safety: 'bg-purple-500',
  ritual_consistency: 'bg-amber-500',
};

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 32;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-brand-primary/60"
      />
    </svg>
  );
}

export function RelationshipScoreCard() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/me/relationship-score', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 rounded-3xl border border-brand-primary/10 shadow-sm p-6 h-48 animate-pulse backdrop-blur-md" />
    );
  }

  if (!data || data.building || !data.score) {
    return (
      <div className="rounded-3xl p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #FFFFFF 0%, #FDF8F6 100%)', border: '1px solid rgba(139,92,246,0.1)', boxShadow: '0 4px 24px rgba(139,92,246,0.06)' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} />
        <Activity className="w-10 h-10 mx-auto mb-4 relative z-10" style={{ color: 'rgba(139,92,246,0.4)' }} />
        <h3 className="text-xl font-serif text-zinc-800 mb-2 relative z-10">Building your connection score...</h3>
        <p className="text-sm max-w-sm mx-auto relative z-10" style={{ color: '#8C827A' }}>
          Complete a few more daily sessions and your Relationship OS Score will appear here.
        </p>
      </div>
    );
  }

  const { score, history } = data;
  const historyScores = history.map(h => h.overall_score);
  const previousScore = historyScores.length >= 2 ? historyScores[historyScores.length - 2] : null;
  const trend = previousScore !== null ? score.overall_score - previousScore : 0;

  const TrendIcon = trend > 1 ? TrendingUp : trend < -1 ? TrendingDown : Minus;
  const trendColor = trend > 1 ? 'text-green-500' : trend < -1 ? 'text-brand-primary' : 'text-zinc-400';

  const dimensions = ['communication_quality', 'repair_speed', 'emotional_safety', 'ritual_consistency'] as const;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-br from-white to-brand-linen/30 rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-lg font-serif text-zinc-800">Relationship OS</h3>
          <MiniSparkline data={historyScores} />
        </div>
        
        <div className="pt-0 pb-4 relative z-10">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-5xl font-serif text-zinc-900">
              {Math.round(score.overall_score)}
            </span>
            <span className="text-sm text-zinc-400 font-medium tracking-wide uppercase">Resonance</span>
            <div className={`flex items-center gap-1 ml-2 px-2.5 py-1 rounded-full bg-white border border-brand-primary/5 shadow-sm ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {trend !== 0 && (
                <span className="text-xs font-bold">
                  {trend > 0 ? '+' : ''}{trend.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {dimensions.map(dim => {
              const value = score[dim];
              return (
                <div key={dim}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500 font-medium tracking-wide">{DIMENSION_LABELS[dim]}</span>
                    <span className="font-semibold text-zinc-700">{Math.round(value)}</span>
                  </div>
                  <div className="h-1.5 bg-brand-linen rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${DIMENSION_COLORS[dim]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
