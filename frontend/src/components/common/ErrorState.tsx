import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react'; // Using lucide-react for an icon

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  message?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  message = 'An unexpected error occurred.',
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message}
        {errorMessage && <p className="mt-2 text-sm">{errorMessage}</p>}
        {onRetry && (
          <Button onClick={onRetry} variant="destructive" size="sm" className="mt-4">
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};