
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Calendar, Activity, ChevronRight, Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";
import { motion } from "framer-motion";
import { StreakIndicator } from "@/components/StreakIndicator";
import { AchievementBadge } from "@/components/AchievementBadge";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { SocialProofNotification } from "@/components/SocialProofNotification";
import { toast } from "sonner";

// Animation variants for staggered animations
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

// Mock data - In a real app, this would come from an API
const MOCK_DATA = {
  streak: 3,
  relationshipLevel: "Silver" as const,
  points: 215,
  pointsToNextLevel: 300,
  hasWeekendActivity: true
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showSocialProof, setShowSocialProof] = useState(true);
  
  // In a real app, these would be fetched from an API
  const streak = MOCK_DATA.streak;
  const badges = ["communication", "dedication"];
  
  useEffect(() => {
    console.log("Dashboard visited:", new Date().toISOString());
    
    // Simulate a notification after a short delay
    const timer = setTimeout(() => {
      toast.success("New weekend activity available! 🎉", {
        description: "Explore a special activity designed to deepen your connection",
        action: {
          label: "View Now",
          onClick: () => navigate("/quiz")
        }
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      <header className="bg-gradient-to-r from-primary-100 to-white border-b">
        <motion.div 
          className="container max-w-lg mx-auto px-4 py-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-600 flex items-center">
            <span>{profile?.fullName || user?.email?.split('@')[0] || 'Partner'}</span>
            {profile?.partnerName && (
              <span className="flex items-center">
                <Heart className="h-4 w-4 mx-1 text-red-400" />
                <span className="text-gray-600">{profile.partnerName}</span>
              </span>
            )}
          </p>
        </motion.div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        {streak > 0 && <StreakIndicator streak={streak} />}
        
        {showSocialProof && (
          <SocialProofNotification 
            message="85% of couples who completed today's question reported improved connection."
            icon="users"
            type="social"
          />
        )}
        
        {/* Badges Section */}
        <motion.div 
          className="flex flex-wrap gap-2 mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {badges.includes("communication") && (
            <motion.div variants={itemVariants}>
              <AchievementBadge type="communication" level={2} />
            </motion.div>
          )}
          {badges.includes("dedication") && (
            <motion.div variants={itemVariants}>
              <AchievementBadge type="dedication" level={1} />
            </motion.div>
          )}
          <motion.div variants={itemVariants}>
            <AchievementBadge type="connection" achieved={false} />
          </motion.div>
        </motion.div>
        
        {/* Cards Section */}
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Daily Connect Card */}
          <motion.div variants={itemVariants}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-primary/20 bg-gradient-to-br from-white to-primary-100" 
              onClick={() => navigate("/quiz")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Daily Connect</h3>
                      <p className="text-sm text-gray-500">
                        Answer today's question to strengthen your bond
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Relationship Progress */}
          <motion.div variants={itemVariants}>
            <RelationshipProgress 
              level={MOCK_DATA.relationshipLevel}
              pointsEarned={MOCK_DATA.points}
              pointsNeeded={MOCK_DATA.pointsToNextLevel}
            />
          </motion.div>

          {/* Relationship Insights Card */}
          <motion.div variants={itemVariants}>
            <RelationshipInsightCard />
          </motion.div>
          
          {/* Weekend Activity Card (conditional) */}
          {MOCK_DATA.hasWeekendActivity && (
            <motion.div
              variants={itemVariants}
              className="animate-pulse"
            >
              <Card 
                className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-amber-200 bg-gradient-to-br from-amber-50 to-white" 
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
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Limited Time</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Exclusive activity to enjoy together this weekend
                        </p>
                      </div>
                    </div>
                    <div className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center">
                      <ChevronRight className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Date Ideas Card */}
          <motion.div variants={itemVariants}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-green-50" 
              onClick={() => navigate("/date-ideas")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Date Ideas</h3>
                      <p className="text-sm text-gray-500">
                        Discover new activities to enjoy together
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Relationship Journeys Card */}
          <motion.div variants={itemVariants}>
            <Card 
              className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50" 
              onClick={() => navigate("/journeys")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Relationship Journeys</h3>
                      <p className="text-sm text-gray-500">
                        Start a guided journey to strengthen specific areas
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Partner Connect Section */}
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {!profile?.partnerName ? (
            <div className="bg-gradient-to-r from-white to-pink-50 rounded-lg p-5 border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Connect with your partner</h3>
                  <p className="text-sm text-gray-500">Invite them to join you on this journey</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/partner-invite")}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm"
              >
                <Gift className="mr-2 h-4 w-4" />
                Invite Partner
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-white to-purple-50 rounded-lg p-5 border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Connected with {profile.partnerName}</h3>
                  <p className="text-sm text-gray-500">View your partner's profile</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/partner-profile")}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm"
              >
                View Partner
              </Button>
            </div>
          )}
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
