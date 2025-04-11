import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

// Inspirational relationship quotes and messages
const encouragementMessages = [
  "Building stronger connections, one moment at a time...",
  "The best relationships require constant nurturing and growth.",
  "Quality time together strengthens your bond.",
  "Communication is the foundation of every healthy relationship.",
  "A thriving relationship requires both listening and sharing.",
  "Mindful relationships lead to deeper connections.",
  "Taking time for each other creates lasting memories.",
  "Relationships flourish with intentional care and attention.",
  "Every moment of connection adds depth to your relationship.",
  "Great relationships are built on mutual respect and understanding."
];

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  const [encouragement, setEncouragement] = useState(encouragementMessages[0]);
  
  // Cycle through encouragement messages
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    setEncouragement(encouragementMessages[randomIndex]);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h3 className="text-lg font-medium text-primary mb-2">{message}</h3>
      <p className="text-center text-muted-foreground max-w-md">
        {encouragement}
      </p>
    </div>
  );
};