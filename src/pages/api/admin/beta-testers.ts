import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';

interface BetaTester {
  id: string;
  email: string;
  name: string | null;
  isonboarded: boolean;
  onboarding_day: number | null;
  traits_count: number;
  session_count: number;
  last_active: string | null;
  consent_given_at: string | null;
  created_at: string;
}

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

  // Get all users with their profile info
  const { data: profiles, error: profilesError } = await ctx.supabase
    .from('profiles')
    .select('id, email, name, isonboarded, consent_given_at, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return res.status(500).json({ error: 'Failed to fetch profiles' });
  }

  const userIds = (profiles || []).map(p => p.id);
  if (userIds.length === 0) {
    return res.status(200).json({ testers: [] });
  }

  // Fetch onboarding day from user_insights
  const { data: insights } = await ctx.supabase
    .from('user_insights')
    .select('user_id, onboarding_day')
    .in('user_id', userIds);

  // Fetch trait counts per user
  const { data: traitRows } = await ctx.supabase
    .from('profile_traits')
    .select('user_id')
    .in('user_id', userIds);

  // Fetch session counts per user
  const { data: sessionRows } = await ctx.supabase
    .from('daily_sessions')
    .select('user_id, session_local_date')
    .eq('status', 'completed')
    .in('user_id', userIds);

  // Build lookup maps
  const insightMap = new Map((insights || []).map(i => [i.user_id, i]));

  const traitCountMap = new Map<string, number>();
  for (const row of traitRows || []) {
    traitCountMap.set(row.user_id, (traitCountMap.get(row.user_id) || 0) + 1);
  }

  const sessionCountMap = new Map<string, number>();
  const lastActiveMap = new Map<string, string>();
  for (const row of sessionRows || []) {
    sessionCountMap.set(row.user_id, (sessionCountMap.get(row.user_id) || 0) + 1);
    const current = lastActiveMap.get(row.user_id);
    if (!current || row.session_local_date > current) {
      lastActiveMap.set(row.user_id, row.session_local_date);
    }
  }

  const testers: BetaTester[] = (profiles || []).map(p => ({
    id: p.id,
    email: p.email || '',
    name: p.name || null,
    isonboarded: p.isonboarded || false,
    onboarding_day: insightMap.get(p.id)?.onboarding_day || null,
    traits_count: traitCountMap.get(p.id) || 0,
    session_count: sessionCountMap.get(p.id) || 0,
    last_active: lastActiveMap.get(p.id) || null,
    consent_given_at: p.consent_given_at || null,
    created_at: p.created_at,
  }));

  return res.status(200).json({ testers });
}
