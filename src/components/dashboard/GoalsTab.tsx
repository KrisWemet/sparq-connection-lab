import React from 'react';
import { GoalListItem } from './GoalListItem'; // Assuming GoalListItem exists and exports necessary types/props
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from "@/components/ui/card";
import { Target } from 'lucide-react'; // Icon for EmptyState
import { Goal } from '@/services/supabase/types'; // Import Goal type
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

// Define the props for the component
interface GoalsTabProps {
  goals: Goal[];
  colors: typeof colorThemes.azure; // Use a specific theme structure or a general Record<string, string>
  onNavigate: (path: string, goalId?: string | number) => void; // Adapt navigation function if needed for goals
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  colors,
  onNavigate,
}) => {
  if (!goals || goals.length === 0) {
    return (
      <EmptyState
        icon={<Target className="w-12 h-12 text-gray-400" />}
        message="No Goals Yet. Start setting goals to track your progress together."
        actionText="Set a New Goal"
        onAction={() => onNavigate('/goals')} // Navigate to the main goals page or a creation page
      />
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent mt-0">
      <CardContent className="p-0">
        <ul className="space-y-3">
          {goals.map((goal) => (
            <GoalListItem
              key={goal.id}
              goal={goal}
              colors={colors}
              // Pass the onNavigate function directly; GoalListItem handles the click
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default GoalsTab;