import React from "react";
import { CheckCircle, CircleDot, Circle, Lock } from "lucide-react";

interface ProgressTrackerProps {
  totalDays: number;
  currentDay: number;
  completedDays: number[];
  onDayClick?: (dayNumber: number) => void;
}

export function ProgressTracker({
  totalDays,
  currentDay,
  completedDays,
  onDayClick
}: ProgressTrackerProps) {
  // Generate an array of day numbers [1...totalDays]
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  
  // Determine if a day is accessible (completed or current)
  const isDayAccessible = (dayNumber: number) => {
    return completedDays.includes(dayNumber) || dayNumber <= currentDay;
  };

  // Get the appropriate icon for a day based on its status
  const getDayIcon = (dayNumber: number) => {
    if (completedDays.includes(dayNumber)) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    if (dayNumber === currentDay) {
      return <CircleDot className="w-6 h-6 text-blue-500" />;
    }
    
    if (isDayAccessible(dayNumber)) {
      return <Circle className="w-6 h-6 text-gray-400" />;
    }
    
    return <Lock className="w-6 h-6 text-gray-400" />;
  };

  // Get the appropriate class for the day indicator
  const getDayClass = (dayNumber: number) => {
    if (completedDays.includes(dayNumber)) {
      return "bg-green-100 dark:bg-green-900/30 border-green-500";
    }
    
    if (dayNumber === currentDay) {
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-500";
    }
    
    if (isDayAccessible(dayNumber)) {
      return "bg-gray-100 dark:bg-gray-700 border-gray-400";
    }
    
    return "bg-gray-100 dark:bg-gray-800 border-gray-300 opacity-60";
  };

  return (
    <div className="w-full py-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Your Journey Progress
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {days.map(dayNumber => (
          <button
            key={dayNumber}
            onClick={() => isDayAccessible(dayNumber) && onDayClick?.(dayNumber)}
            disabled={!isDayAccessible(dayNumber)}
            className={`flex items-center justify-center w-10 h-10 rounded-full border ${getDayClass(dayNumber)} ${isDayAccessible(dayNumber) ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed'}`}
            title={`Day ${dayNumber} ${completedDays.includes(dayNumber) ? '(Completed)' : dayNumber === currentDay ? '(Current)' : isDayAccessible(dayNumber) ? '(Accessible)' : '(Locked)'}`}
          >
            <span className="sr-only">Day {dayNumber}</span>
            {getDayIcon(dayNumber)}
          </button>
        ))}
      </div>
    </div>
  );
} 