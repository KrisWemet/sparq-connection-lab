import React from "react";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ProgressTrackerProps {
  totalDays: number;
  currentDay: number;
  completedDays: number[];
  onDayClick?: (day: number) => void;
}

export function ProgressTracker({ 
  totalDays, 
  currentDay, 
  completedDays, 
  onDayClick 
}: ProgressTrackerProps) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  
  const isDayAccessible = (day: number) => {
    return day <= currentDay;
  };
  
  const getDayIcon = (day: number) => {
    if (completedDays.includes(day)) {
      return <CheckCircle className="w-5 h-5" />;
    } else if (day === currentDay) {
      return <Circle className="w-5 h-5" />;
    } else if (day > currentDay) {
      return <Lock className="w-4 h-4" />;
    } else {
      return <Circle className="w-5 h-5" />;
    }
  };
  
  const getDayClass = (day: number) => {
    if (completedDays.includes(day)) {
      return "text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    } else if (day === currentDay) {
      return "text-primary bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800";
    } else if (day > currentDay) {
      return "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60";
    } else {
      return "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
    }
  };
  
  const handleClick = (day: number) => {
    if (isDayAccessible(day) && onDayClick) {
      onDayClick(day);
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Your Progress
      </h2>
      
      <div className="grid grid-cols-7 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {days.map(day => {
          const isAccessible = isDayAccessible(day);
          const isCompleted = completedDays.includes(day);
          const isCurrent = day === currentDay;
          
          return (
            <TooltipProvider key={day} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleClick(day)}
                    disabled={!isAccessible}
                    className={`
                      flex items-center justify-center
                      w-10 h-10 sm:w-11 sm:h-11
                      rounded-full border
                      transition-all duration-200
                      ${getDayClass(day)}
                    `}
                    aria-label={`Day ${day}`}
                  >
                    {getDayIcon(day)}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Day {day}
                    {isCompleted ? " (Completed)" : isCurrent ? " (Current)" : !isAccessible ? " (Locked)" : ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-primary" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-gray-400 dark:text-gray-600" />
          <span>Locked</span>
        </div>
      </div>
    </div>
  );
} 