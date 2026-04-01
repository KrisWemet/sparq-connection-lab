import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth-context";
import { PeterLoading } from "@/components/PeterLoading";
import { ActiveChallengeDetail } from "@/components/couples/ActiveChallengeDetail";
import { QuestMap } from "@/components/couples/QuestMap";
import { HallOfFame } from "@/components/couples/HallOfFame";

export default function Couples() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return <PeterLoading isLoading />;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
          <p className="text-sm text-gray-500 mt-0.5">Grow together</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        <ActiveChallengeDetail />
        <QuestMap />
        <HallOfFame />
      </main>
    </div>
  );
}
