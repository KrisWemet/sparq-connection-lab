import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Skill tree has been replaced by the journey-based growth ecosystem.
// Redirect any bookmarks or old links to the journeys page.
export default function SkillTreeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/journeys');
  }, [router]);
  return null;
}
