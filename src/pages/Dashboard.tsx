
import { useEffect, useState } from "react";
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

const MOCK_DATA = {
  streak: 3,
  relationshipLevel: "Silver" as const,
  points: 215,
  pointsToNextLevel: 300,
  hasWeekendActivity: true,
  lastActivityCompleted: true,
  specialEvent: true
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showSocialProof, setShowSocialProof] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Use our custom analytics hook
  useAnalytics('dashboard');
  
  // Check if user needs to be redirected to onboarding
  const { isChecking } = useOnboardingRedirect();
  
  const streak = MOCK_DATA.streak;
  const badges = ["communication", "dedication"];
  
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
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="lg" label="Loading your relationship dashboard..." />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-24">
      <DashboardHeader />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-5">
        <AnimatePresence>
          {showConfetti && <ConfettiAnimation show={showConfetti} />}
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
          <motion.div variants={itemVariants}>
            <DailyConnectCard />
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
            <motion.div variants={itemVariants}>
              <WeekendSpecialCard />
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <DateIdeasCard />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <RelationshipJourneysCard hasSpecialEvent={MOCK_DATA.specialEvent} />
          </motion.div>
        </AnimatedList>
        
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <PartnerConnectionCard />
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
