import React, { useEffect, useState } from 'react';
import { 
  Footprints, 
  Flame, 
  Crown, 
  Compass, 
  Eye, 
  Share2,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { AchievementDefinition } from '@/types/streaks';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  footprints: Footprints,
  flame: Flame,
  crown: Crown,
  compass: Compass,
  eye: Eye,
  'share-2': Share2,
};

interface AchievementBadgeProps {
  definition: AchievementDefinition;
  earned: boolean;
  progress: number;
  awardedAt?: string | null;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  definition,
  earned,
  progress,
  awardedAt,
  isNew = false,
  size = 'md',
  showProgress = true,
  className,
}: AchievementBadgeProps) {
  const [showNewAnimation, setShowNewAnimation] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      setShowNewAnimation(true);
      const timer = setTimeout(() => setShowNewAnimation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const IconComponent = ICON_MAP[definition.icon] || Footprints;
  const maxProgress = definition.maxProgress || 1;
  const progressPercent = Math.min((progress / maxProgress) * 100, 100);

  const sizeClasses = {
    sm: {
      container: 'p-2',
      icon: 'w-6 h-6',
      title: 'text-xs',
      description: 'text-[10px]',
    },
    md: {
      container: 'p-3',
      icon: 'w-10 h-10',
      title: 'text-sm',
      description: 'text-xs',
    },
    lg: {
      container: 'p-4',
      icon: 'w-14 h-14',
      title: 'text-base',
      description: 'text-sm',
    },
  };

  const categoryColors = {
    streaks: 'from-orange-500 to-amber-500',
    completions: 'from-blue-500 to-cyan-500',
    engagement: 'from-purple-500 to-pink-500',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 transition-all duration-300',
        earned 
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 dark:from-amber-950 dark:to-orange-950 dark:border-amber-700' 
          : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700',
        showNewAnimation && 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse',
        sizeClasses[size].container,
        className
      )}
    >
      {/* New Badge */}
      {showNewAnimation && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
          NEW!
        </div>
      )}

      {/* Earned Badge */}
      {earned && !showNewAnimation && (
        <div className="absolute -top-1.5 -right-1.5">
          <CheckCircle2 className="w-5 h-5 text-green-500 bg-white dark:bg-gray-900 rounded-full" />
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-2">
        {/* Icon Container */}
        <div
          className={cn(
            'rounded-full p-2.5 transition-all',
            earned
              ? `bg-gradient-to-br ${categoryColors[definition.category]} text-white shadow-lg`
              : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
          )}
        >
          {earned ? (
            <IconComponent className={sizeClasses[size].icon} />
          ) : (
            <Lock className={sizeClasses[size].icon} />
          )}
        </div>

        {/* Title */}
        <h4
          className={cn(
            'font-semibold leading-tight',
            earned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
            sizeClasses[size].title
          )}
        >
          {definition.title}
        </h4>

        {/* Description */}
        <p
          className={cn(
            'line-clamp-2',
            earned ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500',
            sizeClasses[size].description
          )}
        >
          {definition.description}
        </p>

        {/* Progress Bar (for unearned achievements) */}
        {showProgress && !earned && definition.maxProgress && definition.maxProgress > 1 && (
          <div className="w-full mt-1">
            <Progress 
              value={progressPercent} 
              className="h-1.5"
              indicatorClassName={cn(
                'bg-gradient-to-r',
                categoryColors[definition.category]
              )}
            />
            <p className="text-[10px] text-gray-500 mt-1">
              {progress} / {maxProgress}
            </p>
          </div>
        )}

        {/* Awarded Date */}
        {earned && awardedAt && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Earned {new Date(awardedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default AchievementBadge;
