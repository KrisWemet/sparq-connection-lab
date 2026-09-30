import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthedContext } from '@/lib/server/supabase-auth';
import { peterChat } from '@/lib/openrouter';
import { PETER_SYSTEM_PROMPT } from '@/lib/peterService';
import { getAllGrowthMoments } from '@/lib/server/growth-moments';
import { logFinalPrompt } from '@/lib/server/dev-prompt-log';

const TRACK_MAP: Record<string, string> = {
  avoidant: 'trust_security',
  anxious: 'trust_security',
  volatile: 'conflict_repair',
};

function recommendTrack(traits: { trait_key: string; inferred_value: string }[]): string {
  for (const t of traits) {
    if (t.trait_key === 'conflict_style' && (t.inferred_value === 'avoidant' || t.inferred_value === 'volatile')) {
      return 'conflict_repair';
    }
    if (t.trait_key === 'attachment_style' && TRACK_MAP[t.inferred_value]) {
      return TRACK_MAP[t.inferred_value];
    }
  }
  return 'communication';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await getAuthedContext(req);
  if (!ctx) return res.status(401).json({ error: 'Unauthorized' });

  // Return existing report if present (immutable — generated once)
  const { data: existing } = await ctx.supabase
    .from('graduation_reports')
    .select('*')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  if (existing) return res.status(200).json(existing);

  // Gather all 14 sessions
  const { data: sessions } = await ctx.supabase
    .from('daily_sessions')
    .select('day_index, morning_action, evening_reflection')
    .eq('user_id', ctx.userId)
    .eq('status', 'completed')
    .order('day_index', { ascending: true });

  const { data: traitsData } = await ctx.supabase
    .from('profile_traits')
    .select('trait_key, inferred_value, confidence, status')
    .eq('user_id', ctx.userId)
    .gte('confidence', 0.4);

  // Get user's name from profile
  const { data: profileData } = await ctx.supabase
    .from('profiles')
    .select('full_name, name')
    .eq('user_id', ctx.userId)
    .maybeSingle();

  const userName = profileData?.full_name || profileData?.name || 'you';
  const traits = traitsData || [];
  const recommended_track = recommendTrack(traits);

  // Compound Reveal inputs (spec §5.3): baseline + ALL moments regardless of status
  const [{ data: baseline }, allMoments] = await Promise.all([
    ctx.supabase.from('baseline_snapshots').select('quotes, summary').eq('user_id', ctx.userId).maybeSingle(),
    getAllGrowthMoments(ctx.supabase, ctx.userId),
  ]);
  const beforeQuote: string | null = baseline?.quotes?.[0]?.text ?? null;
  const strongMoment = allMoments.find(m => !m.tentative) || null;
  const afterQuote: string | null =
    (strongMoment?.evidence.after_quote as string | undefined) ??
    (sessions && sessions.length > 0 ? (sessions[sessions.length - 1].evening_reflection || '').slice(0, 200) : null);
  const daysShowedUp = (sessions || []).length;

  const reflectionSummary = (sessions || [])
    .map(s => `Day ${s.day_index}: "${s.evening_reflection}"`)
    .join('\n');

  // Only traits the user confirmed reach the model as things "known" about
  // them — inferred guesses are never turned into a verdict (constitution §2).
  // All traits still inform the track recommendation above.
  const traitSummary = traits
    .filter(t => t.status === 'confirmed')
    .map(t => `${t.trait_key}: ${t.inferred_value}`)
    .join(', ');

  const prompt = `${PETER_SYSTEM_PROMPT}

${userName} just completed 14 days of their relationship growth journey. Based on everything they've shared, write a personal graduation reflection in JSON.

Their 14 days of reflections:
${reflectionSummary || '(reflections not available)'}

Things they have confirmed about themselves: ${traitSummary || 'none yet — rely only on their own words above'}

Verified evidence for the reveal (use ONLY this — never invent):
${beforeQuote ? `What they said when they started: "${beforeQuote}"` : '(no baseline quote on record)'}
${afterQuote ? `What they said recently: "${afterQuote}"` : '(no recent quote on record)'}
${strongMoment ? `Verified change: ${strongMoment.kind.replace(/_/g, ' ')}` : 'Verified change: NONE — use the effort fallback.'}
Days they showed up: ${daysShowedUp} of 14

Generate JSON with exactly this shape:
{
  "what_i_learned": "<2-3 sentences: what you noticed across their reflections, tied to things they actually said, offered as your guess (e.g. 'Here's what I noticed — tell me if it fits'). Never state who they are.>",
  "biggest_growth": "<1-2 sentences: one change you saw in their own words or actions. If you are not sure, name their effort instead. End by asking what they make of it.>",
  "relationship_superpower": "<1 sentence: one strength you saw, pointing to a specific thing they did ('One strength I saw: ...'). No labels, no superlatives.>",
  "focus_next": "<1-2 sentences: an open question about what they might want to explore next, drawn from what they said matters to them. Their choice, not your assignment.>",
  "reveal_narrative": "<2-3 sentences. ${strongMoment && beforeQuote ? 'A verified change happened — name it plainly using ONLY the evidence provided, then hand ownership back with a light question.' : `NO verified change is on record — honor effort with the real number: they showed up ${daysShowedUp} of 14 days. Never claim a change that is not in the evidence.`}>"
}

Rules:
- Use "I" (Peter speaking to them) and "you" language
- Everything you say about them is a guess they can correct — they write what it means (constitution: discovery before direction)
- Be specific to their actual reflections — not generic
- No clinical terms
- Return ONLY the JSON object`;

  logFinalPrompt('me/graduation-report', prompt);

  try {
    const raw = await peterChat({ messages: [{ role: 'user', content: prompt }], maxTokens: 700 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    const what_i_learned: string = parsed.what_i_learned || '';
    const biggest_growth: string = parsed.biggest_growth || '';
    const relationship_superpower: string = parsed.relationship_superpower || '';
    const focus_next: string = parsed.focus_next || '';

    if (!what_i_learned || !biggest_growth) {
      return res.status(500).json({ error: 'Incomplete report generated' });
    }

    // Compound Reveal payload (spec §5.3). Quotes only ship when a verified
    // (non-tentative) moment exists — never pair quotes around an unverified claim.
    const reveal = {
      narrative: (parsed.reveal_narrative as string) || '',
      before_quote: strongMoment && beforeQuote ? beforeQuote : null,
      after_quote: strongMoment && afterQuote ? afterQuote : null,
      verified: Boolean(strongMoment),
      days_showed_up: daysShowedUp,
    };

    const { data: inserted, error: insertError } = await ctx.supabase
      .from('graduation_reports')
      .insert({
        user_id: ctx.userId,
        what_i_learned,
        biggest_growth,
        relationship_superpower,
        focus_next,
        recommended_track,
        reveal,
      })
      .select('*')
      .single();

    if (insertError) {
      // Return even if insert failed (e.g. race condition)
      return res.status(200).json({
        what_i_learned,
        biggest_growth,
        relationship_superpower,
        focus_next,
        recommended_track,
        reveal,
      });
    }

    return res.status(200).json(inserted);
  } catch (err) {
    console.error('Graduation report generation error:', err);
    return res.status(500).json({ error: 'Report generation failed' });
  }
}
