import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { LoginForm } from '../components/auth/LoginForm';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { SparqLogo } from '@/components/brand/SparqMark';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <Head>
        <title>{isRegisterMode ? 'Join Sparq' : 'Welcome Back'} - Sparq Relationship Lab</title>
        <meta
          name="description"
          content="Build calmer habits and better talks with simple daily support from Sparq."
        />
      </Head>

      <div className="min-h-dvh bg-brand-linen flex flex-col font-sans selection:bg-brand-primary/30">
        <header className="bg-transparent absolute top-0 inset-x-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <h1 className="flex items-center w-fit">
              <SparqLogo />
            </h1>
          </div>
        </header>

        <main className="flex-grow flex flex-col lg:flex-row relative">
          {/* Left Side - Authentication Form */}
          <motion.div
            className="w-full lg:w-1/2 flex-grow flex items-center justify-center p-6 lg:p-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="w-full max-w-md">
              <LoginForm
                onToggleMode={toggleMode}
                isRegisterMode={isRegisterMode}
              />
            </div>
          </motion.div>

          {/* Right Side - Welcome copy */}
          <motion.div
            className="hidden lg:flex lg:w-1/2 bg-popover border-l border-border p-12 lg:p-24 flex-col justify-center relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-foreground">
                {isRegisterMode
                  ? "Start Small"
                  : "Welcome Back"
                }
              </h2>

              <p className="text-lg mb-12 text-brand-text-secondary leading-relaxed max-w-lg">
                {isRegisterMode
                  ? "Start with one small step. Build calmer talks and stronger habits over time."
                  : "Come back to your next step."
                }
              </p>
            </motion.div>

            <motion.div
              className="mt-16 border-t border-border pt-8 relative z-10"
              variants={itemVariants}
            >
              <h3 className="text-sm font-semibold text-brand-text-secondary mb-5">How Sparq helps</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Simple steps based on real psychology</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Helps you spot the same old loops</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Turns small reps into real change</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </main>

        <footer className="bg-transparent py-8 text-center text-brand-text-secondary text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Sparq</p>
          </div>
        </footer>
      </div>
    </>
  );
} 
