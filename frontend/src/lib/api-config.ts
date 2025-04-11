// API Configuration
interface ApiConfig {
  apiKeys: {
    openai?: string;
    google?: string;
    other?: string;
  };
  endpoints: {
    openai: string;
    googlePlaces: string;
  };
}

// Default configuration
export const apiConfig: ApiConfig = {
  apiKeys: {
    // Default to environment variables if available
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    google: import.meta.env.VITE_GOOGLE_API_KEY || '',
  },
  endpoints: {
    openai: 'https://api.openai.com/v1',
    googlePlaces: 'https://maps.googleapis.com/maps/api/place',
  }
};

// Function to update API keys
export function updateApiKey(service: 'openai' | 'google' | 'other', key: string): void {
  apiConfig.apiKeys[service] = key;
  
  // Store in localStorage for persistence
  try {
    const storedKeys = JSON.parse(localStorage.getItem('sparq-connect-api-keys') || '{}');
    localStorage.setItem('sparq-connect-api-keys', JSON.stringify({
      ...storedKeys,
      [service]: key
    }));
  } catch (error) {
    console.error('Failed to store API key:', error);
  }
}

// Function to load API keys from localStorage
export function loadApiKeys(): void {
  try {
    const storedKeys = JSON.parse(localStorage.getItem('sparq-connect-api-keys') || '{}');
    Object.entries(storedKeys).forEach(([service, key]) => {
      if (service in apiConfig.apiKeys) {
        apiConfig.apiKeys[service as keyof typeof apiConfig.apiKeys] = key as string;
      }
    });
  } catch (error) {
    console.error('Failed to load API keys:', error);
  }
}

// Initialize by loading stored keys
loadApiKeys(); 