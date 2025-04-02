import React from 'react';
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/services/supabase/types"; // Assuming UserProfile type path
import type { colorThemes } from "@/lib/colorThemes"; // Corrected import path

interface GreetingCardProps {
  profile: UserProfile | null;
  colors: typeof colorThemes[keyof typeof colorThemes];
  onNavigate: (path: string) => void;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({ profile, colors, onNavigate }) => {
  return (
    <div className={`bg-gradient-to-r ${colors.cardGradient} text-white rounded-lg p-6 mb-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">Hi, {profile?.fullName || 'User'}!</h2>
          {/* TODO: Fetch and display partner name */}
          <p className="text-white/80">Welcome back!</p>
        </div>
        <div className="flex flex-col items-center">
          {/* TODO: Fetch and display streak */}
          {/* <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.highlight} text-white font-bold text-lg`}>
            {profile?.streak || 0} // Property 'streak' does not exist on type 'UserProfile'.
          </div>
          <span className="text-xs mt-1 text-white/80">Day streak</span> */}
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={() => onNavigate("/daily-questions")}
        >
          Today's Questions
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={() => onNavigate("/messaging")}
        >
          Message Partner
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white"
          onClick={() => onNavigate("/path-to-together")}
        >
          Journey
        </Button>
      </div>
    </div>
  );
};