// reasons.ts — user-owned reasons (constitution v1.1 §1 self-persuasion,
// §4 "The User's Own Reasons", §5A; docs/PERSON_MODEL.md §8.3).
// A reason is kept in the user's own words and is the only material Peter
// may use to support follow-through. Never paraphrased into something stronger.

type Client = { from: (table: string) => any };

export type ReasonSource = 'evening' | 'chat' | 'mirror' | 'ladder' | 'onboarding' | 'experiment_card';

export function cleanReason(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  return trimmed.slice(0, 500);
}

/**
 * Saves a reason for an experiment and links it (experiments.reason_id).
 * Returns the reason id, or null if nothing was saved. Never throws.
 */
export async function saveExperimentReason(
  supabase: Client,
  userId: string,
  experimentId: string,
  reasonText: string,
  source: ReasonSource,
): Promise<string | null> {
  try {
    const { data: reason, error } = await supabase
      .from('user_reasons')
      .insert({
        user_id: userId,
        reason_text: reasonText,
        attached_type: 'experiment',
        attached_id: experimentId,
        source,
      })
      .select('id')
      .single();
    if (error || !reason) return null;
    await supabase.from('experiments').update({ reason_id: reason.id }).eq('id', experimentId).eq('user_id', userId);
    return reason.id as string;
  } catch {
    return null;
  }
}
