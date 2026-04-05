import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { PeterLoading } from "@/components/PeterLoading";
import { RelationshipScoreGauge } from "@/components/insights/RelationshipScoreGauge";
import { CategoryInsights } from "@/components/insights/CategoryInsights";
import { NurtureGrowthCard } from "@/components/insights/NurtureGrowthCard";
import { GuidedJourneysGrid } from "@/components/insights/GuidedJourneysGrid";
import { MeetCurators } from "@/components/insights/MeetCurators";

export default function Insights() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return <PeterLoading isLoading />;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        <RelationshipScoreGauge />
        <CategoryInsights />
        <NurtureGrowthCard />
        <GuidedJourneysGrid />
        <MeetCurators />
      </main>
    </div>
  );
}
