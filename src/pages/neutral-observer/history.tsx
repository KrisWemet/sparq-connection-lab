import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterLoading } from '@/components/PeterLoading';

type Reflection = {
  id: string;
  screen_1_response: string;
  screen_2_response: string;
  screen_3_response: string;
  trigger_source: string;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncate(text: string, max = 110): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="rounded-2xl border border-brand-primary/10 bg-brand-parchment px-5 py-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-brand-taupe">
          {formatDate(reflection.created_at)}
        </span>
        {reflection.trigger_source === 'state_tag' && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-primary/50 bg-brand-primary/8 px-2 py-0.5 rounded-full">
            After conflict
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-brand-espresso">
        {expanded ? reflection.screen_1_response : truncate(reflection.screen_1_response)}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary/50 mb-1">
                  The outside view
                </p>
                <p className="text-sm leading-relaxed text-brand-espresso">
                  {reflection.screen_2_response}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary/50 mb-1">
                  What I noticed
                </p>
                <p className="text-sm leading-relaxed text-brand-espresso">
                  {reflection.screen_3_response}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 flex items-center gap-1 text-xs text-brand-taupe hover:text-brand-espresso transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp size={13} /> Show less
          </>
        ) : (
          <>
            <ChevronDown size={13} /> Read full reflection
          </>
        )}
      </button>
    </motion.div>
  );
}

export default function ReflectionHistory() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/reflections', { headers });
        if (res.ok) {
          const data = await res.json();
          setReflections(data);
        }
      } catch {
        // leave empty
      } finally {
        setFetching(false);
      }
    }

    void load();
  }, [user]);

  if (loading || !user) return <PeterLoading isLoading />;

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      <div className="mx-auto max-w-lg px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-brand-taupe hover:text-brand-espresso transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary/70 mb-1">
            The Finkel Method
          </p>
          <h1 className="text-2xl font-serif text-brand-espresso">Your Reflections</h1>
        </div>

        {/* List */}
        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-brand-primary/8 bg-brand-parchment/60 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : reflections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-brand-primary/10 bg-brand-parchment px-6 py-8 text-center"
          >
            <p className="text-sm text-brand-taupe leading-relaxed">
              Your first reflection will appear here after you complete one.
            </p>
            <button
              onClick={() => router.push('/neutral-observer')}
              className="mt-4 rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              Start now
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {reflections.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ReflectionCard reflection={r} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
