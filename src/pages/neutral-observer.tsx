import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { PeterLoading } from '@/components/PeterLoading';

type Phase = 'entry' | 'privacy_notice' | 'screen_1' | 'screen_2' | 'screen_3' | 'completion';

const PRIVACY_SEEN_KEY = 'nor_privacy_seen';

const slide = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
  transition: { duration: 0.28, ease: 'easeInOut' },
};

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            'h-1.5 rounded-full transition-all duration-300',
            i < current ? 'w-4 bg-brand-primary' : i === current ? 'w-4 bg-brand-primary' : 'w-1.5 bg-brand-primary/25',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export default function NeutralObserver() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('entry');
  const [showTooltip, setShowTooltip] = useState(false);
  const [saving, setSaving] = useState(false);

  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const partnerName = (profile as any)?.partner_name || 'your partner';
  const triggerSource = router.query.trigger === 'conflict' ? 'state_tag' : 'on_demand';

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (phase === 'screen_1' || phase === 'screen_2' || phase === 'screen_3') {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [phase]);

  function handleBegin() {
    const seen = typeof window !== 'undefined' && localStorage.getItem(PRIVACY_SEEN_KEY) === 'true';
    setPhase(seen ? 'screen_1' : 'privacy_notice');
  }

  function handlePrivacyContinue() {
    if (typeof window !== 'undefined') localStorage.setItem(PRIVACY_SEEN_KEY, 'true');
    setPhase('screen_1');
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const headers = await buildAuthedHeaders();
      await fetch('/api/reflections', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ screen_1: answer1, screen_2: answer2, screen_3: answer3, trigger_source: triggerSource }),
      });
    } catch {
      // non-blocking — don't block the completion screen on a save failure
    } finally {
      setSaving(false);
      setPhase('completion');
    }
  }

  if (loading || !user) return <PeterLoading isLoading />;

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col">
      {/* Back nav — hidden on entry and completion */}
      {phase !== 'entry' && phase !== 'completion' && (
        <div className="mx-auto w-full max-w-lg px-4 pt-5 flex items-center">
          <button
            onClick={() => {
              const prev: Record<Phase, Phase> = {
                entry: 'entry',
                privacy_notice: 'entry',
                screen_1: 'entry',
                screen_2: 'screen_1',
                screen_3: 'screen_2',
                completion: 'completion',
              };
              setPhase(prev[phase]);
            }}
            className="flex items-center gap-1 text-sm text-brand-taupe hover:text-brand-espresso transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* ── ENTRY SCREEN ── */}
            {phase === 'entry' && (
              <motion.div key="entry" {...slide} className="space-y-6">
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-1">
                        Northwestern University Research
                      </p>
                      <h1 className="font-serif text-[28px] leading-tight text-brand-espresso">
                        The Finkel Method
                      </h1>
                      <p className="text-sm text-brand-taupe mt-1">
                        Three minutes. Based on peer-reviewed research.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTooltip((v) => !v)}
                      aria-label="About this study"
                      className="mt-1 flex-shrink-0 p-1.5 rounded-full text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/8 transition-colors"
                    >
                      <Info size={18} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        key="tooltip"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-brand-primary/6 px-4 py-3 mb-5 relative">
                          <button
                            onClick={() => setShowTooltip(false)}
                            className="absolute top-2 right-2 text-brand-taupe hover:text-brand-espresso"
                          >
                            <X size={14} />
                          </button>
                          <p className="text-xs leading-relaxed text-brand-espresso pr-4">
                            In 2013, Northwestern researchers led by Eli Finkel published a study in{' '}
                            <em>Psychological Science</em>. 120 couples. Three 7-minute writing sessions
                            per year, done alone. Over two years, the intervention completely eliminated
                            the normal decline in marital quality. That study is the foundation for
                            this feature.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-sm leading-relaxed text-brand-taupe mb-6">
                    There&apos;s one study we come back to over and over. In 2013, researchers at
                    Northwestern asked 120 couples to do a short writing exercise three times a year —
                    about seven minutes each time.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-6">
                    Two years later, the couples who did it had preserved their relationship
                    satisfaction. The ones who didn&apos;t had declined, as most couples do.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-espresso font-medium mb-7">
                    It&apos;s your turn.
                  </p>

                  <button
                    onClick={handleBegin}
                    className="w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    Begin
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── PRIVACY NOTICE ── */}
            {phase === 'privacy_notice' && (
              <motion.div key="privacy" {...slide} className="space-y-6">
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <h2 className="font-serif text-[26px] leading-tight text-brand-espresso mb-4">
                    This stays with you.
                  </h2>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-3">
                    Your reflections are encrypted and private.{' '}
                    <span className="text-brand-espresso font-medium">{partnerName}</span> cannot see
                    them unless you choose to share.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-8">
                    Write honestly. No one&apos;s grading this.
                  </p>
                  <button
                    onClick={handlePrivacyContinue}
                    className="w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SCREEN 1 ── */}
            {phase === 'screen_1' && (
              <motion.div key="screen_1" {...slide} className="space-y-5">
                <ProgressDots current={0} total={3} />
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-7 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-4">
                    Step 1 of 3
                  </p>
                  <p className="text-sm leading-relaxed text-brand-espresso mb-5">
                    Bring to mind a recent disagreement with{' '}
                    <span className="font-medium">{partnerName}</span>. Not the worst one — just one
                    that&apos;s still fresh. Take thirty seconds and let it come into focus: where you
                    were, what was said, how it ended.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-5">
                    When you have it, write a few words here, then tap Next.
                  </p>
                  <textarea
                    ref={textareaRef}
                    value={answer1}
                    onChange={(e) => setAnswer1(e.target.value)}
                    rows={4}
                    placeholder="What comes to mind…"
                    className="w-full rounded-xl border border-brand-primary/15 bg-white/70 px-4 py-3 text-sm text-brand-espresso placeholder-brand-taupe/50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <button
                    onClick={() => setPhase('screen_2')}
                    disabled={!answer1.trim()}
                    className="mt-5 w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SCREEN 2 ── */}
            {phase === 'screen_2' && (
              <motion.div key="screen_2" {...slide} className="space-y-5">
                <ProgressDots current={1} total={3} />
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-7 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-4">
                    Step 2 of 3
                  </p>
                  <p className="text-sm leading-relaxed text-brand-espresso mb-3">
                    Now step outside it. Imagine a neutral third party who cares about both of you.
                    Someone who wants the best for you <em>and</em> the best for{' '}
                    <span className="font-medium">{partnerName}</span>.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-5">
                    In your own words, describe what happened the way that person would see it. What
                    would they notice that you might be missing in the heat of it?
                  </p>
                  <textarea
                    ref={textareaRef}
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    rows={5}
                    placeholder="From the outside, looking in…"
                    className="w-full rounded-xl border border-brand-primary/15 bg-white/70 px-4 py-3 text-sm text-brand-espresso placeholder-brand-taupe/50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <button
                    onClick={() => setPhase('screen_3')}
                    disabled={!answer2.trim()}
                    className="mt-5 w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── SCREEN 3 ── */}
            {phase === 'screen_3' && (
              <motion.div key="screen_3" {...slide} className="space-y-5">
                <ProgressDots current={2} total={3} />
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-7 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-primary/60 mb-4">
                    Step 3 of 3
                  </p>
                  <p className="text-sm leading-relaxed text-brand-espresso mb-2">
                    Last part. Two questions:
                  </p>
                  <ol className="space-y-2 mb-5 text-sm leading-relaxed text-brand-taupe list-decimal pl-4">
                    <li>
                      What&apos;s one thing that makes it hard for you to hold that outside view when
                      you&apos;re actually in the middle of a disagreement?
                    </li>
                    <li>
                      What&apos;s one small thing you could try next time to help yourself get there?
                    </li>
                  </ol>
                  <p className="text-xs text-brand-taupe/70 mb-4">
                    There&apos;s no wrong answer. You&apos;re the only one who will see this.
                  </p>
                  <textarea
                    ref={textareaRef}
                    value={answer3}
                    onChange={(e) => setAnswer3(e.target.value)}
                    rows={5}
                    placeholder="What gets in the way… and what might help…"
                    className="w-full rounded-xl border border-brand-primary/15 bg-white/70 px-4 py-3 text-sm text-brand-espresso placeholder-brand-taupe/50 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <button
                    onClick={handleFinish}
                    disabled={!answer3.trim() || saving}
                    className="mt-5 w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving…' : 'Finish'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── COMPLETION ── */}
            {phase === 'completion' && (
              <motion.div key="completion" {...slide} className="space-y-6">
                <div className="rounded-[28px] border border-brand-primary/12 bg-brand-parchment px-7 py-8 shadow-[0_20px_50px_rgba(42,34,52,0.10)]">
                  <h2 className="font-serif text-[28px] leading-tight text-brand-espresso mb-5">
                    That&apos;s the practice.
                  </h2>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-3">
                    You&apos;ll get a Neutral Observer Reflection again in about 90 days — or anytime
                    you log a new conflict.
                  </p>
                  <p className="text-sm leading-relaxed text-brand-taupe mb-7">
                    The research says you don&apos;t need to do more than this. Three times a year was
                    the whole intervention.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full rounded-[22px] bg-brand-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover mb-3"
                  >
                    Done
                  </button>
                  <div className="flex justify-center">
                    <button
                      onClick={() => router.push('/neutral-observer/history')}
                      className="text-sm text-brand-taupe hover:text-brand-espresso transition-colors"
                    >
                      View your reflection history →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
