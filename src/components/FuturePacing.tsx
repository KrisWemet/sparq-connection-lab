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
    embedCommand?: string; // Optional embedded command
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
  
  // Format text with embedded commands (wrapped in *asterisks*)
  const formatWithEmbeddedCommands = (text: string) => {
    return text.split(/(\*[^*]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // This is an embedded command - style it differently
        const command = part.slice(1, -1);
        return (
          <motion.span 
            key={index}
            className="font-medium text-indigo-600"
            initial={{ opacity: 0.8 }}
            animate={{ 
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            {command}
          </motion.span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-medium text-indigo-900">{title}</h3>
          </div>
          
          <p className="text-sm text-indigo-700">{description}</p>
          
          {activeTimeframe === null ? (
            <div className="space-y-3 py-2">
              <p className="text-xs text-center text-indigo-600 italic">
                Select a timeframe to visualize your relationship's future
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {timeframes.map((timeframe, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center justify-center h-16 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                    onClick={() => handleTimeframeSelect(index)}
                  >
                    <Calendar className="h-4 w-4 mb-1 text-indigo-500" />
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
                className="bg-white/70 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-indigo-800">
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
                
                <div className="min-h-[120px] text-gray-700 leading-relaxed mb-4">
                  <p className="text-sm">
                    {formatWithEmbeddedCommands(timeframes[activeTimeframe].vision)}
                  </p>
                  
                  {timeframes[activeTimeframe].embedCommand && (
                    <motion.p
                      className="text-sm font-medium text-indigo-600 mt-3 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {timeframes[activeTimeframe].embedCommand}
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
                    Next Timeframe
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    onClick={handleComplete}
                  >
                    {isCompleted ? "Visualization Complete" : "Complete Visualization"}
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
              className="text-center text-sm text-indigo-600 pt-2"
            >
              <p>
                As you continue your journey together, notice how these visions naturally begin to manifest in your relationship.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
} 