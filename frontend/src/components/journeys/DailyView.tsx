import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock } from "lucide-react";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import { ActivityComponent } from "./ActivityComponent";

interface DailyViewProps {
  day: {
    dayNumber: number;
    title: string;
    content: Array<{
      type: 'text' | 'video' | 'exercise' | 'link';
      value: string;
    }>;
    reflectionPrompt: string;
    activity?: {
      type: 'quiz' | 'discussion' | 'action';
      details: string;
    };
  };
  dayNumber: number;
  onComplete: () => void;
  isCompleted: boolean;
  isLocked: boolean;
}

export function DailyView({ 
  day, 
  dayNumber, 
  onComplete, 
  isCompleted, 
  isLocked 
}: DailyViewProps) {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Day {dayNumber} is Locked
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Complete the previous day to unlock this content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          Day {dayNumber}: {day.title}
          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </h2>
        <Badge variant={isCompleted ? "success" : "outline"}>
          {isCompleted ? "Completed" : "In Progress"}
        </Badge>
      </div>

      {/* Content Blocks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Today's Lesson</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {day.content.map((block, index) => (
            <ContentBlockRenderer key={index} block={block} />
          ))}
        </CardContent>
      </Card>

      {/* Activity */}
      {day.activity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {day.activity.type === 'discussion' 
                ? 'Discussion Activity' 
                : day.activity.type === 'quiz' 
                  ? 'Quiz Activity' 
                  : 'Action Step'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityComponent activity={day.activity} />
          </CardContent>
        </Card>
      )}

      {/* Reflection Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reflection Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 italic">
            "{day.reflectionPrompt}"
          </p>
        </CardContent>
      </Card>

      {/* Complete Button */}
      {!isCompleted && (
        <Button 
          className="w-full py-6" 
          onClick={onComplete}
          size="lg"
        >
          Mark Day {dayNumber} as Complete
        </Button>
      )}
    </div>
  );
} 