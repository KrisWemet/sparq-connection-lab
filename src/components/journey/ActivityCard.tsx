import { useState } from 'react';
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
    <div className={cn('rounded-3xl overflow-hidden border border-brand-primary/10 bg-white shadow-sm', className)}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brand-taupe">
              {activity.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              {activity.description}
            </p>
          </div>
          {onComplete && (
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              size="icon"
              className={cn(
                'ml-4 flex-shrink-0 rounded-xl',
                isCompleted
                  ? 'border-brand-growth text-brand-growth'
                  : 'bg-brand-primary hover:bg-brand-hover'
              )}
              onClick={onComplete}
            >
              <Check className={cn('h-5 w-5', isCompleted ? 'text-brand-growth' : 'text-white')} />
            </Button>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-between rounded-xl text-brand-taupe hover:bg-brand-primary/5"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-sm font-medium">View Steps</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {activity.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl p-3 hover:bg-brand-linen/50 transition-colors"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary">
                    <span className="text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {activity.funActivity && (
              <div className="mt-4 rounded-2xl bg-brand-linen p-4">
                <h4 className="font-bold text-brand-taupe">
                  {activity.funActivity.title}
                </h4>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                  {activity.funActivity.instructions}
                </p>
                <div className="mt-3 space-y-2">
                  {activity.funActivity.examples.map((example, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white p-3 text-sm text-zinc-700 border border-brand-primary/5"
                    >
                      {example}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-zinc-500 font-serif italic">
                  Reflection: {activity.funActivity.reflection}
                </p>
              </div>
            )}

            {activity.quote && (
              <blockquote className="mt-4 border-l-4 border-brand-primary/20 pl-4 font-serif italic text-zinc-600 leading-relaxed">
                {activity.quote}
              </blockquote>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
