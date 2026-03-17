import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { searchMemories } from '@/lib/server/memory';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT } from '@/lib/peterService';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const weekStart = getWeekStart(new Date());

  // Return cached result if current week already generated
  const { data: cached } = await ctx.supabase
    .from('weekly_insights')
    .select('*')
    .eq('user_id', ctx.userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (cached) return res.status(200).json(cached);

  // Fetch last 7 days of completed sessions
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: sessions } = await ctx.supabase
    .from('daily_sessions')
    .select('day_index, morning_action, evening_reflection, completed_local_date')
    .eq('user_id', ctx.userId)
    .eq('status', 'completed')
    .gte('evening_completed_at', sevenDaysAgo)
    .order('day_index', { ascending: false });

  if (!sessions || sessions.length < 3) {
    return res.status(200).json({ insufficient_data: true });
  }

  // Fetch traits
  const { data: traitsData } = await ctx.supabase
    .from('profile_traits')
    .select('trait_key, inferred_value, confidence')
    .eq('user_id', ctx.userId)
    .gte('confidence', 0.4);

  // Fetch relevant memories
  let memories: string[] = [];
  try {
    const lastReflection = sessions[0]?.evening_reflection || 'relationship growth';
    const memResult = await searchMemories(ctx.userId, lastReflection, 5);
    memories = (memResult?.results || [])
      .map((r: any) => r.memory || r.content || '')
      .filter(Boolean);
  } catch {
    // non-blocking
  }

  const reflectionSummary = sessions
    .map(s => `Day ${s.day_index}: "${s.evening_reflection}"`)
    .join('\n');

  const traitSummary = (traitsData || [])
    .map(t => `${t.trait_key}: ${t.inferred_value}`)
    .join(', ');

  const memorySummary = memories.slice(0, 5).join('; ');

  const prompt = `${PETER_SYSTEM_PROMPT}

You are looking back at a user's last week of evening reflections to identify meaningful patterns.

Their reflections this week:
${reflectionSummary}

What you know about them: ${traitSummary || 'still learning'}
Things they've shared: ${memorySummary || 'still learning'}

Generate a weekly pattern summary in JSON with exactly this shape:
{
  "patterns": ["<pattern 1 — 1 sentence, 'I noticed...' language>", "<pattern 2 — 1 sentence>"],
  "growth_edge": "<one thing they're growing toward — 1 sentence, specific and encouraging>",
  "strength": "<one clear strength you see in them — 1 sentence>"
}

Rules:
- Use "I noticed..." to open each pattern
- Never use clinical terms (no 'attachment style', 'avoidant', 'anxious', 'trauma')
- Keep language warm, specific to their actual reflections
- Return ONLY the JSON object, no other text`;

  let patterns: string[] = [];
  let growth_edge = '';
  let strength = '';

  try {
    const raw = await peterChat({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400,
    });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      patterns = Array.isArray(parsed.patterns) ? parsed.patterns.slice(0, 2) : [];
      growth_edge = parsed.growth_edge || '';
      strength = parsed.strength || '';
    }
  } catch {
    return res.status(500).json({ error: 'Pattern generation failed' });
  }

  if (!patterns.length || !growth_edge || !strength) {
    return res.status(200).json({ insufficient_data: true });
  }

  const { data: inserted, error: insertError } = await ctx.supabase
    .from('weekly_insights')
    .insert({
      user_id: ctx.userId,
      week_start: weekStart,
      patterns,
      growth_edge,
      strength,
    })
    .select('*')
    .single();

  if (insertError) {
    // Return result even if insert fails (e.g. race condition duplicate)
    return res.status(200).json({ patterns, growth_edge, strength, week_start: weekStart });
  }

  return res.status(200).json(inserted);
}
