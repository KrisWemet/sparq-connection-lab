import { BaseService } from './BaseService';
import { Journey, JourneyQuestion, UserJourney } from './types';
import { authService } from './AuthService';

/**
 * Service for handling journey operations
 */
export class JourneyService extends BaseService {
  /**
   * Get all available journeys
   */
  async getAllJourneys(): Promise<Journey[]> {
    try {
      const { data, error } = await this.supabase
        .from('journeys')
        .select('*')
        .order('title');
        
      if (error) throw error;
      
      return data.map((journey: any) => ({
        id: journey.id,
        title: journey.title,
        description: journey.description,
        imageUrl: journey.modality, // Using modality field as a placeholder for image
        category: journey.type,
        difficulty: journey.difficulty === 1 ? 'beginner' : 
                   journey.difficulty === 2 ? 'intermediate' : 'advanced'
      }));
    } catch (error: any) {
      console.error('Error getting journeys:', error.message);
      return [];
    }
  }
  
  /**
   * Get a specific journey by ID
   */
  async getJourneyById(journeyId: string): Promise<Journey | null> {
    try {
      const { data, error } = await this.supabase
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.modality, // Using modality field as a placeholder for image
        category: data.type,
        difficulty: data.difficulty === 1 ? 'beginner' : 
                   data.difficulty === 2 ? 'intermediate' : 'advanced'
      };
    } catch (error: any) {
      console.error('Error getting journey by ID:', error.message);
      return null;
    }
  }
  
  /**
   * Start a journey for the current user
   */
  async startJourney(journeyId: string): Promise<string | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Check if user already has this journey
      const { data: existingJourney } = await this.supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', user.id)
        .eq('journey_id', journeyId)
        .maybeSingle();
        
      if (existingJourney) {
        // Journey already exists
        return existingJourney.id;
      }
      
      // Start a new journey
      const { data, error } = await this.supabase
        .from('user_journeys')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          start_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      await this.logActivity(user.id, 'journey_started', { 
        journeyId, 
        journeyTitle: (await this.getJourneyById(journeyId))?.title 
      });
      
      return data.id;
    } catch (error: any) {
      return this.handleError(error, 'Failed to start journey');
    }
  }
  
  /**
   * Get questions for a specific journey
   */
  async getJourneyQuestions(journeyId: string): Promise<JourneyQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('journey_questions')
        .select('*')
        .eq('journey_id', journeyId)
        .order('category');
        
      if (error) throw error;
      
      return data.map((q: any) => ({
        id: q.id,
        journeyId: q.journey_id,
        question: q.text,
        description: q.explanation,
        sequenceNumber: parseInt(q.category) || 0
      }));
    } catch (error: any) {
      console.error('Error getting journey questions:', error.message);
      return [];
    }
  }
  
  /**
   * Submit a response to a journey question
   */
  async submitJourneyResponse(journeyId: string, questionId: string, answer: string, reflection?: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Save the response
      const { error } = await this.supabase
        .from('journey_responses')
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          question_id: questionId,
          answer
        });
        
      if (error) throw error;
      
      await this.logActivity(user.id, 'journey_response_submitted', { 
        journeyId, 
        questionId 
      });
      
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to submit response');
    }
  }
  
  /**
   * Get the current user's active journeys
   */
  async getUserActiveJourneys(): Promise<UserJourney[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      
      const { data, error } = await this.supabase
        .from('user_journeys')
        .select(`
          *,
          journey:journeys(*)
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return data.map((uj: any) => ({
        id: uj.id,
        userId: uj.user_id,
        journeyId: uj.journey_id,
        progress: 0, // Calculate based on responses
        isActive: !uj.completed_at,
        startDate: new Date(uj.start_date),
        completedAt: uj.completed_at ? new Date(uj.completed_at) : undefined,
        journey: uj.journey ? {
          id: uj.journey.id,
          title: uj.journey.title,
          description: uj.journey.description,
          imageUrl: uj.journey.modality, // Using modality field as a placeholder for image
          category: uj.journey.type,
          difficulty: uj.journey.difficulty === 1 ? 'beginner' : 
                     uj.journey.difficulty === 2 ? 'intermediate' : 'advanced'
        } : undefined
      }));
    } catch (error: any) {
      console.error('Error getting user active journeys:', error.message);
      return [];
    }
  }
}

// Export a singleton instance
export const journeyService = new JourneyService();