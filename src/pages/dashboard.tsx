import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { PeterLoading } from "@/components/PeterLoading";

// Dashboard components
import { DashboardHeaderNew } from "@/components/dashboard/DashboardHeaderNew";
import { DailyPulseBar } from "@/components/dashboard/DailyPulseBar";
import { TodaysReflectionCard } from "@/components/dashboard/TodaysReflectionCard";
import { PartnerAnsweredCard } from "@/components/dashboard/PartnerAnsweredCard";
import { ActiveChallengeCard } from "@/components/dashboard/ActiveChallengeCard";
import { SharedAchievements } from "@/components/dashboard/SharedAchievements";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { supabase } from "@/lib/supabase";

import { Moon } from "lucide-react";

import { getJourneyVelocityStatus } from "@/services/journeyContentService";
import { journeys } from "@/data/journeys";
import { BetaFeedbackDialog } from '@/components/beta/BetaFeedbackDialog';
import { trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';
import { fetchPlayfulConnectionToday } from '@/lib/playfulConnection';
import type { PlayfulPrompt } from '@/data/playful-prompts';
import { DailySparkCard } from '@/components/playful/DailySparkCard';

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const streakCount = (profile as any)?.streak_count || 0;
  const partnerId = (profile as any)?.partner_id || null;

  const { partnerIsOnline } = useRealtimeSync(partnerId);
  const [currentDay, setCurrentDay] = useState(1);
  const [partnerDay, setPartnerDay] = useState<number | null>(null);
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [journeyDuration, setJourneyDuration] = useState(14);
  const [dailySpark, setDailySpark] = useState<PlayfulPrompt | null>(null);
  const [dailySparkOffset, setDailySparkOffset] = useState(0);
  const [showEveningCTA, setShowEveningCTA] = useState(false);
  const [todaySessionId, setTodaySessionId] = useState<string | null>(null);
  const [completionState, setCompletionState] = useState<string | null>(null);

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
    void trackPrimaryPathClientEvent('beta_primary_dashboard_arrived', { arrival_source: 'onboarding' });
  }, [router.isReady, router.query.from, user]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    async function loadDashboardData() {
      try {
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

        const session = sessionResult.data;
        if (session) {
          setTodaySessionId(session.id);
          const morningDone = session.status === 'morning_viewed' || session.status === 'evening_active';
          const eveningNotDone = !session.evening_completed_at;
          if (morningDone && eveningNotDone) setShowEveningCTA(true);
        }
      } catch {}
    }

    loadDashboardData();
  }, [user?.id]);

  useEffect(() => {
    if (!partnerId) return;
    async function loadPartnerDay() {
      try {
        const { data } = await supabase
          .from("user_insights")
          .select("onboarding_day")
          .eq("user_id", partnerId)
          .maybeSingle();
        if (data) setPartnerDay(data.onboarding_day);
      } catch {}
    }
    loadPartnerDay();
  }, [partnerId]);

  useEffect(() => {
    if (!user?.id) return;
    let isActive = true;
    void fetchPlayfulConnectionToday({ dailySparkOffset })
      .then((payload) => { if (isActive) setDailySpark(payload.dailySpark); })
      .catch(() => { if (isActive) setDailySpark(null); });
    return () => { isActive = false; };
  }, [user?.id, dailySparkOffset]);

  if (loading || !user) return <PeterLoading isLoading />;

  const firstName = (profile as any)?.name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const partnerName = (profile as any)?.partner_name;

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
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #F5F3FF 0%, #F9FAFB 40%, #EDE9FE 100%)" }}>
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        <DashboardHeaderNew
          firstName={firstName}
          partnerName={partnerName}
          streakCount={streakCount}
        />

        <DailyPulseBar />

        <TodaysReflectionCard onPress={() => router.push("/daily-growth")} />

        {partnerName && (
          <PartnerAnsweredCard
            partnerName={partnerName}
            onPress={() => router.push("/daily-growth")}
          />
        )}

        {/* ── TODAY'S FOCUS CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)" }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            {activeJourney ? `${activeJourney.title} — Day ${currentDay}` : `Day ${currentDay}`}
          </p>
          <p className="font-serif italic text-white text-lg leading-snug mb-6">
            {primaryPrompt}
          </p>

          <button
            onClick={() => router.push(primaryCtaHref)}
            className="w-full font-semibold rounded-xl py-3 text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.95)", color: "#7C3AED" }}
          >
            {primaryCtaLabel}
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
              triggerClassName="inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white"
            />
          </div>

          {showEveningCTA && !isPostJourney && (
            <button
              onClick={() => router.push(needsEveningReflection ? '/daily-growth' : '/daily-growth?mode=evening-checkin')}
              className="w-full mt-3 font-medium rounded-xl py-3 text-sm flex items-center justify-center gap-2"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <Moon size={16} />
              {secondaryCtaLabel}
            </button>
          )}
        </motion.div>

        {/* ── DAILY SPARK (playful layer) ── */}
        {dailySpark && (
          <DailySparkCard
            prompt={dailySpark}
            surface="dashboard"
            onSwap={() => setDailySparkOffset((current) => current + 1)}
          />
        )}

        {/* ── ACTIVE CHALLENGE ── */}
        <ActiveChallengeCard streakCount={streakCount} />

        {/* ── SHARED ACHIEVEMENTS ── */}
        <SharedAchievements />

      </div>
    </div>
  );
}
