import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QuestionCardProps {
  currentQuestion: any;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  handleSubmitAnswer: () => void;
  isLoading: boolean;
  showFollowUp: boolean;
  handleShowFollowUp: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  userAnswer,
  setUserAnswer,
  handleSubmitAnswer,
  isLoading,
  showFollowUp,
  handleShowFollowUp
}) => {
  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Question</CardTitle>
        <CardDescription>{currentQuestion?.text}</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Your answer..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isLoading}
        />
        {showFollowUp && currentQuestion?.followUp && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Follow-up: {currentQuestion.followUp}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={handleShowFollowUp}>
          Show Follow Up
        </Button>
        <Button onClick={handleSubmitAnswer} disabled={isLoading}>
          Submit Answer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;