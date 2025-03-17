
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuizAnswer = Record<number, string>;

export function useQuizResults() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const calculateAndSaveResults = async (
    answers: QuizAnswer,
    questionsLength: number,
    onComplete: (score: number) => void
  ) => {
    setLoading(true);
    try {
      // Calculate the overall score (1-100)
      const totalPossiblePoints = questionsLength * 5; // Max 5 points per question
      const totalPoints = Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);
      const percentageScore = Math.round((totalPoints / totalPossiblePoints) * 100);
      
      // Save the quiz results to the database if user is logged in
      if (user) {
        const resultsData = {
          user_id: user.id,
          quiz_type: 'relationship_health',
          score: percentageScore,
          answers: answers,
          taken_at: new Date().toISOString()
        };
        
        // Check if the quiz_results table exists, if not we'll just skip saving
        try {
          const { error } = await supabase
            .from('quiz_results')
            .insert(resultsData);
            
          if (error) {
            console.error("Error saving quiz results:", error);
            toast.error("There was an error saving your quiz results.");
          }
        } catch (err) {
          console.error("Error with quiz results table:", err);
        }
      }
      
      // Call the onComplete callback with the score
      onComplete(percentageScore);
    } catch (error) {
      console.error("Error calculating quiz results:", error);
      toast.error("There was an error processing your quiz results.");
      // Even if there's an error, complete the quiz to prevent getting stuck
      onComplete(0);
    }
  };

  return {
    loading,
    calculateAndSaveResults
  };
}
