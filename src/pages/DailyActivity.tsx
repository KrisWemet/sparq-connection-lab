
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ValuesQuestion } from "@/components/journeys/ValuesQuestion";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function DailyActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Optimize data fetching
  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use a single efficient query to fetch the question
      const { data: questionData, error } = await supabase
        .from("journey_questions")
        .select("*, journeys:journey_id(title)")
        .eq("journeys.title", "Vision & Values Journey")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      
      if (questionData) {
        setCurrentQuestion(questionData);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      toast.error("Failed to load the question. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
    
    // Set a timeout to force-show content if loading takes too long
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [fetchQuestion]);

  const handleAnswer = async (answer: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to save your response");
        return;
      }
      
      // Optimistically update UI and show success message
      toast.success("Saving your response...");
      
      // Save the journey response in background
      const journeyPromise = supabase
        .from("journey_responses")
        .insert([
          {
            journey_id: currentQuestion.journey_id,
            question_id: currentQuestion.id,
            user_id: user.id,
            answer
          }
        ]);
      
      // Record as a daily activity to update streak and points (in parallel)
      const activityPromise = supabase
        .from("daily_activities")
        .insert([
          {
            user_id: user.id,
            activity_type: "daily_question",
            response: answer.substring(0, 100) + (answer.length > 100 ? "..." : ""),
            points_earned: 5
          }
        ]);
        
      // Wait for both promises to complete
      const [{ error }, { error: activityError }] = await Promise.all([journeyPromise, activityPromise]);
      
      if (error || activityError) {
        throw error || activityError;
      }

      toast.success("Your response has been saved!");
      navigate("/reflect");
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Failed to save your response. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingIndicator 
          size="md"
          label="Loading your daily question..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        {currentQuestion && (
          <ValuesQuestion
            question={currentQuestion}
            onSubmit={handleAnswer}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
