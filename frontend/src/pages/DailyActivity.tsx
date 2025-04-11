
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ValuesQuestion } from "@/components/journeys/ValuesQuestion";
import { BottomNav } from "@/components/bottom-nav";
import { toast } from "sonner";

export default function DailyActivity() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        // Get Vision & Values Journey
        const { data: journeyData } = await supabase
          .from("journeys")
          .select("id")
          .eq("title", "Vision & Values Journey")
          .single();

        if (journeyData) {
          // Get first question of the journey
          const { data: questionData } = await supabase
            .from("journey_questions")
            .select("*")
            .eq("journey_id", journeyData.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

          if (questionData) {
            setCurrentQuestion(questionData);
          }
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error("Failed to load the question. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, []);

  const handleAnswer = async (answer: string) => {
    try {
      const { error } = await supabase
        .from("journey_responses")
        .insert([
          {
            journey_id: currentQuestion.journey_id,
            question_id: currentQuestion.id,
            answer
          }
        ]);

      if (error) throw error;

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
