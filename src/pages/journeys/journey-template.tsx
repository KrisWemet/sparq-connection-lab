import React, { useState } from 'react';
import { JourneyContentView } from '@/components/journey/JourneyContentView';
import { JourneyTierView, JourneyTier, TierId } from '@/components/journey/JourneyTierView';
import { ReactNode } from 'react';
import { journeys } from '@/data/journeys';

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
  description?: string;
  tiers?: JourneyTier[];
  // Legacy support for journeys not yet converted to tiers
  totalDays?: number;
  conceptItems?: ConceptItem[];
  completionCriteria?: CompletionCriteria;
  headerImage?: string;
  cardImage?: string;
  conceptSelectionPrompt?: string;
  backPath?: string;
}

export default function JourneyTemplate({
  journeyId,
  title,
  description,
  tiers,
  totalDays,
  conceptItems,
  completionCriteria,
}: JourneyTemplateProps) {
  const [activeTier, setActiveTier] = useState<TierId | null>(null);
  const journeyMeta = journeys.find((entry) => entry.id === journeyId);

  // Legacy mode: no tiers defined, use old single-tier behavior
  if ((!tiers || tiers.length === 0) && conceptItems) {
    return (
      <JourneyContentView
        journeyId={journeyId}
        title={title}
        totalDays={totalDays || 14}
        conceptItems={conceptItems}
        completionCriteria={completionCriteria}
      />
    );
  }

  // Tier selected — show content
  if (activeTier && tiers) {
    const tier = tiers.find(t => t.id === activeTier);
    if (!tier) return null;

    return (
      <JourneyContentView
        journeyId={journeyId}
        tierId={activeTier}
        title={title}
        tierName={
          activeTier === 'roots' ? 'Roots' :
          activeTier === 'growth' ? 'Growth' : 'Bloom'
        }
        totalDays={tier.totalDays}
        conceptItems={tier.concepts}
        completionCriteria={tier.completionCriteria}
        onBackToTiers={() => setActiveTier(null)}
      />
    );
  }

  // Show tier selection
  return (
      <JourneyTierView
        journeyId={journeyId}
        title={title}
        description={description || ''}
        duration={journeyMeta?.duration}
        category={journeyMeta?.category}
        overview={journeyMeta?.overview}
        benefits={journeyMeta?.benefits}
        psychology={journeyMeta?.psychology}
        tiers={tiers || []}
        onSelectTier={setActiveTier}
      />
    );
  }
