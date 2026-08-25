// Return-state (spec §3): derived from user_streaks via the get_return_state
// RPC (DB-basis date math). Never throws — fail-soft to not-returning.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReturnState {
  returning: boolean;
  days_away: number;
  /** Forgiving lifetime count — never resets (PRD decision 4, track 1). */
  practice_days: number;
  /** Live consecutive run — the dopamine track (PRD decision 4, track 2). */
  consecutive_streak: number;
  longest_consecutive: number;
}

const AWAY_THRESHOLD_DAYS = 3;

const EMPTY_STATE: ReturnState = {
  returning: false,
  days_away: 0,
  practice_days: 0,
  consecutive_streak: 0,
  longest_consecutive: 0,
};

export async function getReturnState(
  supabase: SupabaseClient,
  _userId: string,
): Promise<ReturnState> {
  try {
    // RPC reads the caller's own row via auth.uid() (SECURITY INVOKER + RLS).
    const { data, error } = await supabase.rpc('get_return_state');
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return EMPTY_STATE;
    const days_away = Number(row.days_away ?? 0);
    const practice_days = Number(row.practice_days ?? 0);
    // returning only when there's real history (practice_days > 0) and a real gap
    const returning = practice_days > 0 && days_away >= AWAY_THRESHOLD_DAYS;
    return {
      returning,
      days_away,
      practice_days,
      // Columns arrive only after the dopamine-layer migration — default to 0
      // so this stays safe if code ships ahead of the migration.
      consecutive_streak: Number(row.consecutive_streak ?? 0),
      longest_consecutive: Number(row.longest_consecutive ?? 0),
    };
  } catch {
    return EMPTY_STATE;
  }
}
