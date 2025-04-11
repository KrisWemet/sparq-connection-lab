import React, { useState } from 'react';
import { unregisterServiceWorkers, registerServiceWorker } from '@/lib/service-worker';
import { Button } from './ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ServiceWorkerManager() {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await unregisterServiceWorkers();
      toast({
        title: 'Service Worker Unregistered',
        description: 'The service worker has been unregistered. Reloading page in 2 seconds...',
      });
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error resetting service worker:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset service worker. Try reloading the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={isLoading}
      title="Reset Service Worker"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      <span className="ml-2">Reset Cache</span>
    </Button>
  );
} 