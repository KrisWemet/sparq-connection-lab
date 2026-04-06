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
      className="rounded-[30px] border border-brand-primary/10 bg-brand-linen/90 p-5 shadow-[0_16px_36px_rgba(42,34,52,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-brand-primary/80">
            Today&apos;s Spark
          </p>
          <p className="mb-2 text-sm text-brand-taupe">
            Light, quick, and fully optional.
          </p>
          <p className="font-serif italic text-[17px] leading-snug text-brand-espresso">
            {prompt.prompt}
          </p>
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[18px] border border-brand-primary/10 bg-white text-brand-primary shadow-sm">
          <Sparkles size={16} className="text-brand-primary" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-brand-taupe">
        {prompt.hint}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-brand-primary/10 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
          Under a minute
        </span>
        <span className="rounded-full border border-brand-primary/10 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
          Text or say it live
        </span>
      </div>

      <p className="mt-3 text-xs text-brand-taupe">
        Keep it light. Skip this one if today feels tender.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          onClick={handleTry}
          className="rounded-2xl border border-brand-primary/15 bg-white px-4 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5"
        >
          {tried ? 'Doing this today' : 'Try this'}
        </button>
        <button
          onClick={handleSend}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-primary/12 bg-transparent px-4 py-3 text-sm font-semibold text-brand-taupe transition-colors hover:bg-white/60 hover:text-brand-primary"
        >
          <Send size={14} />
          {shareState === 'copied' ? 'Copied to send' : shareState === 'shared' ? 'Sent' : 'Copy text'}
        </button>
        <button
          onClick={handleSwap}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-primary/12 bg-transparent px-4 py-3 text-sm font-semibold text-brand-taupe transition-colors hover:bg-white/60 hover:text-brand-primary"
        >
          <RefreshCcw size={14} />
          Another one
        </button>
      </div>
    </motion.div>
  );
}
