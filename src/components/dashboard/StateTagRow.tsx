import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { buildAuthedHeaders } from '@/lib/api-auth';

type StateTag = 'just_had_conflict' | 'partner_shared_good_news' | 'feeling_disconnected' | 'tense_anxious';

const STATE_TAGS: { value: StateTag; label: string; emoji: string; route: string }[] = [
  { value: 'just_had_conflict',        label: 'Just had a conflict',     emoji: '🌊', route: '/daily-growth' },
  { value: 'partner_shared_good_news', label: 'Partner shared good news', emoji: '🎉', route: '/daily-growth' },
  { value: 'feeling_disconnected',     label: 'Feeling disconnected',     emoji: '🌫️', route: '/daily-growth' },
  { value: 'tense_anxious',            label: 'Tense or anxious',         emoji: '🫁', route: '/daily-growth' },
];

interface StateTagRowProps {
  userId: string;
}

export function StateTagRow({ userId }: StateTagRowProps) {
  const router = useRouter();
  const [tapped, setTapped] = useState<StateTag | null>(null);

  const handleTap = async (tag: (typeof STATE_TAGS)[number]) => {
    if (tapped) return;
    setTapped(tag.value);

    // Log state event (fire-and-forget)
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      void fetch('/api/state-events', {
        method: 'POST',
        headers,
        body: JSON.stringify({ state_tag: tag.value }),
      });
    } catch {
      // non-blocking
    }

    router.push(tag.route);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary/60 px-1">
        How are you right now?
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATE_TAGS.map((tag) => (
          <button
            key={tag.value}
            onClick={() => handleTap(tag)}
            disabled={Boolean(tapped)}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              tapped === tag.value
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-brand-primary/12 bg-brand-parchment text-brand-espresso hover:bg-white/80'
            }`}
          >
            <span>{tag.emoji}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
