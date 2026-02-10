import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-provider'; // Assuming auth-provider exports useAuth
import { supabase } from '@/integrations/supabase/client'; // Corrected import path
import { toast } from '@/hooks/use-toast'; // Assuming a toast hook exists

export interface DailyQuestionState {
  questionId: string | null;
  isPaused: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  questionText: string | null;
  level: 'Light' | 'Medium' | 'Deep' | null;
  position: number | null; // Position of the *current* question being displayed
  progressString: string | null; // User-friendly progress text (e.g., "Question 5 of 10 (Light)")
  miniChallenge: string | null;
  statusMessage: string | null; // For paused/completed messages
  isNewDayQuestion: boolean; // Was this question fetched fresh today?
  showLevelCelebration: boolean; // Flag to trigger level completion UI
  showCategoryCelebration: boolean; // Flag to trigger category completion UI
  shouldSelectCategory: boolean; // Flag to indicate user needs to select a category
  selectedCategoryId: string | null; // Add selectedCategoryId to track which category is active
  pastAnswers: {
    questionId: string;
    questionText: string;
    answerText: string;
    answeredAt: string;
  }[];
}

interface DailyQuestionActions {
  submitAnswer: (answerText: string) => Promise<void>;
  pauseDailyQuestions: () => Promise<void>;
  resumeDailyQuestions: () => Promise<void>;
  refetchQuestion: (categoryId?: string) => void;
  dismissCelebration: () => void; // Action to clear celebration flags
  fetchPastAnswers: () => Promise<void>; // Add new action to get past answers
}

const initialState: DailyQuestionState = {
  questionId: null,
  isPaused: false,
  isCompleted: false,
  isLoading: true,
  error: null,
  questionText: null,
  level: null,
  position: null,
  progressString: null,
  miniChallenge: null,
  statusMessage: null,
  isNewDayQuestion: false,
  showLevelCelebration: false,
  showCategoryCelebration: false,
  shouldSelectCategory: false,
  selectedCategoryId: null, // Initialize as null
  pastAnswers: [],
};

