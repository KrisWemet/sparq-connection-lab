
import React from 'react';
import { useRouter } from 'next/router';
import { JourneyContentView } from '@/components/journey/JourneyContentView';
import { ReactNode } from 'react';

export type ConceptItem = {
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

export default function JourneyTemplate({
  journeyId,
  title,
  totalDays,
  conceptItems,
  backPath,
  completionCriteria,
}: JourneyTemplateProps) {
  const router = useRouter();
  const routeJourneyId = router.query.journeyId as string | undefined;
  const effectiveJourneyId = journeyId || routeJourneyId;

  if (!effectiveJourneyId) {
    return (
      <div className="min-h-screen bg-brand-linen flex items-center justify-center">
        <p className="text-zinc-500 font-serif italic">Journey ID is required</p>
      </div>
    );
  }

  return (
    <JourneyContentView
      journeyId={effectiveJourneyId}
      title={title}
      totalDays={totalDays}
      conceptItems={conceptItems}
      completionCriteria={completionCriteria}
    />
  );
}
