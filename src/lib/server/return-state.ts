// Return-state (spec §3): derived from user_streaks via the get_return_state
// RPC (DB-basis date math). Never throws — fail-soft to not-returning.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReturnState {
  returning: boolean;
  days_away: number;
  practice_days: number;
}

const AWAY_THRESHOLD_DAYS = 3;

export async function getReturnState(
  supabase: SupabaseClient,
  _userId: string,
): Promise<ReturnState> {
  try {
    // RPC reads the caller's own row via auth.uid() (SECURITY INVOKER + RLS).
    const { data, error } = await supabase.rpc('get_return_state');
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return { returning: false, days_away: 0, practice_days: 0 };
    const days_away = Number(row.days_away ?? 0);
    const practice_days = Number(row.practice_days ?? 0);
    // returning only when there's real history (practice_days > 0) and a real gap
    const returning = practice_days > 0 && days_away >= AWAY_THRESHOLD_DAYS;
    return { returning, days_away, practice_days };
  } catch {
    return { returning: false, days_away: 0, practice_days: 0 };
  }
}
