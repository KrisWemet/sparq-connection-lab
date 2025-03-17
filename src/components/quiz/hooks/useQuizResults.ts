
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QuizAnswer = Record<number, string>;

export function useQuizResults() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const calculateAndSaveResults = useCallback(async (
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
      
      // Call the onComplete callback quickly for better UX
      // This allows the UI to update without waiting for database operations
      onComplete(percentageScore);
      
      // Save the quiz results to the database if user is logged in
      if (user) {
        const resultsData = {
          user_id: user.id,
          quiz_type: 'relationship_health',
          score: percentageScore,
          answers: answers,
          taken_at: new Date().toISOString()
        };
        
        // Process database operations in parallel for better performance
        const promises = [];
        
        // 1. Save quiz results
        promises.push(
          supabase
            .from('quiz_results')
            .insert(resultsData)
            .then(({ error }) => {
              if (error) {
                console.error("Error saving quiz results:", error);
                toast.error("There was an error saving your quiz results.");
              }
            })
        );
            
        // 2. Save activity data for streaks and points
        const activityData = {
          user_id: user.id,
          activity_type: 'quiz',
          response: 'completed',
          points_earned: 10 // Quizzes are worth more points
        };
        
        promises.push(
          supabase
            .from('daily_activities')
            .insert(activityData)
            .then(({ error }) => {
              if (error) {
                console.error("Error recording activity:", error);
              }
            })
        );
        
        // 3. Handle badge updates if score is good
        if (percentageScore >= 70) {
          promises.push(
            supabase
              .from('user_badges')
              .select('*')
              .eq('user_id', user.id)
              .eq('badge_type', 'communication')
              .single()
              .then(({ data: existingBadge, error }) => {
                if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
                  console.error("Error checking badge:", error);
                  return;
                }
                
                if (existingBadge) {
                  if (!existingBadge.achieved || existingBadge.badge_level < 1) {
                    return supabase
                      .from('user_badges')
                      .update({ 
                        achieved: true, 
                        badge_level: 1,
                        achieved_at: new Date().toISOString()
                      })
                      .eq('id', existingBadge.id);
                  }
                } else {
                  return supabase
                    .from('user_badges')
                    .insert({
                      user_id: user.id,
                      badge_type: 'communication',
                      badge_level: 1,
                      achieved: true,
                      achieved_at: new Date().toISOString()
                    });
                }
              })
          );
        }
        
        // Execute all database operations in parallel
        await Promise.allSettled(promises);
      }
      
      console.log("Quiz completed with score:", percentageScore);
    } catch (error) {
      console.error("Error calculating quiz results:", error);
      toast.error("There was an error processing your quiz results.");
      // Even if there's an error, complete the quiz to prevent getting stuck
      onComplete(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    calculateAndSaveResults
  };
}
