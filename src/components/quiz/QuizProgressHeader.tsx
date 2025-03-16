
import { Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface QuizProgressHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export function QuizProgressHeader({ 
  currentQuestionIndex, 
  totalQuestions 
}: QuizProgressHeaderProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span className="flex items-center">
          <Brain className="text-primary w-6 h-6 mr-2" />
          Relationship Health Quiz
        </span>
        <span className="text-sm font-normal text-muted-foreground">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
      </CardTitle>
      <Progress value={progress} className="h-2 mt-2" />
    </CardHeader>
  );
}
