import { motion } from "framer-motion";
import { Flame, Trophy, Medal, Star, Zap, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription-provider";

interface StreakIndicatorProps {
  streak: number;
  onShare?: () => void;
}

export function StreakIndicator({ streak, onShare }: StreakIndicatorProps) {
  const { subscription } = useSubscription();
  const isPremium = subscription?.tier === "premium" || subscription?.tier === "ultimate";
  const isUltimate = subscription?.tier === "ultimate";
  
  // Determine icon, message and colors based on streak length
  const getStreakInfo = (days: number) => {
    if (days >= 30) return { 
      icon: Trophy, 
      message: "Amazing commitment! 🎉", 
      color: "text-amber-500", 
      bg: "bg-amber-100",
      embedCommand: "Feel the deep connection you've built together",
      benefit: "Couples who maintain 30+ day streaks report 78% higher relationship satisfaction"
    };
    if (days >= 14) return { 
      icon: Medal, 
      message: "Impressive streak! 🌟", 
      color: "text-indigo-500", 
      bg: "bg-indigo-100",
      embedCommand: "Notice how much closer you feel each day",
      benefit: "Two-week streaks lead to 42% more meaningful conversations"
    };
    if (days >= 7) return { 
      icon: Star, 
      message: "Fantastic week! ✨", 
      color: "text-blue-500", 
      bg: "bg-blue-100",
      embedCommand: "Enjoy the growing connection you're creating",
      benefit: "Weekly streaks build lasting relationship habits"
    };
    return { 
      icon: Flame, 
      message: "Keep it going! 🔥", 
      color: "text-orange-500", 
      bg: "bg-orange-100",
      embedCommand: "Feel your bond strengthening with each interaction",
      benefit: "Every day you connect creates positive relationship momentum"
    };
  };

  const { icon: Icon, message, color, bg, embedCommand, benefit } = getStreakInfo(streak);

  // If no streak, don't display anything
  if (streak === 0) return null;
  
  // Determine if we should show the premium upgrade prompt
  // Show for non-premium users with streaks of 3+ days
  const showPremiumPrompt = !isPremium && streak >= 3;
  
  // Determine if we should show the ultimate upgrade prompt
  // Show for premium (but not ultimate) users with streaks of 10+ days
  const showUltimatePrompt = isPremium && !isUltimate && streak >= 10;

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
            <div className="flex-1">
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
              
              {/* Embedded command - subtle persuasive text */}
              <motion.p 
                className={`text-xs ${color} font-medium mt-1`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {embedCommand}
              </motion.p>
              
              {/* Social proof benefit - only shown for premium users */}
              {isPremium && (
                <motion.p 
                  className="text-[10px] text-gray-600 mt-1 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 1.5 }}
                >
                  <span className="inline-flex items-center">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    {benefit}
                  </span>
                </motion.p>
              )}
            </div>
            
            {/* Share button */}
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full ${color} p-1.5 h-auto`}
                onClick={onShare}
              >
                <Heart className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          
          {/* Premium upgrade prompt */}
          {showPremiumPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="mt-2 pt-2 border-t border-gray-100"
            >
              <p className="text-[10px] text-gray-600 mb-1.5">
                <span className="font-medium">Upgrade to Premium</span> to unlock streak insights and relationship analytics
              </p>
              <Button
                variant="default"
                size="sm"
                className="w-full h-7 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={() => window.location.href = '/subscription'}
              >
                Enhance Your Connection
              </Button>
            </motion.div>
          )}
          
          {/* Ultimate upgrade prompt */}
          {showUltimatePrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="mt-2 pt-2 border-t border-gray-100"
            >
              <p className="text-[10px] text-gray-600 mb-1.5">
                <span className="font-medium">Your dedication deserves Ultimate!</span> Unlock exclusive guided visualizations
              </p>
              <Button
                variant="default"
                size="sm"
                className="w-full h-7 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => window.location.href = '/subscription'}
              >
                Elevate to Ultimate
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
