import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/lib/subscription-provider";
import { Button } from "@/components/ui/button";
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

// Question categories based on GitHub repository
const questionCategories = [
  {
    id: "adventure",
    name: "Adventure & Fun",
    description: "Playful questions to spark joy and adventure in your relationship",
    icon: <Compass className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-800",
    theory: "Positive psychology suggests shared novel experiences strengthen bonds",
    benefits: "Couples who engage in novel activities together report 36% higher relationship satisfaction",
    goal: "Discover new activities and experiences that bring you joy as a couple",
    isPremium: false
  },
  {
    id: "appreciation",
    name: "Appreciation & Gratitude",
    description: "Express thankfulness and recognize each other's contributions",
    icon: <Star className="w-5 h-5" />,
    color: "bg-yellow-100 text-yellow-800",
    theory: "Gratitude practice increases relationship satisfaction",
    benefits: "Daily gratitude practices can reduce relationship conflicts by up to 28%",
    goal: "Build a habit of noticing and expressing appreciation for your partner",
    isPremium: false
  },
  {
    id: "communication",
    name: "Communication & Conflict",
    description: "Improve how you communicate and resolve disagreements",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "bg-indigo-100 text-indigo-800",
    theory: "Gottman's research on communication patterns and conflict resolution",
    benefits: "Couples with strong communication skills are 70% more likely to report high relationship satisfaction",
    goal: "Develop healthier communication patterns and conflict resolution strategies",
    isPremium: false
  },
  {
    id: "emotional",
    name: "Emotional Intimacy",
    description: "Deepen your emotional connection and understanding",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-red-100 text-red-800",
    theory: "Attachment theory principles for secure emotional bonds",
    benefits: "Emotional intimacy is the #1 predictor of long-term relationship success",
    goal: "Create a deeper emotional connection through vulnerability and understanding",
    isPremium: false
  },
  {
    id: "hopes",
    name: "Hopes & Dreams",
    description: "Share aspirations and build a vision for your future together",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-800",
    theory: "Narrative therapy approach to co-creating relationship stories",
    benefits: "Couples who regularly discuss future goals are 31% more likely to stay together",
    goal: "Align your visions for the future and support each other's dreams",
    isPremium: false
  },
  {
    id: "physical",
    name: "Intimacy & Physical",
    description: "Explore physical connection and intimacy preferences",
    icon: <Flame className="w-5 h-5" />,
    color: "bg-rose-100 text-rose-800",
    theory: "Sensate focus techniques from sex therapy",
    benefits: "Physical intimacy releases oxytocin, strengthening your emotional bond",
    goal: "Enhance your physical connection and understand each other's needs better",
    isPremium: true
  },
  {
    id: "lgbt",
    name: "LGBTQ+ Relationships",
    description: "Questions specific to LGBTQ+ relationship experiences",
    icon: <Users className="w-5 h-5" />,
    color: "bg-pink-100 text-pink-800",
    theory: "Minority stress theory and affirmative relationship approaches",
    benefits: "Addressing unique aspects of LGBTQ+ relationships can increase feelings of validation by 45%",
    goal: "Navigate the unique aspects of your relationship with understanding and pride",
    isPremium: true
  },
  {
    id: "distance",
    name: "Long Distance",
    description: "Maintain connection when physically apart",
    icon: <Zap className="w-5 h-5" />,
    color: "bg-cyan-100 text-cyan-800",
    theory: "Interdependence theory applied to distance relationships",
    benefits: "Long-distance couples who communicate effectively report stronger trust than proximate couples",
    goal: "Build and maintain a strong connection despite physical distance",
    isPremium: true
  },
  {
    id: "love",
    name: "Love Languages & Affection",
    description: "Discover how you each express and receive love",
    icon: <HeartHandshake className="w-5 h-5" />,
    color: "bg-emerald-100 text-emerald-800",
    theory: "Chapman's Five Love Languages framework",
    benefits: "Understanding your partner's love language can increase relationship satisfaction by 23%",
    goal: "Learn to express love in ways that resonate most with your partner",
    isPremium: true
  },
  {
    id: "growth",
    name: "Personal Growth",
    description: "Support each other's individual development",
    icon: <Leaf className="w-5 h-5" />,
    color: "bg-green-100 text-green-800",
    theory: "Differentiation-based approaches to healthy interdependence",
    benefits: "Couples who support each other's personal growth are 34% less likely to break up",
    goal: "Balance individual growth with relationship growth for a healthier partnership",
    isPremium: true
  },
  {
    id: "sexual",
    name: "Sexual Connection",
    description: "Explore desires, preferences, and sexual communication",
    icon: <Flame className="w-5 h-5" />,
    color: "bg-orange-100 text-orange-800",
    theory: "Sex-positive therapy approaches to intimate communication",
    benefits: "Couples who communicate openly about sex report 62% higher sexual satisfaction",
    goal: "Develop a fulfilling sexual connection based on open communication and trust",
    isPremium: true
  },
  {
    id: "memories",
    name: "Shared Memories",
    description: "Reflect on your journey and special moments together",
    icon: <Clock className="w-5 h-5" />,
    color: "bg-amber-100 text-amber-800",
    theory: "Reminiscence therapy principles for relationship bonding",
    benefits: "Regularly reminiscing about positive shared experiences strengthens relationship bonds",
    goal: "Celebrate your history together and use it as a foundation for future growth",
    isPremium: true
  },
  {
    id: "values",
    name: "Values & Beliefs",
    description: "Explore core principles that guide your lives",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-slate-100 text-slate-800",
    theory: "Acceptance and Commitment Therapy (ACT) values clarification",
    benefits: "Couples with aligned core values report 40% higher relationship satisfaction",
    goal: "Understand each other's values and create shared meaning in your relationship",
    isPremium: true
  },
  {
    id: "polyamory",
    name: "Polyamory & Open Relationships",
    description: "Navigate multiple loving relationships ethically",
    icon: <Users className="w-5 h-5" />,
    color: "bg-violet-100 text-violet-800",
    theory: "Consensual non-monogamy research and ethical frameworks",
    benefits: "Clear agreements and communication in non-monogamous relationships reduce conflict by 47%",
    goal: "Build healthy, ethical connections with multiple partners based on trust and communication",
    isPremium: true
  },
  {
    id: "kink",
    name: "Kink & Alternative Sexuality",
    description: "Explore alternative expressions of intimacy and desire",
    icon: <Sparkles className="w-5 h-5" />,
    color: "bg-fuchsia-100 text-fuchsia-800",
    theory: "Sex-positive and kink-aware therapeutic approaches",
    benefits: "Exploring kink with clear consent and communication can deepen trust and intimacy",
    goal: "Safely explore desires and fantasies to enhance your intimate connection",
    isPremium: true
  }
];

