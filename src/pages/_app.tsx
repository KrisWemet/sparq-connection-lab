
import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../lib/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
