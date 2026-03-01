// Peter Proactive Check-in Service
// Determines which nudge Peter should deliver based on time, streak, and progress.

import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────

export type CheckinType =
  | 'morning_nudge'
  | 'evening_reminder'
  | 'streak_at_risk'
  | 'comeback'
  | 'milestone_celebration'
  | 'weekly_reflection';

export interface Checkin {
  type: CheckinType;
  message: string;
  /** Quick-reply options the user can tap */
  quickReplies?: string[];
  /** Priority for Peter's message router */
  priority: 'low' | 'normal' | 'high';
}

interface UserState {
  currentDay: number;
  streakCount: number;
  lastActivityDate: string | null;
  morningViewedToday: boolean;
  eveningCompletedToday: boolean;
  partnerName: string | null;
}

// ─── Time helpers ───────────────────────────────────────────────────

function getHour(): number {
  return new Date().getHours();
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

// ─── Checkin Logic ──────────────────────────────────────────────────

/** Determine what Peter should say right now based on user state */
export function determineCheckin(state: UserState): Checkin | null {
  const hour = getHour();
  const daysSinceActivity = daysSince(state.lastActivityDate);

  // ── Comeback (inactive 3+ days) ─────────────────────────────────
  if (daysSinceActivity >= 3) {
    const name = state.partnerName ? ` with ${state.partnerName}` : '';
    return {
      type: 'comeback',
      message: `Hey, I missed you! No pressure — just showing up again is the win. Ready to pick back up${name}?`,
      quickReplies: ["Let's do it", "Maybe later", "What did I miss?"],
      priority: 'normal',
    };
  }

  // ── Streak at risk (1 day since activity, afternoon/evening) ────
  if (daysSinceActivity === 1 && hour >= 16) {
    const streak = state.streakCount;
    if (streak >= 3) {
      return {
        type: 'streak_at_risk',
        message: `You've got a ${streak}-day streak going! Don't want you to lose it. Even a quick check-in counts.`,
        quickReplies: ['Open daily growth', 'Remind me later'],
        priority: 'normal',
      };
    }
  }

  // ── Milestone celebrations ──────────────────────────────────────
  if ([7, 14].includes(state.currentDay) && !state.morningViewedToday) {
    const msg = state.currentDay === 7
      ? "One week! You're halfway through the 14-day journey. That's huge. 🦦"
      : "Day 14 — the final day! You've built something real. Let's finish strong.";
    return {
      type: 'milestone_celebration',
      message: msg,
      quickReplies: ["Let's go!", "I'm excited"],
      priority: 'normal',
    };
  }

  // ── Morning nudge (7am-11am, hasn't viewed story) ──────────────
  if (hour >= 7 && hour < 11 && !state.morningViewedToday && state.currentDay <= 14) {
    const messages = [
      `Good morning! Day ${state.currentDay} is ready for you. I've got a story and a little challenge. 🌅`,
      `Rise and shine! Your Day ${state.currentDay} story is waiting. It's a good one.`,
      `Morning! I made something for you — Day ${state.currentDay}'s story. Want to take a look?`,
    ];
    return {
      type: 'morning_nudge',
      message: messages[state.currentDay % messages.length],
      quickReplies: ['Read my story', 'Not yet'],
      priority: 'low',
    };
  }

  // ── Evening reminder (6pm-10pm, morning done but evening not) ──
  if (hour >= 18 && hour < 22 && state.morningViewedToday && !state.eveningCompletedToday) {
    return {
      type: 'evening_reminder',
      message: "Hey! How did today's action go? I'd love to hear about it. Even a one-word answer works. 🌙",
      quickReplies: ['It went well', 'It was hard', "I didn't try it"],
      priority: 'low',
    };
  }

  return null;
}

// ─── DB Helpers ─────────────────────────────────────────────────────

/** Check if a checkin of this type was already delivered today */
export async function wasDeliveredToday(
  userId: string,
  checkinType: CheckinType
): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('peter_checkins')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('checkin_type', checkinType)
    .gte('delivered_at', todayStart.toISOString());

  return (count ?? 0) > 0;
}

/** Record that a checkin was delivered */
export async function recordCheckin(
  userId: string,
  checkin: Checkin,
  day?: number
): Promise<void> {
  await supabase.from('peter_checkins').insert({
    user_id: userId,
    checkin_type: checkin.type,
    message: checkin.message,
    day: day ?? null,
  });
}

/** Load the user state needed for checkin logic */
export async function loadUserState(userId: string): Promise<UserState | null> {
  // Load profile + insights in parallel
  const [profileResult, insightsResult, entryResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('streak_count, last_activity_date, partner_name')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_insights')
      .select('onboarding_day')
      .eq('user_id', userId)
      .single(),
    // Check today's daily entry
    supabase
      .from('daily_entries')
      .select('morning_viewed_at, evening_completed_at')
      .eq('user_id', userId)
      .order('day', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const currentDay = insightsResult.data?.onboarding_day ?? 1;

  return {
    currentDay,
    streakCount: profileResult.data?.streak_count ?? 0,
    lastActivityDate: profileResult.data?.last_activity_date ?? null,
    morningViewedToday: !!entryResult.data?.morning_viewed_at,
    eveningCompletedToday: !!entryResult.data?.evening_completed_at,
    partnerName: profileResult.data?.partner_name ?? null,
  };
}
