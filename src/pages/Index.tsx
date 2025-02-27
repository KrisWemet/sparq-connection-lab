import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, AlertCircle, Heart, Sparkles, Target, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-provider";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 animate-pulse">
          <HeartHandshake className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Sparq Connect</h1>
          <p className="text-gray-600 mt-2">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-md">
                <HeartHandshake className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Sparq Connect
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Strengthen your relationship with meaningful conversations, shared goals, and science-backed activities.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-md px-8"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-md px-8"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Sparq Connect Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-blue-50 dark:bg-gray-800">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Daily Conversations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Thoughtfully crafted questions that help you connect on a deeper level with your partner.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-pink-50 dark:bg-gray-800">
              <div className="bg-pink-100 dark:bg-pink-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Relationship Journeys</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Science-backed paths that help you grow together through intentional activities and reflection.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-purple-50 dark:bg-gray-800">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Relationship Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress and gain insights into your relationship strengths and growth areas.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to strengthen your relationship?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who are deepening their connection and building stronger relationships.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-white text-indigo-600 hover:bg-white/90 text-md px-8"
          >
            Create Free Account
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <HeartHandshake className="w-6 h-6 text-primary mr-2" />
              <span className="font-semibold text-gray-900 dark:text-white">Sparq Connect</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Sparq Connect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

