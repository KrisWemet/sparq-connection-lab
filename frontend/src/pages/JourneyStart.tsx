import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, Shield, Calendar, Play, Clock, AlertCircle } from "lucide-react"; // Added AlertCircle
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

// Define a type for the detailed Path To Together journey data expected from the API
// This should align with the 'journey-detail' function response and spec
// TODO: Refine this type based on actual API response and spec PathToTogetherJourney/Day types
type PathToTogetherDetailsData = { // Renamed type
  id: string;
  title: string;
  description: string;
  category?: string;
  theme?: string;
  image?: string;
  estimatedDurationDays?: number;
  duration?: string; // Keep if API provides it formatted
  commitment?: string; // Keep if API provides it
  overview?: string;
  benefits?: string[];
  psychology?: string[];
  // Add other fields returned by the journey-detail function (backend function name unchanged)
};

// Removed hardcoded journeys array

export default function JourneyStart() {
  const navigate = useNavigate();
  const { journeyId } = useParams();
  const [pathToTogetherData, setPathToTogetherData] = useState<PathToTogetherDetailsData | null>(null); // Use renamed type and state variable
  const [loading, setLoading] = useState<boolean>(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null); // Add error state
  const [startingPathToTogether, setStartingPathToTogether] = useState<boolean>(false); // Renamed state variable
  
  // Fetch Path To Together journey details when component mounts or journeyId changes
  useEffect(() => {
    const fetchJourneyDetails = async () => {
      if (!journeyId) {
        toast.error("No Path To Together Journey ID provided.");
        navigate("/journeys"); // Navigate back to the list
        return;
      }

      setLoading(true);
      setErrorLoading(null); // Reset error on new fetch

      try {
        // Call the 'journey-detail' Supabase function
        const { data, error } = await supabase.functions.invoke('journey-detail', {
          body: { journeyId: journeyId } // Pass journeyId in the body
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setPathToTogetherData(data as PathToTogetherDetailsData); // Use renamed state setter and type
        } else {
          throw new Error("Path To Together journey not found or invalid response.");
        }

      } catch (err: any) {
        console.error("Error fetching Path To Together details:", err);
        setErrorLoading(err.message || "Failed to load Path To Together details.");
        toast.error(err.message || "Failed to load Path To Together details.");
        // Optional: navigate back if journey not found
        // navigate("/journeys");
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyDetails();
  }, [journeyId, navigate]);
  
  // Function to handle starting the Path To Together journey
  const handleStartPathToTogether = async () => { // Renamed handler
    if (!journeyId) {
      toast.error("Cannot start Path To Together journey without an ID.");
      return;
    }
    setStartingPathToTogether(true); // Use renamed state setter

    try {
      // Call the 'me-journey-start' Supabase function
      const { error } = await supabase.functions.invoke('me-journey-start', {
        body: { journeyId: journeyId } // Pass journeyId
      });

      if (error) {
        // Handle specific errors if the function provides them, e.g., already started
        if (error.message.includes("already started")) {
           toast.info("You've already started this Path To Together journey. Resuming...");
           // Navigate to the details page or current day instead
           navigate(`/journey/${journeyId}/details`); // Or determine current day later
        } else {
          throw new Error(error.message);
        }
      } else {
        toast.success(`Starting your ${pathToTogetherData?.title} Path To Together journey!`); // Use renamed state variable
        // Navigate to the first day upon successful start
        navigate(`/journey/${journeyId}/day/1`);
      }

    } catch (err: any) {
      console.error("Error starting Path To Together journey:", err);
      toast.error(`Failed to start Path To Together journey: ${err.message || "Please try again."}`);
      setStartingPathToTogether(false); // Use renamed state setter
    }
    // No finally block needed for setStartingJourney(false) here,
    // as we only want to disable it permanently on success/navigation.
  };
  
  // Loading State UI
  if (loading) {
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
              Loading Path To Together...
            </h1>
            <div className="w-6 h-6"></div> {/* Placeholder */}
          </div>
        </header>
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Error State UI
  if (errorLoading || !pathToTogetherData) { // Use renamed state variable
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
               Error
             </h1>
             <div className="w-6 h-6"></div> {/* Placeholder */}
           </div>
         </header>
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
           <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
           <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Failed to Load Path To Together Journey</h2>
           <p className="text-gray-600 dark:text-gray-400">{errorLoading || "Could not find the requested Path To Together journey."}</p>
           <Button variant="outline" onClick={() => navigate("/journeys")} className="mt-6">
             Back to Path To Together List
           </Button>
         </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate('/journeys')} // Navigate back to the list
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {pathToTogetherData.title} // Use renamed state variable
          </h1>
          <div className="w-6 h-6"></div> {/* Placeholder */}
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-6 animate-slide-up">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8 h-48 md:h-64">
          <img 
            src={pathToTogetherData.image} // Use renamed state variable
            alt={pathToTogetherData.title} // Use renamed state variable
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{pathToTogetherData.title}</h1> // Use renamed state variable
            <p className="text-white/90 max-w-2xl">{pathToTogetherData.description}</p> // Use renamed state variable
          </div>
              </div>
        
        {/* Path To Together Journey Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About This Path To Together Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {pathToTogetherData.overview} // Use renamed state variable
                </p>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    What You'll Gain
                  </h3>
                  <ul className="space-y-2">
                    {pathToTogetherData.benefits && pathToTogetherData.benefits.length > 0 ? ( // Use renamed state variable
                      <ul className="space-y-2">
                        {pathToTogetherData.benefits.map((benefit: string, index: number) => ( // Use renamed state variable
                          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <div className="mt-1 text-primary">✓</div>
                            <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">Benefits information not available.</p>
                    )}
                  </ul> {/* Add missing closing tag */}
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Based On
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pathToTogetherData.psychology && pathToTogetherData.psychology.length > 0 ? ( // Use renamed state variable
                      <div className="flex flex-wrap gap-2">
                        {pathToTogetherData.psychology.map((item: string, index: number) => ( // Use renamed state variable
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                       <p className="text-gray-500 dark:text-gray-400 italic">Information not available.</p>
                    )}
                  </div> {/* Add missing closing tag */}
                </div>
              </CardContent>
            </Card>
              </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Path To Together Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Duration</h3>
                    <p className="text-gray-600 dark:text-gray-400">{pathToTogetherData.estimatedDurationDays ? `${pathToTogetherData.estimatedDurationDays} days` : ''} {pathToTogetherData.duration ? `(${pathToTogetherData.duration})` : ''}</p> // Use renamed state variable
                  </div>
                </div>
                
                  <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Daily Commitment</h3>
                    <p className="text-gray-600 dark:text-gray-400">{pathToTogetherData.commitment || 'Not specified'}</p> // Use renamed state variable
                      </div>
                    </div>
                
                <div className="pt-4">
                    <Button 
                    className="w-full py-6" 
                    size="lg"
                    onClick={handleStartPathToTogether} // Use renamed handler
                    disabled={startingPathToTogether} // Use renamed state variable
                  >
                    {startingPathToTogether ? ( // Use renamed state variable
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Starting...
                      </>
                      ) : (
                        <>
                        <Play className="w-5 h-5 mr-2" />
                        Begin Day 1
                        </>
                      )}
                    </Button>
                  </div>
                  
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  You can do this Path To Together journey at your own pace.
                  Each day will unlock after you complete the previous one.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
} 