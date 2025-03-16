
import { useState, useEffect, useRef } from 'react';

export function useAuthLoading(initialLoading: boolean) {
  const [loading, setLoading] = useState(initialLoading);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up timeout to prevent infinite loading - significantly reduced timeout
  useEffect(() => {
    if (loading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout - reduced from 2000ms to 800ms for faster response
      timeoutRef.current = setTimeout(() => {
        console.log("Auth loading timeout reached, forcing state reset");
        setLoadingTimeout(true);
        setLoading(false); // Force loading state to false on timeout
      }, 800); // Very short timeout for better UX
    } else {
      // Clear timeout when not loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Reset timeout state if needed
      if (loadingTimeout) {
        setLoadingTimeout(false);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading]);

  return {
    loading,
    setLoading,
    loadingTimeout,
    setLoadingTimeout
  };
}
