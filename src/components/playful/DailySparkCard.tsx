import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Send, Sparkles } from 'lucide-react';
import type { PlayfulPrompt } from '@/data/playful-prompts';
import { analyticsService } from '@/services/analyticsService';

interface DailySparkCardProps {
  prompt: PlayfulPrompt;
  surface: 'dashboard' | 'daily_growth';
  onSwap: () => void;
}

async function shareText(text: string) {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({ text });
    return 'shared';
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return 'copied';
  }

  throw new Error('Sharing is not available');
}

export function DailySparkCard({ prompt, surface, onSwap }: DailySparkCardProps) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [tried, setTried] = useState(false);

  const cardId = useMemo(() => `${prompt.id}:${surface}`, [prompt.id, surface]);

  useEffect(() => {
    void analyticsService.trackEvent('playful_daily_spark_viewed', {
      prompt_id: prompt.id,
      bucket: prompt.bucket,
      surface,
    });
  }, [prompt.id, prompt.bucket, surface]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.sessionStorage.getItem(`sparq_daily_spark_tried:${cardId}`);
    setTried(stored === 'true');
    setShareState('idle');
  }, [cardId]);

  const handleTry = () => {
    setTried(true);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`sparq_daily_spark_tried:${cardId}`, 'true');
    }

    void analyticsService.trackEvent('playful_daily_spark_tried', {
      prompt_id: prompt.id,
      bucket: prompt.bucket,
      surface,
    });
  };

  const handleSend = async () => {
    try {
      const result = await shareText(prompt.sendText);
      setShareState(result === 'shared' ? 'shared' : 'copied');

      void analyticsService.trackEvent('playful_daily_spark_sent', {
        prompt_id: prompt.id,
        bucket: prompt.bucket,
        surface,
        delivery: result,
      });
    } catch {
      setShareState('idle');
    }
  };

  const handleSwap = () => {
    setShareState('idle');
    setTried(false);
    void analyticsService.trackEvent('playful_daily_spark_swapped', {
      prompt_id: prompt.id,
      bucket: prompt.bucket,
      surface,
    });
    onSwap();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.14 }}
      className="bg-white rounded-3xl border border-brand-primary/10 shadow-sm p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-2">
            Today&apos;s Spark
          </p>
          <p className="text-sm text-brand-text-secondary mb-2">
            Light, quick, and fully optional.
          </p>
          <p className="font-serif italic text-brand-espresso text-lg leading-snug">
            {prompt.prompt}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-brand-primary" />
        </div>
      </div>

      <p className="text-sm text-brand-text-secondary leading-relaxed mt-3">
        {prompt.hint}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-primary/8 text-brand-primary px-3 py-1 text-xs font-semibold">
          Under a minute
        </span>
        <span className="rounded-full bg-brand-primary/8 text-brand-primary px-3 py-1 text-xs font-semibold">
          Text or say it live
        </span>
      </div>

      <p className="text-xs text-brand-text-secondary mt-3">
        Keep it light. Skip this one if today feels tender.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={handleTry}
          className="rounded-2xl bg-brand-primary text-white px-4 py-3 text-sm font-semibold hover:bg-brand-hover transition-colors"
        >
          {tried ? 'Doing this today' : 'Try this'}
        </button>
        <button
          onClick={handleSend}
          className="rounded-2xl border border-brand-primary/20 text-brand-primary px-4 py-3 text-sm font-semibold hover:bg-brand-primary/5 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {shareState === 'copied' ? 'Copied to send' : shareState === 'shared' ? 'Sent' : 'Copy text'}
        </button>
        <button
          onClick={handleSwap}
          className="rounded-2xl border border-brand-primary/20 text-brand-text-secondary px-4 py-3 text-sm font-semibold hover:bg-brand-primary/5 transition-colors inline-flex items-center justify-center gap-2"
        >
          <RefreshCcw size={14} />
          Another one
        </button>
      </div>
    </motion.div>
  );
}
