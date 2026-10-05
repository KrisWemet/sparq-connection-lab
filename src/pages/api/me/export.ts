import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { getAdminClient } from '@/lib/server/supabase-admin';

/**
 * "Download my data": everything Sparq stores about the signed-in person, as
 * one JSON file. Reads with the service role but only rows this person wrote
 * or owns — never a partner's private rows (no partner_syntheses, and
 * vulnerability_escrow only where they're the author).
 */

// [table, column that names this person]
const SOURCES: Array<[string, string]> = [
  ['profiles', 'id'],
  ['user_preferences', 'user_id'],
  ['user_insights', 'user_id'],
  ['user_streaks', 'user_id'],
  ['daily_sessions', 'user_id'],
  ['daily_entries', 'user_id'],
  ['daily_question_responses', 'user_id'],
  ['reflections', 'user_id'],
  ['memories', 'user_id'],
  ['memory_storage', 'user_id'],
  ['conversation_memories', 'user_id'],
  ['profile_traits', 'user_id'],
  ['rejected_hypotheses', 'user_id'],
  ['self_discoveries', 'user_id'],
  ['experiments', 'user_id'],
  ['user_reasons', 'user_id'],
  ['identity_evidence', 'user_id'],
  ['growth_arcs', 'user_id'],
  ['north_stars', 'user_id'],
  ['growth_moments', 'user_id'],
  ['growth_thread', 'user_id'],
  ['if_then_checkins', 'user_id'],
  ['user_journeys', 'user_id'],
  ['journey_responses', 'user_id'],
  ['ai_journey_content', 'user_id'],
  ['goals', 'user_id'],
  ['user_date_ideas', 'user_id'],
  ['rehearsal_sessions', 'user_id'],
  ['conflict_episodes', 'user_id'],
  ['outcome_assessments', 'user_id'],
  ['csi_pulses', 'user_id'],
  ['relationship_scores', 'user_id'], // retired composite; history kept
  ['baseline_snapshots', 'user_id'],
  ['pattern_snapshots', 'user_id'],
  ['weekly_mirrors', 'user_id'],
  ['weekly_insights', 'user_id'],
  ['mirror_narratives', 'user_id'],
  ['graduation_reports', 'user_id'],
  ['personality_profiles', 'user_id'],
  ['personality_signals', 'user_id'],
  ['user_state_events', 'user_id'],
  ['user_skill_tracks', 'user_id'],
  ['skill_progress', 'user_id'],
  ['vulnerability_escrow', 'user_id'],
  ['shared_items', 'author_id'],
  ['shared_answers', 'sender_id'],
  ['couple_spaces', 'user_a_id'],
  ['couple_spaces', 'user_b_id'],
  ['safety_events', 'user_id'],
  ['coach_usage_daily', 'user_id'],
  ['push_subscriptions', 'user_id'],
  ['analytics_events', 'user_id'],
];

// Search vectors are machine-only and huge; leave them out.
function stripVectors(row: Record<string, unknown>) {
  const { embedding: _embedding, ...rest } = row;
  return rest;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });
  const admin = getAdminClient();
  if (!admin) return res.status(503).json({ error: 'Export is not available right now' });

  const data: Record<string, unknown[]> = {};
  for (const [table, column] of SOURCES) {
    const { data: rows, error } = await admin.from(table).select('*').eq(column, ctx.userId).limit(5000);
    if (error) continue; // a table missing on this database shouldn't block the rest
    if (!rows?.length) continue;
    data[table] = [...(data[table] || []), ...rows.map(r => stripVectors(r as Record<string, unknown>))];
  }

  const { data: authUser } = await admin.auth.admin.getUserById(ctx.userId);
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sparq-data-${date}.json"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(JSON.stringify({
    exported_at: new Date().toISOString(),
    account: { id: ctx.userId, email: authUser?.user?.email ?? null, created_at: authUser?.user?.created_at ?? null },
    note: 'Private reflections for the Neutral Observer are stored encrypted and appear here as stored.',
    data,
  }, null, 2));
}
