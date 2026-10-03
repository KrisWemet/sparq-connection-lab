import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import { buildAuthedHeaders } from '@/lib/api-auth';
import { markPrimarySignupDrivenPath, reportPrimaryPathClientError, trackPrimaryPathClientEvent } from '@/lib/beta/primaryPath';

interface LoginFormProps {
  onToggleMode?: () => void;
  isRegisterMode?: boolean;
}

export function LoginForm({ onToggleMode, isRegisterMode = false }: LoginFormProps) {
  const { login, register, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    partnerName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  // Clear error message when form data changes or mode changes
  useEffect(() => {
    setError('');
  }, [formData, isRegisterMode]);

  // Reset consent state when switching modes
  useEffect(() => {
    setShowConsent(false);
    setConsentGiven(false);
  }, [isRegisterMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      if (isRegisterMode && !formData.name) {
        setError('Please enter your name');
        setIsSubmitting(false);
        return;
      }

      // Show consent screen before first registration attempt
      if (isRegisterMode && !consentGiven) {
        setShowConsent(true);
        setIsSubmitting(false);
        return;
      }

      let result;

      if (isRegisterMode) {
        // Register new user
        result = await register(
          formData.email,
          formData.password,
          {
            name: formData.name,
            partner_name: formData.partnerName
          }
        );
      } else {
        // Login existing user
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        setSuccessMessage(isRegisterMode ? 'Account created! Setting up your experience...' : 'Login successful!');

        if (isRegisterMode) {
          const signupSource = router.query.source === 'signup' ? 'signup' : 'register';
          markPrimarySignupDrivenPath(signupSource);
          void trackPrimaryPathClientEvent('beta_primary_signup_register_success', {
            stage: 'register_success',
            entry_source: signupSource,
          });
          try {
            const headers = await buildAuthedHeaders({ 'Content-Type': 'application/json' });
            await fetch('/api/preferences', {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                grant_consent: true,
                consent_source: 'login_register_flow',
              }),
            });
          } catch (consentError) {
            console.error('Consent save error:', consentError);
          }
        }

        setTimeout(() => {
          router.push(isRegisterMode ? '/onboarding' : '/dashboard');
        }, 1500);
      } else {
        setError(friendlyAuthError(result.error || '', isRegisterMode));
      }
    } catch (err) {
      void reportPrimaryPathClientError('login_form_submit', err, {
        is_register_mode: isRegisterMode,
      });
      setError(friendlyAuthError(err instanceof Error ? err.message : '', isRegisterMode));
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <motion.h1
        className="font-serif text-4xl font-medium text-center text-brand-primary mb-7"
        variants={itemVariants}
      >
        {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
      </motion.h1>

      {error && (
        <motion.div 
          className="bg-destructive-subtle border-l-4 border-destructive p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-destructive-emphasis text-sm">{error}</p>
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          className="bg-success-subtle border-l-4 border-success p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-success-emphasis text-sm">{successMessage}</p>
        </motion.div>
      )}

      {showConsent && !consentGiven && (
        <motion.div
          className="bg-brand-linen border border-brand-primary/20 rounded-lg p-5 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3 className="text-sm font-semibold text-brand-hover mb-3">Before we get started</h3>
          <div className="text-sm text-brand-hover space-y-2 mb-4">
            <p>Sparq uses AI to personalize your experience and help you build a stronger relationship.</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-brand-hover">
              <li>Your journals and reflections are private and encrypted</li>
              <li>Peter (your AI guide) learns from your conversations to give better support</li>
              <li>In crisis moments, safety resources are always prioritized</li>
              <li>You can view, correct, or delete what Peter has learned about you at any time</li>
              <li>You can export or delete all your data from Settings</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setConsentGiven(true);
                setShowConsent(false);
                // Auto-submit the form after consent
                setTimeout(() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }, 100);
              }}
              className="press flex-1 bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover text-sm font-bold"
            >
              I understand, create my account
            </button>
            <button
              type="button"
              onClick={() => setShowConsent(false)}
              className="press px-4 py-2 text-sm text-brand-hover hover:text-brand-espresso"
            >
              Back
            </button>
          </div>
          <p className="mt-3 text-xs text-brand-hover">
            <Link href="/how-sparq-works" className="underline">How Sparq works and what happens to your data</Link>
          </p>
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants}>
        {isRegisterMode && (
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-ring focus:border-ring bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
                placeholder="Enter your name"
              />
              <div className="absolute left-3 top-2.5 text-brand-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {isRegisterMode && (
          <motion.div variants={itemVariants}>
            <label htmlFor="partnerName" className="block text-sm font-medium text-foreground mb-1">
              Partner&apos;s Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="partnerName"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-ring focus:border-ring bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
                placeholder="Enter your partner's name"
              />
              <div className="absolute left-3 top-2.5 text-brand-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-ring focus:border-ring bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
              placeholder="Enter your email"
            />
            <div className="absolute left-3 top-2.5 text-brand-text-secondary">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 pr-10 border rounded-md focus:ring-ring focus:border-ring bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background border-input"
              placeholder={isRegisterMode ? "Create a password" : "Enter your password"}
            />
            <div className="absolute left-3 top-2.5 text-brand-text-secondary">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              className="press absolute right-0 top-0 w-12 h-12 flex items-center justify-center rounded-xl text-brand-text-secondary hover:text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {isRegisterMode ? (
            <p className="mt-1 text-xs text-brand-text-secondary">
              Password must be at least 8 characters long
            </p>
          ) : (
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm font-semibold text-brand-hover hover:text-brand-espresso">
                Forgot your password?
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="press w-full min-h-[48px] bg-brand-primary text-white py-2 px-4 rounded-2xl hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition duration-200 flex items-center justify-center font-bold"
          >
            {isSubmitting || loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {isRegisterMode ? 'Create Account' : 'Sign In'} 
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>

      <motion.div 
        className="mt-6 text-center text-sm"
        variants={itemVariants}
      >
        <p className="text-muted-foreground">
          {isRegisterMode 
            ? 'Already have an account?' 
            : "Don't have an account yet?"}
          <button
            type="button"
            onClick={onToggleMode}
            className="press min-h-[44px] ml-1 text-brand-hover hover:text-brand-espresso font-medium"
          >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </motion.div>
      
      <motion.div 
        className="mt-8 text-center text-xs text-brand-text-secondary"
        variants={itemVariants}
      >
        <p>
          Your journal and reflections stay private.{' '}
          <Link href="/how-sparq-works" className="text-brand-hover underline hover:text-brand-espresso">
            How Sparq works
          </Link>
        </p>
        
        {isRegisterMode && (
          <motion.p 
            className="mt-4 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Creating an account is the first step toward a more connected relationship
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}

// Plain-language auth errors — never show raw library text to users (CLAUDE.md).
// Supabase answers "invalid login credentials" for both a wrong password and an
// unknown email, so sign-in never claims the account doesn't exist.
function friendlyAuthError(raw: string, isRegisterMode: boolean): string {
  const msg = raw.toLowerCase();
  if (/fetch|network|timeout|failed to load/.test(msg)) return "We couldn't reach Sparq. Check your connection and try again.";
  if (/already registered|already exists|user_already_exists/.test(msg)) return 'There is already an account with that email. Try signing in instead.';
  if (/invalid login|invalid_credentials|user not found|no user found/.test(msg)) return "That email and password don't match. Try again, or reset your password.";
  if (/email not confirmed/.test(msg)) return 'Please confirm your email first — check your inbox for the link.';
  if (/password/.test(msg) && /(short|least|weak)/.test(msg)) return 'Please use a password with at least 8 characters.';
  if (/rate limit|too many/.test(msg)) return 'Too many tries in a row. Please wait a minute and try again.';
  return isRegisterMode ? "We couldn't create your account just now. Please try again." : "We couldn't sign you in just now. Please try again.";
}
