import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { DailyView } from "@/components/DailyView";
import { ReflectionInput } from "@/components/ReflectionInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { toast } from "sonner";

// Sample Path To Together journey data - in a real app would come from API
const pathToTogetherData = { // Renamed mock data
  id: "emotional-safety-secure-attachment",
  title: "Emotional Safety & Secure Attachment",
  days: [
    {
      day: 1,
      title: "Understanding Emotional Safety",
      content: [
        {
          type: "text",
          content: "Emotional safety means feeling secure enough to be vulnerable with your partner. It's the foundation of intimacy and trust in a relationship."
        },
        {
          type: "text",
          content: "Today, we'll explore what emotional safety means for both of you and how it forms the basis of a secure attachment."
        },
        {
          type: "activity",
          title: "Safety Check-In",
          instructions: "Take turns answering: On a scale of 1-10, how emotionally safe do you feel in our relationship right now? What's one thing I do that helps you feel safe?"
        }
      ],
      reflectionPrompt: "What did you learn about your partner's sense of emotional safety today? What's one small action you can take tomorrow to help them feel more secure?"
    },
    {
      day: 2,
      title: "Recognizing Emotional Triggers",
      content: [
        {
          type: "text",
          content: "We all have emotional triggers - situations or words that quickly escalate our emotional response based on past experiences."
        },
        {
          type: "text",
          content: "Identifying these triggers is the first step to managing them and preventing unnecessary conflict."
        },
        {
          type: "activity",
          title: "Trigger Mapping",
          instructions: "Each of you write down 3 things that reliably trigger a strong emotional response in you. Share these with each other without interruption or judgment."
        }
      ],
      reflectionPrompt: "How did it feel to share your triggers with your partner? Did you learn anything surprising about their triggers?"
    }
  ]
};

// Define a simple type for the mock progress data
interface MockProgress {
  journeyId: string;
  currentDay: number;
  completedDays: number[];
  reflections: Record<number, string>; // Type reflections properly
}

// Mock user Path To Together progress data - in a real app would come from API
const mockUserPathToTogetherProgress: MockProgress = { // Renamed mock data and applied type
  journeyId: "emotional-safety-secure-attachment", // Keep journeyId for consistency with API/DB? Or rename here too? Let's keep for now.
  currentDay: 1,
  completedDays: [],
  reflections: {} // Now correctly typed
};

