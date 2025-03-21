
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { onboardingService } from '@/services/onboardingService';

export function useOnboardingRedirect(skipCheck = true) { // Default changed to true
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(!skipCheck);
  
  useEffect(() => {
    // If we should skip the check or user is not loaded yet, don't do anything
    if (skipCheck || loading || !user) {
      setIsChecking(false);
      return;
    }
    
    // Set a timeout to force completion after a short delay
    const timeoutId = setTimeout(() => {
      if (isChecking) {
        console.log('Onboarding check timeout reached, forcing state reset');
        setIsChecking(false);
      }
    }, 800); // 800ms timeout as a safety net
    
    const checkOnboarding = async () => {
      try {
        // Store onboarding status but don't redirect
        const needsOnboarding = !(await onboardingService.hasCompletedOnboarding(user.id));
        
        if (needsOnboarding) {
          console.log('User needs onboarding, but skipping redirect');
        } else {
          console.log('User has already completed onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsChecking(false);
        clearTimeout(timeoutId);
      }
    };
    
    checkOnboarding();
    
    return () => clearTimeout(timeoutId);
  }, [user, loading, navigate, skipCheck, isChecking]);
  
  return { isChecking };
}
