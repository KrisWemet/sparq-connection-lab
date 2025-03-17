
import React from "react";
import { motion } from "framer-motion";
import { AnimatedList } from "@/components/ui/animated-container";
import { StreakIndicator } from "@/components/StreakIndicator";
import { SocialProofNotification } from "@/components/SocialProofNotification";
import { BadgeSection } from "@/components/dashboard/BadgeSection";
import { RelationshipProgress } from "@/components/RelationshipProgress";
import { RelationshipInsightCard } from "@/components/insights/RelationshipInsightCard";
import { ConfettiAnimation } from "@/components/dashboard/ConfettiAnimation";
import { DailyConnectCard } from "@/components/dashboard/DailyConnectCard";
import { WeekendSpecialCard } from "@/components/dashboard/WeekendSpecialCard";
import { DateIdeasCard } from "@/components/dashboard/DateIdeasCard";
import { RelationshipJourneysCard } from "@/components/dashboard/RelationshipJourneysCard";
import { PartnerConnectionCard } from "@/components/dashboard/PartnerConnectionCard";
import { UserBadge } from "@/types/profile";

interface DashboardContentProps {
  showConfetti: boolean;
  showSocialProof: boolean;
  streakCount: number;
  badges: UserBadge[];
  relationshipLevel: "Bronze" | "Silver" | "Gold" | "Diamond";
  relationshipPoints: number;
  pointsToNextLevel: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export function DashboardContent({
  showConfetti,
  showSocialProof,
  streakCount,
  badges,
  relationshipLevel,
  relationshipPoints,
  pointsToNextLevel
}: DashboardContentProps) {
  return (
    <>
      {showConfetti && <ConfettiAnimation show={showConfetti} />}
      
      {streakCount > 0 && <StreakIndicator streak={streakCount} />}
      
      {showSocialProof && (
        <SocialProofNotification 
          message="85% of couples who did today's question felt closer and more connected! 💗"
          icon="users"
          type="social"
        />
      )}
      
      <BadgeSection badges={badges} />
      
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
    </>
  );
}