export function useDailyQuestion(): DailyQuestionState & DailyQuestionActions {
  const { user } = useAuth(); // Use 'user' instead of 'session'
  const [state, setState] = useState<DailyQuestionState>(initialState);

  const fetchQuestion = useCallback(async (categoryId?: string) => {
    if (!user) return; // Check if user is logged in

    // If a categoryId is provided, set it as the selected category
    if (categoryId) {
      setState((prev) => ({
        ...prev,
        selectedCategoryId: categoryId
      }));
    }

    // Reset celebrations on new fetch
    setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        showLevelCelebration: false,
        showCategoryCelebration: false
    }));

    try {
      // Construct the URL with the category parameter if provided
      // Either use the provided categoryId or use the one from state if available
      const effectiveCategoryId = categoryId || state.selectedCategoryId;
      console.log('Fetching for category:', effectiveCategoryId);
      const params = effectiveCategoryId ? `?category_id=${effectiveCategoryId}` : '';
      
      // Use supabase.functions.invoke which handles auth implicitly
      const { data, error } = await supabase.functions.invoke('daily-question' + params, {
        method: 'GET', // GET is default but explicit is fine
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch daily question');
      }

      // Handle specific statuses returned by the function
      if (data.status === 'paused') {
        setState({
          ...initialState,
          isLoading: false,
          isPaused: true,
          // Use the warmer message from the backend
          statusMessage: data.message || "Taking a break? We'll be right here when you're ready.",
        });
      } else if (data.status === 'completed') {
         setState({
          ...initialState,
          isLoading: false,
          isCompleted: true,
          statusMessage: data.message || 'Category completed!',
        });
      } else if (data.status === 'select_category') {
        setState({
          ...initialState,
          isLoading: false,
          shouldSelectCategory: true,
          statusMessage: data.message || 'Please select a category to begin daily questions',
        });
      } else if (data.questionId) {
        // Normal question response - use new fields
        setState((prev) => ({ // Keep existing state but update fetched data
            ...prev, // Keep potential celebration flags if they were just set
            isLoading: false,
            error: null,
            questionId: data.questionId,
            questionText: data.questionText,
            level: data.level,
            position: data.position,
            progressString: data.progressString,
            miniChallenge: data.miniChallenge,
            isPaused: false,
            isCompleted: false,
            shouldSelectCategory: false,
            statusMessage: null,
            isNewDayQuestion: data.isNewDayQuestion ?? false,
            selectedCategoryId: effectiveCategoryId, // Save the categoryId
        }));
      } else {
         // Unexpected response format
         throw new Error(data.error || 'Unexpected response format from daily-question function.');
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching daily question:', message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  }, [user, state.selectedCategoryId]); // Depend on user and selectedCategoryId

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]); // Run on mount and when session changes

  const submitAnswer = useCallback(async (answerText: string) => {
    if (!user || !state.questionId) return; // Check user

    setState((prev) => ({ ...prev, isLoading: true })); // Indicate loading state

    try {
      const { data, error } = await supabase.functions.invoke('daily-question-answer', {
        method: 'POST',
        body: JSON.stringify({
          question_id: state.questionId,
          answer_text: answerText,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        // If the function invocation itself resulted in an error (e.g., network, 404)
        // Throw the error to be handled by the catch block.
        throw error;
      }

      if (data.success) {
        // Check for celebrations *before* refetching
        const levelCompleted = data.level_completed ?? false;
        const categoryCompleted = data.category_completed ?? false;

        if (categoryCompleted) {
            toast({ title: 'Category Complete!', description: 'Amazing job! 🎉' });
            setState(prev => ({ ...prev, showCategoryCelebration: true, isLoading: false }));
            // Don't refetch immediately, let celebration show. Refetch might happen on next mount/action.
            // Or refetch after a delay? For now, let the completion state handle it.
             await fetchQuestion(); // Refetch to show completed status
        } else if (levelCompleted) {
            toast({ title: 'Level Complete!', description: 'On to the next level! 💪' });
            setState(prev => ({ ...prev, showLevelCelebration: true, isLoading: false }));
            // Refetch after a short delay to allow celebration view
            setTimeout(() => fetchQuestion(), 1500); // Delay for 1.5s
        } else {
            // Just a normal answer, refetch immediately
            toast({ title: 'Answer Submitted!', description: 'Great insight!' });
            await fetchQuestion();
        }
      } else {
         throw new Error(data.error || 'Failed to process answer.');
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error submitting answer:', message);
      
      // Show a toast with the actual error message
      toast({
        title: 'Error Submitting Answer',
        description: message,
        variant: 'destructive'
      });
      // Set loading to false, but don't attempt to refetch or simulate success
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [user, state.questionId, state.questionText, fetchQuestion]);

  const pauseDailyQuestions = useCallback(async () => {
    if (!user) return; // Check user
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.functions.invoke('daily-question-pause', {
        method: 'POST', // POST is appropriate for state change
      });
      if (error) throw new Error(error.message || 'Failed to pause daily questions');
      if (data.success) {
        // Use backend message for consistency
        toast({ title: 'Daily Questions Paused', description: data.message || "Taking a break? We'll be right here when you're ready." });
        await fetchQuestion(); // Refetch to update state to paused
      } else {
         throw new Error(data.error || 'Failed to pause daily questions.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error pausing daily questions:', message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast({ title: 'Error Pausing', description: message, variant: 'destructive' });
    }
  }, [user, fetchQuestion]); // Depend on user

  const resumeDailyQuestions = useCallback(async () => {
    if (!user) return; // Check user
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.functions.invoke('daily-question-resume', {
        method: 'POST',
      });
      if (error) throw new Error(error.message || 'Failed to resume daily questions');
       if (data.success) {
        toast({ title: 'Daily Questions Resumed!', description: 'Let\'s continue!' });
        await fetchQuestion(); // Refetch to get the current question
      } else {
         throw new Error(data.error || 'Failed to resume daily questions.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error resuming daily questions:', message);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      toast({ title: 'Error Resuming', description: message, variant: 'destructive' });
    }
  }, [user, fetchQuestion]); // Depend on user

  // Action to dismiss celebrations
  const dismissCelebration = useCallback(() => {
      setState(prev => ({
          ...prev,
          showLevelCelebration: false,
          showCategoryCelebration: false
      }));
  }, []);

  // Add a function to fetch past answers
  const fetchPastAnswers = useCallback(async () => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Try to get from the backend first
      const { data, error } = await supabase
        .from('user_daily_question_answers')
        .select(`
          id,
          question_id,
          answer_text,
          created_at,
          daily_questions(id, question_text)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Process data from the database
        const formattedAnswers = data.map(item => ({
          questionId: item.question_id,
          questionText: item.daily_questions?.question_text || 'Question text not available',
          answerText: item.answer_text,
          answeredAt: item.created_at
        }));
        
        setState(prev => ({ 
          ...prev, 
          pastAnswers: formattedAnswers,
          isLoading: false 
        }));
      } else {
        // Fallback to local storage if no data in database
        const localAnswers = JSON.parse(localStorage.getItem('devDailyAnswers') || '[]');
        setState(prev => ({ 
          ...prev, 
          pastAnswers: localAnswers,
          isLoading: false 
        }));
      }
    } catch (err) {
      console.error('Error fetching past answers:', err);
      
      // Fallback to local storage on error
      const localAnswers = JSON.parse(localStorage.getItem('devDailyAnswers') || '[]');
      setState(prev => ({ 
        ...prev, 
        pastAnswers: localAnswers,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch past answers'
      }));
      
      toast({
        title: 'Using Local Answers',
        description: 'Could not connect to the server, showing locally stored answers',
        variant: 'default'
      });
    }
  }, [user]);

  return {
    ...state,
    submitAnswer,
    pauseDailyQuestions,
    resumeDailyQuestions,
    refetchQuestion: fetchQuestion,
    dismissCelebration, // Expose dismiss action
    fetchPastAnswers, // Expose fetchPastAnswers action
  };
}