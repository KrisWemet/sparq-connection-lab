import { BaseService } from './BaseService';
import { Goal, GoalCreateParams, GoalMilestone, transformGoal } from './types';
import { authService } from './AuthService';
import { profileService } from './ProfileService'; // Import profileService

/**
 * Service for handling goal operations
 */
export class GoalService extends BaseService {
  /**
   * Get goals for the current user and shared goals from their partner
   */
  async getUserGoals(): Promise<Goal[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];

      const profile = await profileService.getCurrentProfile();
      const partnerId = profile?.partnerId;

      // Cast table name to 'any' as types might be outdated
      let query = this.supabase
        .from('goals')
        .select('*');

      // Build the OR condition
      const orConditions = [`user_id.eq.${user.id}`];
      if (partnerId) {
        orConditions.push(`and(user_id.eq.${partnerId},is_shared.is.true)`);
      }
      query = query.or(orConditions.join(','));

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Map database results to Goal objects
      return data ? data.map(transformGoal) : [];
    } catch (error: any) {
      console.error('Error getting user goals:', error.message);
      return [];
    }
  }

  /**
   * Create a new goal
   */
  async createGoal(goal: GoalCreateParams): Promise<Goal | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Cast table name to 'any' as types might be outdated
      const { data, error } = await this.supabase
        .from('goals' as any)
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          due_date: goal.dueDate,
          is_shared: goal.isShared ?? false, // Add is_shared field
          // progress and is_completed default in DB or handled separately
        })
        .select() // Select the inserted row
        .single(); // Expect a single row back
if (error) throw error;

// Cast data to 'any' to access properties like 'id' safely
await this.logActivity(user.id, 'goal_created', {
  goalId: (data as any).id,
  title: goal.title,
  category: goal.category,
  // Removed duplicate category property
  isShared: goal.isShared ?? false,
      });

      // Map the inserted data to the Goal type
      return data ? transformGoal(data) : null;
    } catch (error: any) {
      return this.handleError(error, 'Failed to create goal');
    }
  }

  /**
   * Update a goal's progress
   */
  async updateGoalProgress(goalId: string, progress: number): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('goals')
        .update({ progress: progress, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        // Add authorization check if needed: .eq('user_id', user.id)
        ;

      if (error) throw error;

      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to update goal progress');
    }
  }

  /**
   * Toggle a milestone's completion status
   */
  async toggleMilestone(milestoneId: string, isCompleted: boolean): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Assuming a 'goal_milestones' table exists
      const { error } = await this.supabase
        .from('goal_milestones' as any)
        .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
        .eq('id', milestoneId)
        // Add authorization check if needed, potentially joining with goals table
        ;

      if (error) throw error;

      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to update milestone');
    }
  }

  // Placeholder for adding milestones if needed
  async addMilestones(goalId: string, milestones: { title: string }[]): Promise<GoalMilestone[] | null> {
     try {
       const user = await authService.getCurrentUser();
       if (!user) throw new Error('Not authenticated');

       if (!milestones || milestones.length === 0) return [];

       const milestoneRecords = milestones.map((m, index) => ({
         goal_id: goalId,
         title: m.title,
         sequence_number: index + 1,
         is_completed: false,
         // user_id might be needed depending on your schema/RLS policies
       }));

       const { data, error } = await this.supabase
         .from('goal_milestones' as any)
         .insert(milestoneRecords)
         .select();

       if (error) throw error;

       // Basic transformation, adjust if needed
       // Cast 'm' to 'any' to bypass TS errors due to potentially outdated Supabase types
       return data ? data.map((m: any) => ({
         id: m.id,
         goalId: m.goal_id,
         title: m.title,
         sequenceNumber: m.sequence_number,
         isCompleted: m.is_completed,
       })) : [];

     } catch (error: any) {
       return this.handleError(error, 'Failed to add milestones');
     }
   }
}

// Export a singleton instance
export const goalService = new GoalService();