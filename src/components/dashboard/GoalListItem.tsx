import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns'; // For date formatting

// Define the structure of the goal prop based on Dashboard.tsx and Goal type
// Assuming Goal type from '@/services/supabase/types' has these fields
interface Goal {
  id: string | number; // Assuming id is present
  title: string;
  target_date?: string | null; // Optional target date
  progress?: number | null; // Optional progress
  category?: string | null; // Optional category
  // Add other relevant fields if needed based on the actual Goal type
}

// Define the structure for colors (same as ActivityListItem)
interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  cardGradient: string;
  featureGradient: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  borderAccent: string;
  bgSubtle: string;
}

interface GoalListItemProps {
  goal: Goal;
  colors: ColorTheme;
  onNavigate: (path: string) => void; // Function to handle navigation
}

export const GoalListItem: React.FC<GoalListItemProps> = ({ goal, colors, onNavigate }) => {
  const goalPath = `/goals#${goal.id}`; // Example path, adjust as needed

  return (
    <Card
      key={goal.id}
      className="mb-3 transition-all duration-200 ease-in-out cursor-pointer hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
      onClick={() => onNavigate(goalPath)}
      role="button"
      tabIndex={0}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${colors.bgSubtle} dark:bg-opacity-20`}>
            <Target className={`w-5 h-5 ${colors.textPrimary}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              {goal.target_date && (
                <span>Target: {format(parseISO(goal.target_date), 'MMM d, yyyy')}</span>
              )}
              {goal.category && (
                <Badge variant="outline" className="text-xs">{goal.category}</Badge>
              )}
            </div>
            {goal.progress !== null && goal.progress !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <Progress value={goal.progress} className={`h-1.5 ${colors.primary}`} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{goal.progress}%</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </CardContent>
    </Card>
  );
};