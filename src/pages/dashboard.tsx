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
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* ── TOP BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <span className="text-brand-espresso font-bold text-xl tracking-tight">SPARQ</span>
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

        {/* ── 2. TODAY'S PRACTICE CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-brand-primary rounded-3xl p-6"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-3">
            {activeJourney
              ? `${activeJourney.title} — Day ${currentDay}`
              : `Day ${currentDay}`}
          </p>
          <p className="font-serif italic text-white text-lg leading-snug mb-6">
            {primaryPrompt}
          </p>

          <button
            onClick={() => router.push(primaryCtaHref)}
            className="w-full bg-white text-brand-primary font-semibold rounded-2xl py-3 text-sm hover:bg-brand-linen transition-colors"
          >
            {primaryCtaLabel} &rarr;
          </button>

          <div className="mt-3 flex justify-center">
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
              triggerClassName="inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white"
            />
          </div>

          {/* Evening check-in CTA — shown when morning is done */}
          {showEveningCTA && !isPostJourney && (
            <button
              onClick={() => router.push(needsEveningReflection ? '/daily-growth' : '/daily-growth?mode=evening-checkin')}
              className="w-full mt-3 bg-white/15 text-white font-medium rounded-2xl py-3 text-sm hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
            >
              <Moon size={16} />
              {secondaryCtaLabel}
            </button>
          )}
        </motion.div>

        {dailySpark && (
          <DailySparkCard
            prompt={dailySpark}
            surface="dashboard"
            onSwap={() => setDailySparkOffset((current) => current + 1)}
          />
        )}

        <HomeDestinationStrip />

      </div>
    </div>
  );
}
