import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Inter, Lora } from 'next/font/google';
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

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

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
          <div className={`${inter.variable} ${lora.variable} font-sans min-h-screen bg-brand-linen text-brand-taupe selection:bg-brand-primary/30 texture-bg`}>
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
