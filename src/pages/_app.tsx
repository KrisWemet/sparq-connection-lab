
import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../lib/auth-context';
import { SubscriptionProvider } from '../lib/subscription-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Lazy-load Peter to avoid SSR issues and keep initial bundle small
const PeterAssistant = dynamic(
  () => import('@/components/peter/PeterAssistant'),
  { ssr: false }
);

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
        <SubscriptionProvider>
          <Component {...pageProps} />
          <PeterAssistant />
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
