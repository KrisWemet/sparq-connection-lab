import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Heart, Star } from "lucide-react";

interface HypnoticStoryProps {
  title: string;
  story: string;
  theme: "trust" | "communication" | "intimacy" | "growth" | "appreciation";
  onComplete?: () => void;
}

export function HypnoticStory({
  title,
  story,
  theme,
  onComplete
}: HypnoticStoryProps) {
  const [isReading, setIsReading] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  
  // Split story into paragraphs
  const paragraphs = story.split('\n\n').filter(p => p.trim() !== '');
  
  // Theme-based styling
  const themeStyles = {
    trust: {
      gradient: "from-blue-50 to-indigo-50",
      accent: "text-blue-600",
      icon: <Shield className="h-5 w-5" />,
      border: "border-blue-200"
    },
    communication: {
      gradient: "from-green-50 to-emerald-50",
      accent: "text-green-600",
      icon: <MessageCircle className="h-5 w-5" />,
      border: "border-green-200"
    },
    intimacy: {
      gradient: "from-red-50 to-pink-50",
      accent: "text-red-600",
      icon: <Heart className="h-5 w-5" />,
      border: "border-red-200"
    },
    growth: {
      gradient: "from-amber-50 to-yellow-50",
      accent: "text-amber-600",
      icon: <Seedling className="h-5 w-5" />,
      border: "border-amber-200"
    },
    appreciation: {
      gradient: "from-purple-50 to-fuchsia-50",
      accent: "text-purple-600",
      icon: <Star className="h-5 w-5" />,
      border: "border-purple-200"
    }
  };
  
  // Auto-scroll effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isReading && autoScroll) {
      // Average reading speed is about 200-250 words per minute
      // Estimate words in current paragraph and set timer accordingly
      const words = paragraphs[currentParagraph].split(' ').length;
      const readingTime = Math.max(3000, words * 200); // Minimum 3 seconds, 200ms per word
      
      timer = setTimeout(() => {
        if (currentParagraph < paragraphs.length - 1) {
          setCurrentParagraph(prev => prev + 1);
        } else {
          setIsReading(false);
          if (onComplete) onComplete();
        }
      }, readingTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isReading, autoScroll, currentParagraph, paragraphs, onComplete]);
  
  const startReading = () => {
    setIsReading(true);
    setCurrentParagraph(0);
  };
  
  const nextParagraph = () => {
    if (currentParagraph < paragraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
    } else {
      setIsReading(false);
      if (onComplete) onComplete();
    }
  };
  
  const previousParagraph = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
    }
  };
  
  const toggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };
  
  // Embedded commands are highlighted in the text
  const formatParagraphWithEmbeddedCommands = (text: string) => {
    // Identify embedded commands wrapped in *asterisks*
    return text.split(/(\*[^*]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // This is an embedded command - style it differently
        const command = part.slice(1, -1);
        return (
          <motion.span 
            key={index}
            className={`font-medium ${themeStyles[theme].accent}`}
            initial={{ opacity: 0.7 }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.03, 1]
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
    <Card className={`overflow-hidden border ${themeStyles[theme].border} shadow-md bg-gradient-to-br ${themeStyles[theme].gradient}`}>
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {themeStyles[theme].icon}
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          
          {!isReading ? (
            <div className="text-center py-6">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-70" />
              <p className="text-sm mb-4">
                This story contains subtle suggestions to help you *notice how your relationship naturally strengthens* as you read.
              </p>
              <Button 
                variant="default" 
                onClick={startReading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                Begin Reading
              </Button>
            </div>
          ) : (
            <>
              <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentParagraph / (paragraphs.length - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <motion.div
                key={currentParagraph}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="min-h-[200px] py-4 text-gray-800 leading-relaxed"
              >
                <p className="text-base">
                  {formatParagraphWithEmbeddedCommands(paragraphs[currentParagraph])}
                </p>
              </motion.div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={previousParagraph}
                  disabled={currentParagraph === 0}
                >
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleAutoScroll}
                  className={autoScroll ? `${themeStyles[theme].accent} border-current` : ""}
                >
                  {autoScroll ? "Auto-Scrolling" : "Auto-Scroll"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={nextParagraph}
                  disabled={currentParagraph === paragraphs.length - 1}
                >
                  {currentParagraph === paragraphs.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

// Additional icons
function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function MessageCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function Seedling(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 22v-9" />
      <path d="M9 6a3 3 0 0 1 3-3c2 0 4 1 4 4 0 3.5-2 4.5-4 5" />
      <path d="M9 10c0-2.5 2-3 4-3 2 0 4 .5 4 3 0 2.5-2 3-4 3" />
    </svg>
  );
} 