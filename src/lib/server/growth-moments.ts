// growth-moments.ts — read-only consumer helpers for growth_moments (spec §5).
// Surfaces import THIS module, never the engine. No detection logic here.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface SurfaceMoment {
  id: string;
  kind: string;
  tentative: boolean;
  evidence: {
    dimension?: string;
    before_value?: string;
    after_value?: string;
    before_quote?: string | null;
    after_quote?: string | null;
    stats?: Record<string, number>;
  };
}

// Human-readable, non-clinical descriptions of what changed, per kind.
// Behavioral language only — these feed Peter's system prompt, never the UI raw.
function describeMoment(m: SurfaceMoment): string {
  switch (m.kind) {
    case 'pattern_shift':
      return `Their way of handling things has shifted: where they used to lean toward "${(m.evidence.before_value || '').replace(/_/g, ' ')}", lately they've been showing "${(m.evidence.after_value || '').replace(/_/g, ' ')}", and it has held for weeks.`;
    case 'practice_consistency':
      return `They have practiced ${m.evidence.stats?.attempted_this_week ?? 5} times this week — far more consistently than the weeks before.`;
    case 'csi_delta':
      return `Their own check-in scores about the relationship have meaningfully risen since they started.`;
    case 'tone_trend':
      return `Their evening reflections have been landing in a warmer place lately than they did two weeks ago.`;
    case 'moment_pair':
      return `A situation similar to one from weeks ago came up — and they handled it differently this time.`;
    default:
      return '';
  }
}

/** Chat surface (spec §5.1): oldest active moment, or null. Respects 7-day cooldown. */
export async function getActiveGrowthMomentForChat(
  supabase: SupabaseClient,
  userId: string,
): Promise<SurfaceMoment | null> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent } = await supabase
      .from('growth_moments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'surfaced')
      .gte('surfaced_at', sevenDaysAgo)
      .limit(1);
    if (recent && recent.length > 0) return null; // cooldown

    const { data } = await supabase
      .from('growth_moments')
      .select('id, kind, tentative, evidence')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    return (data as SurfaceMoment) || null;
  } catch {
    return null;
  }
}

/** Mark a moment chat-consumed. Fire-and-forget safe. */
export async function markMomentSurfaced(
  supabase: SupabaseClient,
  momentId: string,
): Promise<void> {
  try {
    await supabase
      .from('growth_moments')
      .update({ status: 'surfaced', surfaced_at: new Date().toISOString() })
      .eq('id', momentId);
  } catch {
    // non-blocking
  }
}

/** Day-14 surface (spec §5.3): ALL moments in window, regardless of status. */
export async function getAllGrowthMoments(
  supabase: SupabaseClient,
  userId: string,
): Promise<SurfaceMoment[]> {
  try {
    const { data } = await supabase
      .from('growth_moments')
      .select('id, kind, tentative, evidence')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    return (data || []) as SurfaceMoment[];
  } catch {
    return [];
  }
}

/**
 * System-prompt block for the chat surface — "name it, then hand it back"
 * (spec §5.1). Tentative moments get softer phrasing. The LLM may only voice
 * the change described; it must end by handing ownership back.
 */
export function buildGrowthMomentBlock(m: SurfaceMoment): string {
  const description = describeMoment(m);
  if (!description) return '';
  const evidence: string[] = [];
  if (m.evidence.before_quote) evidence.push(`Something they said back then: "${m.evidence.before_quote}"`);
  if (m.evidence.after_quote) evidence.push(`Something they said recently: "${m.evidence.after_quote}"`);
  const stance = m.tentative
    ? `Phrase it tentatively — "it feels like something's shifting" — never as a settled fact.`
    : `Name it plainly and specifically, grounded in the evidence.`;
  return (
    `\n\nVERIFIED GROWTH OBSERVATION (you may use this at most once, only if the moment fits naturally):\n` +
    `${description}\n` +
    (evidence.length > 0 ? evidence.join('\n') + '\n' : '') +
    `If you choose to voice it: ${stance} Then hand it back with a light question like "Do you feel that shift too?" ` +
    `Never declare what it means about who they are. If the conversation doesn't naturally invite it, stay silent about it.`
  );
}

/** Mirror narrative lines (spec §5.2) — the LLM may reference ONLY these. */
export function describeMomentsForMirror(moments: SurfaceMoment[]): string[] {
  return moments.map(describeMoment).filter(d => d.length > 0);
}
