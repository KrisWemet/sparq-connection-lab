
import { useEffect } from 'react'; // Import useEffect
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; // Assuming supabase client is correctly configured
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JourneyCard, PathToTogetherSummary } from "@/components/journeys/JourneyCard"; // Use renamed type
import { toast } from "sonner"; // Using sonner directly as seen in other files

// TODO: Fetch user progress later and merge with Path To Together journey data

export default function Journeys() {
  const navigate = useNavigate();

  // Fetch available Path To Together journeys using the Supabase function
  const { data: pathToTogetherJourneys, isLoading, error: queryError } = useQuery<PathToTogetherSummary[], Error>({ // Use renamed type
    queryKey: ['availablePathToTogetherJourneys'], // More specific query key
    queryFn: async () => {
      // Call the 'journeys' Supabase function (backend function name remains the same for fetching list)
      const { data, error } = await supabase.functions.invoke('journeys');

      if (error) {
        console.error("Error fetching Path To Together journeys function:", error);
        throw new Error(`Failed to fetch Path To Together journeys: ${error.message}`);
      }
      // Assuming the function returns an array of Path To Together journeys matching PathToTogetherSummary
      // Add validation/transformation if needed
      return data as PathToTogetherSummary[]; // Use renamed type
    },
    // Optional: Add staleTime or cacheTime if desired
  });

  // Handle query error state
  useEffect(() => {
    if (queryError) {
      toast.error(`Error loading Path To Together journeys: ${queryError.message}`);
    }
  }, [queryError]);

  // Removed handleStartJourney - navigation/start logic is handled within JourneyCard -> JourneyStart

  // Loading State UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
         <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
           <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
             <button
               onClick={() => navigate(-1)}
               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
               <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
             </button>
             <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
               Path To Together
             </h1>
             {/* Placeholder for potential filter/search */}
             <div className="w-6 h-6"></div>
           </div>
         </header>
        <main className="container max-w-4xl mx-auto px-4 pt-8">
          {/* Simple loading indicator */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 animate-pulse"></div>
             ))}
           </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Error State UI
  if (queryError) {
     return (
       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 flex flex-col">
         <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
           <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
             <button
               onClick={() => navigate(-1)}
               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
               <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
             </button>
             <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
               Path To Together
             </h1>
             <div className="w-6 h-6"></div>
           </div>
         </header>
         <main className="container max-w-4xl mx-auto px-4 pt-8 flex-grow flex items-center justify-center">
           <div className="text-center text-red-500">
             <p>Failed to load Path To Together journeys.</p>
             <p className="text-sm">{queryError.message}</p>
             {/* Optionally add a retry button */}
           </div>
         </main>
         <BottomNav />
       </div>
     );
   }

  // Main Content - List of Path To Together Journeys
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)} // Assuming navigation back makes sense
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
            Available Path To Together Journeys
          </h1>
           {/* Placeholder for potential filter/search */}
           <div className="w-6 h-6"></div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-8">
        {/* TODO: Add section for 'My Active Path To Together Journeys' based on user progress */}

        {/* Grid for Available Path To Together Journeys */}
        {pathToTogetherJourneys && pathToTogetherJourneys.length > 0 ? ( // Use renamed variable
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathToTogetherJourneys.map((journey) => ( // Use renamed variable
              <JourneyCard key={journey.id} pathToTogetherSummary={journey} /> // Pass renamed prop
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p>No Path To Together journeys available at the moment.</p>
            {/* Or display a specific message if the query returned empty */}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
