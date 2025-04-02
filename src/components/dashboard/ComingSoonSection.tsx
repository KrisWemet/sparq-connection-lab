import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UpcomingFeatureListItem } from './UpcomingFeatureListItem'; // Import the item component

// Re-define interfaces here for now. Consider moving to a shared types file later.
interface UpcomingFeature {
  id: number | string;
  title: string;
  description: string;
  icon: React.ReactNode;
  premium?: boolean;
  path?: string;
  available?: boolean;
}

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

interface ComingSoonSectionProps {
  features: UpcomingFeature[];
  colors: ColorTheme; // Pass the theme colors down
  onNavigate: (path: string) => void; // Pass the navigation handler down
}

export const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({
  features,
  colors,
  onNavigate,
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Coming Soon</h2>
        {/* Consider making the badge color dynamic based on theme if needed */}
        <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">New Features</Badge>
      </div>

      {/* List of Features */}
      <div className="space-y-4">
        {features.map((feature) => (
          <UpcomingFeatureListItem
            key={feature.id}
            feature={feature}
            colors={colors}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};