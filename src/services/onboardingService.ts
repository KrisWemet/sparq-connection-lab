
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';

export const onboardingService = {
  /**
   * Check if the user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('isonboarded')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return !!data?.isonboarded;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
  
  /**
   * Mark the user's onboarding as completed
   */
  async completeOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ isonboarded: true })
        .eq('id', userId);
        
      if (error) throw error;
      
      notificationService.success('Onboarding completed!', {
        description: 'Welcome to Sparq Connect! Your journey to a better relationship starts now.',
        icon: '🚀'
      });
      
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      notificationService.error('Failed to complete onboarding');
      return false;
    }
  },
  
  /**
   * Reset the user's onboarding status (for testing)
   */
  async resetOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ isonboarded: false })
        .eq('id', userId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      return false;
    }
  },
  
  /**
   * Check if the user needs onboarding, and redirect if necessary
   */
  async checkAndRedirectToOnboarding(userId: string, navigate: any): Promise<boolean> {
    if (!userId) return false;
    
    const hasCompleted = await this.hasCompletedOnboarding(userId);
    
    if (!hasCompleted) {
      navigate('/onboarding');
      return true;
    }
    
    return false;
  }
};
