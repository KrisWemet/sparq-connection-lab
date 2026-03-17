import type { SupabaseClient } from '@supabase/supabase-js';

export interface RelationshipScore {
  overall_score: number;
  communication_quality: number;
  repair_speed: number;
  emotional_safety: number;
  ritual_consistency: number;
  computed_at: string;
}

const WEIGHTS = {
  communication_quality: 0.25,
  repair_speed: 0.30,
  emotional_safety: 0.20,
  ritual_consistency: 0.25,
};

/**
 * Compute a user's Relationship OS Score from their data.
 * Returns null if insufficient data (< 3 days of activity).
 */
export async function computeRelationshipScore(
  supabase: SupabaseClient,
  userId: string,
): Promise<RelationshipScore | null> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Communication Quality (25%)
  // Based on: evening reflection depth + coach engagement
  const { data: recentSessions } = await supabase
    .from('daily_sessions')
    .select('evening_reflection, status')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo);

  const completedSessions = (recentSessions || []).filter(s => s.status === 'completed');
  const reflectionsWithContent = completedSessions.filter(
    s => s.evening_reflection && s.evening_reflection.length > 20
  );

  const { count: coachMessages } = await supabase
    .from('coach_usage_daily')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('usage_date', sevenDaysAgo.slice(0, 10));

  const reflectionDepthScore = reflectionsWithContent.length > 0
    ? Math.min(100, (reflectionsWithContent.length / 7) * 100)
    : 0;
  const coachEngagementScore = Math.min(100, ((coachMessages || 0) / 7) * 100);
  const communicationQuality = (reflectionDepthScore * 0.6) + (coachEngagementScore * 0.4);

  // 2. Repair Speed (30%)
  // Based on: avg repair_duration_minutes — lower is better
  const { data: resolvedConflicts } = await supabase
    .from('conflict_episodes')
    .select('repair_duration_minutes')
    .eq('user_id', userId)
    .not('resolved_at', 'is', null)
    .gte('started_at', thirtyDaysAgo);

  let repairSpeed = 50; // neutral default
  if (resolvedConflicts && resolvedConflicts.length > 0) {
    const durations = resolvedConflicts
      .map(c => c.repair_duration_minutes)
      .filter((d): d is number => d != null);

    if (durations.length > 0) {
      const avgMinutes = durations.reduce((a, b) => a + b, 0) / durations.length;
      // Under 30 min = 100, over 1440 min (24h) = 0, linear scale
      repairSpeed = Math.max(0, Math.min(100, 100 - (avgMinutes / 1440) * 100));
    }
  }

  // 3. Emotional Safety (20%)
  // Based on: emotional_state trends + absence of safety events
  const { data: insights } = await supabase
    .from('user_insights')
    .select('emotional_state')
    .eq('user_id', userId)
    .maybeSingle();

  const stateScores: Record<string, number> = {
    thriving: 90,
    neutral: 60,
    struggling: 30,
  };
  const emotionalBaseScore = stateScores[insights?.emotional_state || 'neutral'] || 60;

  const { count: safetyEventCount } = await supabase
    .from('safety_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo);

  // Each safety event reduces score by 15 points
  const safetyPenalty = Math.min(60, (safetyEventCount || 0) * 15);
  const emotionalSafety = Math.max(0, emotionalBaseScore - safetyPenalty);

  // 4. Ritual Consistency (25%)
  // Based on: daily session completion rate over last 7 days
  const totalSessions = (recentSessions || []).length;
  const completedCount = completedSessions.length;
  const ritualConsistency = totalSessions > 0
    ? Math.min(100, (completedCount / 7) * 100)
    : 0;

  // If less than 3 days of data, return null (building score state)
  if (totalSessions < 3 && (!resolvedConflicts || resolvedConflicts.length === 0)) {
    return null;
  }

  // Weighted overall
  const overallScore = Math.round(
    communicationQuality * WEIGHTS.communication_quality +
    repairSpeed * WEIGHTS.repair_speed +
    emotionalSafety * WEIGHTS.emotional_safety +
    ritualConsistency * WEIGHTS.ritual_consistency
  );

  return {
    overall_score: Math.round(overallScore * 100) / 100,
    communication_quality: Math.round(communicationQuality * 100) / 100,
    repair_speed: Math.round(repairSpeed * 100) / 100,
    emotional_safety: Math.round(emotionalSafety * 100) / 100,
    ritual_consistency: Math.round(ritualConsistency * 100) / 100,
    computed_at: now.toISOString(),
  };
}