// Sample questions with progressive intimacy levels
const sampleQuestions = [
  // Communication questions
  {
    id: "q1",
    category: "communication",
    text: "What's one thing I do that makes you feel most understood?",
    level: 1,
    theory: "Active listening principles",
    followUp: "How can I do more of this in our daily interactions?"
  },
  {
    id: "q2",
    category: "communication",
    text: "When we disagree, what's one thing I could do differently that would help you feel more heard?",
    level: 2,
    theory: "Gottman's conflict management research",
    followUp: "Can you share a specific example where this would have helped?"
  },
  {
    id: "q3",
    category: "communication",
    text: "What's a difficult topic you've been hesitant to bring up with me, and what would make it easier to discuss?",
    level: 3,
    theory: "Vulnerability in communication",
    followUp: "What fears come up for you when thinking about discussing this?"
  },
  
  // Values questions
  {
    id: "q4",
    category: "values",
    text: "What's one value or principle that's become more important to you in the past year?",
    level: 1,
    theory: "Values evolution in relationships",
    followUp: "How has this shift affected how you see our relationship?"
  },
  {
    id: "q5",
    category: "values",
    text: "In what ways do you think our core values align well, and where might they differ?",
    level: 2,
    theory: "Value compatibility in relationships",
    followUp: "How do these differences enrich our relationship or create challenges?"
  },
  {
    id: "q6",
    category: "values",
    text: "What's a belief you've changed your mind about since we've been together, and what influenced that change?",
    level: 3,
    theory: "Belief systems and relationship influence",
    followUp: "How has this change affected your perspective on life or our relationship?"
  },
  
  // Emotional intimacy questions
  {
    id: "q7",
    category: "emotional",
    text: "When was the last time you felt truly seen and understood by me?",
    level: 1,
    theory: "Emotional attunement",
    followUp: "What specifically made you feel that way?"
  },
  {
    id: "q8",
    category: "emotional",
    text: "What's something you're currently struggling with that you haven't fully shared with me?",
    level: 2,
    theory: "Emotional vulnerability",
    followUp: "How can I best support you with this?"
  },
  {
    id: "q9",
    category: "emotional",
    text: "What's a fear or insecurity about our relationship that you haven't expressed to me before?",
    level: 3,
    theory: "Deep emotional disclosure",
    followUp: "What would help you feel more secure about this?"
  },
  
  // LGBTQ+ specific questions
  {
    id: "q10",
    category: "lgbt",
    text: "How has your identity shaped your expectations or approach to our relationship?",
    level: 1,
    theory: "Identity integration in relationships",
    followUp: "What aspects of your identity do you feel are most important for me to understand?"
  },
  {
    id: "q11",
    category: "lgbt",
    text: "How do you feel about the way we navigate being out or visible as a couple in different contexts?",
    level: 2,
    theory: "Minority stress and relationship dynamics",
    followUp: "Are there situations where you'd like us to approach this differently?"
  },
  
  // Polyamory questions
  {
    id: "q12",
    category: "polyamory",
    text: "What aspects of our relationship agreements are working well, and what might need revisiting?",
    level: 1,
    theory: "Ethical non-monogamy communication",
    followUp: "What prompted you to reflect on this aspect of our agreement?"
  },
  {
    id: "q13",
    category: "polyamory",
    text: "How do you balance your emotional energy between different relationships, and what helps you maintain that balance?",
    level: 2,
    theory: "Polycule dynamics and emotional resources",
    followUp: "What signs tell you when this balance needs adjustment?"
  }
];

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
  
  // Determine if it's morning or evening
  const getCurrentPeriod = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "morning";
    if (hours >= 12 && hours < 18) return "afternoon";
    return "evening";
  };
  
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  
  // Update time period every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPeriod(getCurrentPeriod());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get remaining questions based on current period
  const getRemainingQuestions = () => {
    return currentPeriod === "morning" || currentPeriod === "afternoon" 
      ? remainingMorningQuestions 
      : remainingEveningQuestions;
  };
  
  // Set remaining questions based on current period
  const decrementRemainingQuestions = () => {
    if (currentPeriod === "morning" || currentPeriod === "afternoon") {
      setRemainingMorningQuestions(remainingMorningQuestions - 1);
    } else {
      setRemainingEveningQuestions(remainingEveningQuestions - 1);
    }
  };
  
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
        
        const remainingQuestions = getRemainingQuestions();
        
        if (filteredQuestions.length > 0 && (remainingQuestions > 0 || subscription.tier !== "free")) {
          const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
          setCurrentQuestion(filteredQuestions[randomIndex]);
          
          // Only decrement questions for free tier users
          if (subscription.tier === "free") {
            decrementRemainingQuestions();
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
      
      const remainingQuestions = getRemainingQuestions();
      
      if (filteredQuestions.length > 0 && (remainingQuestions > 0 || subscription.tier !== "free")) {
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        setCurrentQuestion(filteredQuestions[randomIndex]);
        
        // Only decrement questions for free tier users
        if (subscription.tier === "free") {
          decrementRemainingQuestions();
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
            <>
              {subscription.tier === "free" && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Today's Questions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">Morning</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Available:</span>
                        <Badge variant={remainingMorningQuestions > 0 ? "secondary" : "outline"}>
                          {remainingMorningQuestions} left
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium">Evening</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Available:</span>
                        <Badge variant={remainingEveningQuestions > 0 ? "secondary" : "outline"}>
                          {remainingEveningQuestions} left
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Free users get questions twice daily (morning & evening) to prevent overwhelm and encourage meaningful conversations.
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate("/subscription")}
                    className="w-full"
                  >
                    Upgrade for Unlimited Access
                  </Button>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium mb-3">Free Categories</h3>
                <div className="grid grid-cols-1 gap-3">
                  {freeCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex items-center p-4 bg-background rounded-lg border hover:border-primary transition-colors text-left"
                    >
                      <div className={`p-2 rounded-full mr-3 ${category.color}`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Premium Categories</h3>
                  <Badge variant="outline" className="bg-muted">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {premiumCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex items-center p-4 bg-background rounded-lg border opacity-75 hover:opacity-100 transition-opacity text-left"
                    >
                      <div className={`p-2 rounded-full mr-3 ${category.color}`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{category.name}</h4>
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {selectedCategory && viewingCategoryDetails && selectedCategoryObj && (
            <div className="space-y-6">
              <button 
                onClick={handleBackToCategories}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to categories
              </button>
              
              <div className={`bg-gradient-to-r from-${selectedCategoryObj.color.split(' ')[0].replace('bg-', '')} to-muted rounded-lg p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full ${selectedCategoryObj.color}`}>
                    {selectedCategoryObj.icon}
                  </div>
                  <h2 className="text-xl font-bold">
                    {selectedCategoryObj.name}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-foreground">
                    {selectedCategoryObj.description}
                  </p>
                  
                  <div className="bg-background/80 rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Goal
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedCategoryObj.goal}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Benefits
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedCategoryObj.benefits}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                        Based on
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedCategoryObj.theory}</p>
                    </div>
                  </div>
                  
                  {!selectedCategoryObj.isPremium && subscription.tier === "free" && (
                    <div className="bg-background/80 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Available Questions</h4>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span>Morning:</span>
                          </div>
                          <Badge variant={remainingMorningQuestions > 0 ? "secondary" : "outline"}>
                            {remainingMorningQuestions}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Moon className="w-4 h-4 text-indigo-400" />
                            <span>Evening:</span>
                          </div>
                          <Badge variant={remainingEveningQuestions > 0 ? "secondary" : "outline"}>
                            {remainingEveningQuestions}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleStartCategory} 
                    className="w-full"
                    disabled={subscription.tier === "free" && getRemainingQuestions() <= 0}
                  >
                    Start Questions
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {selectedCategory && !viewingCategoryDetails && (
            <div className="space-y-6">
              <button 
                onClick={() => setViewingCategoryDetails(true)}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to category details
              </button>
              
              {currentQuestion ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={selectedCategoryObj?.color}>
                        {selectedCategoryObj?.name}
                      </Badge>
                      <Badge variant="outline">
                        Level {currentQuestion.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2">
                      {currentQuestion.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showPartnerAnswer ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Type your answer here..."
                          className="min-h-32"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                        />
                        <Button 
                          onClick={handleSubmitAnswer} 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? "Submitting..." : "Submit Answer"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <User className="w-4 h-4 mr-2 text-blue-500" />
                            Your Answer
                          </h4>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p>{userAnswer}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-rose-500" />
                            Partner's Response
                          </h4>
                          <div className="bg-rose-50 p-4 rounded-lg">
                            <p>{partnerAnswer}</p>
                          </div>
                        </div>
                        
                        {!showFollowUp && currentQuestion.followUp && (
                          <Button 
                            variant="outline" 
                            onClick={handleShowFollowUp}
                            className="w-full"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Show Follow-Up Question
                          </Button>
                        )}
                        
                        {showFollowUp && currentQuestion.followUp && (
                          <div>
                            <h4 className="font-medium mb-2">Follow-Up Question</h4>
                            <div className="bg-purple-50 p-4 rounded-lg mb-4">
                              <p>{currentQuestion.followUp}</p>
                            </div>
                            <Textarea
                              placeholder="Type your answer to the follow-up..."
                              className="min-h-24 mb-4"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={handleSaveQuestion}
                            >
                              <Bookmark className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={handleShareQuestion}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                          </div>
                          <Button onClick={handleNextQuestion}>
                            Next Question
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-xs text-muted-foreground">
                      {subscription.tier === "free" && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {currentPeriod === "morning" || currentPeriod === "afternoon" ? (
                            <span>{remainingMorningQuestions} morning questions left</span>
                          ) : (
                            <span>{remainingEveningQuestions} evening questions left</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>Based on {currentQuestion.theory}</span>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="text-center p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">No Questions Available</h3>
                      <p className="text-muted-foreground mb-4">
                        {getRemainingQuestions() <= 0 && subscription.tier === "free"
                          ? `You've reached your ${currentPeriod} question limit. Come back ${currentPeriod === "morning" || currentPeriod === "afternoon" ? "this evening" : "tomorrow"} for more.`
                          : "You've completed all available questions in this category."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleBackToCategories} variant="outline">
                          Choose Another Category
                        </Button>
                        {subscription.tier === "free" && (
                          <Button onClick={() => navigate("/subscription")}>
                            Upgrade for More
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </AnimatedContainer>
      </main>
      <BottomNav />
    </div>
  );
} 