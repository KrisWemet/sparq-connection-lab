
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Award } from "lucide-react";

interface ValuesQuestionProps {
  question: {
    text: string;
    explanation?: string;
  };
  onSubmit: (answer: string) => void;
}

export function ValuesQuestion({ question, onSubmit }: ValuesQuestionProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="text-primary w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Vision & Values Journey
            </h1>
            <p className="text-sm text-gray-500">Day 1: Core Values Discovery</p>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-medium text-gray-900 mb-6">
          {question.text}
        </h2>
        {question.explanation && (
          <p className="text-sm text-gray-600 mb-4">{question.explanation}</p>
        )}
        <div className="space-y-4">
          <Textarea
            placeholder="Write your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[120px]"
          />
          <Button 
            className="w-full"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Save and Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
