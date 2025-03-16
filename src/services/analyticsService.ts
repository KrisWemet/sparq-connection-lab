
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_type: string;
  user_id: string;
  properties: Record<string, any>;
  timestamp: string;
}

export const analyticsService = {
  /**
   * Track a user action
   */
  async trackEvent(eventType: string, properties: Record<string, any> = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const event: AnalyticsEvent = {
        event_type: eventType,
        user_id: user.id,
        properties,
        timestamp: new Date().toISOString()
      };

      // Log to console in development
      console.log('Analytics event:', event);
      
      // In a production environment, we would store this in the database
      try {
        // Store event in analytics_events table if it exists
        const { error } = await supabase
          .from('analytics_events')
          .insert([event]);

        if (error && error.code !== '42P01') { // Ignore "relation does not exist" errors
          console.error('Error storing analytics event:', error);
        }
      } catch (error) {
        // Silently fail if table doesn't exist yet
        console.log('Analytics table not configured yet, skipping storage');
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  /**
   * Track page view
   */
  async trackPageView(pageName: string, properties: Record<string, any> = {}) {
    await this.trackEvent('page_view', {
      page_name: pageName,
      ...properties
    });
  },

  /**
   * Track partner invitation events
   */
  async trackPartnerInvitation(action: 'sent' | 'accepted' | 'rejected', properties: Record<string, any> = {}) {
    await this.trackEvent(`partner_invitation_${action}`, properties);
  },

  /**
   * Track journey progress
   */
  async trackJourneyProgress(journeyId: string, action: 'started' | 'completed' | 'activity_completed', properties: Record<string, any> = {}) {
    await this.trackEvent(`journey_${action}`, {
      journey_id: journeyId,
      ...properties
    });
  },

  /**
   * Track user engagement metrics
   */
  async trackEngagement(action: string, properties: Record<string, any> = {}) {
    await this.trackEvent(`engagement_${action}`, properties);
  }
};
