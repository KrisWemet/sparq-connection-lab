
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Heart, Trophy, Star, Award, Sparkles } from "lucide-react";

interface RelationshipProgressProps {
  level: "Bronze" | "Silver" | "Gold" | "Diamond";
  pointsEarned: number;
  pointsNeeded: number;
}

export function RelationshipProgress({ level, pointsEarned, pointsNeeded }: RelationshipProgressProps) {
  const progress = Math.min(Math.round((pointsEarned / pointsNeeded) * 100), 100);
  
  const levelColors = {
    Bronze: {
      gradient: "from-amber-300 to-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      icon: Trophy
    },
    Silver: {
      gradient: "from-slate-300 to-slate-400",
      bgColor: "bg-slate-50",
      textColor: "text-slate-600",
      icon: Star
    },
    Gold: {
      gradient: "from-yellow-300 to-amber-400",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      icon: Award
    },
    Diamond: {
      gradient: "from-blue-300 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      icon: Sparkles
    }
  };
  
  const { gradient, bgColor, textColor, icon: Icon } = levelColors[level];
  
  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progress}%` }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg p-4 border shadow-sm overflow-hidden relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <motion.div 
            className={`p-1.5 rounded-full bg-gradient-to-r ${gradient} text-white`}
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="h-4 w-4" />
          </motion.div>
          <div>
            <h3 className="font-medium text-sm flex items-center">
              <span>Relationship Level:</span> 
              <motion.span 
                className="font-bold ml-1.5"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                {level}
              </motion.span>
            </h3>
          </div>
        </div>
        <div className={`text-xs ${textColor} font-medium`}>
          {pointsEarned}/{pointsNeeded} points
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient}`}
          initial="initial"
          animate="animate"
          variants={progressVariants}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          {pointsNeeded - pointsEarned} more points until next level
        </p>
        <div className="flex items-center gap-1 text-xs font-medium text-primary">
          <motion.div
            whileHover={{ scale: 1.5 }}
            className="inline-block"
          >
            <Heart className="h-3 w-3" />
          </motion.div>
          <span>{progress}% Complete</span>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <motion.div 
        className={`absolute -right-8 -bottom-8 h-32 w-32 rounded-full ${bgColor} opacity-40 z-0`}
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </motion.div>
  );
}
