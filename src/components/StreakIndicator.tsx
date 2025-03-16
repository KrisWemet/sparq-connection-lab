
import { motion } from "framer-motion";
import { Flame, Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakIndicatorProps {
  streak: number;
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  // Determine icon and message based on streak length
  const getStreakInfo = (days: number) => {
    if (days >= 30) return { icon: Trophy, message: "Amazing commitment!", color: "text-amber-500" };
    if (days >= 14) return { icon: Medal, message: "Impressive streak!", color: "text-indigo-500" };
    return { icon: Flame, message: "Keep it going!", color: "text-orange-500" };
  };

  const { icon: Icon, message, color } = getStreakInfo(streak);

  // If no streak, don't display anything
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-primary-100 to-white border-none shadow-sm overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full bg-white/80 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <span className={`${color} font-bold`}>{streak}-Day</span> Streak!
              </p>
              <p className="text-xs text-gray-500">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
