import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { PeterLoading } from "@/components/PeterLoading";

// New canonical Peter components
import PeterAvatar from "@/components/PeterAvatar";
import PeterSpeechBubble from "@/components/PeterSpeechBubble";

// Data-fetching sub-components (unchanged)
import { TodaysFocusCard } from "@/components/dashboard/TodaysFocusCard";
import { WeeklyMirrorCard } from "@/components/dashboard/WeeklyMirrorCard";
import { LivingArtifact } from "@/components/dashboard/LivingArtifact";

// Phase 5: Partner experience components
import { PartnerSynthesisCard } from "@/components/dashboard/PartnerSynthesisCard";
import { HeartbeatButton } from "@/components/dashboard/HeartbeatButton";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { supabase } from "@/lib/supabase";

import { Users, ArrowRight, Flame, Circle } from "lucide-react";

// ─── Peter tips (rotate daily) ────────────────────────────────────────────────
const PETER_TIPS = [
  "The little moments are the relationship. A genuine smile, asking how their day went — these aren't small things.",
  "You can't fix what you don't understand. Before you respond, try saying back what you heard.",
  "Connection doesn't need big moments. Five minutes of full attention beats an hour of distracted presence.",
  "Assume positive intent today. It shifts the entire dynamic of a conversation.",
];

