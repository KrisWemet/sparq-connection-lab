
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { onboardingService } from '@/services/onboardingService';

export function useOnboardingRedirect(skipCheck = false) {
  const { user, loading } = useAuth(); // Changed from isLoading to loading to match AuthContextType
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(!skipCheck);
  
  useEffect(() => {
    const checkOnboarding = async () => {
      if (skipCheck || loading || !user) {
        setIsChecking(false);
        return;
      }
      
      try {
        const wasRedirected = await onboardingService.checkAndRedirectToOnboarding(user.id, navigate);
        
        if (!wasRedirected) {
          console.log('User has already completed onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkOnboarding();
  }, [user, loading, navigate, skipCheck]);
  
  return { isChecking };
}
