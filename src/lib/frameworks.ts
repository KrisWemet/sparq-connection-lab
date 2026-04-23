/**
 * Canonical eight-pillar framework list for Sparq Connection.
 *
 * Source of truth for all framework/pillar references in the app.
 * Sprint 1 of the science upgrade retired NLP and Polyvagal as standalone pillars.
 * See sparq_science_upgrade_package/SPARQ_SCIENCE_UPGRADE_SPEC.md §2.3 for full rationale.
 */

export const FRAMEWORKS = [
  {
    slug: 'attachment',
    displayName: 'Attachment Theory',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Hazan & Shaver',
    institution: 'Cornell University / UC Davis',
    keycitation: 'Hazan, C., & Shaver, P. (1987). Journal of Personality and Social Psychology, 52, 511–524.',
  },
  {
    slug: 'gottman',
    displayName: 'Gottman Method',
    evidenceTier: 'strong' as const,
    leadResearcher: 'John Gottman',
    institution: 'University of Washington',
    keycitation: 'Gottman, J. M., & Levenson, R. W. (1992). Journal of Personality and Social Psychology, 63, 221–233.',
  },
  {
    slug: 'eft',
    displayName: 'Emotionally Focused Therapy',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Sue Johnson',
    institution: 'University of Ottawa',
    keycitation: 'Johnson, S. M., et al. (1999). Clinical Psychology: Science and Practice, 6, 67–79.',
  },
  {
    slug: 'cbt_cbct',
    displayName: 'Cognitive Behavioral Therapy / CBCT',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Baucom & Epstein',
    institution: 'UNC Chapel Hill',
    keycitation: 'Standard CBT literature; CBCT classified as well-established by APA.',
  },
  {
    slug: 'act',
    displayName: 'Acceptance and Commitment Therapy',
    evidenceTier: 'emerging' as const,
    leadResearcher: 'Steven Hayes',
    institution: 'University of Nevada, Reno',
    keycitation: 'Zarling, A., Lawrence, E., & Marchman, J. (2015). First couples RCT.',
  },
  {
    slug: 'neuroplasticity',
    displayName: 'Neuroplasticity & Habit Science',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Wendy Wood',
    institution: 'USC',
    keycitation: 'Wood, W., & Rünger, D. (2016). Annual Review of Psychology, 67, 289–314.',
  },
  {
    slug: 'positive_psychology',
    displayName: 'Positive Psychology & Relationship Science',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Harry Reis / Shelly Gable',
    institution: 'University of Rochester / UC Santa Barbara',
    keycitation: 'Gable, S. L., et al. (2004). Journal of Personality and Social Psychology, 87, 228–245.',
  },
  {
    slug: 'contemplative',
    displayName: 'Contemplative & Mindfulness-Based Practices',
    evidenceTier: 'strong' as const,
    leadResearcher: 'Barbara Fredrickson',
    institution: 'UNC Chapel Hill',
    keycitation: 'Hutcherson, C. A., et al. (2008). Emotion, 8, 720–724.',
  },
] as const;

export type FrameworkSlug = typeof FRAMEWORKS[number]['slug'];
export type EvidenceTier = typeof FRAMEWORKS[number]['evidenceTier'];
export type Framework = typeof FRAMEWORKS[number];

export function getFramework(slug: FrameworkSlug): Framework {
  const found = FRAMEWORKS.find((f) => f.slug === slug);
  if (!found) throw new Error(`Unknown framework slug: ${slug}`);
  return found;
}
