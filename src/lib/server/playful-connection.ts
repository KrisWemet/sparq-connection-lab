import {
  DAILY_SPARK_PROMPTS,
  FAVORITE_US_PROMPTS,
  PlayfulPrompt,
} from '@/data/playful-prompts';

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeOffset(value: unknown, length: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (length <= 0) return 0;
  return Math.floor(parsed) % length;
}

function pickPrompt(
  prompts: PlayfulPrompt[],
  seed: string,
  offset: unknown
): PlayfulPrompt | null {
  if (prompts.length === 0) return null;

  const baseIndex = hashString(seed) % prompts.length;
  const nextIndex = (baseIndex + normalizeOffset(offset, prompts.length)) % prompts.length;

  return prompts[nextIndex] || null;
}

export function getPlayfulConnectionToday(input: {
  userId: string;
  dateKey: string;
  dailySparkOffset?: unknown;
  favoriteUsOffset?: unknown;
}) {
  const { userId, dateKey, dailySparkOffset, favoriteUsOffset } = input;

  return {
    dateKey,
    dailySpark: pickPrompt(
      DAILY_SPARK_PROMPTS,
      `${userId}:${dateKey}:daily_spark`,
      dailySparkOffset
    ),
    favoriteUs: pickPrompt(
      FAVORITE_US_PROMPTS,
      `${userId}:${dateKey}:favorite_us`,
      favoriteUsOffset
    ),
  };
}
