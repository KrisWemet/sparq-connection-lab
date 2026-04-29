import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Send } from 'lucide-react';
import type { PlayfulPrompt } from '@/data/playful-prompts';
import { analyticsService } from '@/services/analyticsService';

interface FavoriteUsCardProps {
  prompt: PlayfulPrompt;
  dateKey: string;
  surface: 'daily_growth';
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

export function FavoriteUsCard({ prompt, dateKey, surface }: FavoriteUsCardProps) {
  const storageKey = useMemo(
    () => `sparq_favorite_us:${dateKey}:${prompt.id}`,
    [dateKey, prompt.id]
  );

  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [sendState, setSendState] = useState<'idle' | 'copied' | 'shared'>('idle');

  useEffect(() => {
    void analyticsService.trackEvent('playful_favorite_us_viewed', {
      prompt_id: prompt.id,
      bucket: prompt.bucket,
      surface,
    });
  }, [prompt.id, prompt.bucket, surface]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setDraft('');
      setSaved(false);
      setSendState('idle');
      return;
    }

    setDraft(stored);
    setSaved(true);
    setSendState('idle');
  }, [storageKey]);

  const handleSave = () => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(storageKey, draft.trim());
    setSaved(true);

    void analyticsService.trackEvent('playful_favorite_us_saved', {
      prompt_id: prompt.id,
      bucket: prompt.bucket,
      surface,
      length: draft.trim().length,
    });
  };

  const buildShareText = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      return `One thing I like about us today: ${trimmed}`;
    }

    return prompt.sendText;
  };

  const handleSend = async () => {
    try {
      const delivery = await shareText(buildShareText());
      setSendState(delivery === 'shared' ? 'shared' : 'copied');

      void analyticsService.trackEvent('playful_favorite_us_sent', {
        prompt_id: prompt.id,
        bucket: prompt.bucket,
        surface,
        delivery,
        used_draft: Boolean(draft.trim()),
      });
    } catch {
      setSendState('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.2 }}
      className="bg-white rounded-3xl border border-brand-primary/10 shadow-sm p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-2">
            Favorite Us
          </p>
          <p className="text-sm text-brand-text-secondary mb-2">
            A small warm note for an ordinary day.
          </p>
          <p className="font-serif italic text-brand-espresso text-lg leading-snug">
            {prompt.prompt}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart size={18} className="text-brand-primary" />
        </div>
      </div>

      <p className="text-sm text-brand-text-secondary leading-relaxed mt-3">
        {prompt.hint}
      </p>

      <p className="text-xs text-brand-text-secondary mt-3">
        Keep it easy. One line is enough. You can keep this private or send a short version.
      </p>

      <textarea
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setSaved(false);
          setSendState('idle');
        }}
        rows={3}
        placeholder="Write one small thing that felt good about us."
        className="w-full mt-4 rounded-2xl border border-brand-primary/15 bg-brand-linen/70 px-4 py-3 text-sm text-brand-espresso placeholder:text-brand-text-secondary/80 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSave}
          disabled={!draft.trim()}
          className="rounded-2xl bg-brand-primary text-white px-4 py-3 text-sm font-semibold hover:bg-brand-hover transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saved ? 'Kept for today' : 'Keep this note'}
        </button>
        <button
          onClick={handleSend}
          className="rounded-2xl border border-brand-primary/20 text-brand-primary px-4 py-3 text-sm font-semibold hover:bg-brand-primary/5 transition-colors inline-flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {sendState === 'copied' ? 'Copied short note' : sendState === 'shared' ? 'Sent' : 'Copy short note'}
        </button>
      </div>
    </motion.div>
  );
}
