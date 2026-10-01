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

export const DEEP_WHY_LAYERS = 7;

/**
 * Picks the Deep Why layers out of a ladder transcript (constitution v1.2
 * §5B): the user's answers after their opening reflection, minus the final
 * confirmation turn, at most seven. Pure — exported for tests.
 */
export function deepWhyLayersFromTranscript(transcript: Array<{ role: string; content: string }>): string[] {
  const answers = transcript.filter(t => t.role === 'user').map(t => (t.content || '').trim()).filter(Boolean);
  // [0] is the evening reflection Peter asked "why" about; the last is "yes, that's it".
  return answers.slice(1, -1).slice(0, DEEP_WHY_LAYERS).map(a => a.slice(0, 500));
}

/**
 * Saves a Deep Why chain: each layer is a user_reasons row in their words,
 * linked to the one above it, the deepest marked as bedrock. Falls back to
 * saving only the deepest layer before the v1.2 migration has run.
 * Returns how many layers were saved. Never throws.
 */
export async function saveDeepWhyChain(
  supabase: Client,
  userId: string,
  northStarId: string,
  layers: string[],
): Promise<number> {
  if (layers.length === 0) return 0;
  try {
    let parent: string | null = null;
    for (let i = 0; i < layers.length; i++) {
      const { data, error } = await supabase.from('user_reasons').insert({
        user_id: userId,
        reason_text: layers[i],
        attached_type: 'north_star',
        attached_id: northStarId,
        source: 'deep_why',
        parent_reason_id: parent,
        depth: i + 1,
        is_bedrock: i === layers.length - 1,
      }).select('id').single();
      if (error || !data) {
        if (i > 0) return i;
        // Older schema: keep just the deepest answer as a ladder reason.
        const { error: e2 } = await supabase.from('user_reasons').insert({
          user_id: userId,
          reason_text: layers[layers.length - 1],
          attached_type: 'north_star',
          attached_id: northStarId,
          source: 'ladder',
        });
        return e2 ? 0 : 1;
      }
      parent = data.id as string;
    }
    return layers.length;
  } catch {
    return 0;
  }
}
