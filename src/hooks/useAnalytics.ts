
import { useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';

export function useAnalytics(pageName: string, properties: Record<string, any> = {}) {
  useEffect(() => {
    // Track page view when component mounts
    const trackPageView = async () => {
      try {
        await analyticsService.trackPageView(pageName, properties);
        console.log(`Analytics: ${pageName} visited:`, new Date().toISOString());
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };
    
    trackPageView();
    
    // Return cleanup function to potentially handle exit tracking
    return () => {
      console.log(`Analytics: Left ${pageName}:`, new Date().toISOString());
    };
  }, [pageName, properties]);
}
