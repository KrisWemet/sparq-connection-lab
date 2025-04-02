import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define the structure of the feature object
// TODO: Consider creating a shared type if this is used elsewhere
interface UpcomingFeature {
  id: number | string; // Allow string IDs if necessary
  title: string;
  description: string;
  icon: React.ReactNode; // Expecting a JSX element like <Brain />
  premium?: boolean;
  path?: string;
  available?: boolean;
}

// Define the structure for color themes
// TODO: Import this from a shared location if possible (e.g., Dashboard.tsx or a theme file)
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

interface UpcomingFeatureListItemProps {
  feature: UpcomingFeature;
  colors: ColorTheme;
  onNavigate: (path: string) => void;
}

export const UpcomingFeatureListItem: React.FC<UpcomingFeatureListItemProps> = ({
  feature,
  colors,
  onNavigate,
}) => {
  const handleNavigation = () => {
    if (feature.path && feature.available) {
      onNavigate(feature.path);
    }
    // Optionally handle clicks on non-available features (e.g., show a toast)
  };

  return (
    <Card className="overflow-hidden opacity-80">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colors.bgSubtle}`}>
            {/* Ensure the icon color matches the theme */}
            <div className={colors.textPrimary}>{feature.icon}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h3>
              {feature.premium && (
                <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">Premium</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
          {feature.path && feature.available ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigation}
              className="text-xs"
            >
              Preview
            </Button>
          ) : (
            <Badge variant="outline">Soon</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};