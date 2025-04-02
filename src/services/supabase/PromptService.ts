import { supabase } from '../../integrations/supabase/client';
import { BaseService } from './BaseService';
import { CommunicationPrompt } from './types';
import { authService } from './AuthService';

/**
 * Service for handling communication prompt operations
 */
export class PromptService extends BaseService {
  private tableName = 'communication_prompts';

  /**
   * Get communication prompts, limited by the specified number.
   * Requires authentication.
   * @param limit - The maximum number of prompts to retrieve (default: 10)
   */
  async getPrompts(limit: number = 10): Promise<CommunicationPrompt[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Cast table name to 'any' as types might be outdated
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .limit(limit);

      if (error) throw error;

      // Explicitly map snake_case to camelCase and handle potential type issues
      const prompts: CommunicationPrompt[] = (data || []).map((prompt: any) => ({
        id: prompt.id,
        text: prompt.text,
        category: prompt.category,
        createdAt: prompt.created_at, // Map snake_case to camelCase
        updatedAt: prompt.updated_at, // Map snake_case to camelCase (optional)
      }));

      return prompts;
    } catch (error: any) {
      this.handleError(error, 'Failed to get communication prompts');
      return []; // Return empty array on error
    }
  }

  /**
   * Get a random communication prompt.
   * Requires authentication.
   */
  async getRandomPrompt(): Promise<CommunicationPrompt | null> {
    try {
      // Fetch a reasonable subset or all prompts to choose from
      // Using a limit here to avoid fetching potentially thousands of prompts
      // Adjust the limit as needed based on performance and expected data size
      const prompts = await this.getPrompts(100); // Fetch up to 100 prompts

      if (prompts.length === 0) {
        return null; // No prompts found
      }

      // Select a random prompt from the fetched list
      const randomIndex = Math.floor(Math.random() * prompts.length);
      return prompts[randomIndex];

    } catch (error: any) {
      this.handleError(error, 'Failed to get a random communication prompt');
      return null; // Return null on error
    }
  }
}

// Export a singleton instance
export const promptService = new PromptService();