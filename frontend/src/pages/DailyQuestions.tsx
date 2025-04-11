import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDailyQuestion } from '@/hooks/useDailyQuestion';
import DailyQuestionView from '@/components/DailyQuestions/DailyQuestionView';
import CategorySelection, { CategoryStatus } from '@/components/DailyQuestions/CategorySelection';
import PastAnswers from '@/components/DailyQuestions/PastAnswers';
import { BottomNav } from '@/components/bottom-nav';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { Loader2, Settings, ChevronLeft, RefreshCw, AlertCircle, BookOpen } from 'lucide-react'; // Added BookOpen
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import ServiceWorkerManager from '@/components/ServiceWorkerManager';
import { useToast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';
// Removed: import { useSupabaseClient } from "@supabase/auth-helpers-react"; - Use standard client
import { LoadingState } from "@/components/common/LoadingState"; // Use named import
import { ErrorState } from "@/components/common/ErrorState"; // Use named import
// Removed import for non-existent DashboardShell

// Define a type for the category data fetched from Supabase
interface Category {
  id: string;
  name: string;
  description?: string;
  isEnabled?: boolean; // Added isEnabled flag
}

// Fetch Categories function
const fetchCategories = async () => { // Remove supabaseClient param, use imported supabase
  try {
    const { data, error } = await supabase // Use imported supabase
      .from('daily_question_categories')
      .select('*')
      // Removed: .order('display_order', { ascending: true }); - Column does not exist

    if (error) throw error;
    return { categories: data, error: null };
  } catch (error: any) {
    console.error('Error fetching categories:', error.message);
    return { categories: [], error: error.message };
  }
};

// Get Status for Categories function
const getCategoryStatuses = async (user: User) => {
  try {
    // Call the Edge Function instead of querying the table directly
    const { data, error } = await supabase.functions.invoke('me-daily-question-progress', {
      // Pass any necessary arguments to the function if required.
      // Assuming it implicitly uses the authenticated user's ID.
    });

    if (error) throw error;
    // Ensure data is treated as an array, even if the function returns a single object or null/undefined
    const progressData = Array.isArray(data) ? data : (data ? [data] : []);

    // Convert array to object with category_id as key
    const statusMap: Record<string, CategoryStatus> = {};
    
    progressData.forEach((item: any) => {
      statusMap[item.category_id] = {
        inProgress: item.status === 'in_progress',
        completed: item.status === 'completed',
        paused: item.status === 'paused'
      };
    });

    return { statuses: statusMap, error: null };
  } catch (error: any) {
    console.error('Error fetching category statuses:', error.message);
    return { statuses: {}, error: error.message };
  }
};

// Define available categories based on content files
const AVAILABLE_CATEGORY_NAMES = new Set([
  "Adventure & Fun",
  "Appreciation & Gratitude",
  "Conflict Repair",
  "Emotional Intimacy",
  "Hopes & Dreams"
]);

export default function DailyQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useAuth(); // Corrected: use 'loading'
  // Removed: const supabaseClient = useSupabaseClient();
  // Corrected: Destructure all needed state and actions directly from the hook
  const {
    isLoading: isLoadingQuestion,
    error: questionError,
    questionId,
    questionText,
    level,
    miniChallenge,
    isPaused,
    isCompleted,
    shouldSelectCategory,
    submitAnswer,
    pauseDailyQuestions,
    refetchQuestion,
    pastAnswers,
    fetchPastAnswers,
    // Add any other state properties needed from DailyQuestionState if used below
  } = useDailyQuestion();
  const { toast } = useToast();

  // Removed redundant destructuring block

  // State for fetching categories directly
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategoriesData, setIsLoadingCategoriesData] = useState(false);
  const [categoriesFetchError, setCategoriesFetchError] = useState<string | null>(null);

  // State for fetching category *statuses* (progress) - keep existing logic
  const [categoryStatuses, setCategoryStatuses] = useState<Record<string, CategoryStatus>>({});
  const [isLoadingCategoryStatuses, setIsLoadingCategoryStatuses] = useState(false); // Rename existing loading state

  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [showReview, setShowReview] = useState(false); // State for review view

  // New: Track active category to force question view immediately
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Parse the query parameter to determine if we should auto-load today's question
  const searchParams = new URLSearchParams(location.search);
  const autoLoadToday = searchParams.get('autoLoadToday') === 'true';

  // Determine if the user is actively in a question flow (viewing, paused, or completed)
  const hasActiveProgress = questionId || isPaused || isCompleted;
  
  // Removed useEffect managing setShowCategorySelection; logic moved to renderContent

  // Fetch categories and progress when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      if (!user) return;
      
      setIsLoadingCategoriesData(true);
      setCategoriesFetchError(null);
      
      try {
        // Fetch categories from DB
        const { categories: dbCategories, error } = await fetchCategories(); // Use standard client
        if (error) throw new Error(error);

        // Process categories to add isEnabled flag
        const processedCategories = dbCategories.map((category: Category) => ({
          ...category,
          isEnabled: AVAILABLE_CATEGORY_NAMES.has(category.name)
        }));
        
        // Sort categories: enabled first, then alphabetically by name
        processedCategories.sort((a, b) => {
          const aStatus = categoryStatuses[a.id];
          const bStatus = categoryStatuses[b.id];

          // Enabled categories first
          if (a.isEnabled !== b.isEnabled) {
            return a.isEnabled ? -1 : 1;
          }

          // Among enabled, prioritize not completed
          if (a.isEnabled && b.isEnabled) {
            const aCompleted = aStatus?.completed ?? false;
            const bCompleted = bStatus?.completed ?? false;
            if (aCompleted !== bCompleted) {
              return aCompleted ? 1 : -1; // not completed first
            }
          }

          // Otherwise, sort alphabetically
          return a.name.localeCompare(b.name);
        });

        setCategories(processedCategories);

        // Get progress for categories
        const { statuses, error: statusError } = await getCategoryStatuses(user); // Use standard client
        if (statusError) throw new Error(statusError);
        setCategoryStatuses(statuses);
      } catch (err: any) {
        console.error('Error loading daily questions data:', err.message);
        setCategoriesFetchError(err.message);
      } finally {
        setIsLoadingCategoriesData(false);
      }
    };
    
    loadCategories();
  }, [user]); // Removed supabaseClient dependency

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, userLoading, navigate]);

  // Function to start a category
  const startCategory = async (categoryId: string) => {
    if (!user) return;
    
    setIsLoadingCategoryStatuses(true);
    
    try {
      // Attempt to start category with supabase function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-category`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` // Use imported supabase
          },
          body: JSON.stringify({ categoryId })
        }
      );
      
      if (!response.ok) {
        let errorMessage = 'Failed to start category';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, just use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Update local state to reflect the started category
      setCategoryStatuses(prev => ({
        ...prev,
        [categoryId]: { inProgress: true, completed: false, paused: false } // Provide full status object
      }));
      
      // Set selected category in the daily question context
      refetchQuestion(categoryId); // Corrected: Call refetchQuestion with categoryId
      
      // Show success toast
      toast({
        title: "Category Started",
        description: "You can now begin answering questions in this category.",
      });
      
    } catch (error: any) {
      console.error('Error starting category:', error);

      // Check if it's a CORS error
      const isCorsError = error.message.includes('CORS') || 
                          error.message.includes('Failed to fetch') ||
                          error.message.includes('NetworkError');
      
      if (isCorsError) {
        console.log('CORS error detected, using fallback mode');
        
        // In development, simulate success
        // This allows testing without the Edge Function deployed
        setCategoryStatuses(prev => ({
          ...prev,
          [categoryId]: { inProgress: true, completed: false, paused: false } // Provide full status object
        }));
        
        refetchQuestion(categoryId); // Corrected: Call refetchQuestion with categoryId
        
        toast({
          title: "Using Development Mode",
          description: "Category started in mock mode due to CORS/backend error.",
          variant: "default"
        });
      } else {
        // Show error toast for non-CORS errors
        toast({
          title: "Could not start Category",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingCategoryStatuses(false);
    }
  };

  // Handle selecting a category
  const handleSelectCategory = (categoryId: string) => {
    // Immediately set active category to force question view
    setActiveCategoryId(categoryId);

    const status = categoryStatuses[categoryId];
    
    // If already in progress, just select it
    if (status?.inProgress) {
      refetchQuestion(categoryId); // Corrected: Call refetchQuestion with categoryId
      return;
    }
    
    // Otherwise, start the category
    startCategory(categoryId);
  };

  // Loading state while user auth is being checked
  if (userLoading) {
    return <LoadingState />; // Corrected component usage
  }

  // If no user is authenticated, the effect will handle redirect
  if (!user) {
    return <LoadingState />; // Corrected component usage
  }

  // Render content based on state
  // Handle showing the review section
  const handleShowReview = () => {
    fetchPastAnswers(); // Fetch answers when review is opened
    setShowReview(true);
  };

  // Render content based on state
  const renderContent = () => {
    // Show Review Section first if active
    if (showReview) {
      return (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowReview(false)} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Questions
          </Button>
          <PastAnswers
            answers={pastAnswers}
            isLoading={isLoadingQuestion}
            onFetchAnswers={fetchPastAnswers}
          />
        </div>
      );
    }

    // NEW: If a category was just selected, immediately show question view (even if loading)
    if (activeCategoryId) {
      const currentQuestion = {
        id: questionId ?? '',
        text: questionText ?? 'Loading question...',
        level: level ?? 'Light',
      };
      return (
        <DailyQuestionView
          question={currentQuestion}
          onSubmit={submitAnswer}
          onPause={pauseDailyQuestions}
        />
      );
    }

    // If navigated directly to categories (not via "Today's Question" button)
    if (!autoLoadToday) {
       return (
         <CategorySelection
           categories={categories}
           onSelectCategory={handleSelectCategory}
           isLoading={isLoadingCategoryStatuses}
           isLoadingCategories={isLoadingCategoriesData}
           categoryStatuses={categoryStatuses}
           fetchError={categoriesFetchError}
         />
       );
    }

    // If navigated via "Today's Question" button (autoLoadToday is true)
    // Try to show the question first
    if (questionId) {
      const currentQuestion = {
        id: questionId,
        text: questionText ?? '',
        level: level ?? 'Light',
      };
      return (
        <DailyQuestionView
          question={currentQuestion}
          onSubmit={submitAnswer}
          onPause={pauseDailyQuestions}
        />
      );
    }
    // If no question ID, but the hook says we need to select a category
    else if (shouldSelectCategory) {
       return (
         <CategorySelection
           categories={categories}
           onSelectCategory={handleSelectCategory}
           isLoading={isLoadingCategoryStatuses}
           isLoadingCategories={isLoadingCategoriesData}
           categoryStatuses={categoryStatuses}
           fetchError={categoriesFetchError}
         />
       );
    }
    // Otherwise (autoLoadToday is true, but no questionId and not told to select category yet) show loading

    else {
      return <LoadingState />;
    }
  };

  // Render the main page structure
  return (
    <div className="p-4 md:p-6"> {/* Replace DashboardShell with a simple div */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daily Questions</h1>
        {!showReview && ( // Only show review button when not already reviewing
          <Button variant="outline" size="sm" onClick={handleShowReview}>
            <BookOpen className="mr-2 h-4 w-4" /> Review Past Answers
          </Button>
        )}
      </div>
      {renderContent()}
    </div>
  );
}