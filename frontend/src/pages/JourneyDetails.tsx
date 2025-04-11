import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Import Journey specific components
import { DailyView } from "@/components/journeys/DailyView";
import { ProgressTracker } from "@/components/journeys/ProgressTracker";
import { ReflectionInput } from "@/components/journeys/ReflectionInput";

// --- Type Definitions ---
// TODO: Move these to a dedicated types file (e.g., src/types/pathToTogether.ts) and import

type ContentBlock = {
  type: 'text' | 'video' | 'exercise' | 'link';
  value: string;
};

type Activity = {
  type: 'quiz' | 'discussion' | 'action';
  details: string;
};

type Day = {
  dayNumber: number;
  title: string;
  content: ContentBlock[];
  reflectionPrompt: string;
  activity?: Activity;
};

type PathToTogetherJourney = { // Renamed type
  id: string;
  title: string;
  description?: string;
  estimatedDurationDays: number;
  theme?: string;
  days: Day[];
};

type Reflection = {
  dayNumber: number;
  responseText: string;
  timestamp: string; // Or Date
  sharedWithPartner: boolean;
};

type UserPathToTogetherProgress = { // Renamed type
  journeyId: string;
  currentDay: number;
  completedDays: number[];
  startDate: string; // Or Date
  lastAccessedDate: string; // Or Date
  reflections: Reflection[];
};

// --- Component ---

