import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader } from 'lucide-react';

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

        setTimeout(() => {
          router.push(isRegisterMode ? '/onboarding-flow' : '/dashboard');
        }, 1500);
      } else {
        const errMsg = result.error || '';
        const isNoAccount =
          /invalid login credentials/i.test(errMsg) ||
          /invalid_credentials/i.test(errMsg) ||
          /user not found/i.test(errMsg) ||
          /no user found/i.test(errMsg);

        if (!isRegisterMode && isNoAccount && onToggleMode) {
          onToggleMode();
          setError("No account found for that email. Please create one below.");
        } else {
          setError(errMsg || 'An error occurred. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
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
      className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <motion.h2 
        className="text-2xl font-bold text-center text-brand-primary mb-6"
        variants={itemVariants}
      >
        {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
      </motion.h2>

      {error && (
        <motion.div 
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          className="bg-green-50 border-l-4 border-green-500 p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-green-700 text-sm">{successMessage}</p>
        </motion.div>
      )}

      {showConsent && !consentGiven && (
        <motion.div
          className="bg-brand-linen border border-brand-primary/20 rounded-lg p-5 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h3 className="text-sm font-semibold text-brand-hover mb-3">Before we get started</h3>
          <div className="text-sm text-brand-primary space-y-2 mb-4">
            <p>Sparq uses AI to personalize your experience and help you build a stronger relationship.</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-brand-primary">
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
              className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover text-sm font-medium"
            >
              I understand, create my account
            </button>
            <button
              type="button"
              onClick={() => setShowConsent(false)}
              className="px-4 py-2 text-sm text-brand-primary hover:text-brand-hover"
            >
              Back
            </button>
          </div>
          <p className="mt-3 text-xs text-brand-primary/80">
            By continuing, you agree to our{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </motion.div>
      )}

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants}>
        {isRegisterMode && (
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Enter your name"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {isRegisterMode && (
          <motion.div variants={itemVariants}>
            <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 mb-1">
              Partner&apos;s Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="partnerName"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Enter your partner's name"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
              placeholder="Enter your email"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 pr-10 border rounded-md focus:ring-brand-primary focus:border-brand-primary"
              placeholder={isRegisterMode ? "Create a password" : "Enter your password"}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {isRegisterMode && (
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-200 flex items-center justify-center"
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
        <p className="text-gray-600">
          {isRegisterMode 
            ? 'Already have an account?' 
            : "Don't have an account yet?"}
          <button
            type="button"
            onClick={onToggleMode}
            className="ml-1 text-brand-primary hover:text-brand-hover font-medium"
          >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </motion.div>
      
      <motion.div 
        className="mt-8 text-center text-xs text-gray-500"
        variants={itemVariants}
      >
        <p>
          By {isRegisterMode ? 'creating an account' : 'signing in'}, you agree to our{' '}
          <a href="#" className="text-brand-primary hover:text-brand-hover">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-brand-primary hover:text-brand-hover">
            Privacy Policy
          </a>
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
