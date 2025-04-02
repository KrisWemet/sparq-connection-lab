import React from 'react';
import { Heart, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/services/supabase/types"; // Assuming UserProfile type path

// Define the structure for the colors prop based on Dashboard.tsx
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

interface DashboardHeaderProps {
  profile: UserProfile | null;
  colors: ColorTheme; // Pass the specific theme colors
  onNavigate: (path: string) => void; // Navigation handler
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  profile,
  colors,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <div className="container max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Use color prop for the icon */}
            <Heart className={`w-6 h-6 ${colors.textPrimary}`} />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sparq Connect</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Profile Avatar - Use profile prop and onNavigate */}
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => onNavigate('/profile')}>
              <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.fullName || 'User'} />
              <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            {/* Settings Button - Use onNavigate */}
            <button
              onClick={() => onNavigate("/settings")}
              className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              aria-label="Settings" // Added aria-label for accessibility
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;