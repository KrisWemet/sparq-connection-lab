
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuizNavigationFooterProps {
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canContinue: boolean;
}

export function QuizNavigationFooter({
  onPrevious,
  onNext,
  onCancel,
  isFirstQuestion,
  isLastQuestion,
  canContinue
}: QuizNavigationFooterProps) {
  return (
    <CardFooter className="flex justify-between border-t p-4">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={isFirstQuestion}
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
        onClick={onNext}
        disabled={!canContinue}
      >
        {!isLastQuestion ? (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        ) : (
          "Complete Quiz"
        )}
      </Button>
    </CardFooter>
  );
}
