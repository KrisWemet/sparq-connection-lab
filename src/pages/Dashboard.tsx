import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Bell, Clock, Heart, Sparkles, Star, 
  TrendingUp, Trophy, Users, Calendar, ChevronRight 
} from 'lucide-react';
import { MetaphorAnimation } from '../components/MetaphorAnimation';
import { FuturePacing } from '../components/FuturePacing';
import { 
  futurePacingTimeframes, 
  metaphorDescriptions 
} from '../data/persuasiveContent';
import { mem0 } from '../lib/mem0';
import { 
  getRecentActivities, 
  getUserAchievements, 
  logActivity 
} from '../lib/supabase';

// SocialProofNotification component for subtle influence
function SocialProofNotification({ 
  message, 
  icon = 'users',
  type = 'social',
  onClick
}: {
  message: string;
  icon?: 'users' | 'time' | 'trending' | 'heart' | 'star' | 'award';
  type?: 'social' | 'urgency' | 'achievement' | 'scarcity' | 'upgrade';
  onClick?: () => void;
}) {
  const icons = {
    users: Users,
    time: Clock,
    trending: TrendingUp,
    heart: Heart,
    star: Star,
    award: Award
  };
  
  const Icon = icons[icon];
  
  const backgrounds = {
    social: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100",
    urgency: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100",
    achievement: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100",
    scarcity: "bg-gradient-to-r from-purple-50 to-fuchsia-50 border-purple-100",
    upgrade: "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100"
  };
  
  const iconColors = {
    social: "text-blue-500",
    urgency: "text-amber-500",
    achievement: "text-green-500",
    scarcity: "text-purple-500",
    upgrade: "text-indigo-500"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`${onClick ? "cursor-pointer" : ""} ${backgrounds[type]} border shadow-sm overflow-hidden rounded-lg p-3 mb-2 flex items-center space-x-2`}
    >
      <motion.div 
        className={`p-1.5 rounded-full bg-white/80 ${iconColors[type]}`}
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      
      <p className="text-xs text-gray-700">
        {message}
      </p>
    </motion.div>
  );
}

