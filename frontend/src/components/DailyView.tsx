import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export interface DailyViewProps {
  day: {
    day: number;
    title: string;
    content: any[];
    reflectionPrompt: string;
  };
  isLocked: boolean;
}

export function DailyView({ day, isLocked }: DailyViewProps) {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Lock className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          This day is locked
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Complete the previous day to unlock this content.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {day.title}
        </h1>
        
        <div className="space-y-6">
          {day.content.map((block, index) => {
            if (block.type === "text") {
              return (
                <p 
                  key={index} 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                >
                  {block.content}
                </p>
              );
            } else if (block.type === "activity") {
              return (
                <Card key={index} className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-primary font-medium">
                      Activity: {block.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {block.instructions}
                    </p>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })}
        </div>
      </div>
      
      <div className="my-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Today's Reflection
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="italic text-gray-700 dark:text-gray-300">
            {day.reflectionPrompt}
          </p>
        </div>
      </div>
    </div>
  );
} 