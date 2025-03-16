
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Calendar, Activity, ChevronRight, Gift, Sparkles, Zap, Award, Star, Smile, Laugh } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";
import { motion, AnimatePresence } from "framer-motion";
import { StreakIndicator } from "@/components/StreakIndicator";
import { AchievementBadge } from "@/components/AchievementBadge";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { SocialProofNotification } from "@/components/SocialProofNotification";
import { toast } from "sonner";
import { colorThemes, emotionColors, animatedGradients } from "@/lib/colorThemes";
import { AnimatedList } from "@/components/ui/animated-container";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.9 },
  pulse: {
    scale: [1, 1.03, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Confetti animation for special events
const confettiVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02
    }
  }
};

const confettiPieceVariants = {
  hidden: { opacity: 0, y: 0, x: 0 },
  visible: (i: number) => ({
    opacity: [1, 0],
    y: [0, -100 - Math.random() * 100],
    x: [0, (Math.random() - 0.5) * 200],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 1 + Math.random(),
      ease: "easeOut"
    }
  })
};

const MOCK_DATA = {
  streak: 3,
  relationshipLevel: "Silver" as const,
  points: 215,
  pointsToNextLevel: 300,
  hasWeekendActivity: true,
  lastActivityCompleted: true,
  specialEvent: true
};

// Fun greeting messages for different times of day
const getGreeting = () => {
  const hour = new Date().getHours();
  const emojis = ["✨", "🌟", "💫", "💖", "🌈", "🚀", "😊", "🎉"];
  const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  
  if (hour < 12) return `Good morning ${randomEmoji()}`;
  if (hour < 17) return `Good afternoon ${randomEmoji()}`;
  return `Good evening ${randomEmoji()}`;
};

