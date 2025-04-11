import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

// Define the structure of the activity prop based on Dashboard.tsx
export interface Activity {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  completed?: boolean;
  highlighted?: boolean;
  premium?: boolean;
  new?: boolean;
  comingSoon?: boolean; // Added based on AI Therapist example
}

// Define the structure for colors based on Dashboard.tsx colorThemes
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

interface ActivityListItemProps {
  activity: Activity;
  colors: ColorTheme;
  onClick: (path: string, activityId: number) => void;
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({ activity, colors, onClick }) => {
  const isClickable = !activity.comingSoon && activity.path;

  return (
    <div
      key={activity.id}
      className={cn(
        "flex items-center justify-between p-4 rounded-lg mb-3 transition-all duration-200 ease-in-out",
        activity.highlighted ? `border-l-4 ${colors.borderAccent} ${colors.bgSubtle} dark:bg-opacity-20` : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        isClickable ? "cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/50" : "opacity-70 cursor-not-allowed"
      )}
      onClick={() => isClickable && onClick(activity.path, activity.id)}
      aria-disabled={!isClickable}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${activity.highlighted ? colors.primary : 'bg-gray-100 dark:bg-gray-700'} text-white dark:text-gray-200`}>
          {React.cloneElement(activity.icon as React.ReactElement, { className: `w-5 h-5 ${activity.highlighted ? 'text-white' : colors.textPrimary}` })}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {activity.new && <Badge variant="outline" className="text-xs border-green-500 text-green-600 dark:border-green-400 dark:text-green-400">New</Badge>}
            {activity.premium && <Badge variant="outline" className="text-xs border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400"><Lock className="w-3 h-3 mr-1" /> Premium</Badge>}
            {activity.comingSoon && <Badge variant="outline" className="text-xs border-gray-500 text-gray-600 dark:border-gray-400 dark:text-gray-400">Coming Soon</Badge>}
            {activity.completed && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</Badge>}
          </div>
        </div>
      </div>
      {isClickable && (
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  );
};