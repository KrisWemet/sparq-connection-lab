import React from "react";
import { useRouter } from "next/router";
import { ArrowRight, Flame, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
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
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-3xl font-bold mb-2">Today’s Question</h2>
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
              <button
                onClick={() => router.push("/daily-questions")}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors shadow-lg flex items-center"
              >
                Answer Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

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

        {/* New Features Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <button onClick={() => router.push('/DailyGrowth')} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500 hover:shadow-lg transition-shadow text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Growth</h3>
            <p className="text-sm text-gray-600">Track your mood and journal your journey.</p>
          </button>
          
          <button onClick={() => router.push('/OnboardingFlow')} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Onboarding</h3>
            <p className="text-sm text-gray-600">Update your profile and relationship status.</p>
          </button>
          
          <button onClick={() => router.push('/MirrorReport')} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-shadow text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Mirror Report</h3>
            <p className="text-sm text-gray-600">View your psychological insights.</p>
          </button>

          <button onClick={() => router.push('/ConflictFirstAid')} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-rose-500 hover:shadow-lg transition-shadow text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Conflict First Aid</h3>
            <p className="text-sm text-gray-600">Get a 60-second de-escalation script.</p>
          </button>
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
              onClick={() => router.push("/partner-invite")}
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
