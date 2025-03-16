
import React from 'react';
import { useParams } from 'react-router-dom';
import { JourneyContentView } from '@/components/journey/JourneyContentView';
import { ReactNode } from 'react';

type ConceptItem = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  example: string;
};

type CompletionCriteria = {
  requireConceptSelection?: boolean;
  requireReflection?: boolean;
  minReflectionLength?: number;
  requireActivity?: boolean;
};

interface JourneyTemplateProps {
  journeyId: string;
  title: string;
  totalDays: number;
  conceptItems: ConceptItem[];
  backPath: string;
  headerImage?: string;
  cardImage?: string;
  conceptSelectionPrompt?: string;
  completionCriteria?: CompletionCriteria;
}

// The JourneyTemplate now accepts props through the component interface
export default function JourneyTemplate({
  journeyId,
  title,
  totalDays,
  conceptItems,
  backPath,
  headerImage,
  cardImage,
  conceptSelectionPrompt,
  completionCriteria
}: JourneyTemplateProps) {
  // For the route parameter version
  const { journeyId: routeJourneyId } = useParams<{ journeyId: string }>();
  
  // Use the prop value if provided, otherwise fall back to the route parameter
  const effectiveJourneyId = journeyId || routeJourneyId;
  
  if (!effectiveJourneyId) {
    return <div>Journey ID is required</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <JourneyContentView journeyId={effectiveJourneyId} />
    </div>
  );
}
