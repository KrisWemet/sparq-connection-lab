// trait-revision.ts — evidence-based hypothesis revision (docs/PERSON_MODEL.md §4).
// Pure functions, no I/O. A single contradicting reflection never flips a
// hypothesis; contradictions are kept as counter-evidence, not erased.

export type TraitStatus = 'hypothesis' | 'confirmed' | 'rejected';

export type EvidenceEntry = {
  at: string;
  source: string;
  value: string;
  note?: string;
};

export type TraitRow = {
  id: string;
  inferred_value: string;
  confidence: number | null;
  status?: TraitStatus | null;
  evidence?: EvidenceEntry[] | null;
  counter_evidence?: EvidenceEntry[] | null;
  candidate_value?: string | null;
  candidate_confidence?: number | null;
};

export type Observation = {
  value: string;
  boost: number; // quality-weighted, 0.05–0.15
  source: string;
  note?: string;
  at?: string;
};

export const EVIDENCE_CAP = 10;
export const INITIAL_CONFIDENCE = 0.3;
const CONTRADICTION_PENALTY = 0.1;
const MIN_CONFIDENCE = 0.1;

function list(entries?: EvidenceEntry[] | null): EvidenceEntry[] {
  return Array.isArray(entries) ? entries : [];
}

function push(entries: EvidenceEntry[], entry: EvidenceEntry): EvidenceEntry[] {
  return [...entries, entry].slice(-EVIDENCE_CAP);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Fields for a brand-new hypothesis. */
export function newTraitFields(obs: Observation) {
  const at = obs.at ?? new Date().toISOString();
  return {
    inferred_value: obs.value,
    confidence: INITIAL_CONFIDENCE,
    status: 'hypothesis' as TraitStatus,
    source: 'inferred',
    evidence: [{ at, source: obs.source, value: obs.value, note: obs.note }],
    counter_evidence: [] as EvidenceEntry[],
    last_evidence_at: at,
  };
}

/**
 * Returns the update payload for an existing trait given a new observation.
 *
 * - Agreeing evidence raises confidence and weakens any competing candidate.
 * - Contradicting evidence lowers confidence and builds a candidate; the
 *   candidate replaces the value only once it outweighs it.
 * - Confirmed / rejected traits belong to the user: inference only records
 *   evidence, never changes the value, status or confidence.
 */
export function reviseTrait(existing: TraitRow, obs: Observation): Record<string, unknown> {
  const at = obs.at ?? new Date().toISOString();
  const entry: EvidenceEntry = { at, source: obs.source, value: obs.value, note: obs.note };
  const evidence = list(existing.evidence);
  const counter = list(existing.counter_evidence);
  const agrees = existing.inferred_value === obs.value;
  const base = { last_evidence_at: at, updated_at: at };

  if (existing.status === 'confirmed' || existing.status === 'rejected') {
    const confirmsUserView =
      (existing.status === 'confirmed' && agrees) || (existing.status === 'rejected' && !agrees);
    return confirmsUserView
      ? { ...base, evidence: push(evidence, entry) }
      : { ...base, counter_evidence: push(counter, entry) };
  }

  const confidence = existing.confidence ?? INITIAL_CONFIDENCE;

  if (agrees) {
    const candidateConfidence =
      existing.candidate_value != null
        ? Math.max(0, (existing.candidate_confidence ?? 0) - obs.boost / 2)
        : null;
    const dropCandidate = candidateConfidence != null && candidateConfidence <= 0;
    return {
      ...base,
      confidence: round(Math.min(1, confidence + obs.boost)),
      evidence: push(evidence, entry),
      candidate_value: dropCandidate ? null : existing.candidate_value ?? null,
      candidate_confidence: dropCandidate ? null : candidateConfidence == null ? null : round(candidateConfidence),
    };
  }

  // Contradiction.
  const lowered = Math.max(MIN_CONFIDENCE, confidence - CONTRADICTION_PENALTY);
  const sameCandidate = existing.candidate_value === obs.value;
  const candidateConfidence = sameCandidate ? (existing.candidate_confidence ?? 0) + obs.boost : obs.boost;
  const nextCounter = push(counter, entry);

  if (candidateConfidence > lowered) {
    // The candidate now outweighs the old value: swap, and keep the old
    // value's history as counter-evidence so the revision is traceable.
    return {
      ...base,
      inferred_value: obs.value,
      confidence: round(Math.min(1, candidateConfidence)),
      evidence: nextCounter.filter(e => e.value === obs.value).slice(-EVIDENCE_CAP),
      counter_evidence: [...evidence, ...nextCounter.filter(e => e.value !== obs.value)].slice(-EVIDENCE_CAP),
      candidate_value: null,
      candidate_confidence: null,
    };
  }

  return {
    ...base,
    confidence: round(lowered),
    counter_evidence: nextCounter,
    candidate_value: obs.value,
    candidate_confidence: round(candidateConfidence),
  };
}

/**
 * Knowledge level for how Peter may speak about a trait (docs/PERSON_MODEL.md §3).
 */
export type KnowledgeLevel = 'told' | 'evidence' | 'wondering' | 'excluded';

export function knowledgeLevel(
  trait: { status?: string | null; source?: string | null; confidence?: number | null; last_evidence_at?: string | null; updated_at?: string | null },
  now: Date = new Date(),
): KnowledgeLevel {
  if (trait.status === 'rejected') return 'excluded';
  if (trait.status === 'confirmed') return 'told';
  const last = trait.last_evidence_at ?? trait.updated_at;
  const staleDays = last ? (now.getTime() - new Date(last).getTime()) / 86_400_000 : 0;
  if (staleDays > 60) return 'wondering';
  if (trait.source === 'user_stated' && (trait.confidence ?? 0) >= 0.6) return 'told';
  return (trait.confidence ?? 0) >= 0.6 ? 'evidence' : 'wondering';
}
