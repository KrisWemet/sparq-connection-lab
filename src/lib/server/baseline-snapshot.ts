// baseline-snapshot.ts — one-time silent "before" snapshot (spec §3.2).
// Verbatim quotes: deterministic selection from the first 3 evening reflections.
// Structured onboarding answers (profiles.psychological_profile) inform the
// LLM summary ONLY — never presented as the user's words. (Deliberate scope:
// onboarding answers are structured choices, so reflections are the only
// verbatim-quote source.)

import type { SupabaseClient } from '@supabase/supabase-js';
import { peterChat } from '@/lib/openrouter';

type Quote = { text: string; source: string; captured_at: string };

/** Longest sentences are the most emotionally salient proxy — deterministic. */
function selectQuotes(reflections: Array<{ text: string; date: string; day: number }>): Quote[] {
  const quotes: Quote[] = [];
  for (const r of reflections) {
    const sentences = r.text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 40 && s.length <= 240);
    const longest = sentences.sort((a, b) => b.length - a.length)[0];
    if (longest) {
      quotes.push({ text: longest, source: `daily_sessions.day_${r.day}`, captured_at: r.date });
    }
  }
  return quotes;
}

/**
 * Fire-and-forget: extracts the baseline once a user has ≥3 completed evening
 * reflections and no baseline_snapshot yet. Gated on can_store_memories by the
 * caller (profile-analysis). Never throws.
 */
export async function maybeExtractBaseline(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('baseline_snapshots')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (existing) return;

    const { data: sessions } = await supabase
      .from('daily_sessions')
      .select('day_index, evening_reflection, session_local_date')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('evening_reflection', 'is', null)
      .order('day_index', { ascending: true })
      .limit(3);
    if (!sessions || sessions.length < 3) return;

    // NOTE: profiles is keyed by `id` in the live personalization paths
    // (chat.ts, morning.ts) — a mismatch degrades silently to a context-free
    // summary, so this matches those call sites.
    const { data: profile } = await supabase
      .from('profiles')
      .select('psychological_profile')
      .eq('id', userId)
      .maybeSingle();

    const reflections = sessions.map(s => ({
      text: s.evening_reflection as string,
      date: s.session_local_date as string,
      day: s.day_index as number,
    }));
    const quotes = selectQuotes(reflections);
    const sources = sessions.map(s => ({ table: 'daily_sessions', day_index: s.day_index }));

    // LLM distills the summary ONLY (never quoted back as the user's words)
    let summary: string | null = null;
    try {
      const raw = await peterChat({
        messages: [{
          role: 'user',
          content:
            `Summarize where this person is starting from in their relationship growth, in 2-3 plain sentences. ` +
            `Use warm, everyday words — no clinical terms, no labels. Mention what feels hard for them and what they hope for.\n\n` +
            `Their first reflections:\n${reflections.map(r => `- "${r.text.slice(0, 300)}"`).join('\n')}\n\n` +
            (profile?.psychological_profile ? `Onboarding context: ${JSON.stringify(profile.psychological_profile).slice(0, 500)}\n\n` : '') +
            `Return only the summary text.`,
        }],
        maxTokens: 200,
      });
      summary = raw.trim().slice(0, 600);
    } catch {
      summary = null; // quotes alone are still a valid baseline
    }

    await supabase.from('baseline_snapshots').insert({
      user_id: userId,
      quotes,
      summary,
      sources,
    });
  } catch (err) {
    console.error('Baseline extraction error (non-blocking):', err);
  }
}
