import type { NextApiRequest } from 'next';
import OpenAI from 'openai';

export type CrisisType =
  | 'self_harm'
  | 'violence_or_abuse'
  | 'child_harm'
  | 'illegal_surveillance'
  | 'acute_distress';

export interface CrisisDetectionResult {
  triggered: boolean;
  types: CrisisType[];
  matches: string[];
}

type Resource = {
  label: string;
  phone?: string;
  text?: string;
  website?: string;
};

const CRISIS_PATTERNS: Record<CrisisType, RegExp[]> = {
  self_harm: [
    /\b(kill myself|want to die|suicide|end my life|hurt myself)\b/i,
  ],
  violence_or_abuse: [
    /\b(hit me|he hit me|she hit me|afraid of my partner|domestic violence|coercive control|threatening me)\b/i,
  ],
  child_harm: [
    /\b(hurt my child|hurt their child|abuse (a )?child|child is unsafe)\b/i,
  ],
  illegal_surveillance: [
    /\b(track (them|my partner)|spy on (them|my partner)|hack (their|my partner'?s) phone|install spyware)\b/i,
  ],
  acute_distress: [
    /\b(panic attack|can'?t breathe|i am not safe right now|dissociating|i feel out of control)\b/i,
  ],
};

const CRISIS_RESOURCES: Record<string, Resource[]> = {
  US: [
    { label: 'Emergency services', phone: '911' },
    { label: '988 Suicide & Crisis Lifeline', phone: '988', website: 'https://988lifeline.org/' },
    { label: 'National Domestic Violence Hotline', phone: '1-800-799-7233', text: 'Text START to 88788', website: 'https://www.thehotline.org/' },
  ],
  CA: [
    { label: 'Emergency services', phone: '911' },
    { label: 'Talk Suicide Canada', phone: '1-833-456-4566', text: 'Text 45645', website: 'https://talksuicide.ca/' },
    { label: 'ShelterSafe (domestic violence)', website: 'https://www.sheltersafe.ca/' },
  ],
  UK: [
    { label: 'Emergency services', phone: '999' },
    { label: 'Samaritans', phone: '116 123', website: 'https://www.samaritans.org/' },
    { label: 'Refuge National Domestic Abuse Helpline', phone: '0808 2000 247', website: 'https://www.nationaldahelpline.org.uk/' },
  ],
  AU: [
    { label: 'Emergency services', phone: '000' },
    { label: 'Lifeline Australia', phone: '13 11 14', website: 'https://www.lifeline.org.au/' },
    { label: '1800RESPECT', phone: '1800 737 732', website: 'https://www.1800respect.org.au/' },
  ],
  NZ: [
    { label: 'Emergency services', phone: '111' },
    { label: '1737 Need to Talk?', phone: '1737', website: 'https://1737.org.nz/' },
    { label: 'Shine (family violence)', phone: '0508 744 633', website: 'https://www.2shine.org.nz/' },
  ],
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function detectCrisisIntent(text: string): Promise<CrisisDetectionResult> {
  if (!text?.trim()) return { triggered: false, types: [], matches: [] };

  const types: CrisisType[] = [];
  const matches: string[] = [];

  // 1. Static Regex checks
  for (const [type, patterns] of Object.entries(CRISIS_PATTERNS) as [CrisisType, RegExp[]][]) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (!types.includes(type)) types.push(type);
        if (match[0]) matches.push(match[0]);
      }
    }
  }

  // 2. OpenAI Moderation API — only call if regex didn't already trigger
  //    and OPENAI_API_KEY is configured. Skipped to stay within Vercel
  //    serverless timeout on Hobby plan; regex patterns cover critical cases.
  if (types.length === 0 && process.env.OPENAI_API_KEY) {
    try {
      const response = await openai.moderations.create({ input: text });
      const result = response.results[0];

      if (result.flagged) {
        const categories = result.categories as unknown as Record<string, boolean>;

        if (categories['self-harm'] || categories['self-harm/intent'] || categories['self-harm/instructions']) {
          types.push('self_harm');
        }

        if (categories['violence'] || categories['violence/graphic']) {
          types.push('violence_or_abuse');
        }

        if (categories['sexual/minors']) {
          types.push('child_harm');
        }
      }
    } catch (error) {
      console.error('Moderation API failed, relying on regex fallback', error);
    }
  }

  return {
    triggered: types.length > 0,
    types,
    matches,
  };
}

export function resolveCountryCode(req?: NextApiRequest): string {
  const headerCountry = req?.headers['x-vercel-ip-country'];
  if (typeof headerCountry === 'string' && headerCountry.length === 2) {
    return headerCountry.toUpperCase();
  }
  return 'US';
}

export function getCrisisResources(countryCode: string): Resource[] {
  return CRISIS_RESOURCES[countryCode] || CRISIS_RESOURCES.US;
}

function getEmergencyLine(countryCode: string): string {
  if (countryCode === 'UK') return '999';
  if (countryCode === 'AU') return '000';
  if (countryCode === 'NZ') return '111';
  return '911';
}

export function buildCrisisResponse(countryCode: string, types: CrisisType[]): string {
  const emergencyLine = getEmergencyLine(countryCode);
  const resources = getCrisisResources(countryCode)
    .map(r => {
      const details = [r.phone, r.text, r.website].filter(Boolean).join(' | ');
      return details ? `- ${r.label}: ${details}` : `- ${r.label}`;
    })
    .join('\n');

  const riskNote = types.includes('violence_or_abuse')
    ? "If there's any immediate danger, your safety comes first."
    : "If you feel you might harm yourself or someone else, please get immediate real-world support now.";

  return `I care about your safety, and this needs immediate support from a real person right now.

${riskNote} Call emergency services (${emergencyLine}) now if there's urgent risk.

Here are support options in your area:
${resources}

I can stay with you while you take the next safe step, but I can't safely continue normal relationship coaching in this moment.`;
}

