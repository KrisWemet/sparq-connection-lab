import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { PeterLoading } from "@/components/PeterLoading";

// Dashboard components
import { PeterGreeting } from "@/components/dashboard/PeterGreeting";
import { WeeklyMirrorCard } from "@/components/dashboard/WeeklyMirrorCard";
import { GrowthThread } from "@/components/dashboard/GrowthThread";
import { JourneyArc } from "@/components/dashboard/JourneyArc";
import { PartnerSynthesisCard } from "@/components/dashboard/PartnerSynthesisCard";
import { HeartbeatButton } from "@/components/dashboard/HeartbeatButton";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { supabase } from "@/lib/supabase";

import { Bell, Flame, Moon, Users, Heart, Plus, Circle } from "lucide-react";

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
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">{userInitials}</span>
            </div>
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
            {isPostJourney
              ? "Your journey is complete. What would you like to explore next?"
              : activeJourney
                ? `Today's focus: ${activeJourney.title}`
                : "What is one small thing you can do today to show up for your relationship?"}
          </p>

          {isPostJourney ? (
            <button
              onClick={() => router.push("/journeys")}
              className="w-full bg-white text-brand-primary font-semibold rounded-2xl py-3 text-sm hover:bg-brand-linen transition-colors"
            >
              Choose Next Journey
            </button>
          ) : (
            <button
              onClick={() => router.push("/daily-growth")}
              className="w-full bg-white text-brand-primary font-semibold rounded-2xl py-3 text-sm hover:bg-brand-linen transition-colors"
            >
              Begin Today&apos;s Practice &rarr;
            </button>
          )}

          {/* Evening check-in CTA — shown when morning is done */}
          {showEveningCTA && !isPostJourney && (
            <button
              onClick={() => router.push(`/daily-growth?mode=evening-checkin`)}
              className="w-full mt-3 bg-white/15 text-white font-medium rounded-2xl py-3 text-sm hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
            >
              <Moon size={16} />
              Evening Check-in
            </button>
          )}
        </motion.div>

        {/* ── 3. IDENTITY STATEMENT ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-6"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-primary mb-3">
            Your Identity
          </p>
          <p className="font-serif italic text-brand-espresso text-xl leading-snug mb-2">
            {identityStatement}
          </p>
          <p className="text-sm text-brand-text-secondary">
            {partnerName ? `Growing with ${partnerName}` : "Building solo strength"}
          </p>
        </motion.div>

        {/* ── 4. GROWTH THREAD ── */}
        <GrowthThread />

        {/* ── 5. WEEKLY MIRROR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <WeeklyMirrorCard />
        </motion.div>

        {/* ── 6. JOURNEY ARC ── */}
        <JourneyArc journeyDuration={journeyDuration} />

        {/* ── PARTNER CONNECT ── */}
        {(partnerId || !partnerName) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-brand-parchment rounded-3xl border border-brand-primary/10 shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  {partnerId ? (
                    <Heart size={18} className="text-brand-primary" />
                  ) : (
                    <Users size={18} className="text-brand-primary" />
                  )}
                  {partnerId && partnerIsOnline && (
                    <Circle
                      size={10}
                      fill="#4ade80"
                      stroke="#FAF6F1"
                      strokeWidth={2}
                      className="absolute -top-0.5 -right-0.5"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-espresso">
                    {partnerName ? `Growing with ${partnerName}` : "Invite your partner"}
                  </p>
                  <p className="text-xs text-brand-text-secondary">
                    {partnerId && partnerIsOnline
                      ? "Online now"
                      : partnerId && partnerDay
                        ? partnerDay > 14
                          ? "Graduated"
                          : `Day ${partnerDay}`
                        : partnerName
                          ? "Progress is shared."
                          : "Experience this together."}
                  </p>
                </div>
              </div>

              {partnerId ? (
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center ring-2 ring-brand-parchment z-10">
                    <span className="text-white text-xs font-bold">{userInitials}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#C8886A] flex items-center justify-center ring-2 ring-brand-parchment">
                    <span className="text-white text-xs font-bold">{partnerInitials}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/join-partner")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-brand-primary text-brand-primary text-xs font-semibold hover:bg-brand-primary hover:text-white transition-colors"
                >
                  <Plus size={12} />
                  Invite
                </button>
              )}
            </div>

            {partnerId && (
              <div className="mt-4 space-y-3">
                <PartnerSynthesisCard />
                <HeartbeatButton />
              </div>
            )}
          </motion.div>
        )}

        {/* ── 7. STREAK (compact, bottom) ── */}
        {streakCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <Flame size={16} className="text-brand-sand" />
            <span className="font-bold text-brand-sand text-sm">
              {streakCount} day streak
            </span>
          </motion.div>
        )}

      </div>
    </div>
  );
}
