
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { healthQuizQuestions, calculateQuizScore } from "@/data/healthQuizData";
import { QuizQuestion } from "./QuizQuestion";
import { QuizProgressHeader } from "./QuizProgressHeader";
import { QuizNavigationFooter } from "./QuizNavigationFooter";
import { QuizResultsLoading } from "./QuizResultsLoading";

interface RelationshipHealthQuizProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export function RelationshipHealthQuiz({ onComplete, onCancel }: RelationshipHealthQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const currentQuestion = healthQuizQuestions[currentQuestionIndex];
  
  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < healthQuizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
      calculateResults();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const calculateResults = async () => {
    setLoading(true);
    try {
      // Calculate the overall score (1-100)
      const percentageScore = calculateQuizScore(answers);
      
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
    } finally {
      setLoading(false);
    }
  };
  
  if (showResults) {
    return <QuizResultsLoading />;
  }
  
  return (
    <Card className="w-full">
      <QuizProgressHeader 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={healthQuizQuestions.length}
      />
      
      <CardContent>
        <QuizQuestion
          questionText={currentQuestion.text}
          options={currentQuestion.options}
          selectedValue={answers[currentQuestion.id] || ""}
          onValueChange={handleAnswer}
        />
      </CardContent>
      
      <QuizNavigationFooter
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCancel={onCancel}
        isFirstQuestion={currentQuestionIndex === 0}
        isLastQuestion={currentQuestionIndex === healthQuizQuestions.length - 1}
        canContinue={!!answers[currentQuestion.id]}
      />
    </Card>
  );
}
