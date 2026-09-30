import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronLeft, Compass, HeartHandshake, NotebookPen } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { WeeklyMirrorCard } from '@/components/dashboard/WeeklyMirrorCard';
import { ExperimentsCard } from '@/components/dashboard/ExperimentsCard';
import { ThirtyDayMirrorCard } from '@/components/dashboard/ThirtyDayMirrorCard';
import { IdentityArcCard } from '@/components/dashboard/IdentityArcCard';
import { GrowthThread } from '@/components/dashboard/GrowthThread';
import { TraitCard } from '@/components/profile/TraitCard';
import { useProfileTraits } from '@/hooks/useProfileTraits';

export default function JournalPage() {
  const router = useRouter();
  const { traits, accessToken, refreshTraits, archetype, archetypeDescription } = useProfileTraits();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-linen pb-28">
        <header className="max-w-lg mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-parchment text-brand-primary flex items-center justify-center transition-colors hover:bg-brand-primary/5"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-hover">
              Journal
            </span>
            <div className="w-10 h-10" aria-hidden="true" />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 relative overflow-hidden"
          >
            <div className="absolute -top-12 right-0 w-32 h-32 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover mb-3">
              Journal
            </p>
            <h1 className="text-xl font-semibold text-brand-text-primary">Journal</h1>
            <p className="font-serif italic text-2xl leading-snug text-brand-text-primary mt-3">
              A quieter place to notice what is changing in you.
            </p>
            <p className="text-sm text-brand-text-secondary leading-relaxed mt-3 max-w-md">
              Keep your patterns, practice, and reflection history together so Home can stay focused on the next small step.
            </p>
          </motion.section>

          <ThirtyDayMirrorCard />
          <WeeklyMirrorCard />
          <ExperimentsCard />
          <IdentityArcCard />

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04 }}
            className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover mb-1">
                  Your interpretation
                </p>
                <h2 className="text-lg font-semibold text-brand-text-primary">
                  {archetype || 'Your journal is taking shape'}
                </h2>
                <p className="text-sm text-brand-text-secondary leading-relaxed mt-2">
                  {archetypeDescription ||
                    'Keep showing up and Peter will turn your reflections into a clearer picture of how you are growing.'}
                </p>
              </div>
            </div>

            <TraitCard
              traits={traits}
              accessToken={accessToken}
              onUpdated={refreshTraits}
            />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08 }}
            className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
                <NotebookPen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover mb-1">
                  Reflection history
                </p>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  Your recent moments stack up here so you can revisit what felt different, steady, or true.
                </p>
              </div>
              <Link
                href="/daily-growth"
                className="text-xs font-semibold tracking-wide text-brand-hover hover:text-brand-espresso"
              >
                Open practice
              </Link>
            </div>
          </motion.section>

          <Link
            href="/us"
            className="flex items-center gap-3 bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5 hover:bg-brand-parchment/80 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-hover mb-1">Your shared space</p>
              <p className="text-sm text-brand-text-secondary leading-relaxed">
                Only what you choose to share with your partner lives there.
              </p>
            </div>
          </Link>

          <GrowthThread />
        </main>
      </div>
    </ProtectedRoute>
  );
}
