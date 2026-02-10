import React, { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserStreak } from '@/types/streaks';

interface StreakIndicatorProps {
  streak: UserStreak | null;
  showCelebration?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakIndicator({ 
  streak, 
  showCelebration = false,
  size = 'md',
  className 
}: StreakIndicatorProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      subtext: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      subtext: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 gap-2.5',
      icon: 'w-6 h-6',
      text: 'text-lg',
      subtext: 'text-base',
    },
  };

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full bg-gradient-to-r from-orange-50 to-amber-50',
        'border border-orange-200 dark:from-orange-950 dark:to-amber-950 dark:border-orange-800',
        sizeClasses[size].container,
        isCelebrating && 'animate-pulse ring-2 ring-orange-400 ring-offset-2',
        className
      )}
    >
      {/* Fire Icon with animation */}
      <div className={cn(
        'relative',
        isCelebrating && 'animate-bounce'
      )}>
        <Flame 
          className={cn(
            sizeClasses[size].icon,
            currentStreak > 0 
              ? 'text-orange-500 fill-orange-500' 
              : 'text-gray-400'
          )} 
        />
        {isCelebrating && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>

      {/* Streak Info */}
      <div className="flex flex-col">
        <span className={cn(
          'font-semibold text-orange-700 dark:text-orange-300',
          sizeClasses[size].text
        )}>
          {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
        </span>
        {longestStreak > 0 && (
          <span className={cn(
            'text-orange-600/70 dark:text-orange-400/70 flex items-center gap-1',
            sizeClasses[size].subtext
          )}>
            <Trophy className="w-3 h-3" />
            Best: {longestStreak}
          </span>
        )}
      </div>
    </div>
  );
}

export default StreakIndicator;
