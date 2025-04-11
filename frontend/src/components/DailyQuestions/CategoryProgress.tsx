import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // For displaying level

type Level = 'Light' | 'Medium' | 'Deep' | null;

interface CategoryProgressProps {
  progressString: string; // e.g., "Adventure & Fun - Question 1 of 10 (Light)"
  isPaused: boolean;
  onPause: () => Promise<void>;
  // onResume is handled by the main view when isPaused is true
  isLoading: boolean; // Loading state for disabling buttons
}

// Helper to extract info (can be improved)
const parseProgressString = (str: string): { categoryName: string; level: Level } => {
  const categoryMatch = str.match(/^(.*?) -/);
  const levelMatch = str.match(/\((Light|Medium|Deep)\)$/);

  return {
    categoryName: categoryMatch ? categoryMatch[1].trim() : "Unknown Category",
    level: levelMatch ? levelMatch[1] as Level : null,
  };
};

const levelBadgeVariant: Record<NonNullable<Level>, "default" | "secondary" | "destructive" | "outline"> = {
    Light: "secondary", // Or choose a specific color variant if defined in Badge
    Medium: "default", // Using default for Medium, adjust as needed
    Deep: "destructive", // Using destructive for Deep
};

const CategoryProgress: React.FC<CategoryProgressProps> = ({
  progressString,
  isPaused,
  onPause,
  isLoading,
}) => {
  const { categoryName, level } = parseProgressString(progressString);
  const badgeVariant = level ? levelBadgeVariant[level] : "outline";

  return (
    <div className="flex items-center justify-between p-4 mb-4 border rounded-lg bg-card shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{categoryName}</h3>
        {level && (
          <Badge variant={badgeVariant} className="mt-1">{level}</Badge>
        )}
      </div>
      {!isPaused && ( // Only show Pause button if not already paused
        <Button
          variant="ghost"
          size="icon"
          onClick={onPause}
          disabled={isLoading}
          aria-label="Pause Progress"
          className="text-muted-foreground hover:text-primary"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </Button>
      )}
       {/* Resume button is handled in the main DailyQuestionView when isPaused is true */}
    </div>
  );
};

export default CategoryProgress;