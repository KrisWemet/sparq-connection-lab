
import { motion } from "framer-motion";
import { Flame, Trophy, Medal, Star, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakIndicatorProps {
  streak: number;
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  // Determine icon, message and colors based on streak length
  const getStreakInfo = (days: number) => {
    if (days >= 30) return { icon: Trophy, message: "Amazing commitment! 🎉", color: "text-amber-500", bg: "bg-amber-100" };
    if (days >= 14) return { icon: Medal, message: "Impressive streak! 🌟", color: "text-indigo-500", bg: "bg-indigo-100" };
    if (days >= 7) return { icon: Star, message: "Fantastic week! ✨", color: "text-blue-500", bg: "bg-blue-100" };
    return { icon: Flame, message: "Keep it going! 🔥", color: "text-orange-500", bg: "bg-orange-100" };
  };

  const { icon: Icon, message, color, bg } = getStreakInfo(streak);

  // If no streak, don't display anything
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Card className="bg-gradient-to-r from-primary-100 to-white border-none shadow-sm overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`p-1.5 rounded-full ${bg} ${color}`}
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                <motion.span 
                  className={`${color} font-bold`}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, delay: 0.5, type: "keyframes" }}
                >
                  {streak}-Day
                </motion.span>
                <span>Streak!</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 15 }}
                  transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                >
                  <Zap className={`h-3.5 w-3.5 ${color}`} />
                </motion.div>
              </p>
              <p className="text-xs text-gray-500">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
