// src/lib/onboarding/deriveProfile.ts
import type { RawScores, DerivedProfile, OnboardingProgress } from './types';

function deriveAttachmentStyle(scores: RawScores): DerivedProfile['attachmentStyle'] {
  // Disorganized is evaluated first as an override
  if (scores.trauma >= 5 && (scores.anxious >= 4 || scores.avoidant >= 4)) {
    return 'disorganized';
  }
  const max = Math.max(scores.anxious, scores.avoidant, scores.secure);
  if (max < 3) return 'secure'; // all low → default secure
  if (scores.anxious === max) return 'anxious';
  if (scores.avoidant === max) return 'avoidant';
  return 'secure';
}

function deriveLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'moderate';
  return 'high';
}

function deriveSelfWorth(score: number): 'stable' | 'conditional' | 'fragile' {
  if (score <= 3) return 'stable';
  if (score <= 6) return 'conditional';
  return 'fragile';
}

function deriveToneMode(
  attachmentStyle: DerivedProfile['attachmentStyle'],
  abandonmentFear: DerivedProfile['abandonmentFear'],
  selfWorthPattern: DerivedProfile['selfWorthPattern'],
  dysregulationLevel: DerivedProfile['dysregulationLevel'],
): DerivedProfile['toneMode'] {
  // Priority order: first match wins
  if (abandonmentFear === 'high' || selfWorthPattern === 'fragile' || dysregulationLevel === 'high') {
    return 'validation-first';
  }
  if (attachmentStyle === 'anxious' || attachmentStyle === 'disorganized') {
    return 'nurturing';
  }
  return 'collaborative';
}

function derivePrimaryModalities(
  attachmentStyle: DerivedProfile['attachmentStyle'],
  dysregulationLevel: DerivedProfile['dysregulationLevel'],
  abandonmentFear: DerivedProfile['abandonmentFear'],
  traumaFlag: boolean,
  conflictStyle: string,
): string[] {
  const modalities = new Set<string>();

  switch (attachmentStyle) {
    case 'anxious':
      modalities.add('EFT');
      modalities.add('DBT');
      break;
    case 'avoidant':
      modalities.add('ACT');
      modalities.add('IFS');
      break;
    case 'disorganized':
      modalities.add('Somatic');
      modalities.add('IFS');
      break;
    case 'secure':
      modalities.add('Positive Psychology');
      modalities.add('Gottman');
      break;
  }

  if (dysregulationLevel === 'high') modalities.add('DBT');
  if (abandonmentFear === 'high')    modalities.add('EFT');
  if (traumaFlag)                    modalities.add('Somatic');

  if (conflictStyle === 'validating') modalities.add('NVC');
  if (conflictStyle === 'avoidant')   modalities.add('ACT');

  return Array.from(modalities);
}

export function deriveProfile(progress: OnboardingProgress): DerivedProfile {
  const { scores } = progress;

  const attachmentStyle  = deriveAttachmentStyle(scores);
  const dysregulationLevel = deriveLevel(scores.dysregulation);
  const abandonmentFear  = deriveLevel(scores.abandonment);
  const selfWorthPattern = deriveSelfWorth(scores.selfWorth);
  const traumaFlag       = scores.trauma >= 5;
  const toneMode         = deriveToneMode(attachmentStyle, abandonmentFear, selfWorthPattern, dysregulationLevel);
  const primaryModalities = derivePrimaryModalities(
    attachmentStyle,
    dysregulationLevel,
    abandonmentFear,
    traumaFlag,
    progress.conflictStyle,
  );

  return {
    firstName:          progress.firstName,
    ageRange:           progress.ageRange,
    pronouns:           progress.pronouns,
    relationshipStatus: progress.relationshipStatus,
    partnerName:        progress.partnerName,
    relationshipLength: progress.relationshipLength,
    partnerUsing:       progress.partnerUsing,
    attachmentStyle,
    dysregulationLevel,
    abandonmentFear,
    selfWorthPattern,
    traumaFlag,
    primaryModalities,
    toneMode,
    loveLanguage:      progress.loveLanguage,
    conflictStyle:     progress.conflictStyle,
    lifeContext:       progress.lifeContext,
    checkInFrequency:  progress.checkInFrequency,
    growthGoal:        progress.growthGoal,
    scores,
    freeTextAnswers:   progress.freeTextAnswers,
    peterClosingSentence: '',
  };
}
