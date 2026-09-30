import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { SharePrompt } from '@/components/shared/SharePrompt';
import { TONE } from '@/lib/moment-tone';
import { cn } from '@/lib/utils';

type MirrorData = {
  eligible: boolean;
  why_arrived?: string | null;
  north_star?: string | null;
  discoveries?: string[];
  tried?: Array<{ intention: string; outcome: string | null; outcome_note: string | null }>;
  changing?: string[];
  conclusion?: string | null;
};

const OUTCOME_WORDS: Record<string, string> = { helped: 'it helped', mixed: 'it was mixed', didnt_help: "it didn't help" };

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-hover mb-1">{label}</p>
      {children}
    </div>
  );
}

/**
 * Day 30: The Mirror (constitution §9). Shows only what the user said,
 * discovered and tried, plus verified growth — then they write the ending.
 * `compact` is a Home teaser that links to the Journal until they've written it.
 */
export function ThirtyDayMirrorCard({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<MirrorData | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const headers = await buildAuthedHeaders();
        const res = await fetch('/api/me/thirty-day-mirror', { headers });
        if (res.ok) setData(await res.json());
      } catch {
        // fail-soft: the card stays hidden
      }
    })();
  }, []);

  async function save() {
    if (!answer.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/me/thirty-day-mirror', { method: 'POST', headers, body: JSON.stringify({ conclusion: answer }) });
      if (!res.ok) throw new Error('save failed');
      setData(d => (d ? { ...d, conclusion: answer.trim() } : d));
      setJustSaved(true);
    } catch {
      setError("That didn't save. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  if (!data?.eligible) return null;
  if (compact) {
    if (data.conclusion) return null;
    return (
      <Link href="/journal" className="block bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5 hover:bg-brand-parchment/80 transition-colors">
        <div className="flex items-center gap-3">
          <PeterAvatar mood="afternoon" size={32} />
          <div>
            <p className="font-serif text-brand-espresso text-[15px]">Thirty days. Your mirror is ready.</p>
            <p className="text-xs text-brand-hover font-semibold mt-0.5">Open your journal</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(TONE.grow.card, 'rounded-3xl shadow-sm p-6 space-y-4')}
    >
      <div className="flex items-center gap-3">
        <PeterAvatar mood="afternoon" size={32} />
        <p className="text-lg font-serif text-brand-espresso tracking-tight">Your 30-day mirror</p>
      </div>

      {data.why_arrived && (
        <Section label="Why you came">
          <p className="font-serif italic text-brand-espresso text-[15px]">&ldquo;{data.why_arrived}&rdquo;</p>
        </Section>
      )}
      {data.north_star && (
        <Section label="Who you wanted to become">
          <p className="font-serif text-brand-espresso text-[15px]">{data.north_star}</p>
        </Section>
      )}
      {data.discoveries && data.discoveries.length > 0 && (
        <Section label="What you discovered">
          <ul className="space-y-1">
            {data.discoveries.map((d, i) => (
              <li key={i} className="font-serif italic text-brand-espresso text-[15px]">&ldquo;{d}&rdquo;</li>
            ))}
          </ul>
        </Section>
      )}
      {data.tried && data.tried.length > 0 && (
        <Section label="What you tried">
          <ul className="space-y-1">
            {data.tried.map((t, i) => (
              <li key={i} className="text-sm text-brand-espresso">
                &ldquo;{t.intention}&rdquo;{t.outcome && <span className="text-brand-text-secondary"> · {OUTCOME_WORDS[t.outcome] ?? t.outcome}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {data.changing && data.changing.length > 0 && (
        <Section label="What seems to be changing">
          <ul className="space-y-1">
            {data.changing.map((c, i) => <li key={i} className="text-sm text-brand-espresso">{c}</li>)}
          </ul>
        </Section>
      )}

      <div className="bg-brand-linen rounded-2xl p-4 border border-brand-primary/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-hover mb-1">You write the ending</p>
        <p className="font-serif text-brand-espresso text-[15px] leading-relaxed mb-3">
          Looking at all of this, what would you say about who you are becoming?
        </p>
        {data.conclusion ? (
          <>
            <p className="text-sm text-brand-espresso leading-relaxed whitespace-pre-wrap">{data.conclusion}</p>
            {justSaved && <SharePrompt text={data.conclusion} />}
          </>
        ) : (
          <>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={4}
              maxLength={1000}
              aria-label="What would you say about who you are becoming?"
              className="w-full rounded-xl border border-brand-border bg-white/70 p-3 text-sm text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            {error && <p className="text-xs text-brand-hover mt-1">{error}</p>}
            <button
              type="button"
              onClick={save}
              disabled={!answer.trim() || saving}
              className="mt-2 rounded-full bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Keep this'}
            </button>
          </>
        )}
      </div>
    </motion.section>
  );
}
