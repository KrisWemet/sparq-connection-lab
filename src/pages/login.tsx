import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth-context';
import { LoginForm } from '../components/auth/LoginForm';
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function LoginPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      quote: "Sparq has transformed how my partner and I communicate. We're more connected than ever.",
      name: "Sarah & Michael",
      relationship: "Together 4 years"
    },
    {
      id: 2,
      quote: "The subtle metaphor exercises completely changed my perspective on our relationship dynamics.",
      name: "David & Emma",
      relationship: "Married 2 years"
    },
    {
      id: 3,
      quote: "I was skeptical at first, but after just two weeks I noticed profound changes in how we relate to each other.",
      name: "Jordan & Taylor",
      relationship: "Dating 8 months"
    }
  ];

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
          content="Transform your relationship with powerful psychological techniques designed to deepen connection and understanding."
        />
      </Head>

      <div className="min-h-screen bg-brand-linen flex flex-col font-sans selection:bg-brand-primary/30">
        <header className="bg-transparent absolute top-0 inset-x-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              Sparq
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

          {/* Right Side - Persuasive Content and Testimonials */}
          <motion.div
            className="hidden lg:flex lg:w-1/2 bg-white border-l border-zinc-200 p-12 lg:p-24 flex-col justify-center relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-black">
                {isRegisterMode
                  ? "A Structured Approach"
                  : "Welcome Back"
                }
              </h2>

              <p className="text-lg mb-12 text-zinc-500 leading-relaxed max-w-lg">
                {isRegisterMode
                  ? "Join the forward-thinking individuals building profound relationships through structured communication."
                  : "Return to your active sessions and continue the work."
                }
              </p>
            </motion.div>

            <motion.div
              className="space-y-6 relative z-10"
              variants={itemVariants}
            >
              <h3 className="text-sm font-semibold text-zinc-400 mb-6">Observations</h3>

              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    className="bg-brand-linen border border-zinc-100 p-6 rounded-3xl"
                  >
                    <p className="italic mb-6 text-zinc-600 text-sm leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                    <p className="text-sm font-semibold tracking-tight flex justify-between items-center text-black">
                      <span>{testimonial.name}</span>
                      <span className="text-zinc-500 text-xs font-normal">{testimonial.relationship}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="mt-16 border-t border-zinc-200 pt-8 relative z-10"
              variants={itemVariants}
            >
              <h3 className="text-sm font-semibold text-zinc-400 mb-5">Methodology</h3>
              <ul className="space-y-4 text-sm text-zinc-600">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Clinical psychology frameworks</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Objective pattern recognition</span>
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-4" />
                  <span>Sustainable behavioral shifts</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </main>

        <footer className="bg-transparent py-8 text-center text-zinc-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Sparq</p>
          </div>
        </footer>
      </div>
    </>
  );
} 