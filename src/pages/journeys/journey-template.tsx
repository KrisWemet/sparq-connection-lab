import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { JourneyContentView } from '@/components/journey/JourneyContentView';
import { JourneyTierView, JourneyTier, TierId } from '@/components/journey/JourneyTierView';
import { ReactNode } from 'react';
import { journeys } from '@/data/journeys';
import { PeterLoading } from '@/components/PeterLoading';
import { fetchJourneyState, journeyAction, type ClientJourney } from '@/lib/journeys/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const router = useRouter();
  const [activeTier, setActiveTier] = useState<TierId | null>(null);
  const journeyMeta = journeys.find((entry) => entry.id === journeyId);

  // Saved state (Supabase): this journey's record, and whichever other
  // journey is active right now.
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<ClientJourney | null>(null);
  const [otherActive, setOtherActive] = useState<ClientJourney | null>(null);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchJourneyState().then((state) => {
      if (!alive) return;
      setRecord(state?.journeys.find((j) => j.journey_id === journeyId) ?? null);
      const active = state?.active ?? null;
      setOtherActive(active && active.journey_id !== journeyId ? active : null);
      setLoaded(true);
    });
    return () => { alive = false; };
  }, [journeyId]);

  const showActionError = (error?: string, message?: string) => {
    if (error === 'journey_limit_reached') toast(message || 'You reached your free-plan journey limit.');
    else if (error === 'stage_locked') toast('Finish the stage before this one first.');
    else toast.error("We couldn't save that. Please try again.");
  };

  // Opening a stage starts (or resumes) the journey. Moving between stages is
  // the user's choice. One journey at a time (Chris, 2026-10-07): while
  // another journey is active this one can't start; the user pauses or
  // finishes that one first, from Journeys.
  const openTier = async (tier: TierId) => {
    if (busy) return;
    if (record?.status === 'active') {
      if (record.stage !== tier) {
        setBusy(true);
        const result = await journeyAction({ action: 'stage', journey_id: journeyId, stage: tier });
        setBusy(false);
        if (!result.ok || !result.journey) return showActionError(result.error, result.message);
        setRecord(result.journey);
      }
      setActiveTier(tier);
      return;
    }
    if (otherActive) {
      setBlockedOpen(true);
      return;
    }
    setBusy(true);
    const result = await journeyAction({ action: 'activate', journey_id: journeyId, stage: tier });
    setBusy(false);
    if (result.error === 'another_journey_active') {
      // Started elsewhere (another tab or device) since this page loaded.
      setOtherActive((prev) => prev ?? ({ journey_id: result.active_journey_id, title: result.active_title } as ClientJourney));
      setBlockedOpen(true);
      return;
    }
    if (!result.ok || !result.journey) return showActionError(result.error, result.message);
    setRecord(result.journey);
    setActiveTier(tier);
  };

  if (!loaded) return <PeterLoading isLoading />;

  // Legacy mode: no tiers defined, use old single-tier behavior
  if ((!tiers || tiers.length === 0) && conceptItems) {
    return (
      <JourneyContentView
        journeyId={journeyId}
        title={title}
        totalDays={totalDays || 14}
        conceptItems={conceptItems}
        completionCriteria={completionCriteria}
        record={record}
        onRecordChange={setRecord}
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
        record={record}
        onRecordChange={setRecord}
      />
    );
  }

  // Show tier selection
  return (
    <>
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
        record={record}
        otherActive={otherActive}
        onSelectTier={(tier) => void openTier(tier)}
      />
      <AlertDialog open={blockedOpen} onOpenChange={setBlockedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>One journey at a time</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re on {otherActive?.title ?? 'another journey'} right now. To start {title}, pause or finish it first. Your place there is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => void router.push('/journeys')}>
              Go to my journey
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
