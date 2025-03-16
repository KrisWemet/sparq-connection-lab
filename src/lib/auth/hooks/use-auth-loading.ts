
import { useState, useEffect, useRef } from 'react';

export function useAuthLoading(initialLoading: boolean) {
  const [loading, setLoading] = useState(initialLoading);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout - more reasonable timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Auth loading timeout reached, forcing state reset");
        setLoadingTimeout(true);
        setLoading(false); // Force loading state to false on timeout
      }, 5000); // Increased timeout to 5 seconds to allow auth operations to complete
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
  }, [loading, loadingTimeout]);

  return {
    loading,
    setLoading,
    loadingTimeout,
    setLoadingTimeout
  };
}
