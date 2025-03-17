
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Brain, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

// Define the quiz questions
const healthQuizQuestions = [
  {
    id: 1,
    text: "How satisfied are you with the communication in your relationship?",
    category: "communication",
    options: [
      { value: "1", label: "Very unsatisfied" },
      { value: "2", label: "Unsatisfied" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Satisfied" },
      { value: "5", label: "Very satisfied" }
    ]
  },
  {
    id: 2,
    text: "How often do you and your partner resolve conflicts in a healthy way?",
    category: "conflict",
    options: [
      { value: "1", label: "Never" },
      { value: "2", label: "Rarely" },
      { value: "3", label: "Sometimes" },
      { value: "4", label: "Often" },
      { value: "5", label: "Always" }
    ]
  },
  {
    id: 3,
    text: "How emotionally connected do you feel to your partner?",
    category: "emotional",
    options: [
      { value: "1", label: "Not at all connected" },
      { value: "2", label: "Slightly connected" },
      { value: "3", label: "Moderately connected" },
      { value: "4", label: "Very connected" },
      { value: "5", label: "Extremely connected" }
    ]
  },
  {
    id: 4,
    text: "How satisfied are you with the level of intimacy in your relationship?",
    category: "intimacy",
    options: [
      { value: "1", label: "Very unsatisfied" },
      { value: "2", label: "Unsatisfied" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Satisfied" },
      { value: "5", label: "Very satisfied" }
    ]
  },
  {
    id: 5,
    text: "How much do you trust your partner?",
    category: "trust",
    options: [
      { value: "1", label: "No trust at all" },
      { value: "2", label: "Little trust" },
      { value: "3", label: "Moderate trust" },
      { value: "4", label: "High trust" },
      { value: "5", label: "Complete trust" }
    ]
  },
  {
    id: 6,
    text: "How well do you and your partner support each other's goals?",
    category: "support",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "A little" },
      { value: "3", label: "Moderately" },
      { value: "4", label: "Very well" },
      { value: "5", label: "Extremely well" }
    ]
  },
  {
    id: 7,
    text: "How often do you and your partner spend quality time together?",
    category: "quality_time",
    options: [
      { value: "1", label: "Never" },
      { value: "2", label: "Rarely" },
      { value: "3", label: "Sometimes" },
      { value: "4", label: "Often" },
      { value: "5", label: "Very often" }
    ]
  },
  {
    id: 8,
    text: "How well do you and your partner respect each other's boundaries?",
    category: "boundaries",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "A little" },
      { value: "3", label: "Moderately" },
      { value: "4", label: "Very well" },
      { value: "5", label: "Extremely well" }
    ]
  },
  {
    id: 9,
    text: "How fairly are responsibilities shared in your relationship?",
    category: "responsibilities",
    options: [
      { value: "1", label: "Very unfairly" },
      { value: "2", label: "Unfairly" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Fairly" },
      { value: "5", label: "Very fairly" }
    ]
  },
  {
    id: 10,
    text: "Overall, how happy are you in your relationship?",
    category: "overall",
    options: [
      { value: "1", label: "Very unhappy" },
      { value: "2", label: "Unhappy" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Happy" },
      { value: "5", label: "Very happy" }
    ]
  }
];

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
  const progress = ((currentQuestionIndex + 1) / healthQuizQuestions.length) * 100;
  
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
      const totalPossiblePoints = healthQuizQuestions.length * 5; // Max 5 points per question
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
  
  if (showResults) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            <Heart className="inline-block text-primary w-6 h-6 mr-2" />
            Processing Your Results
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <LoadingIndicator size="lg" label="Analyzing your relationship health..." />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Brain className="text-primary w-6 h-6 mr-2" />
            Relationship Health Quiz
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Question {currentQuestionIndex + 1} of {healthQuizQuestions.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50">
                <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
        >
          {currentQuestionIndex < healthQuizQuestions.length - 1 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            "Complete Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
