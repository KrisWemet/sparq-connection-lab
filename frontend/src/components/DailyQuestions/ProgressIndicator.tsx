import React from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils"; // For conditional classes

type Level = 'Light' | 'Medium' | 'Deep' | null;

interface ProgressIndicatorProps {
  level: Level;
  current: number; // Current question number (1-based)
  total: number; // Total questions in this level
  progressString?: string; // Optional: Use pre-formatted string if available
}

const levelColors: Record<NonNullable<Level>, string> = {
  Light: "bg-sky-500",
  Medium: "bg-amber-500",
  Deep: "bg-red-500",
};

const levelTextColors: Record<NonNullable<Level>, string> = {
    Light: "text-sky-700",
    Medium: "text-amber-700",
    Deep: "text-red-700",
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  level,
  current,
  total,
  progressString,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const levelColorClass = level ? levelColors[level] : "bg-primary"; // Default color if level is null
  const levelTextColorClass = level ? levelTextColors[level] : "text-primary";

  // Prefer the pre-formatted string if provided
  const displayString = progressString
    ? progressString
    : `Question ${current} of ${total}${level ? ` (${level})` : ''}`;

  return (
    <div className="mb-4 p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className={cn("text-sm font-medium", levelTextColorClass)}>
          Progress
        </span>
        <span className="text-xs text-muted-foreground">
          {displayString}
        </span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={levelColorClass} />
    </div>
  );
};

export default ProgressIndicator;