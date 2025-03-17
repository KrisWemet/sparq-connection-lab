import { motion } from "framer-motion";
import { Users, Clock, TrendingUp, ThumbsUp, Heart, Award, Zap, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SocialProofNotificationProps {
  message: string;
  icon?: "users" | "time" | "trending" | "like" | "heart" | "award" | "zap" | "star";
  type?: "social" | "urgency" | "achievement" | "scarcity" | "upgrade";
  statistic?: string;
  tier?: "premium" | "ultimate";
  onClick?: () => void;
}

export function SocialProofNotification({ 
  message, 
  icon = "users", 
  type = "social",
  statistic,
  tier,
  onClick
}: SocialProofNotificationProps) {
  
  const icons = {
    users: Users,
    time: Clock,
    trending: TrendingUp,
    like: ThumbsUp,
    heart: Heart,
    award: Award,
    zap: Zap,
    star: Star
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
  
  // Split message to find and animate emojis
  const messageParts = message.split(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF])/g);
  
  // Determine if this is a premium/ultimate tier notification
  const isPremiumNotification = tier !== undefined;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card className={`${backgrounds[type]} border shadow-sm overflow-hidden`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`p-1.5 rounded-full bg-white/80 ${iconColors[type]}`}
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            
            <div className="flex-1">
              <p className="text-xs text-gray-700 font-medium">
                {messageParts.map((part, index) => {
                  // Check if part is emoji (simple check)
                  const isEmoji = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/.test(part);
                  
                  return isEmoji ? (
                    <motion.span 
                      key={index}
                      className="inline-block"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 15, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatDelay: 3
                      }}
                    >
                      {part}
                    </motion.span>
                  ) : (
                    <span key={index}>{part}</span>
                  );
                })}
              </p>
              
              {/* Display statistic if provided */}
              {statistic && (
                <motion.p 
                  className="text-xs font-bold mt-0.5 text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {statistic}
                </motion.p>
              )}
            </div>
            
            {/* Premium/Ultimate badge if applicable */}
            {isPremiumNotification && (
              <motion.div
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  tier === "premium" 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                    : "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tier === "premium" ? "Premium" : "Ultimate"}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
