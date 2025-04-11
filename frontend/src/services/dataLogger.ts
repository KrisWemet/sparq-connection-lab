import { supabase } from "@/integrations/supabase/client";

// Types for data logging
export interface UserActivity {
  userId: string;
  activityType: ActivityType;
  details: any;
  timestamp: string;
  sessionId: string;
}

export interface QuestionResponse {
  userId: string;
  partnerId: string | null;
  questionId: string;
  categoryId: string;
  response: string;
  emotionTag?: string[];
  intimacyLevel: number;
  timestamp: string;
  sessionId: string;
}

export interface RelationshipData {
  userId: string;
  partnerId: string | null;
  relationshipType: string;
  relationshipDuration: number; // in months
  lastUpdated: string;
}

export interface UserPreference {
  userId: string;
  gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
  colorTheme: string;
  notificationPreferences: any;
  privacySettings: any;
  lastUpdated: string;
}

export interface AIInteraction {
  userId: string;
  partnerId: string | null;
  interactionType: 'question' | 'advice' | 'therapy' | 'exercise';
  content: string;
  aiResponse: string;
  timestamp: string;
  duration: number; // in seconds
  sessionId: string;
  subscriptionTier: 'free' | 'premium' | 'ultimate';
}

export type ActivityType = 
  | 'app_open'
  | 'page_view'
  | 'question_answered'
  | 'goal_created'
  | 'goal_updated'
  | 'date_scheduled'
  | 'message_sent'
  | 'feature_used'
  | 'subscription_changed'
  | 'relationship_type_selected'
  | 'ai_interaction'
  | 'settings_changed';

// Generate a session ID for tracking user sessions
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Current session ID
let currentSessionId = generateSessionId();

// Reset session ID (call this when user logs in or out)
export const resetSessionId = (): void => {
  currentSessionId = generateSessionId();
};

// Log user activity
export const logUserActivity = async (
  userId: string,
  activityType: ActivityType,
  details: any = {}
): Promise<void> => {
  try {
    const activity: UserActivity = {
      userId,
      activityType,
      details,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity logged:', activity);
      return;
    }

    // In production, send to Supabase
    const { error } = await supabase
      .from('user_activities')
      .insert(activity);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};

// Log question response
export const logQuestionResponse = async (
  userId: string,
  questionId: string,
  categoryId: string,
  response: string,
  intimacyLevel: number,
  partnerId: string | null = null,
  emotionTag?: string[]
): Promise<void> => {
  try {
    const questionResponse: QuestionResponse = {
      userId,
      partnerId,
      questionId,
      categoryId,
      response,
      emotionTag,
      intimacyLevel,
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Question response logged:', questionResponse);
      return;
    }

    // In production, send to Supabase
    const { error } = await supabase
      .from('question_responses')
      .insert(questionResponse);

    if (error) {
      console.error('Error logging question response:', error);
    }
  } catch (error) {
    console.error('Failed to log question response:', error);
  }
};

// Log AI interaction
export const logAIInteraction = async (
  userId: string,
  interactionType: 'question' | 'advice' | 'therapy' | 'exercise',
  content: string,
  aiResponse: string,
  duration: number,
  partnerId: string | null = null,
  subscriptionTier: 'free' | 'premium' | 'ultimate' = 'free'
): Promise<void> => {
  try {
    const interaction: AIInteraction = {
      userId,
      partnerId,
      interactionType,
      content,
      aiResponse,
      timestamp: new Date().toISOString(),
      duration,
      sessionId: currentSessionId,
      subscriptionTier
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('AI interaction logged:', interaction);
      return;
    }

    // In production, send to Supabase
    const { error } = await supabase
      .from('ai_interactions')
      .insert(interaction);

    if (error) {
      console.error('Error logging AI interaction:', error);
    }
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
};

// Update user relationship data
export const updateRelationshipData = async (
  userId: string,
  relationshipType: string,
  relationshipDuration: number,
  partnerId: string | null = null
): Promise<void> => {
  try {
    const relationshipData: RelationshipData = {
      userId,
      partnerId,
      relationshipType,
      relationshipDuration,
      lastUpdated: new Date().toISOString()
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Relationship data updated:', relationshipData);
      return;
    }

    // In production, upsert to Supabase
    const { error } = await supabase
      .from('relationship_data')
      .upsert(relationshipData, { onConflict: 'userId' });

    if (error) {
      console.error('Error updating relationship data:', error);
    }
  } catch (error) {
    console.error('Failed to update relationship data:', error);
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say',
  colorTheme: string,
  notificationPreferences: any = {},
  privacySettings: any = {}
): Promise<void> => {
  try {
    const userPreference: UserPreference = {
      userId,
      gender,
      colorTheme,
      notificationPreferences,
      privacySettings,
      lastUpdated: new Date().toISOString()
    };

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('User preferences updated:', userPreference);
      return;
    }

    // In production, upsert to Supabase
    const { error } = await supabase
      .from('user_preferences')
      .upsert(userPreference, { onConflict: 'userId' });

    if (error) {
      console.error('Error updating user preferences:', error);
    }
  } catch (error) {
    console.error('Failed to update user preferences:', error);
  }
};

// Get user's AI usage statistics
export const getAIUsageStats = async (
  userId: string,
  subscriptionTier: 'free' | 'premium' | 'ultimate'
): Promise<{
  totalUsage: number;
  remainingFreeMinutes: number;
  usageHistory: any[];
}> => {
  try {
    // In a real implementation, this would query Supabase
    // For now, return mock data
    
    // Free tier gets 10 minutes per month
    // Premium gets 30 minutes per month
    // Ultimate gets unlimited
    
    let totalMinutesAllowed = 0;
    if (subscriptionTier === 'free') totalMinutesAllowed = 10;
    if (subscriptionTier === 'premium') totalMinutesAllowed = 30;
    if (subscriptionTier === 'ultimate') totalMinutesAllowed = Infinity;
    
    // Mock usage (in seconds)
    const mockUsage = Math.floor(Math.random() * 600); // 0-10 minutes
    const remainingSeconds = Math.max(0, (totalMinutesAllowed * 60) - mockUsage);
    
    return {
      totalUsage: mockUsage, // in seconds
      remainingFreeMinutes: Math.floor(remainingSeconds / 60),
      usageHistory: [
        { date: '2023-06-01', duration: 120 }, // 2 minutes
        { date: '2023-06-05', duration: 180 }, // 3 minutes
        { date: '2023-06-10', duration: 300 }, // 5 minutes
      ]
    };
  } catch (error) {
    console.error('Failed to get AI usage stats:', error);
    return {
      totalUsage: 0,
      remainingFreeMinutes: 0,
      usageHistory: []
    };
  }
};

// Export a default object with all functions
export default {
  logUserActivity,
  logQuestionResponse,
  logAIInteraction,
  updateRelationshipData,
  updateUserPreferences,
  getAIUsageStats,
  resetSessionId
}; 