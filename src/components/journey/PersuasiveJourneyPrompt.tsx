import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Lock } from "lucide-react";
import { useSubscription } from "@/lib/subscription-provider";
import { useNavigate } from "react-router-dom";

interface PersuasiveJourneyPromptProps {
  journeyId: string;
  journeyTitle: string;
  journeyDescription: string;
  isPremiumJourney: boolean;
  completionPercentage: number;
  onContinue: () => void;
}

export function PersuasiveJourneyPrompt({
  journeyId,
  journeyTitle,
  journeyDescription,
  isPremiumJourney,
  completionPercentage,
  onContinue
}: PersuasiveJourneyPromptProps) {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [motivationalIndex, setMotivationalIndex] = useState(0);
  
  const isPremium = subscription?.tier === "premium" || subscription?.tier === "ultimate";
  const hasAccess = !isPremiumJourney || isPremium;
  
  // Motivational messages with embedded commands
  const motivationalMessages = [
    "As you continue this journey, *notice how your connection naturally deepens* with each activity you complete together.",
    "With each step forward, *feel the growing sense of understanding* between you and your partner.",
    "As you progress through this journey, *experience how much easier communication becomes* when you practice these techniques.",
    "Moving through these activities together, *discover new dimensions of your relationship* that were always there waiting to be explored."
  ];
  
  // Rotate through motivational messages
  useEffect(() => {
    if (hasAccess && completionPercentage > 0) {
      const interval = setInterval(() => {
        setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [hasAccess, completionPercentage, motivationalMessages.length]);
  
  // Format text with embedded commands (wrapped in *asterisks*)
  const formatWithEmbeddedCommands = (text: string) => {
    return text.split(/(\*[^*]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // This is an embedded command - style it differently
        const command = part.slice(1, -1);
        return (
          <motion.span 
            key={index}
            className="font-medium text-primary-600"
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
  
  // Benefits based on journey type
  const getJourneyBenefits = () => {
    const benefits = {
      communication: [
        "Resolve misunderstandings 3x faster",
        "Develop a unique language of understanding",
        "Create a safe space for difficult conversations"
      ],
      intimacy: [
        "Deepen your emotional and physical connection",
        "Discover new dimensions of closeness",
        "Build a foundation of trust and vulnerability"
      ],
      trust: [
        "Establish unshakable trust that withstands challenges",
        "Create a relationship where authenticity is celebrated",
        "Develop confidence in your partner's reliability"
      ],
      future: [
        "Create a shared vision that excites you both",
        "Align your goals and dreams for maximum fulfillment",
        "Navigate life transitions with grace and unity"
      ],
      attachment: [
        "Transform insecure attachment patterns",
        "Build a secure emotional foundation",
        "Respond to each other's needs with greater sensitivity"
      ],
      conflict: [
        "Turn disagreements into opportunities for growth",
        "Develop a conflict resolution style that works for both of you",
        "Maintain connection even during challenging conversations"
      ]
    };
    
    // Default to communication if journey type not found
    const journeyType = Object.keys(benefits).find(type => journeyId.includes(type)) || "communication";
    return benefits[journeyType as keyof typeof benefits];
  };
  
  // Social proof based on journey type
  const getSocialProof = () => {
    const proofs = {
      communication: "92% of couples report significant improvement in communication after completing this journey",
      intimacy: "Couples report feeling 78% more connected after finishing this journey",
      trust: "85% of couples say this journey helped them rebuild trust after challenges",
      future: "Couples who complete this journey are 3x more likely to achieve shared goals",
      attachment: "This journey has helped 89% of couples develop more secure attachment patterns",
      conflict: "Couples report 73% fewer destructive arguments after completing this journey"
    };
    
    // Default to communication if journey type not found
    const journeyType = Object.keys(proofs).find(type => journeyId.includes(type)) || "communication";
    return proofs[journeyType as keyof typeof proofs];
  };
  
  return (
    <>
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary-50 to-white">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-medium text-primary-900">{journeyTitle}</h3>
              
              {isPremiumJourney && !isPremium && (
                <div className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Lock className="h-3 w-3" />
                  Premium
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-700">{journeyDescription}</p>
            
            {/* Progress bar for ongoing journeys */}
            {hasAccess && completionPercentage > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(completionPercentage)}% Complete</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, type: "spring" }}
                  />
                </div>
              </div>
            )}
            
            {/* Motivational message for ongoing journeys */}
            {hasAccess && completionPercentage > 0 && (
              <motion.div
                key={motivationalIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-primary-50 p-3 rounded-lg"
              >
                <p className="text-sm text-primary-700 italic">
                  {formatWithEmbeddedCommands(motivationalMessages[motivationalIndex])}
                </p>
              </motion.div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end">
              {hasAccess ? (
                <Button 
                  onClick={onContinue}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                >
                  {completionPercentage > 0 ? "Continue Journey" : "Start Journey"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowUpgradePrompt(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                  Unlock Premium Journey
                  <Lock className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Upgrade modal */}
      {showUpgradePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setShowUpgradePrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-lg p-6 m-4 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <Heart className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold mb-2">Unlock Your Relationship Potential</h3>
              <p className="text-gray-600">
                This premium journey will help you and your partner {journeyTitle.toLowerCase()}.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-primary-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary-700">
                  {getSocialProof()}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">With this journey, you'll:</p>
                <ul className="space-y-1">
                  {getJourneyBenefits().map((benefit, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Sparkles className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <p className="text-sm text-center italic text-gray-600">
                "This journey transformed how we understand each other. We're closer than ever." - Jamie & Alex
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUpgradePrompt(false)}
              >
                Not Now
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600"
                onClick={() => navigate("/subscription")}
              >
                Upgrade to Premium
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
} 