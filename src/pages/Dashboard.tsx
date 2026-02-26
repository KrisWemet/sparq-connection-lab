import React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Users, Sparkles, MessageSquare, TreePine, ScanFace, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Peter rotates tips daily — stable throughout the day, new one each morning
const PETER_TIPS = [
  "The little moments are the relationship. A genuine smile, asking how their day went — these aren't small things.",
  "You can't fix what you don't understand. Before you respond, try saying back what you heard.",
  "Conflict is completely normal. What matters is whether you both feel heard when it's over.",
  "Appreciation is a skill. Name one specific thing your partner did this week that you're grateful for.",
  "Connection doesn't need big moments. Five minutes of full attention beats an hour of distracted presence.",
  "When you feel defensive, it usually means you care. That's actually a good sign.",
  "Repair attempts don't have to be perfect. Even a small touch or joke during tension can reset everything.",
];

function getDailyTip() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return PETER_TIPS[dayOfYear % PETER_TIPS.length];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, profile, loading, logout: signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🦦</div>
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const streakCount = (profile as any)?.streak_count ?? 0;
  const connectionScore = Math.min(100, 50 + streakCount * 5);
  const displayName =
    profile?.fullName || (profile as any)?.name || user.email?.split("@")[0] || "there";
  const partnerName = profile?.partnerName || (profile as any)?.partner_name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-700 tracking-tight">Sparq</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome back, <span className="font-semibold text-gray-700">{displayName}</span>
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Peter's Tip ──────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35 }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
              🦦
            </div>
            <div>
              <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mb-1">
                Peter's tip for today
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{getDailyTip()}</p>
            </div>
          </div>
        </motion.section>

        {/* ── Hero: Daily Loop ─────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <button
            onClick={() => router.push("/daily-growth")}
            className="w-full text-left bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 text-white rounded-2xl p-7 shadow-lg hover:shadow-xl hover:opacity-95 transition-all relative overflow-hidden group"
          >
            {/* Big faded otter behind content */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8rem] leading-none opacity-10 select-none group-hover:opacity-15 transition-opacity">
              🦦
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-200 mb-2">
              Your core daily practice
            </p>
            <h2 className="text-2xl font-bold mb-1">Daily Loop with Peter</h2>
            <p className="text-teal-100 text-sm mb-5 max-w-md">
              Morning story + one small action + evening reflection. This is where the real growth happens.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Start today's session
              <ArrowRight size={14} />
            </span>
          </button>
        </motion.section>

        {/* ── Secondary Features Grid ──────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Skill Tree */}
          <FeatureCard
            onClick={() => router.push("/skill-tree")}
            accent="border-amber-400"
            bg="from-amber-50 to-orange-50"
            icon={<TreePine className="h-5 w-5 text-amber-500" />}
            bgEmoji="🌳"
            title="Skill Tree"
            description="Level up your relationship skills."
            badge="9 levels"
            badgeColor="bg-amber-100 text-amber-700"
          />

          {/* Translator */}
          <FeatureCard
            onClick={() => router.push("/translator")}
            accent="border-emerald-400"
            bg="from-emerald-50 to-teal-50"
            icon={<MessageSquare className="h-5 w-5 text-emerald-500" />}
            bgEmoji="💬"
            title="Translator"
            description="Rephrase anything, kinder."
          />

          {/* Mirror Report */}
          <FeatureCard
            onClick={() => router.push("/mirrorreport")}
            accent="border-blue-400"
            bg="from-blue-50 to-indigo-50"
            icon={<ScanFace className="h-5 w-5 text-blue-500" />}
            bgEmoji="✨"
            title="Mirror Report"
            description="Your relationship insights."
          />

          {/* Onboarding */}
          <FeatureCard
            onClick={() => router.push("/onboarding-flow")}
            accent="border-purple-400"
            bg="from-purple-50 to-violet-50"
            icon={<Pencil className="h-5 w-5 text-purple-500" />}
            bgEmoji="📝"
            title="Profile"
            description="Update your info with Peter."
          />
        </motion.section>

        {/* ── Metrics Row ──────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Connection Score */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Connection Score
              </h3>
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-4xl font-bold text-indigo-700 mb-3">
              {connectionScore}
              <span className="text-lg font-normal text-gray-400 ml-1">/100</span>
            </div>
            {/* Glowing progress bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 transition-all duration-1000"
                style={{
                  width: `${connectionScore}%`,
                  boxShadow: connectionScore > 50 ? "0 0 10px rgba(139,92,246,0.45)" : "none",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Grows with your daily streak</p>
          </div>

          {/* Day Streak */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Day Streak
              </h3>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <div className="flex items-end gap-2 mb-3">
              <div className="text-4xl font-bold text-indigo-700">{streakCount}</div>
              <div className="text-sm text-gray-500 mb-1">
                {streakCount === 1 ? "day" : "days"}
              </div>
            </div>
            {/* Mini streak visualizer — last 7 days dots */}
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < Math.min(streakCount, 7)
                      ? "bg-gradient-to-r from-orange-400 to-red-400"
                      : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">Answer today's question to keep it going</p>
          </div>
        </motion.section>

        {/* ── Today's Question CTA ─────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                Daily ritual
              </p>
              <h2 className="text-xl font-bold mb-1">Today's Question</h2>
              <div className="flex items-center gap-2 text-sm text-indigo-200">
                <Flame className="w-4 h-4 text-orange-300" />
                <span>{streakCount} day streak</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/daily-questions")}
              className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm flex-shrink-0"
            >
              Answer Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>

        {/* ── Partner Invite ───────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Invite your partner{" "}
                  <span className="text-xs font-normal text-gray-400">(optional)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {partnerName
                    ? `Connected with ${partnerName} 💙`
                    : "Even better together — invite anytime you're ready."}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/partner-invite")}
              className="text-sm font-semibold px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              {partnerName ? "View Partner" : "Invite Partner"}
            </button>
          </div>
        </motion.section>

      </main>
    </div>
  );
}

// ── Reusable secondary feature card ─────────────────────────────────────────
interface FeatureCardProps {
  onClick: () => void;
  accent: string;
  bg: string;
  icon: React.ReactNode;
  bgEmoji: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

function FeatureCard({
  onClick,
  accent,
  bg,
  icon,
  bgEmoji,
  title,
  description,
  badge,
  badgeColor,
}: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left bg-gradient-to-br ${bg} rounded-2xl border-2 ${accent} p-4 hover:shadow-md transition-all relative overflow-hidden group`}
    >
      {/* Big faded emoji background */}
      <div className="absolute right-1 bottom-0 text-5xl leading-none opacity-10 select-none group-hover:opacity-20 transition-opacity">
        {bgEmoji}
      </div>

      <div className="mb-3">{icon}</div>
      <p className="text-sm font-bold text-gray-800 mb-0.5">{title}</p>
      <p className="text-xs text-gray-500 leading-snug">{description}</p>
      {badge && (
        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
