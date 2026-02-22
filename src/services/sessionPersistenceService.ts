import { supabase } from "@/integrations/supabase/client";
import { getMemoryService } from "@/services/memoryService";

/**
 * SessionPersistenceService — Handles saving daily sessions,
 * updating streaks, incrementing discovery_day, and recording
 * memories for AI context.
 */

interface SaveSessionInput {
  userId: string;
  discoveryDay: number;
  phase: string;
  learnQuestionText: string;
  learnQuestionId?: string;
  modality?: string;
  learnResponse: string;
  microAction: string;
  microActionAccepted: boolean;
  implementActionId?: string;
  checkInResponse?: string;
}

/** Save a completed daily session and update all related state */
export async function saveCompletedSession(
  input: SaveSessionInput
): Promise<{ success: boolean; newStreak: number; newDiscoveryDay: number }> {
  const {
    userId,
    discoveryDay,
    phase,
    learnQuestionText,
    learnQuestionId,
    modality,
    learnResponse,
    microAction,
    microActionAccepted,
    implementActionId,
    checkInResponse,
  } = input;

  try {
    // 1. Insert the daily session record
    //    The DB trigger (on_daily_session_created) auto-updates streaks + profile
    const { error: sessionError } = await supabase
      .from("daily_sessions")
      .insert({
        user_id: userId,
        session_date: new Date().toISOString().split("T")[0],
        discovery_day: discoveryDay,
        phase,
        learn_question_text: learnQuestionText,
        learn_question_id: learnQuestionId,
        modality,
        learn_response: learnResponse,
        micro_action: microAction,
        micro_action_accepted: microActionAccepted,
        implement_action_id: implementActionId,
        check_in_response: checkInResponse,
        points_earned: 10,
        completed_at: new Date().toISOString(),
      });

    if (sessionError) {
      // If it's a unique constraint violation, session already exists for today
      if (sessionError.code === "23505") {
        console.warn("Session already saved for today");
      } else {
        throw sessionError;
      }
    }

    // 2. Increment discovery_day on profile (capped at 14 for core discovery)
    const newDiscoveryDay = discoveryDay + 1;
    await supabase
      .from("profiles")
      .update({
        discovery_day: newDiscoveryDay,
        last_daily_activity: new Date().toISOString(),
      } as any)
      .eq("id", userId);

    // 3. Get updated streak
    const { data: streakData } = await supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle();

    const newStreak = streakData?.current_streak ?? 1;

    // 4. Record session memory for AI personalization
    const memory = getMemoryService(userId);
    await memory.recordConversationMemory(
      `Day ${discoveryDay} session: Question was "${learnQuestionText}". ` +
        `User responded: "${learnResponse}". ` +
        `Accepted micro-action: "${microAction}" (${microActionAccepted ? "accepted" : "swapped"}).`,
      "session",
      0.7
    );

    // Store last session data for tomorrow's check-in
    await memory.set("last_session", {
      date: new Date().toISOString().split("T")[0],
      microAction,
      microActionAccepted,
      discoveryDay,
      phase,
    });

    return { success: true, newStreak, newDiscoveryDay };
  } catch (error) {
    console.error("Failed to save session:", error);
    return { success: false, newStreak: 0, newDiscoveryDay: discoveryDay };
  }
}

/** Load the previous session data for yesterday's check-in */
export async function getLastSession(
  userId: string
): Promise<{ microAction: string; date: string } | null> {
  try {
    const memory = getMemoryService(userId);
    const lastSession = await memory.get("last_session");
    if (lastSession?.microAction) {
      return {
        microAction: lastSession.microAction,
        date: lastSession.date,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Check if user has already completed a session today */
export async function hasCompletedToday(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("session_date", today)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/** Get the user's current streak info */
export async function getStreakInfo(
  userId: string
): Promise<{ current: number; longest: number; total: number }> {
  try {
    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, total_sessions")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      current: data?.current_streak ?? 0,
      longest: data?.longest_streak ?? 0,
      total: data?.total_sessions ?? 0,
    };
  } catch {
    return { current: 0, longest: 0, total: 0 };
  }
}
