// progress-summary.ts — what Sparq can honestly say about a user's progress
// (docs/METRICS.md "Outcome measurement"). Replaces the old weighted
// "Relationship OS Score", which scored communication by reflection length
// and Peter usage and emotional safety by an inferred mood minus logged
// safety events — none of which measure those things.
//
// Three layers, never combined into one number:
//   1. practice — what the user did in Sparq. Activity, not an outcome: more
//      use is not better communication, and less use can go with things
//      going well (constitution §10).
//   2. self_report — what the user said about their relationship: the
//      published CSI-4 and Sparq's informal check-in. Before/after changes are
//      what they reported, not proof Sparq caused them.
//   3. tentative — patterns Sparq noticed in what the user wrote. Guesses the
//      user can correct; never a score.
//
// Historical relationship_scores rows are left untouched (they appear in the
// user's data export) but are no longer written or shown.

import type { SupabaseClient } from '@supabase/supabase-js';
import { compareCheckIns, type CheckInAnswers, type CheckInChange } from '@/lib/check-in';

export interface ProgressSummary {
  practice: {
    days_practiced_7d: number;
    reflections_written_7d: number;
    missions_tried_30d: number;
    missions_adapted_30d: number;
  };
  self_report: {
    csi4: { baseline: number | null; latest: number | null; measured_at: string | null };
    check_in_changes: CheckInChange[];
  };
  tentative: {
    growth_moments_60d: Array<{ kind: string; tentative: boolean }>;
  };
  computed_at: string;
}

const DAY = 86_400_000;

export async function computeProgressSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressSummary> {
  const now = Date.now();
  const since = (days: number) => new Date(now - days * DAY).toISOString();

  const [sessions, missions, pulses, checkIns, moments] = await Promise.all([
    supabase.from('daily_sessions').select('status, evening_reflection')
      .eq('user_id', userId).gte('created_at', since(7)),
    supabase.from('experiments').select('status')
      .eq('user_id', userId).gte('resolved_at', since(30)),
    supabase.from('csi_pulses').select('context, total_score, measured_at')
      .eq('user_id', userId).order('measured_at', { ascending: true }),
    supabase.from('outcome_assessments').select('milestone, responses')
      .eq('user_id', userId).in('milestone', ['checkin_baseline', 'checkin_follow_up'])
      .order('completed_at', { ascending: true }),
    supabase.from('growth_moments').select('kind, tentative')
      .eq('user_id', userId).gte('created_at', since(60)),
  ]);

  const sessionRows = sessions.data || [];
  const missionRows = missions.data || [];
  const pulseRows = pulses.data || [];
  const baselinePulse = pulseRows.find(p => p.context === 'baseline') ?? null;
  const laterPulses = pulseRows.filter(p => p.context !== 'baseline');
  const latestPulse = laterPulses.length > 0 ? laterPulses[laterPulses.length - 1] : null;

  const checkInRows = (checkIns.data || []) as Array<{ milestone: string; responses: { answers?: CheckInAnswers } | null }>;
  const checkInBase = checkInRows.find(r => r.milestone === 'checkin_baseline');
  const followUps = checkInRows.filter(r => r.milestone === 'checkin_follow_up');
  const checkInLatest = followUps[followUps.length - 1];

  return {
    practice: {
      days_practiced_7d: sessionRows.filter(s => s.status === 'completed').length,
      // Counted, never judged by length: a short reflection is not a worse one.
      reflections_written_7d: sessionRows.filter(s => typeof s.evening_reflection === 'string' && s.evening_reflection.trim()).length,
      missions_tried_30d: missionRows.filter(m => m.status === 'tried').length,
      missions_adapted_30d: missionRows.filter(m => m.status === 'revised').length,
    },
    self_report: {
      csi4: {
        baseline: baselinePulse?.total_score ?? null,
        latest: latestPulse?.total_score ?? null,
        measured_at: latestPulse?.measured_at ?? baselinePulse?.measured_at ?? null,
      },
      check_in_changes: checkInBase && checkInLatest
        ? compareCheckIns(checkInBase.responses?.answers ?? {}, checkInLatest.responses?.answers ?? {})
        : [],
    },
    tentative: {
      growth_moments_60d: (moments.data || []).map(m => ({ kind: m.kind, tentative: Boolean(m.tentative) })),
    },
    computed_at: new Date(now).toISOString(),
  };
}