export default function JourneyDetailsPage() {
  const navigate = useNavigate();
  const { journeyId, dayNum } = useParams<{ journeyId: string; dayNum?: string }>();
  const queryClient = useQueryClient();

  const targetDayNumber = useMemo(() => {
    const parsedDay = parseInt(dayNum || '1', 10);
    return isNaN(parsedDay) || parsedDay < 1 ? 1 : parsedDay;
  }, [dayNum]);

  const [isCompletingDay, setIsCompletingDay] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [hasPartner, setHasPartner] = useState(false); // Placeholder state for partner status

  // TODO: Fetch partner status (e.g., using 'me-relationship' function) and update setHasPartner

  // --- Data Fetching ---

  const {
    data: pathToTogetherData, // Renamed variable
    isLoading: isLoadingJourney,
    error: errorJourney,
  } = useQuery<PathToTogetherJourney, Error>({ // Use renamed type
    queryKey: ['pathToTogetherDetail', journeyId], // Updated query key
    queryFn: async () => {
      console.log(`Fetching Path To Together details for ID: ${journeyId}`);
      if (!journeyId) throw new Error("Journey ID is required.");
      const { data, error } = await supabase.functions.invoke('journey-detail', {
        body: { journeyId: journeyId }
      });
      if (error) {
        console.error("Error invoking journey-detail:", error);
        throw new Error(`Failed to fetch Path To Together details: ${error.message}`);
      }
      if (!data || !Array.isArray(data.days) || typeof data.estimatedDurationDays !== 'number') {
         console.error("Invalid data structure received from journey-detail:", data);
         throw new Error("Invalid data returned for Path To Together details.");
      }
      console.log("Path To Together details fetched:", data);
      return data;
    },
    enabled: !!journeyId,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  const {
    data: userPathToTogetherProgress, // Renamed variable
    isLoading: isLoadingProgress,
    error: errorProgress,
  } = useQuery<UserPathToTogetherProgress | null, Error>({ // Use renamed type
    queryKey: ['userPathToTogetherProgress', journeyId], // Updated query key
    queryFn: async () => {
      console.log(`Fetching user Path To Together progress for journey ID: ${journeyId}`);
      if (!journeyId) throw new Error("Journey ID is required.");
      const { data, error } = await supabase.functions.invoke('me-journey-progress-detail', {
         body: { journeyId: journeyId }
      });

      if (error) {
        if (error.message.includes('Not found') || error.message.includes('404') || error.message.includes('No progress found')) {
           console.log("User Path To Together progress not found for this journey (likely not started).");
           return null;
        }
        console.error("Error invoking me-journey-progress-detail:", error);
        throw new Error(`Failed to fetch user Path To Together progress: ${error.message}`);
      }

      if (data == null) {
          console.log("No progress data returned, assuming not started.");
          return null;
      }

      if (typeof data.currentDay !== 'number' || !Array.isArray(data.completedDays) || !Array.isArray(data.reflections)) {
          console.error("Invalid data structure received for user progress:", data);
          throw new Error("Invalid progress data received.");
      }

      console.log("User Path To Together progress fetched:", data);
      data.completedDays = data.completedDays || [];
      data.reflections = data.reflections || [];
      return data;
    },
    enabled: !!journeyId,
    retry: (failureCount, error) => {
       if (error.message.includes('Not found') || error.message.includes('404') || error.message.includes('No progress found')) {
         return false;
       }
       return failureCount < 1;
     },
  });

  // --- Derived State & Memoization ---

  useEffect(() => {
    if (!isLoadingProgress && userPathToTogetherProgress && !dayNum) { // Use renamed variable
      const navigateToDay = userPathToTogetherProgress.currentDay > 0 ? userPathToTogetherProgress.currentDay : 1; // Use renamed variable
      console.log(`Redirecting to user's current day: ${navigateToDay}`);
      navigate(`/journey/${journeyId}/day/${navigateToDay}`, { replace: true });
    }
     else if (!isLoadingProgress && !userPathToTogetherProgress && !errorProgress) { // Use renamed variable
        console.log("No progress found, redirecting to start page.");
        toast.info("Start the Path To Together journey to begin!");
        navigate(`/journey/${journeyId}/start`, { replace: true }); // Route path remains /journey/...
     }
  }, [isLoadingProgress, userPathToTogetherProgress, errorProgress, dayNum, journeyId, navigate]); // Use renamed variable


  const currentDayData = useMemo(() => {
    if (!pathToTogetherData?.days) return null; // Use renamed variable
    return pathToTogetherData.days.find(d => d.dayNumber === targetDayNumber) || null; // Use renamed variable
  }, [pathToTogetherData, targetDayNumber]); // Use renamed variable

  const totalDays = pathToTogetherData?.estimatedDurationDays ?? 0; // Use renamed variable

  const isDayAccessible = useMemo(() => {
    if (!userPathToTogetherProgress || !currentDayData) return false; // Use renamed variable
    if (targetDayNumber === 1) return true;
    return targetDayNumber <= userPathToTogetherProgress.currentDay; // Use renamed variable
  }, [userPathToTogetherProgress, targetDayNumber, currentDayData]); // Use renamed variable

  const isCurrentDayCompleted = useMemo(() => {
     return userPathToTogetherProgress?.completedDays?.includes(targetDayNumber) ?? false; // Use renamed variable
  }, [userPathToTogetherProgress, targetDayNumber]); // Use renamed variable

  const currentReflection = useMemo(() => {
      return userPathToTogetherProgress?.reflections?.find(r => r.dayNumber === targetDayNumber); // Use renamed variable
  }, [userPathToTogetherProgress, targetDayNumber]); // Use renamed variable

  // --- Mutations ---

  const completeDayMutation = useMutation({
    mutationFn: async () => {
      if (!journeyId || !userPathToTogetherProgress || !currentDayData) throw new Error("Missing data to complete day."); // Use renamed variable
      if (isCurrentDayCompleted) {
          toast.info("Day already completed.");
          return { alreadyCompleted: true };
      }

      const nextDay = targetDayNumber + 1;
      const currentCompleted = Array.isArray(userPathToTogetherProgress.completedDays) ? userPathToTogetherProgress.completedDays : []; // Use renamed variable
      const newCompletedDays = [...currentCompleted, targetDayNumber].sort((a, b) => a - b);
      const newCurrentDay = Math.max(userPathToTogetherProgress.currentDay, nextDay); // Use renamed variable

      const updates: Partial<UserPathToTogetherProgress> = { // Use renamed type
        completedDays: newCompletedDays,
        lastAccessedDate: new Date().toISOString(),
        ...(newCurrentDay !== userPathToTogetherProgress.currentDay && { currentDay: newCurrentDay }), // Use renamed variable
      };

      console.log("Updating progress with:", updates);

      const { error } = await supabase.functions.invoke('me-journey-progress-update', {
        body: {
          journeyId: journeyId,
          updates: updates
        }
      });
      if (error) throw new Error(`Failed to update progress: ${error.message}`);
      return { nextDay: newCurrentDay <= totalDays ? newCurrentDay : null };
    },
    onSuccess: (data) => {
      if (!data?.alreadyCompleted) {
          toast.success(`Day ${targetDayNumber} marked as complete!`);
          queryClient.invalidateQueries({ queryKey: ['userPathToTogetherProgress', journeyId] }); // Updated query key
          if (data?.nextDay) {
             navigate(`/journey/${journeyId}/day/${data.nextDay}`);
          }
      }
    },
    onError: (error: Error) => {
      toast.error(`Error completing day: ${error.message}`);
    },
    onSettled: () => {
      setIsCompletingDay(false);
    }
  });

   const saveReflectionMutation = useMutation({
     mutationFn: async ({ reflectionText, share }: { reflectionText: string; share: boolean }) => {
       if (!journeyId || !currentDayData) throw new Error("Missing data to save reflection.");
       const payload = {
         journeyId: journeyId,
         dayNumber: currentDayData.dayNumber,
         responseText: reflectionText,
         sharedWithPartner: share,
       };
       console.log("Saving reflection:", payload);
       const { error } = await supabase.functions.invoke('me-journey-day-reflection', {
         body: payload
       });
       if (error) throw new Error(`Failed to save reflection: ${error.message}`);
     },
     onSuccess: () => {
       toast.success("Reflection saved successfully!");
       queryClient.invalidateQueries({ queryKey: ['userPathToTogetherProgress', journeyId] }); // Updated query key
     },
     onError: (error: Error) => {
       toast.error(`Error saving reflection: ${error.message}`);
     },
     onSettled: () => {
       setIsSavingReflection(false);
     }
   });

  // --- Event Handlers ---
  const handleCompleteDay = () => {
    if (isCompletingDay) return;
    setIsCompletingDay(true);
    completeDayMutation.mutate();
  };

  const handleSaveReflection = (reflectionText: string, share: boolean) => {
     if (isSavingReflection) return;
     setIsSavingReflection(true);
     saveReflectionMutation.mutate({ reflectionText, share });
   };

  // --- Render Logic ---

  if ((isLoadingJourney || isLoadingProgress) && !(errorJourney || errorProgress)) {
    return ( // Loading UI
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 flex flex-col">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
           <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
             <Link to="/journeys" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
             </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
              Loading Path To Together...
            </h1>
             <div className="w-8 h-8"></div>
          </div>
        </header>
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const combinedError = errorJourney || errorProgress;
  if (errorJourney || !pathToTogetherData || (errorProgress && !userPathToTogetherProgress)) { // Use renamed variables
     return ( // Error UI
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 flex flex-col">
         <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
           <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
             <Link to="/journeys" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
               <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
             </Link>
             <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
               Error Loading Path To Together
             </h1>
             <div className="w-8 h-8"></div>
           </div>
         </header>
         <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
           <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
           <p className="text-red-600 dark:text-red-400">
             {combinedError?.message || "Could not load Path To Together data or progress."}
           </p>
           <Button variant="outline" onClick={() => navigate("/journeys")} className="mt-6">
             Back to Path To Together List
           </Button>
         </div>
         <BottomNav />
       </div>
     );
   }

   // --- Main Content Render ---

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/journeys" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center truncate px-2">
            {pathToTogetherData.title} - Day {targetDayNumber} // Use renamed variable
          </h1>
          <div className="w-8 h-8"></div>
        </div>
      </header>

      {/* Progress Tracker */}
      {userPathToTogetherProgress && pathToTogetherData && ( // Use renamed variables
          <ProgressTracker
            currentDay={userPathToTogetherProgress.currentDay ?? 1} // Use renamed variable
            completedDays={userPathToTogetherProgress.completedDays ?? []} // Use renamed variable
            totalDays={pathToTogetherData.estimatedDurationDays ?? 0} // Use renamed variable
          />
      )}

      <main className="container max-w-4xl mx-auto px-4 pt-6 pb-8 animate-slide-up">
        {/* Handle Day Locked State for Path To Together */}
        {userPathToTogetherProgress && !isDayAccessible ? ( // Use renamed variable
          <div className="text-center p-8 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-md">
            <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Day Locked</h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              You need to complete Day {targetDayNumber - 1} before accessing this day.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/journey/${journeyId}/day/${targetDayNumber - 1}`)}
              className="mt-4 border-yellow-500 text-yellow-700 hover:bg-yellow-200 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-800"
            >
              Go to Previous Day
            </Button>
          </div>
        ) : !currentDayData ? ( // Handle Missing Day Content
           <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg shadow-md">
             <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto mb-3" />
             <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Content Error</h2>
             <p className="text-red-700 dark:text-red-300">
               Could not load content for Day {targetDayNumber}. Please try again later or contact support.
             </p>
              </div>
        ) : ( // Render Accessible Day Content
          <>
            <DailyView
                day={currentDayData}
                dayNumber={targetDayNumber}
                onComplete={handleCompleteDay} // Pass the handler
                isCompleted={isCurrentDayCompleted}
                isLocked={!isDayAccessible && !!userPathToTogetherProgress} // Locked if progress exists but day not accessible // Use renamed variable
            />

            {/* Only show reflection input if progress exists */}
            {userPathToTogetherProgress && journeyId && ( // Ensure journeyId is available // Use renamed variable
              <ReflectionInput
                dayNumber={targetDayNumber}
                pathToTogetherId={journeyId} // Pass renamed prop
                // Pass prompt via a prop named 'prompt' or similar if ReflectionInput expects it
                // prompt={currentDayData.reflectionPrompt} // Assuming prop name is 'prompt'
                initialReflection={currentReflection?.responseText ?? ""}
                sharedWithPartner={currentReflection?.sharedWithPartner ?? false}
                hasPartner={hasPartner} // Pass partner status state
                onSave={handleSaveReflection}
                // isSaving prop is handled internally by ReflectionInput now
              />
            )}

            {/* Completion button moved inside DailyView */}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10">
              <Button 
                variant="outline"
                onClick={() => navigate(`/journey/${journeyId}/day/${targetDayNumber - 1}`)}
                disabled={targetDayNumber <= 1}
                aria-label="Previous Day"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
          <Button 
                variant="outline"
                onClick={() => navigate(`/journey/${journeyId}/day/${targetDayNumber + 1}`)}
                disabled={targetDayNumber >= totalDays || (!!userPathToTogetherProgress && !isCurrentDayCompleted)} // Use renamed variable
                aria-label="Next Day"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
} 