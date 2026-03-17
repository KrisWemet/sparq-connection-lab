
import { supabase } from '@/lib/supabase';

export interface AnalyticsEvent {
  event_name: string;
  user_id: string;
  event_props: Record<string, any>;
  created_at: string;
}

export const analyticsService = {
  /**
   * Track a user action
   */
  async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const event = {
        event_name: eventName,
        user_id: user.id,
        event_props: properties,
        created_at: new Date().toISOString()
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics event:', event);
      }
      
      try {
        const { error } = await supabase
          .from('analytics_events')
          .insert([event]);

        if (error && error.code !== '42P01') {
          console.error('Error storing analytics event:', error);
        }
      } catch (error) {
        // Silently fail if table doesn't exist yet
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
