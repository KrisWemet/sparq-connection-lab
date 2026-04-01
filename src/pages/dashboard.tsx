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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const streakCount = (profile as any)?.streak_count || 0;
  const partnerId = (profile as any)?.partner_id || null;

  // Partner realtime presence
  const { partnerIsOnline } = useRealtimeSync(partnerId);
  const [currentDay, setCurrentDay] = useState(1);
  const [partnerDay, setPartnerDay] = useState<number | null>(null);
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [journeyDuration, setJourneyDuration] = useState(14);

  // Evening check-in eligibility
  const [showEveningCTA, setShowEveningCTA] = useState(false);
  const [todaySessionId, setTodaySessionId] = useState<string | null>(null);

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
          setTodaySessionId(session.id);
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

  if (loading || !user) {
    return <PeterLoading isLoading />;
  }

  const firstName =
    (profile as any)?.name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "there";
  const partnerName = (profile as any)?.partner_name;
  const identityStatement =
    (profile as any)?.identity_statement || "I am someone who shows up.";
  const userInitials = firstName[0]?.toUpperCase() ?? "?";
  const partnerInitials = partnerName ? partnerName[0]?.toUpperCase() : "?";

  // CTA logic: journey completed → choose next, otherwise → begin practice
  const isPostJourney = completionState === 'pending_decision' || completionState === 'resting';

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(160deg, #F5F3FF 0%, #F9FAFB 40%, #EDE9FE 100%)" }}>
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        <DashboardHeaderNew
          firstName={firstName}
          partnerName={partnerName}
          streakCount={streakCount}
        />

        <DailyPulseBar />

        <TodaysReflectionCard
          onPress={() => router.push("/daily-growth")}
        />

        {/* Partner answered — show when partner exists */}
        {partnerName && (
          <PartnerAnsweredCard
            partnerName={partnerName}
            onPress={() => router.push("/daily-growth")}
          />
        )}

        {/* Today's Practice CTA card (keep existing amethyst-style, replacing brand-primary) */}
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
          <p className="font-serif italic text-white text-base leading-snug mb-4">
            {isPostJourney
              ? "Your journey is complete. What would you like to explore next?"
              : activeJourney
                ? `Today's focus: ${activeJourney.title}`
                : "A daily practice, however small, compounds into real change."}
          </p>
          {isPostJourney ? (
            <button
              onClick={() => router.push("/journeys")}
              className="w-full font-semibold rounded-xl py-3 text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.95)", color: "#7C3AED" }}
            >
              Choose Next Journey
            </button>
          ) : (
            <button
              onClick={() => router.push("/daily-growth")}
              className="w-full font-semibold rounded-xl py-3 text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.95)", color: "#7C3AED" }}
            >
              Begin Today&apos;s Practice →
            </button>
          )}
          {showEveningCTA && !isPostJourney && (
            <button
              onClick={() => router.push("/daily-growth?mode=evening-checkin")}
              className="w-full mt-3 font-medium rounded-xl py-3 text-sm flex items-center justify-center gap-2"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              <Moon size={16} />
              Evening Check-in
            </button>
          )}
        </motion.div>

        <ActiveChallengeCard streakCount={streakCount} />

        <SharedAchievements />

      </div>
    </div>
  );
}
