import { useState, useEffect } from "react";
import questionCategories from "@/data/questionCategories";
import sampleQuestions from "@/data/sampleQuestions";
import { getCurrentPeriod, getRemainingQuestions, decrementRemainingQuestions } from "@/utils/dailyQuestionsHelpers";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/lib/subscription-provider";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/DailyQuestions/QuestionCard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ArrowRight,
  ThumbsUp,
  Sparkles,
  Lightbulb,
  Zap,
  Flame,
  Smile,
  HeartHandshake,
  Compass,
  Star,
  Clock,
  Users,
  Leaf,
  Shield,
  Lock,
  Target,
  User,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";

import CategoryList from "@/components/DailyQuestions/CategoryList";
import QuestionSection from "@/components/DailyQuestions/QuestionSection";
import CategoryDetails from "@/components/DailyQuestions/CategoryDetails";

export default function DailyQuestions() {
  const navigate = useNavigate();
  const { subscription, remainingMorningQuestions, remainingEveningQuestions, setRemainingMorningQuestions, setRemainingEveningQuestions } = useSubscription();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingCategoryDetails, setViewingCategoryDetails] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [partnerAnswer, setPartnerAnswer] = useState("");
  const [showPartnerAnswer, setShowPartnerAnswer] = useState(false);
  const [questionLevel, setQuestionLevel] = useState(1);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  
  // Update time period every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPeriod(getCurrentPeriod());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate fetching questions based on selected category and level
  useEffect(() => {
    if (selectedCategory && !viewingCategoryDetails) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const filteredQuestions = sampleQuestions.filter(
          q => q.category === selectedCategory && 
               q.level <= questionLevel &&
               !completedQuestions.includes(q.id)
        );
        
        const remainingQuestions = getRemainingQuestions(currentPeriod, remainingMorningQuestions, remainingEveningQuestions);
        
        if (filteredQuestions.length > 0 && (remainingQuestions > 0 || subscription.tier !== "free")) {
          const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
          setCurrentQuestion(filteredQuestions[randomIndex]);
          
          // Only decrement questions for free tier users
          if (subscription.tier === "free") {
            decrementRemainingQuestions(currentPeriod, setRemainingMorningQuestions, remainingMorningQuestions, setRemainingEveningQuestions, remainingEveningQuestions);
          }
        } else if (remainingQuestions <= 0 && subscription.tier === "free") {
          const nextPeriod = currentPeriod === "morning" || currentPeriod === "afternoon" ? "evening" : "tomorrow morning";
          toast("You've reached your questions limit for this period!", {
            description: `Wait until ${nextPeriod} for more questions, or upgrade for unlimited access.`,
            action: {
              label: "Upgrade",
              onClick: () => navigate("/subscription")
            }
          });
          setCurrentQuestion(null);
        } else {
          // If no questions match criteria, reset level or categories
          if (questionLevel < 3) {
            setQuestionLevel(prev => prev + 1);
            toast.info("Moving to deeper questions!");
          } else {
            toast("You've completed all questions in this category!", {
              description: "Try selecting a different category or check back tomorrow for new questions."
            });
            setCurrentQuestion(null);
            setSelectedCategory(null);
          }
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [selectedCategory, completedQuestions, viewingCategoryDetails, remainingMorningQuestions, remainingEveningQuestions, subscription.tier, currentPeriod]);
  
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter your answer before submitting");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate sending answer to backend and getting partner's response
    setTimeout(() => {
      // In a real app, this would come from the database or partner's actual response
      const simulatedPartnerAnswers = [
        "I really appreciate you sharing that. It helps me understand you better.",
        "That's interesting! I hadn't thought about it that way before.",
        "Thank you for being so open with me. I feel closer to you now.",
        "I love learning new things about you, even after all this time together.",
        "Your perspective on this is really valuable to me."
      ];
      
      const randomAnswer = simulatedPartnerAnswers[Math.floor(Math.random() * simulatedPartnerAnswers.length)];
      setPartnerAnswer(randomAnswer);
      setCompletedQuestions([...completedQuestions, currentQuestion.id]);
      
      toast.success("Answer submitted successfully!");
      setIsLoading(false);
      setShowPartnerAnswer(true);
    }, 1500);
  };
  
  const handleNextQuestion = () => {
    setUserAnswer("");
    setPartnerAnswer("");
    setShowPartnerAnswer(false);
    setShowFollowUp(false);
    
    // Check if we should increase the question level
    if (completedQuestions.length % 5 === 0 && questionLevel < 3) {
      setQuestionLevel(prev => prev + 1);
      toast.info(`Moving to level ${questionLevel + 1} questions!`);
    }
    
    // Fetch a new question (handled by the useEffect)
    setIsLoading(true);
    setTimeout(() => {
      const filteredQuestions = sampleQuestions.filter(
        q => q.category === selectedCategory && 
             q.level <= questionLevel &&
             !completedQuestions.includes(q.id)
      );
      
      const remainingQuestions = getRemainingQuestions(currentPeriod, remainingMorningQuestions, remainingEveningQuestions);
      
      if (filteredQuestions.length > 0 && (remainingQuestions > 0 || subscription.tier !== "free")) {
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        setCurrentQuestion(filteredQuestions[randomIndex]);
        
        // Only decrement questions for free tier users
        if (subscription.tier === "free") {
          decrementRemainingQuestions(currentPeriod, setRemainingMorningQuestions, remainingMorningQuestions, setRemainingEveningQuestions, remainingEveningQuestions);
        }
      } else if (remainingQuestions <= 0 && subscription.tier === "free") {
        const nextPeriod = currentPeriod === "morning" || currentPeriod === "afternoon" ? "evening" : "tomorrow morning";
        toast("You've reached your questions limit for this period!", {
          description: `Wait until ${nextPeriod} for more questions, or upgrade for unlimited access.`,
          action: {
            label: "Upgrade",
            onClick: () => navigate("/subscription")
          }
        });
        setCurrentQuestion(null);
      } else {
        // If no questions match criteria, suggest new categories
        toast("You've completed all questions in this category!", {
          description: "Try selecting a different category or check back tomorrow for new questions."
        });
        setCurrentQuestion(null);
        setSelectedCategory(null);
        setViewingCategoryDetails(false);
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const handleShowFollowUp = () => {
    setShowFollowUp(true);
  };
  
  const handleSaveQuestion = () => {
    toast.success("Question saved to your favorites!");
  };
  
  const handleShareQuestion = () => {
    toast.success("Question shared with your partner!");
  };
  
  const handleCategorySelect = (categoryId: string) => {
    const category = questionCategories.find(c => c.id === categoryId);
    
    if (category?.isPremium && subscription.tier === "free") {
      toast("This category requires a premium subscription", {
        description: "Upgrade to access all categories and unlimited questions.",
        action: {
          label: "Upgrade",
          onClick: () => navigate("/subscription")
        }
      });
      return;
    }
    
    setSelectedCategory(categoryId);
    setViewingCategoryDetails(true);
  };
  
  const handleStartCategory = () => {
    setViewingCategoryDetails(false);
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewingCategoryDetails(false);
    setCurrentQuestion(null);
  };
  
  const getProgressPercentage = () => {
    return Math.min((completedQuestions.length / 20) * 100, 100);
  };

  // Get the free categories (first 5)
  const freeCategories = questionCategories.filter(c => !c.isPremium);
  const premiumCategories = questionCategories.filter(c => c.isPremium);
  
  // Get the selected category object
  const selectedCategoryObj = questionCategories.find(c => c.id === selectedCategory);
  
  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    switch (currentPeriod) {
      case "morning": return "Good Morning";
      case "afternoon": return "Good Afternoon";
      case "evening": return "Good Evening";
      default: return "Hello";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold mx-auto">
            Daily Questions
          </h1>
          <button 
            onClick={() => navigate("/settings")} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-6">
        <AnimatedContainer className="mb-6" variant="fadeIn">
          {!selectedCategory && (
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                {currentPeriod === "morning" || currentPeriod === "afternoon" ? (
                  <Sun className="w-6 h-6 text-amber-500" />
                ) : (
                  <Moon className="w-6 h-6 text-indigo-400" />
                )}
                <h2 className="text-2xl font-bold">
                  {getGreeting()}! Ready for connection?
                </h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Daily questions help you discover new dimensions of your relationship through meaningful conversations. Each category focuses on different aspects of your connection.
              </p>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-muted-foreground italic">
                  "The quality of your relationship depends on the quality of your questions." — Esther Perel
                </p>
              </div>
            </div>
          )}
          
          {!selectedCategory && (
            <CategoryList
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
            />
          )}
          
          {selectedCategory && currentQuestion && (
            <QuestionSection
              currentQuestion={currentQuestion}
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              handleSubmitAnswer={handleSubmitAnswer}
              isLoading={isLoading}
              showFollowUp={showFollowUp}
              handleShowFollowUp={handleShowFollowUp}
              handleBackToCategories={handleBackToCategories}
            />
          )}

          {selectedCategory && viewingCategoryDetails && (
            <CategoryDetails
              selectedCategory={selectedCategory}
              handleStartCategory={handleStartCategory}
            />
          )}
        </AnimatedContainer>
      </main>

      <BottomNav />
    </div>
  );
}