import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from 'lucide-react'; // Or another relevant icon

interface QuestionDisplayProps {
  questionText: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questionText }) => {
  return (
    <Card className="mb-6 shadow-md border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {questionText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;