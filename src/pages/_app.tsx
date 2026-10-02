import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from '../lib/auth-context';
import { SubscriptionProvider } from '../lib/subscription-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomNav } from '../components/bottom-nav';
import { PageTransition } from '../components/PageTransition';
import { PeterLoading } from '../components/PeterLoading';
import { TimeOutOverlay } from '../components/TimeOutOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { reportPrimaryPathClientError, shouldReportPrimaryPathRouteError } from '@/lib/beta/primaryPath';
import '../styles/globals.css';
import '../styles/emotion.css';
import { VisualEmotionProvider } from '@/components/emotion/VisualEmotionProvider';
import { EmotionalEnvironment } from '@/components/emotion/EmotionalEnvironment';

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
    // Only show the full-screen loader when a page is genuinely slow. Most
    // navigations (every bottom-nav tap) finish well under this, and a loader
    // that flashes on every tap feels slower than no loader at all.
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    const clearSlowTimer = () => {
      if (slowTimer) clearTimeout(slowTimer);
      slowTimer = null;
    };

    const handleStart = (_url: string, { shallow }: { shallow: boolean }) => {
      if (shallow) return; // same page, just a query change (e.g. sign in ↔ create account)
      clearSlowTimer();
      slowTimer = setTimeout(() => setIsLoading(true), 400);
    };

    const handleComplete = () => {
      clearSlowTimer();
      setIsLoading(false);
    };

    const handleRouteError = (error: unknown, url: string) => {
      clearSlowTimer();
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
      clearSlowTimer();
    };
  }, [router.events]);

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        {/* viewport-fit=cover lets safe-area insets work (bottom nav, notch);
            resizes-content makes the Android keyboard shrink the layout like iOS.
            Zoom stays allowed — never disable it. */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
        <meta name="theme-color" content="#FAF7F2" />
      </Head>
      {/* reducedMotion="user": people who turn on "reduce motion" get fades
          instead of movement, across every Framer Motion animation. */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <SubscriptionProvider>
            <VisualEmotionProvider>
              <div
                className={`${sans.variable} ${editorialSerif.variable} texture-bg min-h-dvh bg-brand-linen font-sans text-brand-text-primary selection:bg-brand-primary/20 selection:text-brand-espresso`}
              >
                <EmotionalEnvironment>
                  <PeterLoading isLoading={isLoading} />
                  <TimeOutOverlay />
                  <div className={['/', '/login', '/signup'].includes(router.pathname) ? undefined : 'pb-20'}>
                    <ErrorBoundary resetKey={router.asPath}>
                      <PageTransition>
                        <Component {...pageProps} />
                      </PageTransition>
                    </ErrorBoundary>
                  </div>
                  <BottomNav />
                </EmotionalEnvironment>
              </div>
            </VisualEmotionProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
