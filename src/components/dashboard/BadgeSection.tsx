
import React from "react";
import { motion } from "framer-motion";
import { AchievementBadge } from "@/components/AchievementBadge";
import { UserBadge } from "@/types/profile";

interface BadgeSectionProps {
  badges: UserBadge[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export function BadgeSection({ badges }: BadgeSectionProps) {
  return (
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
  );
}
