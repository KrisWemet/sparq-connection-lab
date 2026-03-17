import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { CheckCircle, Award, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

interface GraduationReport {
  what_i_learned: string;
  biggest_growth: string;
  relationship_superpower: string;
  focus_next: string;
  recommended_track?: string;
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

    useEffect(() => {
        // Fire confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

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
            } catch {} finally {
                setReportLoading(false);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 flex flex-col items-center justify-start p-6 pb-12">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full border border-teal-100 mt-8"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-4xl shadow-inner shadow-white/20">
                        🦦
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">You Did It.</h1>
                <p className="text-gray-500 mb-6 text-center">14 days of showing up.</p>

                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-5 mb-6 text-left space-y-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="text-teal-500 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-gray-700 leading-relaxed">
                            You built a consistent habit of reflecting and connecting.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle className="text-teal-500 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm text-gray-700 leading-relaxed">
                            You proved to yourself that small, daily actions matter more than giant ones.
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Award className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                            Skill Tree Unlocked
                        </p>
                    </div>
                </div>

                {/* Personalized Report Section */}
                {reportLoading ? (
                    <div className="space-y-3 mb-6 animate-pulse">
                        <div className="h-3 bg-gray-100 rounded w-full" />
                        <div className="h-3 bg-gray-100 rounded w-5/6" />
                        <div className="h-3 bg-gray-100 rounded w-4/6" />
                    </div>
                ) : report ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4 mb-6"
                    >
                        {/* What Peter Noticed */}
                        <div className="rounded-2xl bg-brand-linen border border-indigo-100 p-4">
                            <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles size={12} />
                                What Peter Noticed
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{report.what_i_learned}</p>
                        </div>

                        {/* Biggest Growth */}
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <TrendingUp size={12} />
                                Your Biggest Growth
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{report.biggest_growth}</p>
                        </div>

                        {/* Superpower */}
                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                                ✨ Your Superpower
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{report.relationship_superpower}</p>
                        </div>

                        {/* Next Focus */}
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Your Next Focus
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">{report.focus_next}</p>
                        </div>

                        {/* Recommended Track */}
                        {report.recommended_track && (
                            <div className="rounded-2xl bg-brand-primary p-4 text-white">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-indigo-200">
                                    Recommended Skill Track
                                </p>
                                <p className="font-semibold text-base">
                                    {TRACK_LABELS[report.recommended_track] || report.recommended_track}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ) : null}

                <button
                    onClick={() => router.push('/skill-tree')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                    Enter the Skill Tree
                    <ArrowRight size={18} />
                </button>
            </motion.div>
        </div>
    );
}
