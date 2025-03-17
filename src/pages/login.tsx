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
  }, [user, loading, router]);

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
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-indigo-700">Sparq</h1>
          </div>
        </header>
        
        <main className="flex-grow flex flex-col lg:flex-row">
          {/* Left Side - Authentication Form */}
          <motion.div 
            className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
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
            className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-12 flex-col justify-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6">
                {isRegisterMode 
                  ? "Transform Your Relationship" 
                  : "Welcome Back to Your Journey"
                }
              </h2>
              
              <p className="text-xl mb-8 text-indigo-100 leading-relaxed">
                {isRegisterMode
                  ? "Join thousands of couples who have discovered the power of psychological techniques to deepen their connection and understanding."
                  : "Continue your relationship journey. Each session builds upon your previous insights, creating a more profound connection with your partner."
                }
              </p>
            </motion.div>
            
            <motion.div 
              className="space-y-6"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold mb-4">What Others Are Saying</h3>
              
              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="italic mb-2 text-sm">"{testimonial.quote}"</p>
                    <p className="text-xs font-medium flex justify-between">
                      <span>{testimonial.name}</span>
                      <span className="text-indigo-200">{testimonial.relationship}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-12 border-t border-indigo-500 pt-6"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold mb-3">Why Sparq Works</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Grounded in proven psychological techniques</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized to your relationship dynamics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-300 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Builds lasting neural pathways for better connection</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </main>
        
        <footer className="bg-white py-4 text-center text-gray-500 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Sparq Relationship Lab. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
} 