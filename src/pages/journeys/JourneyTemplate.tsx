
import React from 'react';
import { useParams } from 'react-router-dom';
import { JourneyContentView } from '@/components/journey/JourneyContentView';

export default function JourneyTemplate() {
  const { journeyId } = useParams<{ journeyId: string }>();
  
  if (!journeyId) {
    return <div>Journey ID is required</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <JourneyContentView journeyId={journeyId} />
    </div>
  );
}
