
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
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("Auth loading timeout reached");
        setLoadingTimeout(true);
      }, 5000);
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
