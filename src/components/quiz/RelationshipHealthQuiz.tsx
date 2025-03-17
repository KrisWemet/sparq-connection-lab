
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain } from "lucide-react";
import { healthQuizQuestions } from "./data/healthQuizQuestions";
import { QuizQuestion } from "./QuizQuestion";
import { QuizLoadingState } from "./QuizLoadingState";
import { useQuizResults } from "./hooks/useQuizResults";

interface RelationshipHealthQuizProps {
  onComplete: (score: number) => void;
  onCancel: () => void;
}

export function RelationshipHealthQuiz({ onComplete, onCancel }: RelationshipHealthQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { loading, calculateAndSaveResults } = useQuizResults();

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
    await calculateAndSaveResults(answers, healthQuizQuestions.length, onComplete);
  };
  
  if (showResults) {
    return <QuizLoadingState />;
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
        <QuizQuestion 
          questionText={currentQuestion.text}
          options={currentQuestion.options}
          selectedValue={answers[currentQuestion.id] || ""}
          onValueChange={handleAnswer}
        />
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
