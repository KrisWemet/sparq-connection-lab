import React from "react";
import { MessageSquare, PlayCircle, CheckCircle } from "lucide-react";

interface ActivityComponentProps {
  activity: {
    type: 'quiz' | 'discussion' | 'action';
    details: string;
  };
}

export function ActivityComponent({ activity }: ActivityComponentProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'discussion':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'quiz':
        return <PlayCircle className="w-5 h-5 text-amber-500" />;
      case 'action':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityTitle = () => {
    switch (activity.type) {
      case 'discussion':
        return "Discussion Activity";
      case 'quiz':
        return "Quiz Activity";
      case 'action':
        return "Action Step";
      default:
        return "Activity";
    }
  };

  const getActivityBackground = () => {
    switch (activity.type) {
      case 'discussion':
        return "bg-indigo-50 dark:bg-indigo-900/20";
      case 'quiz':
        return "bg-amber-50 dark:bg-amber-900/20";
      case 'action':
        return "bg-green-50 dark:bg-green-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  return (
    <div className={`p-4 rounded-lg ${getActivityBackground()}`}>
      <div className="flex items-start gap-3 mb-3">
        {getActivityIcon()}
        <h3 className="font-medium text-gray-900 dark:text-white">
          {getActivityTitle()}
        </h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300">
        {activity.details}
      </p>
    </div>
  );
} 