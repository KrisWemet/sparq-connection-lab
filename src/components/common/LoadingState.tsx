import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      {/* TODO: Replace with a proper spinner component from the UI library if available */}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};