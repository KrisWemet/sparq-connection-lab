import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

type KpiResponse = {
  date_utc: string;
  activation_day3_users: number;
  onboarding_day14_users: number;
  onboarding_completion_rate: number | null;
  active_users_30d: number;
  retained_users_30d: number;
  retention_rate_30d: number | null;
  avg_repair_time_minutes: number | null;
  avg_relationship_score: number | null;
  assessment_improvement_avg: number | null;
  memory_utilization: number | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const { data: adminCheck } = await ctx.supabase.rpc('is_admin', { user_id: ctx.userId });
  if (!adminCheck) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const today = new Date();
  const d30 = new Date(today);
  d30.setDate(today.getDate() - 30);
  const d60 = new Date(today);
  d60.setDate(today.getDate() - 60);
  const d90 = new Date(today);
  d90.setDate(today.getDate() - 90);

  const [activationRows, day14Rows, activeRows, retainedRows] = await Promise.all([
    ctx.supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_name', 'activation_day3_reached')
      .gte('created_at', d90.toISOString()),
    ctx.supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_name', 'onboarding_day14_completed')
      .gte('created_at', d90.toISOString()),
    ctx.supabase
      .from('daily_sessions')
      .select('user_id')
      .eq('status', 'completed')
      .gte('session_local_date', d30.toISOString().slice(0, 10)),
    ctx.supabase
      .from('daily_sessions')
      .select('user_id, session_local_date')
      .eq('status', 'completed')
      .gte('session_local_date', d60.toISOString().slice(0, 10)),
  ]);

  const activationUsers = new Set((activationRows.data || []).map(r => r.user_id));
  const day14Users = new Set((day14Rows.data || []).map(r => r.user_id));
  const active30Users = new Set((activeRows.data || []).map(r => r.user_id));

  const periodAStart = d60.toISOString().slice(0, 10);
  const periodAEnd = d30.toISOString().slice(0, 10);
  const periodBStart = d30.toISOString().slice(0, 10);

  const periodA = new Set<string>();
  const periodB = new Set<string>();
  for (const row of retainedRows.data || []) {
    if (!row.user_id || !row.session_local_date) continue;
    if (row.session_local_date >= periodAStart && row.session_local_date < periodAEnd) {
      periodA.add(row.user_id);
    }
    if (row.session_local_date >= periodBStart) {
      periodB.add(row.user_id);
    }
  }
  let retained30 = 0;
  for (const userId of periodA) {
    if (periodB.has(userId)) retained30 += 1;
  }

  // New KPIs: avg repair time, avg relationship score, assessment improvement, memory utilization
  const [repairRows, scoreRows, assessmentRows, memoryCount] = await Promise.all([
    ctx.supabase
      .from('conflict_episodes')
      .select('repair_duration_minutes')
      .not('resolved_at', 'is', null)
      .gte('started_at', d30.toISOString()),
    ctx.supabase
      .from('relationship_scores')
      .select('overall_score')
      .gte('computed_at', d30.toISOString()),
    ctx.supabase
      .from('outcome_assessments')
      .select('user_id, milestone, total_score')
      .order('completed_at', { ascending: true }),
    ctx.supabase
      .from('memories')
      .select('*', { count: 'exact', head: true }),
  ]);

  // Avg repair time
  const repairDurations = (repairRows.data || [])
    .map(r => r.repair_duration_minutes)
    .filter((d): d is number => d != null);
  const avgRepairTime = repairDurations.length > 0
    ? Number((repairDurations.reduce((a, b) => a + b, 0) / repairDurations.length).toFixed(1))
    : null;

  // Avg relationship score
  const scores = (scoreRows.data || []).map(r => r.overall_score).filter((s): s is number => s != null);
  const avgRelationshipScore = scores.length > 0
    ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    : null;

  // Assessment improvement avg (baseline → latest for each user)
  const userAssessments = new Map<string, { baseline: number; latest: number }>();
  for (const a of assessmentRows.data || []) {
    if (!userAssessments.has(a.user_id)) {
      userAssessments.set(a.user_id, { baseline: a.total_score, latest: a.total_score });
    } else {
      userAssessments.get(a.user_id)!.latest = a.total_score;
    }
  }
  const improvements: number[] = [];
  for (const [, v] of userAssessments) {
    if (v.latest !== v.baseline) improvements.push(v.latest - v.baseline);
  }
  const assessmentImprovementAvg = improvements.length > 0
    ? Number((improvements.reduce((a, b) => a + b, 0) / improvements.length).toFixed(1))
    : null;

  const response: KpiResponse = {
    date_utc: today.toISOString(),
    activation_day3_users: activationUsers.size,
    onboarding_day14_users: day14Users.size,
    onboarding_completion_rate:
      activationUsers.size > 0 ? Number((day14Users.size / activationUsers.size).toFixed(3)) : null,
    active_users_30d: active30Users.size,
    retained_users_30d: retained30,
    retention_rate_30d: periodA.size > 0 ? Number((retained30 / periodA.size).toFixed(3)) : null,
    avg_repair_time_minutes: avgRepairTime,
    avg_relationship_score: avgRelationshipScore,
    assessment_improvement_avg: assessmentImprovementAvg,
    memory_utilization: memoryCount.count ?? null,
  };

  return res.status(200).json(response);
}

