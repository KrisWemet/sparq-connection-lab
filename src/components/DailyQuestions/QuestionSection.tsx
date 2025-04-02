import React from "react";
import { ChevronLeft } from "lucide-react";
import QuestionCard from "@/components/DailyQuestions/QuestionCard";

interface QuestionSectionProps {
  currentQuestion: any;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  handleSubmitAnswer: () => void;
  isLoading: boolean;
  showFollowUp: boolean;
  handleShowFollowUp: () => void;
  handleBackToCategories: () => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({
  currentQuestion,
  userAnswer,
  setUserAnswer,
  handleSubmitAnswer,
  isLoading,
  showFollowUp,
  handleShowFollowUp,
  handleBackToCategories
}) => {
  return (
    <>
      <QuestionCard
        currentQuestion={currentQuestion}
        userAnswer={userAnswer}
        setUserAnswer={setUserAnswer}
        handleSubmitAnswer={handleSubmitAnswer}
        isLoading={isLoading}
        showFollowUp={showFollowUp}
        handleShowFollowUp={handleShowFollowUp}
      />
      <button
        onClick={handleBackToCategories}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to categories
      </button>
    </>
  );
};

export default QuestionSection;