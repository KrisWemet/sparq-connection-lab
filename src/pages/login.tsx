import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { LoginForm } from '../components/auth/LoginForm';
import Head from 'next/head';
import { SparqLogo } from '@/components/brand/SparqMark';
import Link from 'next/link';
import { AmbientScene } from '@/components/emotion/EmotionalEnvironment';
import { MetaphorVisual } from '@/components/emotion/MetaphorVisual';
import { emotionStyle } from '@/lib/visual-emotion';
import styles from '@/components/emotion/welcome.module.css';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    setIsRegisterMode(router.query.mode === 'register');
  }, [router.isReady, router.query.mode]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading && !isRegisterMode) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isRegisterMode]);

  const toggleMode = () => {
    const nextMode = !isRegisterMode;
    setIsRegisterMode(nextMode);
    router.replace(
      nextMode ? '/login?mode=register' : '/login',
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <Head>
        <title>{`${isRegisterMode ? 'Join Sparq' : 'Welcome Back'} - Sparq Relationship Lab`}</title>
        <meta
          name="description"
          content="Build calmer habits and better talks with simple daily support from Sparq."
        />
      </Head>

      <div className={styles.authPage} style={emotionStyle('onboarding')}>
        <AmbientScene quiet />
        <header className={styles.authHeader}>
          <Link href="/" aria-label="Sparq home" className="inline-flex"><SparqLogo /></Link>
        </header>
        <main>
          <div className={styles.authMain}>
            <div className={styles.authForm}>
              <LoginForm onToggleMode={toggleMode} isRegisterMode={isRegisterMode} />
            </div>
            <aside className={styles.authAside}>
              <MetaphorVisual kind={isRegisterMode ? 'bloom' : 'bridge'} />
              <p className={styles.eyebrow}>Room for your next small step</p>
              <h2>{isRegisterMode ? 'Start where you are.' : 'A little space to come back to.'}</h2>
              <p>{isRegisterMode ? 'A private practice. A little more understanding. Something you can build on, one day at a time.' : 'Bring the day you have had. Find a little room to reflect, reconnect, and begin again.'}</p>
            </aside>
          </div>
        </main>
        <footer className={styles.authFooter}>© {new Date().getFullYear()} Sparq</footer>
      </div>
    </>
  );
}
