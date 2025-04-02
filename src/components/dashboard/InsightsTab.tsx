import React from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { Sparkles } from 'lucide-react'; // Icon for EmptyState
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

// Define the props for the component
interface InsightsTabProps {
  colors: typeof colorThemes.azure; // Use a specific theme structure or a general Record<string, string>
  onNavigate: (path: string) => void; // Keep for consistency, might be used for a CTA later
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  colors, // colors prop might be used for styling the EmptyState icon or text later
  onNavigate,
}) => {
  return (
    <EmptyState
      icon={<Sparkles className={`w-12 h-12 text-gray-400`} />} // Use colors.textPrimary potentially
      message="Relationship insights are coming soon! Keep interacting with the app to build your insights."
      actionText="Answer Daily Questions"
      onAction={() => onNavigate('/daily-questions')} // Navigate to daily questions to build insights
    />
  );
};

export default InsightsTab;