
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award, MessageSquare, Heart, Star, Calendar, Zap, Smile, Trophy, Flag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define badge types
type BadgeType = "communication" | "connection" | "dedication" | "newJourney" | "milestone" | "growth" | "empathy" | "champion";

interface AchievementBadgeProps {
  type: BadgeType;
  achieved?: boolean;
  level?: 1 | 2 | 3;
}

export function AchievementBadge({ type, achieved = true, level = 1 }: AchievementBadgeProps) {
  // Define badge configurations with fun, engaging messages
  const badges = {
    communication: {
      icon: MessageSquare,
      label: "Communication Champ",
      description: "Completed 5 daily conversation prompts! Your communication skills are growing! 🗣️",
      color: "bg-green-100 text-green-700 border-green-200",
      achievedColor: "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-600",
    },
    connection: {
      icon: Heart,
      label: "Connection Builder",
      description: "Shared 3 vulnerable moments with your partner. Your bond is growing stronger! 💖",
      color: "bg-red-100 text-red-700 border-red-200",
      achievedColor: "bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-600",
    },
    dedication: {
      icon: Calendar,
      label: "Relationship Dedicated",
      description: "7-day streak of app interactions! You're creating a beautiful habit of connection! 📅",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      achievedColor: "bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-600",
    },
    newJourney: {
      icon: Star,
      label: "Journey Explorer",
      description: "Started your first relationship journey! Adventure awaits you both! ✨",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      achievedColor: "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-600",
    },
    milestone: {
      icon: Award,
      label: "Milestone Achieved",
      description: "Reached a significant relationship milestone! Keep growing together! 🏆",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      achievedColor: "bg-gradient-to-r from-purple-400 to-purple-500 text-white border-purple-600",
    },
    growth: {
      icon: Zap,
      label: "Growth Mindset",
      description: "Tackled a challenging relationship topic together! Growth happens outside your comfort zone! ⚡",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      achievedColor: "bg-gradient-to-r from-indigo-400 to-indigo-500 text-white border-indigo-600",
    },
    empathy: {
      icon: Smile,
      label: "Empathy Expert",
      description: "Demonstrated exceptional empathy in your responses! You're truly listening to each other! 😊",
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      achievedColor: "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white border-cyan-600",
    },
    champion: {
      icon: Trophy,
      label: "Relationship Champion",
      description: "Completed an entire relationship journey! You're investing in what matters most! 🏆",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      achievedColor: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-600",
    }
  };

  const badgeConfig = badges[type];
  const Icon = badgeConfig.icon;
  
  // Level indicator with fun animations
  const getLevelDots = () => {
    return (
      <div className="flex gap-0.5 ml-1">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            className={`h-1.5 w-1.5 rounded-full ${i <= level ? "bg-current" : "bg-current/30"}`}
            initial={{ scale: i <= level ? 0 : 1 }}
            animate={{ 
              scale: i <= level ? [0, 1.5, 1] : 1,
              opacity: i <= level ? [0, 1] : 0.3
            }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.15 + 0.5,
              type: "spring"
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
          >
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 py-1.5 px-2.5 ${achieved ? badgeConfig.achievedColor : badgeConfig.color} opacity-${achieved ? '100' : '70'} shadow-sm`}
            >
              <motion.div
                animate={achieved ? { 
                  rotate: [0, 15, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ 
                  duration: 1.5, 
                  repeat: achieved ? Infinity : 0, 
                  repeatDelay: 5
                }}
              >
                <Icon className={`h-3.5 w-3.5 ${!achieved && "opacity-50"}`} />
              </motion.div>
              <span className="text-xs font-medium">{badgeConfig.label}</span>
              {getLevelDots()}
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-white p-3 max-w-xs border shadow-md rounded-lg">
          <p className="text-sm">{badgeConfig.description}</p>
          {level > 1 && (
            <p className="text-xs font-medium mt-1 text-gray-500">
              Level {level} achievement - {level === 2 ? "Impressive!" : "Master level!"}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
