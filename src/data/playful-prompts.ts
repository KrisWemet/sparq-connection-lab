export type PlayfulPromptType = 'daily_spark' | 'favorite_us';

export type PlayfulPromptBucket =
  | 'connect_us'
  | 'delight_us'
  | 'make_us_laugh'
  | 'help_us_enjoy_each_other';

export interface PlayfulPrompt {
  id: string;
  type: PlayfulPromptType;
  bucket: PlayfulPromptBucket;
  prompt: string;
  hint: string;
  soloOk: boolean;
  partnerOptional: boolean;
  sendText: string;
}

export const DAILY_SPARK_PROMPTS: PlayfulPrompt[] = [
  {
    id: 'spark-soft-start',
    type: 'daily_spark',
    bucket: 'connect_us',
    prompt: 'Send one short text about something you still like about them.',
    hint: 'Keep it easy. One true line is enough.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'One thing I still like about you is how you make everyday life feel warmer.',
  },
  {
    id: 'spark-memory-smile',
    type: 'daily_spark',
    bucket: 'help_us_enjoy_each_other',
    prompt: 'Bring up one tiny memory that still makes you smile.',
    hint: 'Pick a small real moment, not the big perfect one.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'I keep smiling about that little memory we made together.',
  },
  {
    id: 'spark-curious-question',
    type: 'daily_spark',
    bucket: 'connect_us',
    prompt: 'Ask: what felt good in your day today?',
    hint: 'Just listen. You do not need to fix or teach anything.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'What felt good in your day today? I want to hear it.',
  },
  {
    id: 'spark-playful-compliment',
    type: 'daily_spark',
    bucket: 'delight_us',
    prompt: 'Give one playful compliment that still feels true.',
    hint: 'Sweet beats clever here.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'Tiny playful note: you are still very easy to like.',
  },
  {
    id: 'spark-laugh-question',
    type: 'daily_spark',
    bucket: 'make_us_laugh',
    prompt: 'Ask what silly thing always makes them laugh.',
    hint: 'A light moment counts too.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'Quick fun question: what silly thing always makes you laugh?',
  },
  {
    id: 'spark-proud-of-you',
    type: 'daily_spark',
    bucket: 'connect_us',
    prompt: 'Tell them one small thing you felt proud of them for this week.',
    hint: 'Real beats polished.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'One small thing I felt proud of you for this week is how you kept showing up.',
  },
];

export const FAVORITE_US_PROMPTS: PlayfulPrompt[] = [
  {
    id: 'favorite-us-easy',
    type: 'favorite_us',
    bucket: 'help_us_enjoy_each_other',
    prompt: 'What has felt easy between us lately?',
    hint: 'Look for the warm small thing, not the perfect thing.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'One thing I liked about us lately is how easy it felt to be around you.',
  },
  {
    id: 'favorite-us-laugh',
    type: 'favorite_us',
    bucket: 'make_us_laugh',
    prompt: 'What is one funny thing about us that you never want to lose?',
    hint: 'Inside jokes count. Weird little habits count too.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'One funny thing about us that I never want to lose is how we make each other laugh.',
  },
  {
    id: 'favorite-us-safe',
    type: 'favorite_us',
    bucket: 'connect_us',
    prompt: 'When did you feel most on the same team this week?',
    hint: 'Pick one moment that felt steady or kind.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'I keep thinking about a moment this week when we felt like the same team.',
  },
  {
    id: 'favorite-us-delight',
    type: 'favorite_us',
    bucket: 'delight_us',
    prompt: 'What little thing did they do that made your day better?',
    hint: 'Tiny details are often the best part.',
    soloOk: true,
    partnerOptional: true,
    sendText: 'One little thing you did made my day better, and I wanted you to know that.',
  },
];
