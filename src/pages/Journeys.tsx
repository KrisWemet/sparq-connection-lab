
import { useQuery } from "@tanstack/react-query";
import { Journey } from "@/types/quiz";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Crown, MessageSquare, Search, BookOpen, Star, Clock, Pencil, Share2, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Journeys() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: journeys, isLoading } = useQuery({
    queryKey: ['journeys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('journeys').select('*');
      if (error) throw error;
      return data as Journey[];
    }
  });

  const journey = journeys?.[0]; // For now, showing the first journey

  const handleStartJourney = async () => {
    if (!journey?.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to start a journey."
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_journeys')
        .insert([
          { 
            journey_id: journey.id,
            user_id: user.id 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Journey Started!",
        description: "You've begun your Vision & Values Journey."
      });

      // Navigate to the daily question
      navigate('/quiz');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start journey. Please try again."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container max-w-lg mx-auto px-4 pt-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-32 bg-gray-200 rounded mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">
            Path to Together: Vision & Values Journey
          </h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {journey?.difficulty && (
                <div className="flex items-center text-amber-500">
                  {[...Array(journey.difficulty)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              )}
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                28 days
              </span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                Values & Goals
              </span>
            </div>
            <p className="text-lg text-gray-900 leading-relaxed">
              Welcome to the Vision & Values Journey—a transformative 28-day program designed to help you and your partner explore your core values, enhance communication, and build a shared vision for your future.
            </p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
          <div className="space-y-3">
            <p className="text-gray-600">• Deep Self-Discovery: Uncover your personal core values and the life experiences that shaped them.</p>
            <p className="text-gray-600">• Enhanced Communication: Build trust and intimacy by openly sharing your personal stories and aspirations.</p>
            <p className="text-gray-600">• Practical Application: Learn to recognize and reinforce how your values influence real-life decisions.</p>
            <p className="text-gray-600">• Shared Vision & Goals: Develop a collaborative vision statement and set actionable goals.</p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-primary mb-8">How it works</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-primary-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#E2E5FF] flex items-center justify-center mb-4">
                <Pencil className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phase 1: Begin (Days 1-7)</h3>
              <p className="text-gray-600">Start with individual discovery and self-reflection. Identify your personal core values and see them in action during your day.</p>
            </div>

            <div className="bg-primary-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#E2E5FF] flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phase 2: Share (Days 8-14)</h3>
              <p className="text-gray-600">Exchange your personal discoveries with your partner to build mutual understanding through structured activities and conversations.</p>
            </div>

            <div className="bg-primary-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#E2E5FF] flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phase 3: Reflect (Days 15-21)</h3>
              <p className="text-gray-600">Review your combined insights, analyze patterns, and identify how your values shape your relationship dynamics.</p>
            </div>

            <div className="bg-primary-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#E2E5FF] flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phase 4: Align (Days 22-28)</h3>
              <p className="text-gray-600">Create your Vision & Values Manifesto—a clear, actionable roadmap that will guide your shared future together.</p>
            </div>
          </div>
        </section>

        <Button 
          className="w-full mt-12 py-6 text-lg bg-primary hover:bg-primary/90"
          onClick={handleStartJourney}
        >
          <HeartHandshake className="w-5 h-5 mr-2" />
          Begin Your Journey
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
