
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award, MessageSquare, Heart, Star, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define badge types
type BadgeType = "communication" | "connection" | "dedication" | "newJourney" | "milestone";

interface AchievementBadgeProps {
  type: BadgeType;
  achieved?: boolean;
  level?: 1 | 2 | 3;
}

export function AchievementBadge({ type, achieved = true, level = 1 }: AchievementBadgeProps) {
  // Define badge configurations
  const badges = {
    communication: {
      icon: MessageSquare,
      label: "Communication Champion",
      description: "Completed 5 daily conversation prompts",
      color: "bg-green-100 text-green-700 border-green-200",
      achievedColor: "bg-green-500 text-white border-green-600",
    },
    connection: {
      icon: Heart,
      label: "Connection Builder",
      description: "Shared 3 vulnerable moments with your partner",
      color: "bg-red-100 text-red-700 border-red-200",
      achievedColor: "bg-red-500 text-white border-red-600",
    },
    dedication: {
      icon: Calendar,
      label: "Relationship Dedicated",
      description: "7-day streak of app interactions",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      achievedColor: "bg-blue-500 text-white border-blue-600",
    },
    newJourney: {
      icon: Star,
      label: "Journey Explorer",
      description: "Started your first relationship journey",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      achievedColor: "bg-amber-500 text-white border-amber-600",
    },
    milestone: {
      icon: Award,
      label: "Milestone Achieved",
      description: "Reached a significant relationship milestone",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      achievedColor: "bg-purple-500 text-white border-purple-600",
    },
  };

  const badgeConfig = badges[type];
  const Icon = badgeConfig.icon;
  
  // Level indicator
  const getLevelDots = () => {
    return (
      <div className="flex gap-0.5 ml-1">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 w-1.5 rounded-full ${i <= level ? "bg-current" : "bg-current/30"}`}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 py-1.5 px-2.5 ${achieved ? badgeConfig.achievedColor : badgeConfig.color} opacity-${achieved ? '100' : '70'}`}
            >
              <Icon className={`h-3.5 w-3.5 ${!achieved && "opacity-50"}`} />
              <span className="text-xs font-medium">{badgeConfig.label}</span>
              {getLevelDots()}
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{badgeConfig.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