// StreakIndicator component for consistency reinforcement
function StreakIndicator({ 
  streak, 
  onCelebrate 
}: { 
  streak: number;
  onCelebrate?: () => void;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Trigger celebration animation on component mount if streak milestone
    if (streak > 0 && streak % 5 === 0) {
      setIsAnimating(true);
      if (onCelebrate) {
        onCelebrate();
      }
    }
  }, [streak, onCelebrate]);
  
  // Get message based on streak length
  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "You've started your journey!";
    if (streak < 5) return `${streak} days in a row - building momentum!`;
    if (streak < 10) return `${streak} day streak - you're dedicated!`;
    if (streak < 20) return `Impressive ${streak} day streak!`;
    return `Amazing ${streak} day streak - you're transforming your relationship!`;
  };
  
  return (
    <motion.div 
      className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-lg"
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, ease: "easeInOut" }}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-indigo-800">Your Streak</h3>
        <div className="bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
          {streak}
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-xs text-indigo-700">{getStreakMessage()}</p>
      </div>
      
      <div className="flex space-x-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const dayActive = i < (streak % 7);
          return (
            <motion.div 
              key={i}
              className={`h-3 flex-1 rounded-sm ${dayActive ? 'bg-indigo-600' : 'bg-gray-200'}`}
              animate={dayActive && isAnimating ? { 
                scaleY: [1, 1.5, 1],
                opacity: [1, 0.8, 1]
              } : {}}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showFuturePacing, setShowFuturePacing] = useState(false);
  const [activeNotification, setActiveNotification] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [suggestedActivity, setSuggestedActivity] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Load user data
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user?.id) {
      const loadData = async () => {
        // Get insights from Mem0
        const userInsights = await mem0.getInsights(user.id, profile || undefined);
        setInsights(userInsights);
        
        // Get recent activities
        const recentActivities = await getRecentActivities(user.id);
        setActivities(recentActivities);
        
        // Get achievements
        const userAchievements = await getUserAchievements(user.id);
        setAchievements(userAchievements);
        
        // Get personalized activity suggestion
        const activity = await mem0.suggestActivity(user.id, undefined, profile || undefined);
        setSuggestedActivity(activity);
      };
      
      loadData();
    }
  }, [user, profile, loading, router]);
  
  // Rotate notifications for subtle social proof
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotification(prev => (prev + 1) % socialProofMessages.length);
    }, 10000); // Rotate every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Social proof notification messages - using scarcity, social proof, and achievement motivation
  const socialProofMessages = [
    { 
      message: "85% of couples improved communication after 2 weeks of daily activities", 
      icon: 'users', 
      type: 'social' 
    },
    { 
      message: "7 new couples joined Sparq in the last hour", 
      icon: 'trending', 
      type: 'social' 
    },
    { 
      message: `You're in the top ${Math.floor(Math.random() * 30) + 10}% of active users this week!`, 
      icon: 'award', 
      type: 'achievement' 
    },
    { 
      message: "Special guided meditation unlocks after 5 consecutive days", 
      icon: 'star', 
      type: 'scarcity' 
    },
    { 
      message: "Only 3 days left to access this month's exclusive content", 
      icon: 'time', 
      type: 'urgency' 
    },
    { 
      message: "Premium users report 2x more relationship satisfaction", 
      icon: 'heart', 
      type: 'upgrade' 
    }
  ];
  
  // Connection score based on activities, achievements and personalized content
  const getConnectionScore = () => {
    const baseScore = 50; // Everyone starts at 50%
    const activityBonus = Math.min(20, activities.length * 2); // Up to 20% for activities
    const achievementBonus = Math.min(15, achievements.length * 3); // Up to 15% for achievements
    const streakBonus = Math.min(15, (profile?.streak_count || 0) * 1.5); // Up to 15% for streak
    
    return Math.min(100, Math.floor(baseScore + activityBonus + achievementBonus + streakBonus));
  };
  
  // Loading state with persuasive language
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">Preparing Your Relationship Insights</h2>
        <p className="text-gray-600 max-w-md text-center">
          Your personalized journey awaits. Notice how each moment of patience now
          builds toward deeper connection later...
        </p>
      </div>
    );
  }

  // If no user is found after loading
  if (!user) {
    return null; // This will be handled by the redirect
  }
  
  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
    
    // Show metaphor animation based on the metric selected
    if (metric === 'connectionScore') {
      setShowAnimation(true);
    } else if (metric === 'streakDays') {
      setShowFuturePacing(true);
    }
    
    // Log the activity
    logActivity({
      user_id: user.id,
      type: 'daily_question',
      content_id: `metric_${metric}`,
      completed_at: new Date().toISOString()
    });
  };
  
  const handleCelebrateStreak = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };
  
  const handleActivitySuggestion = async () => {
    // Get a new suggestion
    const activity = await mem0.suggestActivity(user.id, undefined, profile || undefined);
    setSuggestedActivity(activity);
    
    // Log the activity view
    logActivity({
      user_id: user.id,
      type: 'daily_question',
      content_id: 'activity_suggestion',
      completed_at: new Date().toISOString()
    });
  };
  
  const connectionScore = getConnectionScore();
  const userName = profile?.name || user.email?.split('@')[0] || 'User';
  const streakCount = profile?.streak_count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Confetti animation would go here - using placeholder */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-indigo-600"
              initial={{ 
                top: '-10px', 
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
              animate={{ 
                top: '110vh', 
                rotate: 360,
                scale: [1, 2, 0]
              }}
              transition={{ 
                duration: Math.random() * 4 + 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      {showAnimation && (
        <MetaphorAnimation
          title={metaphorDescriptions.bridge.title}
          description={metaphorDescriptions.bridge.description} 
          metaphorType="bridge"
          onComplete={() => setShowAnimation(false)}
        />
      )}
      
      {showFuturePacing && (
        <FuturePacing
          title="Your Relationship Future"
          description="Envision how your consistent practice transforms your relationship over time"
          timeframes={futurePacingTimeframes[0].timeframes}
          onComplete={() => setShowFuturePacing(false)}
        />
      )}
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Sparq</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {userName}</span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Section - Social Proof & Scarcity */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <SocialProofNotification 
              key={activeNotification}
              message={socialProofMessages[activeNotification].message}
              icon={socialProofMessages[activeNotification].icon as any}
              type={socialProofMessages[activeNotification].type as any}
            />
          </AnimatePresence>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Relationship Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedMetric === 'connectionScore' ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => handleMetricClick('connectionScore')}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Connection Score</h3>
                  <div className="text-3xl font-bold text-indigo-700">{connectionScore}<span className="text-lg text-gray-500">/100</span></div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                      initial={{ width: 0 }}
                      animate={{ width: `${connectionScore}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Tap to explore your connection</p>
                </div>
                
                <div 
                  className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedMetric === 'streakDays' ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => handleMetricClick('streakDays')}
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Day Streak</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-indigo-700 mr-2">{streakCount}</div>
                    <div className="flex items-center text-amber-500">
                      <Trophy className="h-5 w-5 mr-1" />
                      <motion.span
                        animate={streakCount > 0 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: 3, duration: 1 }}
                        className="text-sm font-medium"
                      >
                        {streakCount > 0 ? "Active Streak!" : "Start your streak!"}
                      </motion.span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Tap to visualize your future</p>
                </div>
              </div>
            </section>
            
            {selectedMetric && (
              <section className="mb-8">
                {selectedMetric === 'connectionScore' && (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-4">Connection Score</h3>
                    <p className="mb-4">Your connection score represents the depth and quality of your relationship communication patterns.</p>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${connectionScore}%` }}
                      ></div>
                    </div>
                    <p className="mt-4 text-gray-600">
                      <strong>{connectionScore} / 100</strong> - {connectionScore < 60 ? "Good start! Keep building meaningful interactions." : connectionScore < 80 ? "Great progress! You're developing meaningful communication patterns." : "Excellent! Your relationship shows strong signs of deep connection."}
                    </p>
                    <button
                      onClick={() => setShowAnimation(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Experience Connection Metaphor
                    </button>
                  </div>
                )}
              
                {selectedMetric === 'streakDays' && (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-4">Activity Streak</h3>
                    <p className="mb-4">You've maintained your relationship practice for <strong>{streakCount} day{streakCount !== 1 ? 's' : ''}</strong> in a row!</p>
                    <div className="flex space-x-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`h-8 w-4 rounded-sm ${i < streakCount ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        ></div>
                      ))}
                    </div>
                    <p className="mt-4 text-gray-600">
                      Keep going! Consistent small actions create profound relationship changes.
                    </p>
                    <button
                      onClick={() => setShowFuturePacing(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Visualize Your Future Together
                    </button>
                  </div>
                )}
              </section>
            )}
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Activities</h2>
              
              {activities.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-indigo-600 mb-3"
                  >
                    <Calendar className="h-12 w-12 mx-auto" />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">Start Your Journey Today</h3>
                  <p className="text-gray-600 mb-4">
                    Complete your first activity to begin tracking your relationship growth
                  </p>
                  <button
                    onClick={handleActivitySuggestion}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activities.slice(0, 5).map((activity) => (
                        <tr key={activity.id} className="hover:bg-indigo-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {activity.type === 'metaphor' ? 'Metaphor Visualization' : 
                               activity.type === 'futurePacing' ? 'Future Vision Exercise' : 
                               activity.type === 'hypnoticStory' ? 'Relationship Story' :
                               'Daily Question'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              {activity.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(activity.completed_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
          
          <div className="space-y-6">
            {/* Streak indicator - Commitment & Consistency */}
            <StreakIndicator streak={streakCount} onCelebrate={handleCelebrateStreak} />
            
            {/* Activity Suggestion - Micro-Commitments */}
            <div className="bg-white p-5 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-indigo-800">Today's Suggestion</h3>
                <button 
                  onClick={handleActivitySuggestion}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <RefreshIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-700 text-sm mb-4">{suggestedActivity}</p>
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
              >
                I'll Do This Today
              </button>
            </div>
            
            {/* Personal Insights - Personalization */}
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="font-semibold text-indigo-800 mb-3">Your Relationship Insights</h3>
              <ul className="space-y-2">
                {insights.slice(0, 4).map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <Sparkles className="h-4 w-4 text-indigo-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Achievements - Reward & Reinforcement */}
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h3 className="font-semibold text-indigo-800 mb-3">Achievements</h3>
              {achievements.length === 0 ? (
                <div className="text-center py-4">
                  <Trophy className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Complete activities to earn achievements</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <li key={achievement.id} className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <Award className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple Refresh Icon component
function RefreshIcon({ className = "h-6 w-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
