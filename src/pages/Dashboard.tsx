
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/auth";
import { AnimatedList } from "@/components/ui/animated-container";
import { StreakIndicator } from "@/components/StreakIndicator";
import { SocialProofNotification } from "@/components/SocialProofNotification";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingRedirect } from "@/hooks/useOnboardingRedirect";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DailyConnectCard } from "@/components/dashboard/DailyConnectCard";
import { WeekendSpecialCard } from "@/components/dashboard/WeekendSpecialCard";
import { DateIdeasCard } from "@/components/dashboard/DateIdeasCard";
import { RelationshipJourneysCard } from "@/components/dashboard/RelationshipJourneysCard";
import { PartnerConnectionCard } from "@/components/dashboard/PartnerConnectionCard";
import { ConfettiAnimation } from "@/components/dashboard/ConfettiAnimation";
import { supabase } from "@/integrations/supabase/client";
import { UserBadge } from "@/types/profile";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05 // Reduced from 0.08 for faster animation
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 }, // Reduced from y: 20
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } // Reduced from 0.3 for faster animation
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showSocialProof, setShowSocialProof] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [relationshipLevel, setRelationshipLevel] = useState<"Bronze" | "Silver" | "Gold" | "Diamond">("Bronze");
  const [relationshipPoints, setRelationshipPoints] = useState(0);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(100);
  const [loading, setLoading] = useState(true);
  
  // Use our custom analytics hook
  useAnalytics('dashboard');
  
  // Check if user needs to be redirected to onboarding
  const { isChecking } = useOnboardingRedirect();
  
  // Fetch user data from Supabase - optimized with useCallback
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Perform parallel requests for better performance
      const [profileResponse, badgesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('streak_count, relationship_level, relationship_points')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('achieved', true)
      ]);
      
      if (profileResponse.error) throw profileResponse.error;
      if (badgesResponse.error) throw badgesResponse.error;
      
      const profileData = profileResponse.data;
      if (profileData) {
        setStreakCount(profileData.streak_count || 0);
        setRelationshipLevel(profileData.relationship_level as any || 'Bronze');
        setRelationshipPoints(profileData.relationship_points || 0);
        
        // Calculate points needed for next level
        if (profileData.relationship_level === 'Bronze') {
          setPointsToNextLevel(100);
        } else if (profileData.relationship_level === 'Silver') {
          setPointsToNextLevel(300);
        } else if (profileData.relationship_level === 'Gold') {
          setPointsToNextLevel(500);
        } else {
          setPointsToNextLevel(500); // Max level
        }
      }
      
      if (badgesResponse.data) {
        setBadges(badgesResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchUserData();
    
    // Set a timeout to force-show dashboard if loading takes too long
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 1500); // Reduced from 3000ms to 1500ms
    
    return () => clearTimeout(timeout);
  }, [fetchUserData]);
  
  // Show confetti on first load for celebration moments
  useEffect(() => {
    if (badges.some(badge => badge.achieved)) {
      const timer = setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000); // Reduced from 3000ms to 2000ms
      }, 300); // Reduced from 500ms to 300ms
      return () => clearTimeout(timer);
    }
  }, [badges]);
  
  // Show weekend activity toast after a short delay
  useEffect(() => {
    if (loading) return; // Don't show toast while loading
    
    const timer = setTimeout(() => {
      toast.success("Weekend activity unlocked! 🎉", {
        description: "A special activity to bring you closer has been unlocked! Don't miss it!",
        action: {
          label: "Let's go!",
          onClick: () => navigate("/quiz")
        },
        icon: "✨"
      });
    }, 1000); // Reduced from 2000ms to 1000ms
    
    return () => clearTimeout(timer);
  }, [navigate, loading]);
  
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="md" label="Loading your relationship dashboard..." />
      </div>
    );
  }
  
  // Rest of component stays the same
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      <DashboardHeader />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        <AnimatePresence>
          {showConfetti && <ConfettiAnimation show={showConfetti} />}
        </AnimatePresence>
        
        {streakCount > 0 && <StreakIndicator streak={streakCount} />}
        
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
          {badges.map(badge => (
            badge.achieved && (
              <motion.div 
                key={badge.id}
                variants={itemVariants} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <AchievementBadge 
                  type={badge.badge_type as any}
                  level={badge.badge_level as any}
                  achieved={badge.achieved}
                />
              </motion.div>
            )
          ))}
          
          {badges.length === 0 && (
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AchievementBadge type="communication" achieved={false} />
            </motion.div>
          )}
        </motion.div>
        
        <AnimatedList variant="slideUp" staggerDelay={0.06} className="space-y-4">
          <motion.div variants={itemVariants}>
            <DailyConnectCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RelationshipProgress 
              level={relationshipLevel}
              pointsEarned={relationshipPoints}
              pointsNeeded={pointsToNextLevel}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RelationshipInsightCard />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <WeekendSpecialCard />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <DateIdeasCard />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <RelationshipJourneysCard hasSpecialEvent={true} />
          </motion.div>
        </AnimatedList>
        
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <PartnerConnectionCard />
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
