import React, { useEffect, useState } from 'react';
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
  const [activeTier, setActiveTier] = useState<TierId | null>(null);
  const journeyMeta = journeys.find((entry) => entry.id === journeyId);

  // Saved state (Supabase): this journey's record, and whichever other
  // journey is active right now.
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<ClientJourney | null>(null);
  const [otherActive, setOtherActive] = useState<ClientJourney | null>(null);
  const [pendingTier, setPendingTier] = useState<TierId | null>(null);
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
  // the user's choice. Starting this journey while another is active pauses
  // the other one — after asking — and keeps its place.
  const openTier = async (tier: TierId, confirmedSwitch = false) => {
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
    if (otherActive && !confirmedSwitch) {
      setPendingTier(tier);
      return;
    }
    setBusy(true);
    const result = await journeyAction({ action: 'activate', journey_id: journeyId, stage: tier });
    setBusy(false);
    if (!result.ok || !result.journey) return showActionError(result.error, result.message);
    setRecord(result.journey);
    setOtherActive(null);
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
      <AlertDialog open={pendingTier !== null} onOpenChange={(open) => { if (!open) setPendingTier(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Sparq keeps one journey in focus at a time. {otherActive?.title ?? 'Your current journey'} will be paused, and your place there is saved for when you want to go back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on {otherActive?.title ?? 'my journey'}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={() => {
                const tier = pendingTier;
                setPendingTier(null);
                if (tier) void openTier(tier, true);
              }}
            >
              Pause it and start this one
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
