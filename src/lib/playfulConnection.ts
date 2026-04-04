import { buildAuthedHeaders } from '@/lib/api-auth';
import type { PlayfulPrompt } from '@/data/playful-prompts';

export interface PlayfulTodayResponse {
  dateKey: string;
  dailySpark: PlayfulPrompt | null;
  favoriteUs: PlayfulPrompt | null;
}

export async function fetchPlayfulConnectionToday(input: {
  dailySparkOffset?: number;
  favoriteUsOffset?: number;
} = {}): Promise<PlayfulTodayResponse> {
  const params = new URLSearchParams();

  if (typeof input.dailySparkOffset === 'number') {
    params.set('dailySparkOffset', String(input.dailySparkOffset));
  }
  if (typeof input.favoriteUsOffset === 'number') {
    params.set('favoriteUsOffset', String(input.favoriteUsOffset));
  }

  const headers = await buildAuthedHeaders();
  const query = params.toString();
  const response = await fetch(`/api/playful/today${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to load playful connection prompts');
  }

  return response.json();
}
