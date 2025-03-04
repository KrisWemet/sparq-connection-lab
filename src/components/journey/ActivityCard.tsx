import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { JourneyActivity } from '@/types/journey';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activity: JourneyActivity;
  color: string;
  isCompleted?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ActivityCard({
  activity,
  color,
  isCompleted = false,
  onComplete,
  className
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activity.title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {activity.description}
            </p>
          </div>
          {onComplete && (
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              className={cn(
                'ml-4 flex-shrink-0',
                isCompleted ? 'border-green-500 text-green-500' : color
              )}
              onClick={onComplete}
            >
              <Check className={cn('h-5 w-5', isCompleted ? 'text-green-500' : 'text-white')} />
            </Button>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>View Steps</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              {activity.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                    color
                  )}>
                    <span className="text-sm font-medium text-white">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>

            {activity.funActivity && (
              <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {activity.funActivity.title}
                </h4>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {activity.funActivity.instructions}
                </p>
                <div className="mt-4 space-y-2">
                  {activity.funActivity.examples.map((example, index) => (
                    <div
                      key={index}
                      className="rounded-md bg-white dark:bg-gray-700 p-3 text-sm"
                    >
                      {example}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                  Reflection: {activity.funActivity.reflection}
                </p>
              </div>
            )}

            {activity.quote && (
              <blockquote className="mt-6 border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic text-gray-600 dark:text-gray-300">
                {activity.quote}
              </blockquote>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 