export default function JourneyDay() {
  const navigate = useNavigate();
  const { journeyId, dayId } = useParams();
  const dayNumber = parseInt(dayId || "1");
  
  const [pathToTogether, setPathToTogether] = useState<any>(null); // Renamed state variable
  const [userPathToTogetherProgress, setUserPathToTogetherProgress] = useState<MockProgress | null>(null); // Renamed state variable and applied type
  const [currentDay, setCurrentDay] = useState<any>(null);
  const [reflection, setReflection] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [completing, setCompleting] = useState<boolean>(false);
  
  useEffect(() => {
    // In a real app, we would fetch this data from the API
    // For now, use our mock data
    setPathToTogether(pathToTogetherData); // Use renamed state setter and mock data
    setUserPathToTogetherProgress(mockUserPathToTogetherProgress); // Use renamed state setter and mock data
    
    const foundDay = pathToTogetherData.days.find(d => d.day === dayNumber); // Use renamed mock data
    if (foundDay) {
      setCurrentDay(foundDay);
      // Load saved reflection if available
      if (mockUserPathToTogetherProgress.reflections && mockUserPathToTogetherProgress.reflections[dayNumber]) { // Use renamed mock data
        setReflection(mockUserPathToTogetherProgress.reflections[dayNumber]); // Use renamed mock data
      } else {
        setReflection("");
      }
    } else {
      // If day not found, redirect to Path To Together journey overview
      navigate(`/journey/${journeyId}`); // Route path remains /journey/...
      toast.error("Day not found");
    }
    
    setLoading(false);
  }, [journeyId, dayNumber, navigate]);
  
  const handleMarkComplete = async () => {
    setCompleting(true);
    
    try {
      // In a real app, this would call the API to update progress
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state to reflect completion
      setUserPathToTogetherProgress((prev: MockProgress | null) => {
        if (!prev) return null; // Handle null case
        return {
          ...prev, // Spread existing properties
          completedDays: [...prev.completedDays, dayNumber],
          currentDay: dayNumber + 1,
        };
      });
      
      toast.success(`Day ${dayNumber} completed!`);
      
      // Navigate to next day if available
      if (dayNumber < pathToTogetherData.days.length) { // Use renamed mock data
        navigate(`/journey/${journeyId}/day/${dayNumber + 1}`);
      } else {
        // If this was the last day, navigate to Path To Together journey completion page
        navigate(`/journey/${journeyId}/complete`);
      }
    } catch (error) {
      toast.error("Failed to mark day as complete. Please try again.");
      console.error("Error marking day complete:", error);
    } finally {
      setCompleting(false);
    }
  };
  
  const handleSaveReflection = async (text: string) => {
    setReflection(text);
    
    try {
      // In a real app, this would call the API to save the reflection
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setUserPathToTogetherProgress((prev: MockProgress | null) => {
        if (!prev) return null; // Handle null case
        return {
          ...prev, // Spread existing properties
          reflections: {
            ...prev.reflections,
            [dayNumber]: text,
          },
        };
      });
      
      toast.success("Reflection saved");
    } catch (error) {
      toast.error("Failed to save reflection");
      console.error("Error saving reflection:", error);
    }
  };
  
  const isDayCompleted = userPathToTogetherProgress?.completedDays?.includes(dayNumber); // Use renamed state variable
  const isDayLocked = userPathToTogetherProgress ? userPathToTogetherProgress.currentDay < dayNumber : true; // Add null check, default to locked
  
  const navigateToDay = (day: number) => {
    if (day >= 1 && day <= pathToTogether?.days?.length && userPathToTogetherProgress && day <= userPathToTogetherProgress.currentDay) { // Add null check for progress
      navigate(`/journey/${journeyId}/day/${day}`);
    }
  };
  
  if (loading || !pathToTogether || !currentDay || !userPathToTogetherProgress) { // Use renamed state variables
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
              Loading...
            </h1>
          </div>
        </header>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(`/journey/${journeyId}`)} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {pathToTogether.title} // Use renamed state variable
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-6 animate-slide-up">
        {/* Progress Tracker */}
        <div className="mb-8">
          <ProgressTracker 
            totalDays={pathToTogether.days.length} // Use renamed state variable
            currentDay={userPathToTogetherProgress.currentDay} // Use renamed state variable
            completedDays={userPathToTogetherProgress.completedDays} // Use renamed state variable
            onDayClick={navigateToDay}
          />
        </div>
        
        {/* Day Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigateToDay(dayNumber - 1)}
            disabled={dayNumber <= 1}
            className="flex gap-1 items-center"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Day
          </Button>
          
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            Day {currentDay.day}
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigateToDay(dayNumber + 1)}
            disabled={dayNumber >= pathToTogether.days.length || dayNumber >= userPathToTogetherProgress.currentDay} // Use renamed state variables
            className="flex gap-1 items-center"
          >
            Next Day
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Day Content */}
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm mb-8">
          <DailyView 
            day={currentDay} 
            isLocked={isDayLocked} 
          />
        </div>
        
        {/* Reflection Input */}
        {!isDayLocked && (
          <div className="rounded-lg bg-white dark:bg-gray-800 shadow-sm p-6 mb-8">
            <ReflectionInput
              prompt={currentDay.reflectionPrompt}
              value={reflection}
              onChange={handleSaveReflection}
            />
            
            <div className="mt-8 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleMarkComplete}
                disabled={completing || reflection.trim().length < 10}
                className="w-full sm:w-auto"
              >
                {completing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : isDayCompleted ? (
                  "Already Completed"
                ) : (
                  "Mark Day as Complete"
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
} 