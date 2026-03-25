import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, TrendingUp, Eye, Pin, ChevronDown } from 'lucide-react';
import { buildAuthedHeaders } from '@/lib/api-auth';

interface GrowthEntry {
  id: string;
  date: string;
  label: string;
  type: 'milestone' | 'breakthrough' | 'pattern' | 'mirror' | 'pinned';
  journey_id: string | null;
  detail: string | null;
}

const TYPE_CONFIG: Record<GrowthEntry['type'], { icon: typeof Sparkles; color: string; bg: string }> = {
  milestone: { icon: Star, color: 'text-brand-sand', bg: 'bg-brand-sand/15' },
  breakthrough: { icon: Sparkles, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  pattern: { icon: TrendingUp, color: 'text-brand-growth', bg: 'bg-brand-growth/15' },
  mirror: { icon: Eye, color: 'text-brand-text-secondary', bg: 'bg-brand-parchment' },
  pinned: { icon: Pin, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GrowthThread() {
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/growth-thread?limit=10', { headers });
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch {
        // Silently fail — growth thread is non-critical
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;
  if (entries.length === 0) return null;

  const visible = expanded ? entries : entries.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-3"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary pl-1">
        Growth Thread
      </p>

      <div className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((entry) => {
              const config = TYPE_CONFIG[entry.type];
              const Icon = config.icon;
              const isExpanded = expandedEntry === entry.id;

              return (
                <motion.button
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="w-full text-left flex items-start gap-3"
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full ${config.bg} flex-shrink-0`}>
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-espresso font-medium leading-snug">
                      {entry.label}
                    </p>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {formatDate(entry.date)}
                    </p>
                    <AnimatePresence>
                      {isExpanded && entry.detail && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-brand-text-secondary font-serif italic leading-relaxed mt-2"
                        >
                          {entry.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {entries.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-3 border-t border-brand-primary/10 flex items-center justify-center gap-1 text-sm text-brand-primary font-medium hover:bg-brand-primary/5 transition-colors"
          >
            {expanded ? 'Show less' : `See all ${entries.length}`}
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}
