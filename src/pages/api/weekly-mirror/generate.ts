import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { stripMarkdown } from '@/lib/strip-markdown';
import { runGrowthDetection, type GrowthMomentRow } from '@/lib/server/growth-engine';
import { describeMomentsForMirror } from '@/lib/server/growth-moments';
import { logFinalPrompt } from '@/lib/server/dev-prompt-log';
import { loadPrivacyState } from '@/lib/server/privacy';

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day;
  const weekStart = new Date(now.setDate(diff));
  return weekStart.toISOString().slice(0, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  const weekStart = getWeekStart();

  // Check if a mirror already exists for this week
  const { data: existing } = await ctx.supabase
    .from('weekly_mirrors')
    .select('*')
    .eq('user_id', ctx.userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ mirror: existing, cached: true });
  }

  // Fetch this week's sessions
  const { data: sessions } = await ctx.supabase
    .from('daily_sessions')
    .select('day_index, morning_action, evening_reflection, evening_peter_response, practice_attempted, evening_emotional_tone, session_local_date')
    .eq('user_id', ctx.userId)
    .eq('status', 'completed')
    .gte('session_local_date', weekStart)
    .order('day_index', { ascending: true });

  if (!sessions || sessions.length < 3) {
    return res.status(200).json({
      mirror: null,
      insufficient_data: true,
      message: 'Need at least 3 completed sessions for a weekly mirror.',
    });
  }

  // Growth Engine weekly batch (spec §4): snapshot → expire → detect.
  // Gated on can_personalize (spec §6); fail-soft — Mirror proceeds regardless.
  let growthMoments: GrowthMomentRow[] = [];
  try {
    const privacy = await loadPrivacyState(ctx.supabase, ctx.userId);
    if (privacy.can_personalize) {
      growthMoments = await runGrowthDetection(ctx.supabase, ctx.userId, weekStart);
    }
  } catch {
    // fail-soft: no growth lines this week
  }
  const growthLines = describeMomentsForMirror(growthMoments);

  // Build context for Peter's narrative synthesis
  const practiceCount = sessions.length;
  const practicesAttempted = sessions.filter(s => s.practice_attempted === true).length;
  const tones = sessions
    .map(s => s.evening_emotional_tone)
    .filter(Boolean);

  const sessionSummaries = sessions.map(s =>
    `Day ${s.day_index}: Action: "${s.morning_action}" | Reflection: "${(s.evening_reflection || '').slice(0, 150)}" | Tone: ${s.evening_emotional_tone || 'unknown'} | Practiced: ${s.practice_attempted ?? 'unknown'}`
  ).join('\n');

  const prompt = `You are Peter the otter, reviewing a user's week of relationship practice.

Here are their sessions this week:
${sessionSummaries}

Emotional tones observed: ${tones.join(', ') || 'none detected'}
Sessions completed: ${practiceCount}
Practices attempted: ${practicesAttempted}
${growthLines.length > 0 ? `\nVERIFIED growth this week (you may reference ONLY these growth moments; do not infer or invent others):\n${growthLines.map(l => `- ${l}`).join('\n')}` : '\nNo verified growth moments this week — do NOT claim any specific change; reflect honestly on the practice itself.'}

Write a 2-3 sentence narrative synthesis of their week. Focus on:
- What PATTERN you notice across sessions (not a summary of each day)
- What is SHIFTING for them (awareness, behavior, or emotional capacity)
- A warm, forward-looking observation

Do NOT list days. Do NOT use clinical terms. Write as Peter — warm, wise, specific.
Use present tense. Use identity language when possible ("You are becoming someone who...")

Example: "You are noticing defensiveness before it takes over. That is the shift — awareness before reaction. The practice is landing deeper than you think."

Also return a JSON object with:
{
  "narrative": "your 2-3 sentence synthesis",
  "key_patterns": ["pattern1", "pattern2"],
  "practices_felt_natural": <number of sessions where the practice seemed comfortable based on reflection tone>
}

Output ONLY valid JSON. No text outside the JSON object.`;

  logFinalPrompt('weekly-mirror/generate', prompt);

  try {
    const raw = await peterChat({
      messages: [
        { role: 'system', content: 'You are Peter, a wise otter companion who notices growth patterns.' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 512,
    });

    let narrative = '';
    let keyPatterns: string[] = [];
    let feltNatural = 0;

    try {
      const parsed = JSON.parse(raw);
      narrative = stripMarkdown(parsed.narrative || raw);
      keyPatterns = parsed.key_patterns || [];
      feltNatural = parsed.practices_felt_natural || 0;
    } catch {
      narrative = stripMarkdown(raw);
    }

    // Store the mirror
    const { data: mirror, error } = await ctx.supabase
      .from('weekly_mirrors')
      .upsert(
        {
          user_id: ctx.userId,
          week_start: weekStart,
          narrative_text: narrative,
          practice_count: practiceCount,
          practices_felt_natural: feltNatural,
          key_patterns: keyPatterns,
        },
        { onConflict: 'user_id,week_start' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Weekly mirror store error:', error);
      return res.status(500).json({ error: 'Failed to store weekly mirror' });
    }

    // Growth thread entries. MUST await: supabase-js builders are lazy — an
    // un-awaited .insert() never executes (the previous fire-and-forget version
    // of the mirror insert silently never ran).
    if (keyPatterns.length > 0) {
      await ctx.supabase.from('growth_thread').insert({
        user_id: ctx.userId,
        date: weekStart,
        label: keyPatterns[0],
        type: 'mirror',
        detail: narrative,
      });
    }

    // Growth moments land on the thread as their own type (constraint extended
    // in the growth_engine migration).
    for (const line of growthLines) {
      await ctx.supabase.from('growth_thread').insert({
        user_id: ctx.userId,
        date: weekStart,
        label: line.slice(0, 80),
        type: 'growth',
        detail: line,
      });
    }

    return res.status(200).json({ mirror, cached: false });
  } catch (error) {
    console.error('Weekly mirror generation error:', error);
    return res.status(500).json({ error: 'Failed to generate weekly mirror' });
  }
}
