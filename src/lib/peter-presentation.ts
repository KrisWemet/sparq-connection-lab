/** Presentation chosen by the screen, never inferred from a person's traits. */
export type PeterState = 'neutral' | 'welcoming' | 'listening' | 'reflective' | 'encouraging' | 'grounding' | 'celebrating' | 'curious';
export type PeterEnvironment = 'none' | 'bridge' | 'bloom' | 'flow';

export interface PeterAppearance {
  /** Explicit visual preferences only. No persistence or person-model coupling. */
  warmth?: number;
  energy?: number;
  complexity?: number;
  pacingSeconds?: number;
}

interface PeterPose {
  tilt: number;
  headY: number;
  gaze: number;
  gazeY: number;
  eyes: number;
  rightEye: number;
  eyeStyle: 'open' | 'resting' | 'smiling';
  mouth: string;
  brows: string;
  leftPaw: number;
  rightPaw: number;
  pawY: number;
  warmth: number;
  energy: number;
  complexity: number;
  pacingSeconds: number;
}

// Deliberate, readable silhouettes and facial shapes. These are static poses,
// not looping performances; each remains distinct when motion is disabled.
const presets: Record<PeterState, PeterPose> = {
  neutral: { tilt: 0, headY: 0, gaze: 0, gazeY: 0, eyes: 1, rightEye: 1, eyeStyle: 'open',
    mouth: 'M121 115V122M110 124Q121 127 132 124', brows: 'M84 82Q92 79 99 82M141 82Q149 79 157 82',
    leftPaw: 0, rightPaw: 0, pawY: 0, warmth: .35, energy: .3, complexity: .35, pacingSeconds: 28 },
  welcoming: { tilt: -5, headY: -2, gaze: 0, gazeY: 0, eyes: 1.2, rightEye: 1.2, eyeStyle: 'open',
    mouth: 'M121 115V120M103 120Q121 138 140 119', brows: 'M82 80Q91 75 100 79M140 79Q149 75 158 80',
    leftPaw: 28, rightPaw: -28, pawY: 0, warmth: .6, energy: .4, complexity: .45, pacingSeconds: 26 },
  listening: { tilt: 9, headY: 1, gaze: 2, gazeY: 0, eyes: 1.18, rightEye: 1.18, eyeStyle: 'open',
    mouth: 'M121 115V121M111 124Q121 128 132 122', brows: 'M83 80Q92 76 100 80M141 80Q150 76 158 80',
    leftPaw: -10, rightPaw: 10, pawY: 2, warmth: .3, energy: 0, complexity: .2, pacingSeconds: 32 },
  reflective: { tilt: 6, headY: 7, gaze: -2, gazeY: 3, eyes: .55, rightEye: .55, eyeStyle: 'open',
    mouth: 'M121 115V123M111 126Q119 125 128 127', brows: 'M83 84Q91 81 99 82M141 82Q149 81 157 84',
    leftPaw: 12, rightPaw: 48, pawY: -1, warmth: .2, energy: .1, complexity: .25, pacingSeconds: 32 },
  encouraging: { tilt: -4, headY: -5, gaze: 0, gazeY: -1, eyes: .82, rightEye: .82, eyeStyle: 'open',
    mouth: 'M121 115V120M107 122Q120 136 137 118', brows: 'M83 81Q92 77 100 81M141 81Q150 77 158 81',
    leftPaw: -32, rightPaw: -12, pawY: -3, warmth: .65, energy: .4, complexity: .45, pacingSeconds: 26 },
  grounding: { tilt: 0, headY: 5, gaze: 0, gazeY: 0, eyes: 1, rightEye: 1, eyeStyle: 'resting',
    mouth: 'M121 115V121M111 124Q121 129 132 124', brows: 'M83 83Q92 80 100 83M141 83Q150 80 158 83',
    leftPaw: 30, rightPaw: -30, pawY: 19, warmth: .25, energy: 0, complexity: .1, pacingSeconds: 32 },
  celebrating: { tilt: -5, headY: -4, gaze: 0, gazeY: 0, eyes: 1, rightEye: 1, eyeStyle: 'smiling',
    mouth: 'M121 115V119M102 119Q120 142 140 118', brows: 'M82 79Q91 73 100 78M140 78Q150 73 158 79',
    leftPaw: 20, rightPaw: -20, pawY: -9, warmth: .8, energy: .5, complexity: .55, pacingSeconds: 26 },
  curious: { tilt: -13, headY: -1, gaze: 2.5, gazeY: -1, eyes: 1.45, rightEye: .8, eyeStyle: 'open',
    mouth: 'M121 115V122M113 127Q121 126 130 122', brows: 'M82 77Q91 70 101 76M141 83Q149 81 157 84',
    leftPaw: 15, rightPaw: 25, pawY: 1, warmth: .4, energy: .4, complexity: .4, pacingSeconds: 28 },
};

const bounded = (value: number | undefined, fallback: number, min = 0, max = 1) =>
  value === undefined || !Number.isFinite(value) ? fallback : Math.min(max, Math.max(min, value));

export function resolvePeterPresentation(state: PeterState, appearance: PeterAppearance = {}) {
  const preset = presets[state];
  return {
    ...preset,
    warmth: bounded(appearance.warmth, preset.warmth),
    // Grounding/listening always retain a quiet floor, even with future preferences.
    energy: state === 'grounding' || state === 'listening' ? 0 : bounded(appearance.energy, preset.energy),
    complexity: Math.min(state === 'grounding' ? .15 : 1, bounded(appearance.complexity, preset.complexity)),
    pacingSeconds: bounded(appearance.pacingSeconds, preset.pacingSeconds, 24, 40),
  };
}
