// API Configuration — uses Next.js process.env (server-side keys are NOT exposed to client)
// For OpenAI calls, use the server-side API route /api/date-ideas/generate instead.

interface ApiConfig {
  apiKeys: {
    google?: string;
  };
  endpoints: {
    dateIdeas: string;
    googlePlaces: string;
  };
}

export const apiConfig: ApiConfig = {
  apiKeys: {
    google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  },
  endpoints: {
    dateIdeas: '/api/date-ideas/generate',
    googlePlaces: 'https://maps.googleapis.com/maps/api/place',
  },
};
