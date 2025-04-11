import { supabase } from '../../integrations/supabase/client';
import { BaseService } from './BaseService';
import { SharedEvent, SharedEventCreateParams, EventStatus } from './types';
import { authService } from './AuthService';
import { profileService } from './ProfileService'; // Needed to find partner ID

/**
 * Service for handling shared event operations
 */
export class SharedEventService extends BaseService {
  private tableName = 'shared_events';

  /**
   * Get shared events for the current user and their partner
   */
  async getSharedEvents(): Promise<SharedEvent[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch the user's profile to get the partner ID
      const profile = await profileService.getProfileById(user.id); // Corrected method name
      const partnerId = profile?.partnerId;

      // Query for events created by the user OR their partner
      // RLS policies handle the actual permission checking on the DB side
      // Cast table name to 'any' as types might be outdated
      const { data, error } = await supabase
        .from('shared_events' as any)
        .select('*')
        .or(`creator_id.eq.${user.id}${partnerId ? `,creator_id.eq.${partnerId}` : ''}`)
        .order('event_datetime', { ascending: true });

      if (error) throw error;

      // Explicitly map snake_case to camelCase
      const events: SharedEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        creatorId: event.creator_id,
        title: event.title,
        description: event.description,
        eventDatetime: event.event_datetime,
        status: event.status,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }));

      return events;
    } catch (error: any) {
      this.handleError(error, 'Failed to get shared events');
      return []; // Return empty array on error
    }
  }

  /**
   * Create a new shared event
   */
  async createSharedEvent(eventData: SharedEventCreateParams): Promise<SharedEvent | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // TS Error expected on .from() until types are regenerated
      // Cast table name to 'any' as types might be outdated
      const { data, error } = await supabase
        .from('shared_events' as any)
        .insert({
          creator_id: user.id, // Ensure snake_case
          title: eventData.title,
          description: eventData.description,
          event_datetime: eventData.eventDatetime, // Ensure ISO string format
          status: 'planned', // Default status
        })
        .select()
        .single(); // Return the created record

      if (error) throw error;

      await this.logActivity(user.id, 'shared_event_created', { title: eventData.title });

      // Explicitly map snake_case to camelCase for the return value
      // Cast data to 'any' to bypass TS errors due to potentially outdated Supabase types
      const createdEvent: SharedEvent = {
        id: (data as any).id,
        creatorId: (data as any).creator_id,
        title: (data as any).title,
        description: (data as any).description,
        eventDatetime: (data as any).event_datetime,
        status: (data as any).status,
        createdAt: (data as any).created_at,
        updatedAt: (data as any).updated_at,
      };
      return createdEvent;
    } catch (error: any) {
      this.handleError(error, 'Failed to create shared event');
      return null;
    }
  }

  /**
   * Update an existing shared event
   */
  async updateSharedEvent(eventId: string, updates: Partial<SharedEventCreateParams & { status: EventStatus }>): Promise<SharedEvent | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Map camelCase keys to snake_case for the database update
      const dbUpdates: { [key: string]: any } = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.eventDatetime !== undefined) dbUpdates.event_datetime = updates.eventDatetime; // Ensure snake_case
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      if (Object.keys(dbUpdates).length === 0) {
        console.warn('No updates provided for shared event');
        // Optionally fetch and return the existing event if no updates are made
        // TS Error expected on .from() until types are regenerated
        // Cast table name to 'any' as types might be outdated
        const { data: existingData, error: existingError } = await supabase // Renamed variables
          .from('shared_events' as any)
          .select('*')
          .eq('id', eventId)
          .single();
        if (existingError) throw existingError; // Use renamed variable
        // Map the current data if no updates were made
        // Note: The duplicated fetch block was removed here.
        // Cast existingData to 'any' to bypass TS errors
        return {
          id: (existingData as any).id,
          creatorId: (existingData as any).creator_id,
          title: (existingData as any).title,
          description: (existingData as any).description,
          eventDatetime: (existingData as any).event_datetime,
          status: (existingData as any).status,
          createdAt: (existingData as any).created_at,
          updatedAt: (existingData as any).updated_at,
        };
      }

      // TS Error expected on .from() until types are regenerated
      // Cast table name to 'any' as types might be outdated
      const { data, error } = await supabase
        .from('shared_events' as any)
        .update(dbUpdates)
        .eq('id', eventId)
        .select()
        .single(); // Return the updated record

      if (error) throw error;

      await this.logActivity(user.id, 'shared_event_updated', { eventId, updates: Object.keys(dbUpdates) });

      // Explicitly map snake_case to camelCase for the return value
      // Cast data to 'any' to bypass TS errors due to potentially outdated Supabase types
      const updatedEvent: SharedEvent = {
        id: (data as any).id,
        creatorId: (data as any).creator_id,
        title: (data as any).title,
        description: (data as any).description,
        eventDatetime: (data as any).event_datetime,
        status: (data as any).status,
        createdAt: (data as any).created_at,
        updatedAt: (data as any).updated_at,
      };
      return updatedEvent;
    } catch (error: any) {
      this.handleError(error, 'Failed to update shared event');
      return null;
    }
  }

  /**
   * Delete a shared event
   */
  async deleteSharedEvent(eventId: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // TS Error expected on .from() until types are regenerated
      // Cast table name to 'any' as types might be outdated
      const { error } = await supabase
        .from('shared_events' as any)
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await this.logActivity(user.id, 'shared_event_deleted', { eventId });

      return true;
    } catch (error: any) {
      this.handleError(error, 'Failed to delete shared event');
      return false;
    }
  }
}

// Export a singleton instance
export const sharedEventService = new SharedEventService();