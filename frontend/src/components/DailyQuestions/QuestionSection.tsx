import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Share2, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';

interface QuestionSectionProps {
  currentQuestion: any;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  handleSubmitAnswer: () => void;
  isLoading: boolean;
  showFollowUp: boolean;
  handleShowFollowUp: () => void;
  handleBackToCategories: () => void;
  isReflectionMode?: boolean;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({
  currentQuestion,
  userAnswer,
  setUserAnswer,
  handleSubmitAnswer,
  isLoading,
  showFollowUp,
  handleShowFollowUp,
  handleBackToCategories,
  isReflectionMode = false
}) => {
  const [reflectionNotes, setReflectionNotes] = useState("");
  
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-2 -ml-2"
        onClick={handleBackToCategories}
      >
        ← Back to Categories
      </Button>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-primary/5 rounded-t-lg">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">
              {isReflectionMode ? "Evening Reflection" : "Today's Question"}
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10">
              {currentQuestion.category}
            </Badge>
          </div>
          <CardDescription className="text-base font-medium mt-4">
            {isReflectionMode 
              ? `Reflect on today's question: ${currentQuestion.text}`
              : currentQuestion.text}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isReflectionMode ? (
            <>
              <h3 className="text-sm font-medium mb-2">How did discussing this question go?</h3>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Share how the conversation went with your partner..."
                className="min-h-[120px] mb-4"
              />
              
              <h3 className="text-sm font-medium mb-2">What did you learn or discover?</h3>
              <Textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="Note any insights or things you'd like to remember..."
                className="min-h-[120px]"
              />
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium mb-2">Your Answer</h3>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="min-h-[120px]"
              />
              
              {showFollowUp && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    Go Deeper
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.followUp || "Consider sharing your answer with your partner and listen to their perspective. What new insights does this bring?"}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" title="Save for later">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Share with partner">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {!showFollowUp && !isReflectionMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowFollowUp}
                className="ml-auto mr-2"
              >
                Go Deeper
              </Button>
            )}
            
            <Button onClick={handleSubmitAnswer} disabled={isLoading || !userAnswer.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isReflectionMode ? "Save Reflection" : "Submit"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuestionSection;