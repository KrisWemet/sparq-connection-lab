import React from "react";
import { useRouter } from "next/router";
import { ArrowLeft, CheckCircle2, Lock, Sparkles } from "lucide-react";

type LevelStatus = "unlocked" | "locked";

type Level = {
  name: string;
  status: LevelStatus;
  description: string;
};

type Track = {
  name: string;
  description: string;
  gradient: string;
  badgeClass: string;
  buttonClass: string;
  levels: Level[];
};

const tracks: Track[] = [
  {
    name: "Communication",
    description: "Build clarity, empathy, and daily connection rituals.",
    gradient: "from-indigo-500 to-blue-500",
    badgeClass: "bg-indigo-100 text-indigo-700",
    buttonClass: "border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    levels: [
      {
        name: "Basic",
        status: "unlocked",
        description: "Active listening, daily check-ins, and gratitude prompts.",
      },
      {
        name: "Advanced",
        status: "locked",
        description: "Repair scripts, difficult conversations, and de-escalation.",
      },
      {
        name: "Expert",
        status: "locked",
        description: "Deep attunement, emotional mirroring, and shared meaning.",
      },
    ],
  },
  {
    name: "Conflict Resolution",
    description: "Turn tension into teamwork with structured repair skills.",
    gradient: "from-amber-500 to-orange-500",
    badgeClass: "bg-amber-100 text-amber-700",
    buttonClass: "border-amber-600 text-amber-700 hover:bg-amber-50",
    levels: [
      {
        name: "Basic",
        status: "unlocked",
        description: "Name the issue, cool-down routines, and reset signals.",
      },
      {
        name: "Advanced",
        status: "locked",
        description: "Negotiation frameworks and repair rituals after conflict.",
      },
      {
        name: "Expert",
        status: "locked",
        description: "Reframe patterns, prevent triggers, and build trust fast.",
      },
    ],
  },
  {
    name: "Intimacy",
    description: "Strengthen closeness with intentional affection and presence.",
    gradient: "from-purple-500 to-pink-500",
    badgeClass: "bg-purple-100 text-purple-700",
    buttonClass: "border-purple-600 text-purple-600 hover:bg-purple-50",
    levels: [
      {
        name: "Basic",
        status: "unlocked",
        description: "Affection rituals, appreciation moments, and playful sparks.",
      },
      {
        name: "Advanced",
        status: "locked",
        description: "Vulnerability prompts and deeper connection exercises.",
      },
      {
        name: "Expert",
        status: "locked",
        description: "Shared visions, sacred routines, and intimacy mastery.",
      },
    ],
  },
];

export default function SkillTree() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-100">
      <header className="bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex-1 md:mx-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="h-3 w-3" />
              Skill Tree
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">Gamified Growth Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Track your relationship growth across the core skill tracks. Unlock new levels to access deeper
              coaching, exercises, and personalized rituals.
            </p>
          </div>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
            Upgrade
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const unlockedCount = track.levels.filter((level) => level.status === "unlocked").length;
            const progress = Math.round((unlockedCount / track.levels.length) * 100);

            return (
              <div
                key={track.name}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col border border-white/60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${track.badgeClass}`}
                    >
                      {track.name}
                    </span>
                    <p className="text-sm text-gray-600 mt-3">{track.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{progress}%</span>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${track.gradient}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {unlockedCount} of {track.levels.length} levels unlocked
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {track.levels.map((level) => {
                    const isLocked = level.status === "locked";
                    const Icon = isLocked ? Lock : CheckCircle2;

                    return (
                      <div
                        key={level.name}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                          isLocked
                            ? "bg-gray-50 border-gray-200 opacity-70"
                            : "bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isLocked ? "bg-gray-200 text-gray-500" : "bg-emerald-500 text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">{level.name}</h3>
                            <span
                              className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                                isLocked
                                  ? "bg-gray-200 text-gray-500"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {isLocked ? "Locked" : "Unlocked"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{level.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className={`mt-6 w-full py-2 border rounded-md text-sm font-semibold transition-colors ${track.buttonClass}`}
                >
                  Unlock Next Level
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-white/80 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ready to level up faster?</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upgrade to unlock advanced lessons, expert rituals, and full relationship mastery paths.
            </p>
          </div>
          <button className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Upgrade & Unlock
          </button>
        </div>
      </main>
    </div>
  );
}
