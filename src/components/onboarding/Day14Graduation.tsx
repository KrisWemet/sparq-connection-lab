import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { CheckCircle, Compass, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { SceneAccent } from '@/components/emotion/EmotionalEnvironment';
import { supabase } from '@/lib/supabase';
import { CsiTrajectoryCard } from '@/components/dashboard/CsiTrajectoryCard';

interface GraduationReport {
  what_i_learned: string;
  biggest_growth: string;
  relationship_superpower: string;
  focus_next: string;
  recommended_track?: string;
  reveal?: {
    narrative: string;
    before_quote: string | null;
    after_quote: string | null;
    verified: boolean;
    days_showed_up: number;
  } | null;
}

const TRACK_LABELS: Record<string, string> = {
  conflict_repair: 'Conflict Repair',
  trust_security: 'Trust & Security',
  communication: 'Communication',
};

export function Day14Graduation() {
    const router = useRouter();
    const [report, setReport] = useState<GraduationReport | null>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [northStar, setNorthStar] = useState<string | null>(null);
    const [boundaryDone, setBoundaryDone] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.access_token) return;

                const res = await fetch('/api/me/graduation-report', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && !data.error) setReport(data);
                }

                // North Star boundary beat (spec §2/§5)
                const nsRes = await fetch('/api/me/north-star', {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (nsRes.ok) {
                    const ns = await nsRes.json();
                    if (ns.line) setNorthStar(ns.line);
                }
            } catch {} finally {
                setReportLoading(false);
            }
        })();
    }, []);

    const answerBoundary = async (action: 'reaffirm' | 'shift') => {
        setBoundaryDone(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return;
            await fetch('/api/me/north-star', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ action }),
            });
        } catch { /* fail-soft */ }
    };

    return (
        <div className="emotion-page emotion-accomplishment min-h-dvh bg-brand-linen flex flex-col items-center justify-start p-6 pb-12">
            <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="emotion-featured emotion-surface relative overflow-hidden bg-popover rounded-3xl p-8 shadow-xl max-w-sm w-full border border-growth/20 mt-8"
            >
                <SceneAccent kind="bloom" className="-mt-4 mb-3 h-36 w-full" />

                <h1 className="text-3xl font-bold text-foreground mb-2 text-center">You did it.</h1>
                <p className="text-brand-text-secondary mb-6 text-center">14 days of showing up.</p>

                <div className="bg-gradient-to-br from-growth-subtle to-card rounded-2xl p-5 mb-6 text-left space-y-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="text-growth-emphasis mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-foreground leading-relaxed">
                            You built a consistent habit of reflecting and connecting.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="text-growth-emphasis mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-foreground leading-relaxed">
                            You proved to yourself that small, daily actions matter more than giant ones.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Compass className="text-growth-emphasis mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                            Your journeys are ready when you are. Go deeper wherever you choose.
                        </p>
                    </div>
                </div>

                {/* Personalized Report Section */}
                {reportLoading ? (
                    <div className="space-y-3 mb-6 animate-pulse">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                        <div className="h-3 bg-muted rounded w-4/6" />
                    </div>
                ) : report ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4 mb-6"
                    >
                        {/* Compound Reveal — the user's own words, then and now (spec §5.3) */}
                        {report.reveal?.narrative && (
                            <div className="rounded-2xl bg-popover border border-growth/20 p-4 shadow-sm">
                                <p className="note-label text-growth-emphasis mb-3">
                                    Something I kept for you
                                </p>
                                {report.reveal.verified && report.reveal.before_quote && (
                                    <blockquote className="mb-3 font-serif text-base italic leading-relaxed text-brand-text-secondary">
                                        &ldquo;{report.reveal.before_quote}&rdquo;
                                        <span className="mt-1 block not-italic text-xs text-brand-text-secondary">— you, when we started</span>
                                    </blockquote>
                                )}
                                {report.reveal.verified && report.reveal.after_quote && (
                                    <blockquote className="mb-3 font-serif text-lg italic leading-relaxed text-foreground">
                                        &ldquo;{report.reveal.after_quote}&rdquo;
                                        <span className="mt-1 block not-italic text-xs text-brand-text-secondary">— you, this week</span>
                                    </blockquote>
                                )}
                                <p className="text-sm text-foreground leading-relaxed">{report.reveal.narrative}</p>
                            </div>
                        )}

                        {/* Day-14 CSI trajectory — PRD §4.2 conversion moment.
                            Renders only when a baseline exists; reports honestly
                            even when flat or down. */}
                        <CsiTrajectoryCard />

                        {/* North Star boundary beat (spec §2/§5) */}
                        {northStar && (
                            <div className="rounded-2xl bg-popover border border-brand-primary/10 p-4 shadow-sm">
                                <p className="text-sm text-foreground leading-relaxed mb-1">
                                    When we started, you told me:
                                </p>
                                <p className="text-sm italic text-foreground mb-3">&ldquo;{northStar}&rdquo;</p>
                                {boundaryDone ? (
                                    <p className="text-xs text-brand-text-secondary">Thank you. I&apos;ll keep that close. 🦦</p>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => answerBoundary('reaffirm')}
                                            className="flex-1 rounded-xl border border-growth/40 bg-growth-subtle px-3 py-2 text-xs font-medium text-growth-emphasis hover:bg-growth/20"
                                        >
                                            Still true
                                        </button>
                                        <button
                                            onClick={() => answerBoundary('shift')}
                                            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                                        >
                                            It&apos;s shifting
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* What Peter noticed */}
                        <div className="rounded-2xl bg-brand-linen border border-brand-primary/10 p-4">
                            <p className="note-label mb-2 flex items-center gap-1.5">
                                <Sparkles size={12} />
                                What Peter noticed
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{report.what_i_learned}</p>
                            <p className="text-xs text-brand-text-secondary mt-2">These are Peter&apos;s guesses. You&apos;re the judge of what fits.</p>
                        </div>

                        {/* Biggest Growth */}
                        <div className="rounded-2xl bg-growth-subtle border border-growth/20 p-4">
                            <p className="note-label text-growth-emphasis mb-2 flex items-center gap-1.5">
                                <TrendingUp size={12} />
                                A change Peter saw
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{report.biggest_growth}</p>
                        </div>

                        {/* Superpower */}
                        <div className="rounded-2xl bg-insight-subtle border border-insight/20 p-4">
                            <p className="note-label text-growth-emphasis mb-2">
                                One strength Peter saw
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{report.relationship_superpower}</p>
                        </div>

                        {/* Next Focus */}
                        <div className="rounded-2xl bg-background border border-border p-4">
                            <p className="note-label text-muted-foreground mb-2">
                                Something you might explore next
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">{report.focus_next}</p>
                        </div>

                        {/* Recommended Track */}
                        {report.recommended_track && (
                            <div className="rounded-2xl bg-brand-primary p-4 text-white font-bold">
                                <p className="note-label mb-1 text-white/70">
                                    Recommended skill track
                                </p>
                                <p className="font-semibold text-base">
                                    {TRACK_LABELS[report.recommended_track] || report.recommended_track}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ) : null}

                <button
                    onClick={() => router.push('/journeys')}
                    className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-4 rounded-2xl hover:bg-brand-hover transition-colors"
                >
                    Explore journeys
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        </div>
    );
}
