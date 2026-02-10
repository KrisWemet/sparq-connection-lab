import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useStreaks } from "@/hooks/useStreaks";
import { colorThemes } from "@/lib/colorThemes";
import { dailyActivities, upcomingFeatures } from "@/data/dashboardConstants"; // Keep static constants

// Common Components
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState"; // Added
import { Button } from "@/components/ui/button";
import { Heart, Trophy } from "lucide-react";

// Dashboard Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
// InfoSnippetCard removed as its content was static/local
import { DailyPromptCard } from "@/components/dashboard/DailyPromptCard";
// PromoCard removed as its logic was based on local state/storage
import { DailyActivitiesTab } from "@/components/dashboard/DailyActivitiesTab";
import { GoalsTab } from "@/components/dashboard/GoalsTab";
import { EventsTab } from "@/components/dashboard/EventsTab";
import { InsightsTab } from "@/components/dashboard/InsightsTab";
import { ComingSoonSection } from "@/components/dashboard/ComingSoonSection";
import { StreakIndicator } from "@/components/StreakIndicator";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    profile,
    events,
    goals,
    dailyPrompt,
    loading,
    error,
    refetchData,
  } = useDashboardData();
  const { streak } = useStreaks();

  // Derive theme from profile or default
  // TODO: Update UserProfile type and ProfileService to include preferences.theme
  const userTheme = "azure"; // Default theme, replace with profile.preferences.theme when available
  const colors = colorThemes[userTheme as keyof typeof colorThemes] || colorThemes.azure;

  // Loading State
  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  // Error State
  if (error || (!loading && !profile)) {
    const errorToDisplay = error || new Error("Profile data is missing.");
    return <ErrorState error={errorToDisplay} onRetry={refetchData} message="Failed to load dashboard data. Please try again." />;
  }

  // Profile is guaranteed non-null here due to the check above
  if (!profile) {
     // Fallback error state, should ideally not be reached
     return <ErrorState error={new Error("Profile data is unexpectedly missing after load.")} onRetry={refetchData} />;
  }

  // Navigation handlers to match component prop types
  const handleActivityNavigate = (path: string, _activityId: number) => {
    navigate(path);
  };

  const handleGoalNavigate = (path: string, _goalId?: string | number) => {
    navigate(path);
  };

  const handleEventNavigate = (path: string, _eventId?: string | number) => {
    navigate(path);
  };


  return (
    <div className={`min-h-screen pb-24 ${colors.bgSubtle} dark:bg-gray-900`}>
      <DashboardHeader
        profile={profile}
        colors={colors}
        onNavigate={navigate}
      />

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up space-y-6">
        {/* Streak and Achievements Row */}
        <div className="flex items-center justify-between">
          <StreakIndicator streak={streak} size="md" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/achievements')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            Achievements
          </Button>
        </div>

        <GreetingCard
          profile={profile}
          colors={colors}
          onNavigate={navigate}
        />

        {profile && !profile.partnerId && (
          <div className="bg-amber-50 border-amber-200 border rounded-lg p-4 mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <Heart className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Connect with your partner</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Link your account with your partner to unlock the full experience and get personalized insights.
                </p>
                <Button
                  size="sm"
                  variant="default"
                  className="mt-3 bg-amber-500 hover:bg-amber-600"
                  onClick={() => navigate("/partner-invite")}
                >
                  Connect Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Removed InfoSnippetCards for encouragement and fun activity - data should come from hook or dedicated components */}

        <DailyPromptCard
          dailyPrompt={dailyPrompt}
          colors={colors}
          isLoading={loading && !dailyPrompt} // Pass loading state specifically for the prompt
        />

        {/* Removed PromoCard for 36 Questions - logic was based on local state */}

        {/* Tabs Section */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today">
            <DailyActivitiesTab
              activities={dailyActivities} // Use imported constant
              colors={colors}
              onNavigate={handleActivityNavigate} // Use wrapper
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            {goals && goals.length > 0 ? (
              <GoalsTab
                goals={goals}
                colors={colors}
                onNavigate={handleGoalNavigate} // Use wrapper
              />
            ) : (
              <EmptyState
                // title prop removed
                message="No Goals Yet. Start setting goals together to track your progress."
                actionText="Set a Goal"
                onAction={() => navigate('/goals')} // Navigate to goals page
              />
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
             {events && events.length > 0 ? (
               <EventsTab
                 events={events}
                 colors={colors}
                 onNavigate={handleEventNavigate} // Use wrapper
               />
             ) : (
               <EmptyState
                 // title prop removed
                 message="No Upcoming Events. Plan your next date night or special occasion."
                 actionText="Add an Event"
                 onAction={() => navigate('/shared-planner')} // Navigate to planner
               />
             )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
             <InsightsTab
               colors={colors}
               onNavigate={navigate} // Pass navigate directly
             />
          </TabsContent>
        </Tabs>

        {/* Coming Soon Section */}
        <ComingSoonSection
          features={upcomingFeatures} // Use imported constant
          colors={colors}
          onNavigate={navigate} // Pass navigate directly
        />

      </main>

      <BottomNav />
    </div>
  );
}