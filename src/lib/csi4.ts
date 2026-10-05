// CSI-4 — the 4-item Couples Satisfaction Index.
//
// Source: Funk, J. L., & Rogge, R. D. (2007). Testing the ruler with item
// response theory: Increasing precision of measurement for relationship
// satisfaction with the Couples Satisfaction Index. Journal of Family
// Psychology, 21(4), 572–583. Items 1, 12, 19 and 22 of the CSI-32.
//
// Wording, anchors and scoring are kept exactly as published — a paraphrased
// scale is no longer the validated scale (docs/METRICS.md "Outcome
// measurement"). Item 1 is scored 0–6, items 2–4 are scored 0–5; the total
// (0–21) is a simple sum, kept continuous. The authors publish the CSI as
// free for research and clinical use without further permission; use inside
// a commercial app is an open question for Chris (docs/METRICS.md).
//
// The total is the user's own answer about their relationship. It is never a
// grade, a diagnosis, a comparison with a partner, or proof that Sparq helped.

export type Csi4Item = {
  /** Wording as published. */
  text: string;
  /** Anchor labels in score order (index = score). */
  anchors: string[];
};

export const CSI4_ITEMS: Csi4Item[] = [
  {
    text: 'Please indicate the degree of happiness, all things considered, of your relationship.',
    anchors: ['Extremely unhappy', 'Fairly unhappy', 'A little unhappy', 'Happy', 'Very happy', 'Extremely happy', 'Perfect'],
  },
  {
    text: 'I have a warm and comfortable relationship with my partner.',
    anchors: ['Not at all true', 'A little true', 'Somewhat true', 'Mostly true', 'Almost completely true', 'Completely true'],
  },
  {
    text: 'How rewarding is your relationship with your partner?',
    anchors: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Almost completely', 'Completely'],
  },
  {
    text: 'In general, how satisfied are you with your relationship?',
    anchors: ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Almost completely', 'Completely'],
  },
];

export const CSI4_ITEM_MAX = CSI4_ITEMS.map(i => i.anchors.length - 1); // [6, 5, 5, 5]

export const CSI4_SOURCE_NOTE =
  'These four questions are the CSI-4, a short published relationship-satisfaction scale (Funk & Rogge, 2007).';

export function isValidCsi4(scores: unknown): scores is number[] {
  return Array.isArray(scores)
    && scores.length === CSI4_ITEMS.length
    && scores.every((s, i) => Number.isInteger(s) && s >= 0 && s <= CSI4_ITEM_MAX[i]);
}

export function csi4Total(scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}