function getDailyTip() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return PETER_TIPS[dayOfYear % PETER_TIPS.length];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ─── Journey Hero Card ────────────────────────────────────────────────────────
function JourneyHeroCard({
  currentDay,
  totalDays,
  streakCount,
  onClick,
}: {
  currentDay: number;
  totalDays: number;
  streakCount: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      style={{
        background: "#FFF8F3",
        borderRadius: 20,
        border: "1px solid rgba(192,97,74,0.15)",
        boxShadow: "0 4px 20px rgba(192,97,74,0.10)",
        padding: 20,
      }}
    >
      {/* Label */}
      <p style={{ fontSize: 11, letterSpacing: "0.1em", color: "#C0614A", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
        Your Growth Journey
      </p>

      {/* Day + streak */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#3D2C28" }}>
          Day {currentDay} of {totalDays}
        </h2>
        {streakCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(232,168,87,0.15)", color: "#7A5A2A" }}>
            <Flame size={13} style={{ color: "#E8A857" }} />
            {streakCount} day streak
          </div>
        )}
      </div>

      {/* Progress dots — 14 dots in a wrapped row */}
      <div className="flex flex-wrap gap-2 mb-4" style={{ alignItems: "center" }}>
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isCompleted = day < currentDay;
          const isCurrent = day === currentDay;
          return (
            <div
              key={i}
              style={{
                width: isCurrent ? 14 : 10,
                height: isCurrent ? 14 : 10,
                borderRadius: "50%",
                flexShrink: 0,
                background: isCompleted ? "#C0614A" : isCurrent ? "#E8A857" : "transparent",
                border: isCompleted ? "none" : isCurrent ? "none" : "2px solid #8FAF8A",
                boxShadow: isCurrent ? "0 0 8px rgba(232,168,87,0.6)" : "none",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>

      {/* Subtext */}
      <p style={{ fontSize: 14, color: "#5C4A44", fontStyle: "italic", marginBottom: 16 }}>
        Keep going — you&apos;re building something real.
      </p>

      {/* CTA */}
      <button
        onClick={onClick}
        style={{
          width: "100%",
          background: "#C0614A",
          color: "white",
          borderRadius: 12,
          padding: "14px 0",
          fontSize: 16,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
        onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        Continue Today&apos;s Journey
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const streakCount = (profile as any)?.streak_count || 0;
  const currentDay = (profile as any)?.discovery_day || 1;
  const connectionScore = (profile as any)?.relationship_points || 0;
  const partnerId = (profile as any)?.partner_id || null;

  // Phase 5: Partner realtime presence
  const { partnerIsOnline } = useRealtimeSync(partnerId);
  const [partnerDay, setPartnerDay] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Phase 5: Fetch partner's current day
  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('user_insights')
          .select('onboarding_day')
          .eq('user_id', partnerId)
          .maybeSingle();
        if (data) setPartnerDay(data.onboarding_day);
      } catch {}
    })();
  }, [partnerId]);

  if (loading || !user) {
    return <PeterLoading isLoading />;
  }

  const firstName = (profile as any)?.name?.split(" ")[0]
    || user.email?.split("@")[0]
    || "there";
  const partnerName = (profile as any)?.partner_name;

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: "#FAF6F1" }}>

      {/* ── SECTION 1: HEADER (greeting only, no Peter) ── */}
      <header
        style={{
          background: "linear-gradient(135deg, #C0614A 0%, #D4795F 100%)",
          padding: "28px 20px 36px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 6 }}>
            {getFormattedDate()}
          </p>
          <h1 style={{ color: "white", fontSize: 26, fontWeight: 700, lineHeight: 1.25, margin: 0 }}>
            {getGreeting()},<br />{firstName}.
          </h1>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="dashboard-main-wrapper">

        {/* ── MAIN CONTENT ── */}
        <main className="dashboard-main space-y-4">

          {/* SECTION 2: JOURNEY HERO CARD */}
          <JourneyHeroCard
            currentDay={currentDay}
            totalDays={14}
            streakCount={streakCount}
            onClick={() => router.push("/daily-growth")}
          />

          {/* SECTION 3: PETER'S MESSAGE */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <PeterSpeechBubble
              message={getDailyTip()}
              userName={firstName}
              onTap={() => router.push("/ai-therapist")}
            />
          </motion.div>

          {/* SECTION 4: TODAY'S FOCUS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <TodaysFocusCard actionText="Notice one small bid for connection from your partner and lean into it." />
          </motion.div>

          {/* SECTION 5: SECONDARY CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="space-y-4"
          >
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#9E8A86", textTransform: "uppercase", paddingLeft: 4 }}>
              Relationship Context
            </p>
            <WeeklyMirrorCard />
            <LivingArtifact score={connectionScore} />
          </motion.div>

          {/* SECTION 6: PARTNER CONNECT */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="space-y-4"
          >
            <div
              className="flex items-center justify-between gap-4 mt-2"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(192,97,74,0.08)",
                borderRadius: 24,
                padding: "16px 20px",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center flex-shrink-0 relative"
                  style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(192,97,74,0.1)" }}
                >
                  <Users size={18} style={{ color: "#C0614A" }} />
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
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#3D2C28", margin: 0 }}>
                    {partnerName ? `Growing with ${partnerName}` : "Invite your partner"}
                  </p>
                  <p style={{ fontSize: 12, color: "#9E8A86", margin: 0 }}>
                    {partnerId && partnerIsOnline
                      ? "Online now"
                      : partnerId && partnerDay
                        ? partnerDay > 14 ? "Graduated" : `Day ${partnerDay} of 14`
                        : partnerName ? "Progress is shared." : "Experience this together."}
                  </p>
                </div>
              </div>
              {!partnerName && (
                <button
                  onClick={() => router.push("/join-partner")}
                  style={{
                    fontSize: 12, fontWeight: 600,
                    padding: "8px 16px",
                    background: "rgba(192,97,74,0.1)",
                    color: "#C0614A",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Invite
                </button>
              )}
            </div>

            {/* Phase 5: Partner synthesis card + heartbeat button */}
            {partnerId && <PartnerSynthesisCard />}
            {partnerId && <HeartbeatButton />}
          </motion.div>

        </main>

        {/* ── DESKTOP PETER (fixed, right side, 1024px+) ── */}
        <div className="peter-fixed">
          <PeterAvatar size="xl" mood="welcome" priority />
          <p>Your relationship guide</p>
        </div>

      </div>

      {/* ── MOBILE / TABLET PETER (normal flow, below cards) ── */}
      <div className="peter-mobile">
        <PeterAvatar size="lg" mood="welcome" />
        <p>Your relationship guide</p>
      </div>

    </div>
  );
}
