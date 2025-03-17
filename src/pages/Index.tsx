import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import MetaphorAnimation from '../components/MetaphorAnimation';
import { useState } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [showMetaphor, setShowMetaphor] = useState(false);
  const [currentMetaphor, setCurrentMetaphor] = useState<'bridge' | 'flower' | 'river'>('bridge');

  const handleShowMetaphor = (type: 'bridge' | 'flower' | 'river') => {
    setCurrentMetaphor(type);
    setShowMetaphor(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {showMetaphor && (
        <MetaphorAnimation
          metaphorKey={currentMetaphor}
          onComplete={() => setShowMetaphor(false)}
        />
      )}
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Sparq</h1>
          <div>
            {user ? (
              <Link href="/dashboard">
                <span className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer">
                  Go to Dashboard
                </span>
              </Link>
            ) : (
              <div className="space-x-4">
                <Link href="/login">
                  <span className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer">
                    Login
                  </span>
                </Link>
                <Link href="/login">
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors cursor-pointer">
                    Sign Up
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              Transform Your Relationship
              <span className="text-indigo-600"> Starting Today</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Experience deeper connection, improved communication, and a more fulfilling relationship through powerful psychological techniques that <span className="italic">actually work</span>.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <span className="px-8 py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium text-lg cursor-pointer">
                  Start Your Journey
                </span>
              </Link>
              <button 
                onClick={() => handleShowMetaphor('bridge')}
                className="px-8 py-4 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium text-lg"
              >
                Experience a Demo
              </button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Sparq Transforms Relationships</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our science-backed approach combines the latest in relationship psychology with proven persuasive techniques to create lasting change.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div 
                className="bg-indigo-50 p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow" 
                onClick={() => handleShowMetaphor('bridge')}
              >
                <h3 className="text-xl font-semibold text-indigo-700 mb-3">
                  Meaningful Communication
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn to truly hear and be heard by your partner, creating a bridge of understanding that grows stronger with every conversation.
                </p>
                <p className="text-indigo-600 font-medium">
                  Experience the bridge metaphor →
                </p>
              </div>
              
              <div 
                className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleShowMetaphor('flower')}
              >
                <h3 className="text-xl font-semibold text-purple-700 mb-3">
                  Nurture Intimacy
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover how to nurture the delicate bloom of intimacy with consistent attention and care, creating a relationship that continuously flourishes.
                </p>
                <p className="text-purple-600 font-medium">
                  Experience the flower metaphor →
                </p>
              </div>
              
              <div 
                className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleShowMetaphor('river')}
              >
                <h3 className="text-xl font-semibold text-blue-700 mb-3">
                  Navigate Challenges
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn to flow like water around obstacles, turning relationship challenges into opportunities for deeper connection and growth.
                </p>
                <p className="text-blue-600 font-medium">
                  Experience the river metaphor →
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Stories of Transformation</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Hear from couples who have experienced profound changes in their relationships through Sparq.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-4">
                    JM
                  </div>
                  <div>
                    <h3 className="font-medium">John & Maria</h3>
                    <p className="text-sm text-gray-500">Together 5 years</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Before Sparq, we were talking but not communicating. Now we truly understand each other, and our connection is deeper than ever before."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold mr-4">
                    SK
                  </div>
                  <div>
                    <h3 className="font-medium">Sarah & Kevin</h3>
                    <p className="text-sm text-gray-500">Together 3 years</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The metaphor exercises completely changed how we view our relationship. We now have a shared language that helps us navigate challenges together."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold mr-4">
                    LD
                  </div>
                  <div>
                    <h3 className="font-medium">Lisa & David</h3>
                    <p className="text-sm text-gray-500">Together 10 years</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "After years of feeling stuck, Sparq helped us rediscover each other. The future pacing exercises gave us a shared vision that we're excited to build together."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">Begin Your Transformation Today</h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of couples who have discovered a deeper, more fulfilling relationship through Sparq.
            </p>
            <Link href="/login">
              <span className="px-8 py-4 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium text-lg inline-block cursor-pointer">
                Start Your Free Journey
              </span>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-white">Sparq</h2>
              <p className="text-sm opacity-75">Transforming relationships through science and connection.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about">
                <span className="hover:text-white transition-colors cursor-pointer">About</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
              </Link>
              <Link href="/contact">
                <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm opacity-75">
            &copy; {new Date().getFullYear()} Sparq Connection Lab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
