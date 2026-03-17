// Legacy route — redirect to the active onboarding flow
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OnboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-flow');
  }, [router]);
  return null;
}
