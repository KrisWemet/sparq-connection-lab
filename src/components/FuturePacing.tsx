import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Calendar, ArrowRight, Clock } from "lucide-react";

interface FuturePacingProps {
  title: string;
  description: string;
  timeframes: {
    label: string; // e.g., "1 Month", "6 Months", "1 Year"
    vision: string; // The future vision text
    reflection?: string; // Open question the user answers for themselves
  }[];
  onComplete?: () => void;
}

export function FuturePacing({
  title,
  description,
  timeframes,
  onComplete
}: FuturePacingProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleTimeframeSelect = (index: number) => {
    setActiveTimeframe(index);
  };
  
  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete();
  };
  
  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-brand-linen to-brand-parchment">
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-primary/80" />
            <h3 className="text-lg font-medium text-brand-espresso">{title}</h3>
          </div>
          
          <p className="text-sm text-brand-hover">{description}</p>
          
          {activeTimeframe === null ? (
            <div className="space-y-3 py-2">
              <p className="text-xs text-center text-brand-hover italic">
                How far ahead should we look first?
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {timeframes.map((timeframe, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center justify-center h-16 border-brand-primary/20 hover:border-brand-primary hover:bg-brand-linen"
                    onClick={() => handleTimeframeSelect(index)}
                  >
                    <Calendar className="h-4 w-4 mb-1 text-brand-primary/80" />
                    <span className="text-xs font-medium">{timeframe.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTimeframe}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-popover/70 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-primary/80" />
                    <span className="text-sm font-medium text-brand-hover">
                      {timeframes[activeTimeframe].label} from now
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setActiveTimeframe(null)}
                  >
                    Change
                  </Button>
                </div>
                
                <div className="min-h-[120px] text-foreground leading-relaxed mb-4">
                  <p className="text-sm">
                    {timeframes[activeTimeframe].vision}
                  </p>
                  
                  {timeframes[activeTimeframe].reflection && (
                    <motion.p
                      className="font-serif text-lg italic leading-snug text-brand-espresso mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {timeframes[activeTimeframe].reflection}
                    </motion.p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const nextIndex = (activeTimeframe + 1) % timeframes.length;
                      setActiveTimeframe(nextIndex);
                    }}
                  >
                    Look further ahead
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs bg-brand-primary hover:bg-brand-hover"
                    onClick={handleComplete}
                  >
                    {isCompleted ? "Kept close" : "Keep this picture"}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
          
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-brand-hover pt-2"
            >
              <p>
                Every small step you take this week brings this picture a little closer.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
} 