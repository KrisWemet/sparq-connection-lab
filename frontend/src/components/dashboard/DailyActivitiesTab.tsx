import React from 'react';
import { ActivityListItem, Activity } from './ActivityListItem'; // Assuming Activity type is exported from ActivityListItem or a types file
import { Card, CardContent } from "@/components/ui/card";
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

// Define the props for the component
interface DailyActivitiesTabProps {
  activities: Activity[];
  colors: typeof colorThemes.azure; // Use a specific theme structure or a general Record<string, string>
  onNavigate: (path: string, activityId: number) => void;
}

export const DailyActivitiesTab: React.FC<DailyActivitiesTabProps> = ({
  activities,
  colors,
  onNavigate,
}) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="border-none shadow-none bg-transparent mt-4">
        <CardContent className="p-0 text-center text-gray-500 dark:text-gray-400">
          No daily activities available right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent mt-0">
      <CardContent className="p-0">
        <ul className="space-y-3">
          {activities.map((activity) => (
            <ActivityListItem
              key={activity.id}
              activity={activity}
              colors={colors}
              onClick={() => {
                if (!activity.comingSoon && activity.path) {
                  onNavigate(activity.path, activity.id);
                }
              }}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DailyActivitiesTab;