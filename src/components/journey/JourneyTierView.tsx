import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export type TierId = 'roots' | 'growth' | 'bloom';

export interface JourneyTierConcept {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  example: string;
}

export interface JourneyTier {
  id: TierId;
  concepts: JourneyTierConcept[];
  totalDays: number;
  completionCriteria?: {
    requireConceptSelection?: boolean;
    requireReflection?: boolean;
    minReflectionLength?: number;
    requireActivity?: boolean;
  };
}

interface JourneyTierViewProps {
  journeyId: string;
  title: string;
  description: string;
  duration?: string;
  category?: string;
  overview?: string;
  benefits?: string[];
  psychology?: string[];
  tiers: JourneyTier[];
  onSelectTier: (tier: TierId) => void;
}

const TIER_META: Record<TierId, { name: string; tagline: string; color: string; bgColor: string; borderColor: string }> = {
  roots: {
    name: 'Roots',
    tagline: 'Build awareness and understanding',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  growth: {
    name: 'Growth',
    tagline: 'Practice with intention and nuance',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  bloom: {
    name: 'Bloom',
    tagline: 'Integrate into your natural way of relating',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/5',
    borderColor: 'border-brand-primary/20',
  },
};

const TIER_ICONS: Record<TierId, string> = {
  roots: '🌱',
  growth: '🌿',
  bloom: '🌸',
};

function getTierProgress(journeyId: string, tierId: TierId): { completed: boolean; currentDay: number; totalDays: number } {
  if (typeof window === 'undefined') return { completed: false, currentDay: 0, totalDays: 14 };

  try {
    const raw = localStorage.getItem('sparq_tier_progress');
    if (!raw) return { completed: false, currentDay: 0, totalDays: 14 };
    const progress = JSON.parse(raw);
    const tierData = progress?.[journeyId]?.[tierId];
    if (!tierData) return { completed: false, currentDay: 0, totalDays: 14 };
    return tierData;
  } catch {
    return { completed: false, currentDay: 0, totalDays: 14 };
  }
}

function isTierUnlocked(journeyId: string, tierId: TierId): boolean {
  if (tierId === 'roots') return true;
  const prerequisite: TierId = tierId === 'growth' ? 'roots' : 'growth';
  return getTierProgress(journeyId, prerequisite).completed;
}

function buildBestFitCopy(title: string, category?: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('communication')) return 'Best if talks turn into misses, tension, or shutdowns.';
  if (lowerTitle.includes('conflict')) return 'Best if hard moments get hot fast or never really get resolved.';
  if (lowerTitle.includes('love language')) return 'Best if you both care, but love is not landing the way you hoped.';
  if (lowerTitle.includes('intimacy') || lowerTitle.includes('sexual')) return 'Best if you want more closeness, safety, and honest connection.';
  if (lowerTitle.includes('trust')) return 'Best if trust feels shaky and you need a clear rebuild path.';
  if (lowerTitle.includes('attachment')) return 'Best if old patterns keep showing up and you want to understand why.';
  if (lowerTitle.includes('values')) return 'Best if you want to get on the same page about what matters most.';
  return category === 'Foundation'
    ? 'Best if you want a steady skill-building path for your relationship.'
    : 'Best if you want guided practice around this part of your relationship.';
}

export function JourneyTierView({
  journeyId,
  title,
  description,
  duration,
  category,
  overview,
  benefits,
  psychology,
  tiers,
  onSelectTier,
}: JourneyTierViewProps) {
  const router = useRouter();
  const bestFitCopy = buildBestFitCopy(title, category);

  return (
    <div className="min-h-screen bg-brand-linen pb-28 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 mix-blend-multiply" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-sand/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 mix-blend-multiply" />

      <div className="max-w-lg mx-auto px-4 pt-6 relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/journeys')}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-brand-taupe transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          All Journeys
        </motion.button>

        {/* Journey header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif font-bold text-brand-taupe tracking-tight mb-2">{title}</h1>
          <p className="text-zinc-500 leading-relaxed">{description}</p>
          <div className="mt-4 rounded-[1.5rem] bg-white/80 border border-brand-primary/10 p-5 shadow-sm">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mb-2">Before You Start</p>
            <p className="text-sm text-brand-taupe leading-relaxed mb-3">
              {overview || description}
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-3">
              {bestFitCopy}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mb-3">
              {category && <span className="rounded-full bg-brand-linen px-3 py-1">{category}</span>}
              {duration && <span className="rounded-full bg-brand-linen px-3 py-1">{duration}</span>}
              <span className="rounded-full bg-brand-linen px-3 py-1">{tiers.length} stages</span>
            </div>
            {benefits && benefits.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">What You Will Practice</p>
                {benefits.slice(0, 3).map((benefit) => (
                  <p key={benefit} className="text-sm text-zinc-600 leading-relaxed">
                    {benefit}
                  </p>
                ))}
              </div>
            )}
            {psychology && psychology.length > 0 && (
              <p className="text-xs text-zinc-400 mt-3">
                Built from: {psychology.slice(0, 3).join(' • ')}
              </p>
            )}
          </div>
        </motion.div>

        {/* Tier progression */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-12 bottom-12 w-px bg-gradient-to-b from-emerald-300 via-amber-300 to-brand-primary/40" />

          <div className="space-y-4">
            {tiers.map((tier, idx) => {
              const meta = TIER_META[tier.id];
              const icon = TIER_ICONS[tier.id];
              const unlocked = isTierUnlocked(journeyId, tier.id);
              const progress = getTierProgress(journeyId, tier.id);
              const isComplete = progress.completed;
              const isInProgress = !isComplete && progress.currentDay > 0;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <button
                    onClick={() => unlocked && onSelectTier(tier.id)}
                    disabled={!unlocked}
                    className={`w-full text-left rounded-[1.5rem] border p-5 transition-all duration-300 relative ${
                      unlocked
                        ? `${meta.bgColor} ${meta.borderColor} hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`
                        : 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Tier icon */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        unlocked ? 'bg-white shadow-sm' : 'bg-zinc-100'
                      }`}>
                        {isComplete ? (
                          <CheckCircle className="w-7 h-7 text-emerald-500" />
                        ) : unlocked ? (
                          icon
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>

                      {/* Tier info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-bold ${unlocked ? meta.color : 'text-zinc-400'}`}>
                            {meta.name}
                          </h3>
                          {isComplete && (
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Complete
                            </span>
                          )}
                          {isInProgress && (
                            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Day {progress.currentDay}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${unlocked ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {meta.tagline}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>{tier.totalDays} days</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300" />
                          <span>{tier.concepts.length} concepts</span>
                        </div>

                        {/* Progress bar for in-progress tiers */}
                        {isInProgress && (
                          <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(progress.currentDay / tier.totalDays) * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      {unlocked && !isComplete && (
                        <ChevronRight className={`w-5 h-5 mt-1 flex-shrink-0 ${meta.color} opacity-50`} />
                      )}
                    </div>

                    {/* Lock message */}
                    {!unlocked && (
                      <p className="text-xs text-zinc-400 mt-2 ml-20">
                        Complete {TIER_META[idx === 1 ? 'roots' : 'growth'].name} to unlock
                      </p>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
