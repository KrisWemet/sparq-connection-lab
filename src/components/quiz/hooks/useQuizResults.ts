
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
        
        try {
          const { error } = await supabase
            .from('quiz_results')
            .insert(resultsData);
            
          if (error) {
            console.error("Error saving quiz results:", error);
            toast.error("There was an error saving your quiz results.");
          } else {
            console.log("Quiz results saved successfully");
            
            // Save as a daily activity to count for streaks and points
            const activityData = {
              user_id: user.id,
              activity_type: 'quiz',
              response: 'completed',
              points_earned: 10 // Quizzes are worth more points
            };
            
            try {
              const { error: activityError } = await supabase
                .from('daily_activities')
                .insert(activityData);
                
              if (!activityError) {
                console.log("Activity recorded successfully");
                
                // Add communication badge if score is good
                if (percentageScore >= 70) {
                  const { data: existingBadge } = await supabase
                    .from('user_badges')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('badge_type', 'communication')
                    .single();
                    
                  if (existingBadge) {
                    if (!existingBadge.achieved || existingBadge.badge_level < 1) {
                      await supabase
                        .from('user_badges')
                        .update({ 
                          achieved: true, 
                          badge_level: 1,
                          achieved_at: new Date().toISOString()
                        })
                        .eq('id', existingBadge.id);
                    }
                  } else {
                    await supabase
                      .from('user_badges')
                      .insert({
                        user_id: user.id,
                        badge_type: 'communication',
                        badge_level: 1,
                        achieved: true,
                        achieved_at: new Date().toISOString()
                      });
                  }
                }
              }
            } catch (err) {
              console.error("Error recording activity:", err);
            }
          }
        } catch (err) {
          console.error("Error with quiz results table:", err);
        }
      }
      
      // Call the onComplete callback with the score
      console.log("Quiz completed with score:", percentageScore);
      onComplete(percentageScore);
    } catch (error) {
      console.error("Error calculating quiz results:", error);
      toast.error("There was an error processing your quiz results.");
      // Even if there's an error, complete the quiz to prevent getting stuck
      onComplete(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    calculateAndSaveResults
  };
}
