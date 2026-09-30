// rejected-hypotheses.ts — remember what Peter got wrong so he never re-pushes
// it (constitution v1.1 §2, §6A, §12; docs/PERSON_MODEL.md §8.7).
// Rejections are evidence about Peter's understanding, not about the user.

import { INSIGHT_SKELETONS } from '@/lib/server/pattern-hints';
import { PATTERN_KEYS, type PatternKey } from '@/lib/server/attachment-context';

type Client = { from: (table: string) => any };

export type OfferedAs = 'reflection' | 'challenge' | 'suggestion' | 'interpretation' | 'insight';

export type RejectionRow = {
  hypothesis_ref: string | null;
  offered_text: string | null;
  user_response: string | null;
  created_at?: string;
};

/** How long a rejection keeps an idea off the table (it can always come back if the user raises it). */
export const REJECTION_WINDOW_DAYS = 90;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
}

/**
 * If Peter's message voiced one of the insight observations, return its trait
 * key. Matches the distinctive phrase after "you tend to" so light rewording
 * of the opener ("I might be off, but…") still matches.
 */
export function detectVoicedInsight(peterMessage: string): PatternKey | null {
  const said = normalize(peterMessage);
  for (const key of PATTERN_KEYS) {
    for (const skeleton of Object.values(INSIGHT_SKELETONS[key] ?? {})) {
      if (!skeleton) continue;
      const tail = normalize(skeleton).split('you tend to ')[1];
      const phrase = (tail ?? normalize(skeleton)).split(/[—,]/)[0].trim().slice(0, 40);
      if (phrase.length >= 12 && said.includes(phrase)) return key;
    }
  }
  return null;
}

/** Trait keys the user rejected recently — never voiced as observations again. */
export function rejectedTraitKeys(rows: RejectionRow[]): Set<string> {
  const keys = new Set<string>();
  for (const row of rows) {
    if (row.hypothesis_ref?.startsWith('trait:')) keys.add(row.hypothesis_ref.slice('trait:'.length));
  }
  return keys;
}

/** Prompt block: things the user told Peter don't fit. Empty when there are none. */
export function buildDoNotRepushBlock(rows: RejectionRow[]): string {
  const lines = rows
    .filter(r => r.offered_text)
    .slice(0, 5)
    .map(r => `- You offered: "${(r.offered_text ?? '').slice(0, 160)}"${r.user_response ? ` — they said: "${r.user_response.slice(0, 160)}"` : ''}`);
  if (lines.length === 0) return '';
  return `\n\nThings they told you don't fit (never offer these again, in any wording, unless they bring it up themselves):\n${lines.join('\n')}`;
}

export async function loadRecentRejections(supabase: Client, userId: string): Promise<RejectionRow[]> {
  try {
    const since = new Date(Date.now() - REJECTION_WINDOW_DAYS * 86_400_000).toISOString();
    const { data } = await supabase
      .from('rejected_hypotheses')
      .select('hypothesis_ref, offered_text, user_response, created_at')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);
    return (data || []) as RejectionRow[];
  } catch {
    return [];
  }
}

export async function recordRejection(
  supabase: Client,
  userId: string,
  entry: { hypothesisRef: string | null; offeredAs: OfferedAs; offeredText?: string | null; userResponse?: string | null },
): Promise<void> {
  try {
    await supabase.from('rejected_hypotheses').insert({
      user_id: userId,
      hypothesis_ref: entry.hypothesisRef,
      offered_as: entry.offeredAs,
      offered_text: entry.offeredText ? entry.offeredText.slice(0, 400) : null,
      user_response: entry.userResponse ? entry.userResponse.slice(0, 500) : null,
    });
  } catch {
    // never block the conversation on bookkeeping
  }
}
