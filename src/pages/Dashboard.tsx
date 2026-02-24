import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Flame, Users, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { usePersonalityDiscovery } from "@/hooks/usePersonalityDiscovery";
import { SparqOtter } from "@/components/SparqOtter";

export default function Dashboard() {
  const { user, profile, loading, signOut, handleRefreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle Stripe checkout success redirect (?checkout=success&tier=premium)
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const tier = searchParams.get("tier");
    if (checkoutStatus === "success" && tier) {
      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
      toast.success(`Welcome to ${tierLabel}!`, {
        description: "Your subscription is active. Enjoy all the new features.",
        duration: 6000,
      });
      // Refresh profile so subscription provider re-reads the new tier from Supabase
      handleRefreshProfile();
      // Remove query params from URL without navigation
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);
  const {
    discoveryDay,
    discoveryPhase,
    dimensionsRevealed,
    totalDimensions,
    mirrorReady,
  } = usePersonalityDiscovery();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <SparqOtter mood="thinking" size="lg" message="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const streakCount = (profile as any)?.streak_count ?? 0;
  const connectionScore = Math.min(100, 50 + streakCount * 5);
  const displayName =
    profile?.fullName || (profile as any)?.name || user.email?.split("@")[0] || "there";
  const partnerName = profile?.partnerName || (profile as any)?.partner_name;

  const phaseLabels: Record<string, string> = {
    rhythm: "Getting to Know Your Rhythm",
    deepening: "Going a Little Deeper",
    navigating: "How You Navigate Together",
    layers: "The Deeper Layers",
    mirror: "The Mirror Moment",
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Sparq</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {displayName}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily Question CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8 flex-1">
                <h2 className="text-3xl font-bold mb-2">Today's Question</h2>
                <p className="text-indigo-100 text-lg mb-4">
                  Build your relationship, one conversation at a time.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Flame className="w-4 h-4 mr-1" />
                    {streakCount} day streak
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SparqOtter mood="waving" size="sm" />
                <button
                  onClick={() => navigate("/daily-questions")}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors shadow-lg flex items-center"
                >
                  Answer Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Personality Discovery Progress */}
        {discoveryDay <= 14 && (
          <section className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-medium text-gray-800">
                    Personality Discovery
                  </h3>
                </div>
                <span className="text-sm text-gray-500">Day {discoveryDay} of 14</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {phaseLabels[discoveryPhase] || "Discovery"} — {dimensionsRevealed} of {totalDimensions} dimensions revealed
              </p>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${(discoveryDay / 14) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {discoveryPhase === "mirror"
                    ? "Your reflection is ready!"
                    : `Next phase: ${
                        discoveryDay <= 3 ? "Deepening (Day 4)" :
                        discoveryDay <= 6 ? "Navigating (Day 7)" :
                        discoveryDay <= 9 ? "Layers (Day 10)" :
                        "Mirror (Day 13)"
                      }`
                  }
                </span>
                {mirrorReady && (
                  <button
                    onClick={() => navigate("/daily-questions")}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Reflection
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Core Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Connection Score</h3>
            <div className="text-3xl font-bold text-indigo-700">
              {connectionScore}
              <span className="text-lg text-gray-500">/100</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${connectionScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on your recent daily question streak.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Day Streak</h3>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div className="text-3xl font-bold text-indigo-700">{streakCount}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Answer today’s question to keep your streak going.
            </p>
          </div>
        </section>

        {/* Optional Partner Invite */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-800">
                  Invite your partner <span className="text-sm text-gray-500">(optional)</span>
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Daily questions are even better together — but you can skip this for now.
              </p>
              {partnerName ? (
                <p className="text-xs text-gray-500 mt-2">Connected with {partnerName}.</p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">Invite anytime when you’re ready.</p>
              )}
            </div>
            <button
              onClick={() => navigate("/partner-invite")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Invite Partner
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
