import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { PeterLoading } from "@/components/PeterLoading";

// Dashboard components
import { PeterGreeting } from "@/components/dashboard/PeterGreeting";
import { supabase } from "@/lib/supabase";

import { Bell, Moon } from "lucide-react";

import { getJourneyVelocityStatus } from "@/services/journeyContentService";
import { journeys } from "@/data/journeys";
import { BetaFeedbackDialog } from '@/components/beta/BetaFeedbackDialog';
import { trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';
import { fetchPlayfulConnectionToday } from '@/lib/playfulConnection';
import type { PlayfulPrompt } from '@/data/playful-prompts';
import { DailySparkCard } from '@/components/playful/DailySparkCard';
import { HomeDestinationStrip } from "@/components/dashboard/HomeDestinationStrip";
import { EditorialEyebrow } from "@/components/editorial/EditorialSurface";
import { IfThenCheckinCard } from "@/components/dashboard/IfThenCheckinCard";
import { StateTagRow } from "@/components/dashboard/StateTagRow";

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(1);
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [dailySpark, setDailySpark] = useState<PlayfulPrompt | null>(null);
  const [dailySparkOffset, setDailySparkOffset] = useState(0);

  // Evening check-in eligibility
  const [showEveningCTA, setShowEveningCTA] = useState(false);

  // If-then plan check-in
  const [pendingCheckin, setPendingCheckin] = useState<{ sessionId: string; planText: string } | null>(null);

  // Journey completion state
  const [completionState, setCompletionState] = useState<string | null>(null);

  // Load Active Journey Context + check today's session status
  useEffect(() => {
    async function loadContext() {
      const status = await getJourneyVelocityStatus();
      if (status.activeJourneyId) {
        const journeyMeta = journeys.find((j) => j.id === status.activeJourneyId);
        setActiveJourney(journeyMeta);
      }
    }
    loadContext();
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  useEffect(() => {
    if (!router.isReady || !user) return;
    if (router.query.from !== 'onboarding') return;

    void trackPrimaryPathClientEvent('beta_primary_dashboard_arrived', {
      arrival_source: 'onboarding',
    });
  }, [router.isReady, router.query.from, user]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function loadDashboardData() {
      try {
        // Fetch user insights + today's session in parallel
        const today = new Date().toISOString().slice(0, 10);
        const [insightsResult, sessionResult] = await Promise.all([
          supabase
            .from("user_insights")
            .select("onboarding_day, journey_completion_state, active_journey_id")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("daily_sessions")
            .select("id, status, morning_viewed_at, evening_completed_at")
            .eq("user_id", userId)
            .eq("session_local_date", today)
            .maybeSingle(),
        ]);

        if (insightsResult.data?.onboarding_day) {
          setCurrentDay(Math.max(1, insightsResult.data.onboarding_day));
        }
        if (insightsResult.data?.journey_completion_state) {
          setCompletionState(insightsResult.data.journey_completion_state);
        }

        // Show evening CTA if morning is viewed but evening not yet completed
        const session = sessionResult.data;
        if (session) {
          const morningDone = session.status === 'morning_viewed' || session.status === 'evening_active';
          const eveningNotDone = !session.evening_completed_at;
          if (morningDone && eveningNotDone) {
            setShowEveningCTA(true);
          }
        }

        // Check for a completed session with an if-then plan that hasn't been checked in yet
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const { data: planSession } = await supabase
          .from('daily_sessions')
          .select('id, if_then_plan')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .not('if_then_plan', 'is', null)
          .gte('evening_completed_at', cutoff)
          .order('evening_completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planSession?.if_then_plan) {
          const { data: existingCheckin } = await supabase
            .from('if_then_checkins')
            .select('id')
            .eq('session_id', planSession.id)
            .maybeSingle();

          if (!existingCheckin) {
            setPendingCheckin({ sessionId: planSession.id, planText: planSession.if_then_plan });
          }
        }
      } catch {}
    }

    loadDashboardData();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    void fetchPlayfulConnectionToday({ dailySparkOffset })
      .then((payload) => {
        if (!isActive) return;
        setDailySpark(payload.dailySpark);
      })
      .catch(() => {
        if (!isActive) return;
        setDailySpark(null);
      });

    return () => {
      isActive = false;
    };
  }, [user?.id, dailySparkOffset]);

  if (loading || !user) {
    return <PeterLoading isLoading />;
  }

  const firstName =
    (profile as any)?.name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";
  const userInitials = firstName[0]?.toUpperCase() ?? "?";

  // CTA logic: journey completed → choose next, otherwise → begin practice
  const isPostJourney = completionState === 'pending_decision' || completionState === 'resting';
  const needsEveningReflection = showEveningCTA && !isPostJourney;
  const primaryPrompt = isPostJourney
    ? "Your journey is complete. What would you like to explore next?"
    : needsEveningReflection
      ? "You started today already. Come back now and finish your evening reflection."
      : activeJourney
        ? `Today's focus: ${activeJourney.title}`
        : "What is one small thing you can do today to show up better at home?";
  const primaryCtaLabel = isPostJourney
    ? 'Choose Next Journey'
    : needsEveningReflection
      ? 'Resume Evening Reflection'
      : 'Set my trigger moment →';
  const primaryCtaHref = isPostJourney
    ? '/journeys'
    : needsEveningReflection
      ? '/daily-growth?mode=evening-checkin'
      : '/daily-growth';
  const secondaryCtaLabel = needsEveningReflection ? "Restart Morning Practice" : 'Evening Check-in';

  return (
    <div className="min-h-screen bg-brand-linen pb-24">
      <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">

        {/* ── TOP BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary/70">
              Home
            </p>
            <span className="text-xl font-semibold tracking-tight text-brand-espresso">SPARQ</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="p-2 rounded-full text-brand-text-secondary hover:bg-brand-parchment transition-colors"
            >
              <Bell size={20} />
            </button>
            <button
              type="button"
              aria-label="Open profile"
              onClick={() => router.push("/profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              <span className="text-white text-sm font-bold">{userInitials}</span>
            </button>
          </div>
        </motion.div>

        {/* ── 1. PETER'S GREETING ── */}
        <PeterGreeting firstName={firstName} />

        {/* ── IF-THEN CHECKIN ── */}
        {pendingCheckin && (
          <IfThenCheckinCard
            sessionId={pendingCheckin.sessionId}
            planText={pendingCheckin.planText}
            onDismiss={() => setPendingCheckin(null)}
          />
        )}

        {/* ── STATE TAG ROW (JITAI Phase 1) ── */}
        {user && <StateTagRow userId={user.id} />}

        {/* ── 2. TODAY'S PRACTICE CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative overflow-hidden rounded-[34px] border border-brand-primary/12 bg-brand-parchment px-6 py-6 shadow-[0_26px_60px_rgba(42,34,52,0.12)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-brand-primary/10 blur-3xl"
          />
          <div className="relative">
            <EditorialEyebrow className="mb-3 text-brand-primary/80">
              {activeJourney
                ? `${activeJourney.title} — Day ${currentDay}`
                : `Day ${currentDay}`}
            </EditorialEyebrow>
            <p className="max-w-[16rem] font-serif italic text-[28px] leading-[1.15] text-brand-espresso">
              {primaryPrompt}
            </p>
            <p className="mt-4 max-w-[18rem] text-sm leading-relaxed text-brand-taupe">
              Start with the one next step that matters most today.
            </p>
          </div>

          <div className="relative mt-6 space-y-3">
            <button
              onClick={() => router.push(primaryCtaHref)}
              className="w-full rounded-[22px] bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              {primaryCtaLabel}
            </button>

            <div className="flex justify-center">
              <BetaFeedbackDialog
                stage={dailySpark ? 'dashboard_playful_layer' : 'dashboard'}
                context={{
                  current_day: currentDay,
                  active_journey_id: activeJourney?.id || null,
                  playful_visible: Boolean(dailySpark),
                  playful_surface: dailySpark ? 'dashboard' : null,
                  playful_prompt_id: dailySpark?.id || null,
                  playful_prompt_bucket: dailySpark?.bucket || null,
                }}
                title={dailySpark ? 'How did this page feel?' : undefined}
                description={
                  dailySpark
                    ? 'Did the light prompt feel warm, helpful, easy to ignore, or a little off?'
                    : undefined
                }
                placeholder={
                  dailySpark
                    ? 'Tell us if the spark felt helpful, cheesy, distracting, or easy to use.'
                    : undefined
                }
                triggerClassName="inline-flex items-center gap-2 text-sm font-medium text-brand-taupe transition-colors hover:text-brand-espresso"
              />
            </div>

            {/* Evening check-in CTA — shown when morning is done */}
            {showEveningCTA && !isPostJourney && (
              <button
                onClick={() => router.push(needsEveningReflection ? '/daily-growth' : '/daily-growth?mode=evening-checkin')}
                className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-brand-primary/12 bg-white/65 py-3 text-sm font-medium text-brand-espresso transition-colors hover:bg-white"
              >
                <Moon size={16} />
                {secondaryCtaLabel}
              </button>
            )}
          </div>
        </motion.div>

        {dailySpark && (
          <DailySparkCard
            prompt={dailySpark}
            surface="dashboard"
            onSwap={() => setDailySparkOffset((current) => current + 1)}
          />
        )}

        {/* Lally habit-formation framing — shown while user is building the habit */}
        {currentDay <= 90 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl border border-brand-primary/8 bg-white/40 px-4 py-3"
          >
            <p className="text-xs leading-relaxed text-brand-taupe">
              <span className="font-medium text-brand-espresso">Building a habit takes about 66 days</span> — not 21.
              Missing a day doesn&apos;t break it. Just show up again tomorrow.
            </p>
          </motion.div>
        )}

        <HomeDestinationStrip />
      </div>
    </div>
  );
}
