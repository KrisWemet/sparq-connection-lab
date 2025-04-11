import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";
import type { CommunicationPrompt } from "@/services/supabase/types"; // Assuming the type is exported
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

// Define the props interface
interface DailyPromptCardProps {
  dailyPrompt: CommunicationPrompt | null | undefined;
  isLoading: boolean;
  colors: typeof colorThemes.azure; // Use a specific theme type or a more generic one if needed
}

export const DailyPromptCard: React.FC<DailyPromptCardProps> = ({
  dailyPrompt,
  isLoading,
  colors,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className={`w-5 h-5 mr-2 ${colors.textAccent}`} />
          Daily Communication Prompt
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state using Skeleton
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : dailyPrompt ? (
          // Display the prompt if available
          <p className="text-gray-700 dark:text-gray-300 italic">"{dailyPrompt.text}"</p>
        ) : (
          // Empty state if no prompt after loading
          <p className="text-sm text-gray-500 dark:text-gray-400">No prompt available today.</p>
        )}
      </CardContent>
    </Card>
  );
};