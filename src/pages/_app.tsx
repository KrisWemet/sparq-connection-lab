import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { AuthProvider } from '../lib/auth-context';
import { SubscriptionProvider } from '../lib/subscription-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomNav } from '../components/bottom-nav';
import { PageTransition } from '../components/PageTransition';
import { PeterLoading } from '../components/PeterLoading';
import { TimeOutOverlay } from '../components/TimeOutOverlay';
import { reportPrimaryPathClientError, shouldReportPrimaryPathRouteError } from '@/lib/beta/primaryPath';
import '../styles/globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const editorialSerif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
});

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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleComplete = () => {
      setIsLoading(false);
    };

    const handleRouteError = (error: unknown, url: string) => {
      setIsLoading(false);
      if (!shouldReportPrimaryPathRouteError(error, url)) return;
      void reportPrimaryPathClientError('route_change', error, { url });
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleRouteError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleRouteError);
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <div
            className={`${sans.variable} ${editorialSerif.variable} texture-bg min-h-screen bg-brand-linen font-sans text-brand-text-primary selection:bg-brand-primary/20 selection:text-white`}
          >
            <PeterLoading isLoading={isLoading} />
            <TimeOutOverlay />
            <div className="pb-20"> {/* Add padding for BottomNav */}
              <PageTransition>
                <Component {...pageProps} />
              </PageTransition>
            </div>
            <BottomNav />
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
