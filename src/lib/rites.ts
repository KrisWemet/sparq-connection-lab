// rites.ts — milestones and rites of passage (constitution v1.2 §11C, §11D).
// Every field is written by the user; Sparq supplies evidence, never meaning.

import { SKILL_KEYS } from '@/lib/missions';

export type RiteField =
  | 'used_to' | 'discovered' | 'practiced' | 'changed' | 'still_struggle'
  | 'now_believe' | 'carry_forward' | 'ready_next' | 'who_benefits';

export const RITE_FIELDS: Array<{ key: RiteField; prompt: string }> = [
  { key: 'used_to', prompt: 'What I used to do' },
  { key: 'discovered', prompt: 'What I discovered' },
  { key: 'practiced', prompt: 'What I practiced' },
  { key: 'changed', prompt: 'What changed' },
  { key: 'still_struggle', prompt: 'What I still struggle with' },
  { key: 'now_believe', prompt: 'What I now believe about myself' },
  { key: 'carry_forward', prompt: 'What I want to carry forward' },
  { key: 'ready_next', prompt: "What I'm ready to work on next" },
  // Contribution is offered, never required (§11D).
  { key: 'who_benefits', prompt: 'Who else benefits when I am like this? (only if it matters to you)' },
];

const ARC_KEY = new RegExp(`^(day_30|skill:(${SKILL_KEYS.join('|')}))$`);

export function isArcKey(value: unknown): value is string {
  return typeof value === 'string' && ARC_KEY.test(value);
}

/** Keeps only known fields, trimmed, max 500 chars; drops empties. */
export function cleanRiteFields(input: unknown): Partial<Record<RiteField, string>> {
  const out: Partial<Record<RiteField, string>> = {};
  if (!input || typeof input !== 'object') return out;
  for (const { key } of RITE_FIELDS) {
    const v = (input as Record<string, unknown>)[key];
    if (typeof v === 'string' && v.trim()) out[key] = v.trim().slice(0, 500);
  }
  return out;
}
