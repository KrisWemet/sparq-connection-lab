
import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../lib/auth-context';
import { SubscriptionProvider } from '../lib/subscription-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { usePeterCheckin } from '@/hooks/usePeterCheckin';
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

/** Inner component so hooks can access AuthProvider context */
function AppInner({ Component, pageProps }: AppProps) {
  // Proactive check-ins — Peter nudges based on time, streak, and progress
  usePeterCheckin();

  return (
    <>
      <Component {...pageProps} />
      <PeterAssistant />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <AppInner {...props} />
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