// Fun emoji pairs for partner references
const partnerEmojis = ["💕", "💘", "💞", "💓", "💗", "💖", "❤️", "🧡", "💛", "💚", "💙", "💜"];
const getPartnerEmoji = () => partnerEmojis[Math.floor(Math.random() * partnerEmojis.length)];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showSocialProof, setShowSocialProof] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const streak = MOCK_DATA.streak;
  const badges = ["communication", "dedication"];
  const greeting = getGreeting();
  const partnerEmoji = getPartnerEmoji();
  
  // Show confetti on first load for celebration moments
  useEffect(() => {
    if (MOCK_DATA.lastActivityCompleted) {
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    console.log("Dashboard visited:", new Date().toISOString());
    
    const timer = setTimeout(() => {
      toast.success("Weekend activity unlocked! 🎉", {
        description: "A special activity to bring you closer has been unlocked! Don't miss it!",
        action: {
          label: "Let's go!",
          onClick: () => navigate("/quiz")
        },
        icon: "✨"
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      {/* Header with animated gradient background */}
      <header className="bg-gradient-to-r from-primary-100 via-white to-primary-100 border-b bg-[length:200%_100%] animate-gradient-x">
        <motion.div 
          className="container max-w-lg mx-auto px-4 py-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-2xl font-bold text-gray-900 mb-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {greeting}
          </motion.h1>
          <motion.p 
            className="text-gray-600 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <span className="font-medium">{profile?.fullName || user?.email?.split('@')[0] || 'Partner'}</span>
            {profile?.partnerName && (
              <span className="flex items-center">
                <motion.span 
                  className="mx-1 text-red-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10, 
                    delay: 0.6 
                  }}
                >
                  {partnerEmoji}
                </motion.span>
                <span className="text-gray-600">{profile.partnerName}</span>
              </span>
            )}
          </motion.p>
        </motion.div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Confetti animation for celebrations */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div 
              className="fixed inset-0 pointer-events-none z-50"
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    top: "40%",
                    left: "50%",
                    backgroundColor: 
                      i % 5 === 0 ? emotionColors.joy :
                      i % 5 === 1 ? emotionColors.love :
                      i % 5 === 2 ? emotionColors.calm :
                      i % 5 === 3 ? emotionColors.growth :
                      emotionColors.passion
                  }}
                  variants={confettiPieceVariants}
                  custom={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {streak > 0 && <StreakIndicator streak={streak} />}
        
        {showSocialProof && (
          <SocialProofNotification 
            message="85% of couples who did today's question felt closer and more connected! 💗"
            icon="users"
            type="social"
          />
        )}
        
        <motion.div 
          className="flex flex-wrap gap-2 mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {badges.includes("communication") && (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AchievementBadge type="communication" level={2} />
            </motion.div>
          )}
          {badges.includes("dedication") && (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AchievementBadge type="dedication" level={1} />
            </motion.div>
          )}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <AchievementBadge type="connection" achieved={false} />
          </motion.div>
        </motion.div>
        
        <AnimatedList variant="slideUp" staggerDelay={0.08} className="space-y-4">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-primary/20 bg-gradient-to-br from-white to-primary-100 relative" 
              onClick={() => navigate("/quiz")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        Daily Connect 
                        <motion.span 
                          className="ml-1 inline-block text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          New!
                        </motion.span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        Answer today's fun question to strengthen your bond!
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "var(--primary)" }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ChevronRight className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
                
                {/* Fun animated decoration element */}
                <motion.div 
                  className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-primary/5 z-0"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <RelationshipProgress 
              level={MOCK_DATA.relationshipLevel}
              pointsEarned={MOCK_DATA.points}
              pointsNeeded={MOCK_DATA.pointsToNextLevel}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RelationshipInsightCard />
          </motion.div>
          
          {MOCK_DATA.hasWeekendActivity && (
            <motion.div
              variants={itemVariants}
              initial="initial"
              animate="pulse"
              variants={pulseVariants}
            >
              <Card 
                className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-amber-200 bg-gradient-to-br from-amber-50 to-white relative" 
                onClick={() => navigate("/date-ideas")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">Weekend Special</h3>
                          <motion.span 
                            className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span>Hurry! Ends Sunday</span>
                            <Zap className="h-3 w-3 ml-1" />
                          </motion.span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Exclusive fun activity to enjoy together this weekend!
                        </p>
                      </div>
                    </div>
                    <motion.div 
                      className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: "rgb(251, 191, 36)" }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <ChevronRight className="h-5 w-5 text-amber-500" />
                    </motion.div>
                  </div>
                  
                  {/* Decorative elements */}
                  <motion.div 
                    className="absolute right-0 bottom-0 h-24 w-16 opacity-10"
                    style={{ backgroundImage: "url('/placeholder.svg')" }}
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-green-50 relative" 
              onClick={() => navigate("/date-ideas")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Fun Date Ideas</h3>
                      <p className="text-sm text-gray-500">
                        Discover new exciting activities to enjoy together!
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgb(34, 197, 94)" }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ChevronRight className="h-5 w-5 text-green-600" />
                  </motion.div>
                </div>
                
                {/* Fun animated decoration */}
                <motion.div 
                  className="absolute right-4 bottom-0 opacity-10"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Smile className="h-10 w-10 text-green-800" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50 relative" 
              onClick={() => navigate("/journeys")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center">
                        Relationship Journeys
                        {MOCK_DATA.specialEvent && (
                          <motion.span 
                            className="ml-2 inline-block text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                          >
                            <span className="flex items-center">
                              <Star className="h-3 w-3 mr-0.5" />
                              New journey!
                            </span>
                          </motion.span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Start a guided adventure to strengthen your connection!
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, backgroundColor: "rgb(59, 130, 246)" }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  </motion.div>
                </div>
                
                {/* Decorative elements */}
                <motion.div 
                  className="absolute -right-6 -bottom-2 opacity-10"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 8, repeat: Infinity }}
                >
                  <Award className="h-16 w-16 text-blue-700" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatedList>
        
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          {!profile?.partnerName ? (
            <div className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-5 border shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Connect with your partner</h3>
                  <p className="text-sm text-gray-500">Invite them to join you on this exciting journey!</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate("/partner-invite")}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Invite Partner
                </Button>
              </motion.div>
              
              {/* Decorative background elements */}
              <motion.div 
                className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-pink-100 opacity-40 z-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute right-10 -top-6 h-16 w-16 rounded-full bg-purple-100 opacity-30 z-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-5 border shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    Connected with {profile.partnerName} {partnerEmoji}
                  </h3>
                  <p className="text-sm text-gray-500">Check out your partner's profile</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate("/partner-profile")}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"
                >
                  View Partner
                </Button>
              </motion.div>
              
              {/* Decorative background elements */}
              <motion.div 
                className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-purple-100 opacity-40 z-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, 0],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute right-10 -top-6 h-16 w-16 rounded-full bg-indigo-100 opacity-30 z-0"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
            </div>
          )}
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
