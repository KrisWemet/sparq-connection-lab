import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/bottom-nav";
import { 
  Calendar, 
  MessageCircle, 
  Target, 
  Heart, 
  Star, 
  Sparkles,
  ArrowRight,
  Bell,
  Lock,
  Gift,
  Lightbulb,
  Zap,
  Award,
  Clock,
  HeartHandshake,
  Users,
  ChevronRight,
  CheckCircle2,
  Brain,
  Settings,
  PartyPopper,
  Bookmark,
  ThumbsUp
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { dailyEncouragementMessages, funActivitiesAndQuestions } from "@/data/relationshipContent";
import { PartnerInvite } from "@/components/PartnerInvite";
import { supabase } from "@/integrations/supabase/client";

// Color themes based on style
export const colorThemes = {
  azure: {
    primary: "bg-blue-600",
    secondary: "bg-slate-700",
    accent: "bg-emerald-700",
    highlight: "bg-amber-600",
    cardGradient: "from-slate-700 to-slate-600",
    featureGradient: "from-blue-700 to-blue-600",
    textPrimary: "text-blue-600",
    textSecondary: "text-slate-700",
    textAccent: "text-emerald-700",
    borderAccent: "border-blue-600",
    bgSubtle: "bg-blue-50",
  },
  rose: {
    primary: "bg-rose-400",
    secondary: "bg-violet-400",
    accent: "bg-teal-400",
    highlight: "bg-amber-400",
    cardGradient: "from-violet-400 to-violet-300",
    featureGradient: "from-rose-400 to-rose-300",
    textPrimary: "text-rose-400",
    textSecondary: "text-violet-400",
    textAccent: "text-teal-400",
    borderAccent: "border-rose-400",
    bgSubtle: "bg-rose-50",
  },
  indigo: {
    primary: "bg-indigo-500",
    secondary: "bg-purple-500",
    accent: "bg-cyan-500",
    highlight: "bg-amber-500",
    cardGradient: "from-indigo-500 to-indigo-400",
    featureGradient: "from-purple-500 to-purple-400",
    textPrimary: "text-indigo-500",
    textSecondary: "text-purple-500",
    textAccent: "text-cyan-500",
    borderAccent: "border-indigo-500",
    bgSubtle: "bg-indigo-50",
  },
  rainbow: {
    primary: "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500",
    secondary: "bg-gradient-to-r from-blue-500 to-purple-500",
    accent: "bg-gradient-to-r from-pink-500 to-orange-500",
    highlight: "bg-gradient-to-r from-yellow-400 to-pink-400",
    cardGradient: "from-purple-500 to-pink-500",
    featureGradient: "from-blue-500 to-teal-400",
    textPrimary: "text-purple-500",
    textSecondary: "text-pink-500",
    textAccent: "text-blue-500",
    borderAccent: "border-purple-500",
    bgSubtle: "bg-purple-50",
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("today");
  const [userTheme, setUserTheme] = useState("azure");
  const [colors, setColors] = useState(colorThemes[userTheme as keyof typeof colorThemes]);
  
  // Add state to track active journey
  const [activeJourney, setActiveJourney] = useState<{id: string, day: number} | null>(null);
  
  // Add state to track if 36 Questions has been completed
  const [has36QuestionsCompleted, setHas36QuestionsCompleted] = useState(false);
  
  // Add state for partner status
  const [hasPartner, setHasPartner] = useState(false);
  const [isLoadingPartner, setIsLoadingPartner] = useState(true);
  
  // Sample user data
  const userData = {
    name: "Chris",
    partnerName: "Alex",
    gender: "male",
    relationshipDuration: "3 years",
    streak: 12,
    lastActivity: "2 hours ago",
    relationshipInsights: {
      communication: 78,
      intimacy: 65,
      trust: 82,
      conflict: 60,
      overall: 72
    },
    upcomingEvents: [
      {
        id: 1,
        title: "Date Night",
        date: "Friday, 7:00 PM",
        description: "Dinner at Italian restaurant"
      },
      {
        id: 2,
        title: "Anniversary",
        date: "June 15",
        description: "3 years together!"
      }
    ],
    goals: [
      {
        id: 1,
        title: "Weekly Date Nights",
        progress: 75,
        dueDate: "Ongoing"
      },
      {
        id: 2,
        title: "Improve Communication",
        progress: 60,
        dueDate: "Ongoing"
      }
    ],
    insights: [
      {
        id: 1,
        title: "Communication Streak",
        description: "You've completed daily questions for 12 days in a row!",
        icon: <MessageCircle className="w-5 h-5" />
      },
      {
        id: 2,
        title: "Quality Time",
        description: "You've scheduled 3 date activities this month.",
        icon: <Calendar className="w-5 h-5" />
      }
    ]
  };
  
  // Daily activities
  const dailyActivities = [
    {
      id: 1,
      title: "Daily Questions",
      description: "Answer today's relationship questions",
      icon: <MessageCircle className="w-5 h-5" />,
      path: "/daily-questions",
      completed: false,
      highlighted: true,
      premium: false,
      new: false
    },
    {
      id: 2,
      title: "Path to Together",
      description: "Science-based relationship journeys for growth",
      icon: <Brain className="w-5 h-5" />,
      path: "/path-to-together",
      completed: false,
      highlighted: true,
      premium: false,
      new: true
    },
    {
      id: 3,
      title: "Relationship Check-in",
      description: "Quick assessment of your relationship",
      icon: <Heart className="w-5 h-5" />,
      path: "/quiz",
      completed: false,
      highlighted: false,
      premium: false,
      new: false
    },
    {
      id: 4,
      title: "Message Partner",
      description: "Send a thoughtful message",
      icon: <MessageCircle className="w-5 h-5" />,
      path: "/messaging",
      completed: true,
      premium: false
    },
    {
      id: 5,
      title: "AI Therapist",
      description: "Get personalized relationship advice",
      icon: <Brain className="w-5 h-5" />,
      path: "/ai-therapist",
      completed: false,
      premium: true,
      comingSoon: true
    }
  ];
  
  // Upcoming features
  const upcomingFeatures = [
    {
      id: 1,
      title: "AI Relationship Therapist",
      description: "Get personalized guidance from our AI therapist",
      icon: <Brain className="w-5 h-5" />,
      premium: true,
      path: "/ai-therapist",
      available: true
    },
    {
      id: 2,
      title: "Relationship Timeline",
      description: "Document and celebrate your journey together",
      icon: <Clock className="w-5 h-5" />,
      premium: true,
      path: "",
      available: false
    },
    {
      id: 3,
      title: "Couples Challenges",
      description: "Fun activities to strengthen your bond",
      icon: <Target className="w-5 h-5" />,
      premium: false,
      path: "",
      available: false
    }
  ];

  // Add these lines to get today's encouragement message and fun activity based on the date
  const todayIndex = new Date().getDate() % dailyEncouragementMessages.length;
  const todayEncouragement = dailyEncouragementMessages[todayIndex];
  
  const funActivityIndex = (new Date().getDate() + 3) % funActivitiesAndQuestions.length; // offset by 3 to get a different item than encouragement
  const todayFunActivity = funActivitiesAndQuestions[funActivityIndex];

  // Add state for selected categories
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string | null>(null);
  const [selectedJourneyCategory, setSelectedJourneyCategory] = useState<string | null>(null);
  
  // Use effect to simulate loading selected categories from storage/API
  useEffect(() => {
    // This would normally be fetched from an API or local storage
    // Just simulating for this example
    const storedQuestionCategory = localStorage.getItem('selectedQuestionCategory');
    const storedJourneyCategory = localStorage.getItem('selectedJourneyCategory');
    
    if (storedQuestionCategory) setSelectedQuestionCategory(storedQuestionCategory);
    if (storedJourneyCategory) setSelectedJourneyCategory(storedJourneyCategory);
  }, []);

  // Use effect to check if 36 Questions has been completed
  useEffect(() => {
    // Check local storage for 36 Questions completion
    const completed36Questions = localStorage.getItem('completed36Questions');
    if (completed36Questions === 'true') {
      setHas36QuestionsCompleted(true);
    }
    
    // Check for active journey
    checkActiveJourney();
  }, []);

  // Check if user has a partner
  useEffect(() => {
    const checkPartnerStatus = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('partner_id')
          .single();
        
        setHasPartner(!!profile?.partner_id);
      } catch (error) {
        console.error('Error checking partner status:', error);
      } finally {
        setIsLoadingPartner(false);
      }
    };

    checkPartnerStatus();
  }, []);

  useEffect(() => {
    setColors(colorThemes[userTheme as keyof typeof colorThemes]);
    console.log("Dashboard visited:", new Date().toISOString());
  }, [userTheme]);
  
  const logUserActivity = (activity: string, details: any) => {
    console.log("User activity logged:", {
      userId: "user123",
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  };
  
  const handleActivityClick = (path: string, activityId: number) => {
    logUserActivity("clicked_activity", { activityId, path });
    navigate(path);
  };
  
  const handleRelationshipTypeClick = (path: string, typeId: string) => {
    logUserActivity("selected_relationship_type", { typeId, path });
    navigate(path);
  };
  
  const toggleTheme = () => {
    // Cycle through themes: azure -> rose -> indigo -> rainbow -> azure
    const themes = Object.keys(colorThemes);
    const currentIndex = themes.indexOf(userTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    setUserTheme(newTheme);
    setColors(colorThemes[newTheme as keyof typeof colorThemes]);
    toast.success(`Switched to ${newTheme} color theme`);
  };

  // Function to check if the user has an active journey
  const checkActiveJourney = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get the user's journey progress
      const { data: journeyProgress } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (journeyProgress && journeyProgress.length > 0) {
        // Get the journey details
        const { data: journeyDetails } = await supabase
          .from('journeys')
          .select('*')
          .eq('id', journeyProgress[0].journey_id)
          .single();
          
        if (journeyDetails) {
          setActiveJourney({
            id: journeyProgress[0].journey_id,
            day: journeyProgress[0].day
          });
        }
      }
    } catch (error) {
      console.error('Error checking active journey:', error);
    }
  };
  
  // Function to continue the user's active journey
  const continueUserJourney = () => {
    if (activeJourney) {
      // Navigate to the specific journey
      switch(activeJourney.id) {
        case 'love-languages':
          navigate("/journey/love-languages");
          break;
        case 'sexual-intimacy':
          navigate("/journey/sexual-intimacy");
          break;
        case '36-questions':
          navigate("/journey/36-questions");
          break;
        case 'conflict-resolution':
          navigate("/journey/conflict-resolution");
          break;
        default:
          // If no active journey or unknown journey, go to the journeys list
          navigate("/path-to-together");
      }
    } else {
      // If no active journey, go to the journeys list
      navigate("/path-to-together");
    }
  };

  return (
    <div className={`min-h-[100dvh] pb-16 ${
      userTheme === "azure" ? "bg-blue-50/40" : 
      userTheme === "rose" ? "bg-rose-50/30" : 
      userTheme === "indigo" ? "bg-indigo-50/40" : 
      "bg-purple-50/30"
    } dark:bg-gray-900`}>
      <header className={`sticky top-0 z-50 bg-white border-b dark:bg-gray-800 dark:border-gray-700`}>
        <div className="container max-w-lg mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className={`w-6 h-6 ${colors.textPrimary}`} />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sparq Connect</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate("/settings")} 
                className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-3 pb-20 animate-slide-up">
        <div className={`bg-gradient-to-r ${colors.cardGradient} text-white rounded-lg p-5 mb-5`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">Hi, {userData.name}!</h2>
              <p className="text-white/80">Connected with {userData.partnerName}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.highlight} text-white font-bold text-lg`}>
                {userData.streak}
              </div>
              <span className="text-xs mt-1 text-white/80">Day streak</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => navigate("/daily-questions")}
            >
              Today's Questions
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => navigate("/messaging")}
            >
              Message Partner
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => navigate("/path-to-together")}
            >
              Journey
            </Button>
          </div>
        </div>

        {/* Free "36 Questions" Card - only shown if not completed - MOVED to top position */}
        {!has36QuestionsCompleted && (
          <Card className="mb-4 overflow-hidden border border-green-200 dark:border-green-800/30 shadow-md hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0 mt-1">
                  <HeartHandshake className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">36 Questions to Fall in Love</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Free</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Try this science-backed method to deepen your connection through carefully sequenced questions.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                    "The 36 questions that lead to love" - NY Times
                  </p>
                  <Button 
                    className="w-full border-green-200 hover:bg-green-600 hover:text-white"
                    onClick={() => {
                      // In a real app, you'd navigate and then handle completion after the journey
                      navigate("/journey/36-questions");
                      // For demo purposes, simulate completing the journey after clicking
                      localStorage.setItem('completed36Questions', 'true');
                    }}
                  >
                    Explore Free Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Daily encouragement - enhanced language */}
        <div 
          className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 dark:from-amber-950 dark:to-amber-900 dark:border-amber-800 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/daily-questions")}
        >
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full mt-1">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{todayEncouragement.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                {todayEncouragement.message}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                {todayEncouragement.fact}
              </p>
            </div>
          </div>
        </div>

        {/* Partner Invitation - show only if user doesn't have a partner */}
        {!isLoadingPartner && !hasPartner && (
          <div className="mb-4">
            <PartnerInvite />
          </div>
        )}

        {/* Relationship Insights Card - Moved right after daily inspiration */}
        <Card 
          className="mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/insights")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className={`w-5 h-5 mr-2 ${colors.textPrimary}`} />
              Relationship Insights
            </CardTitle>
            <CardDescription>
              Based on your interactions and responses
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Communication</span>
                  <span>{userData.relationshipInsights.communication}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-indigo-500" 
                    style={{ width: `${userData.relationshipInsights.communication}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Intimacy</span>
                  <span>{userData.relationshipInsights.intimacy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-rose-500" 
                    style={{ width: `${userData.relationshipInsights.intimacy}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Trust</span>
                  <span>{userData.relationshipInsights.trust}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-emerald-500" 
                    style={{ width: `${userData.relationshipInsights.trust}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="font-medium">Conflict Resolution</span>
                  <span>{userData.relationshipInsights.conflict}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-amber-500" 
                    style={{ width: `${userData.relationshipInsights.conflict}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Overall Health</span>
                  <span className="font-medium">{userData.relationshipInsights.overall}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${colors.primary}`}
                    style={{ width: `${userData.relationshipInsights.overall}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-4">
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={() => navigate("/daily-questions")}
            >
              Improve Your Scores
            </Button>
          </div>
        </Card>

        {/* Fun Activity - now placed BEFORE daily questions */}
        <div 
          className="relative mb-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/date-ideas")}
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950 dark:to-indigo-900 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mt-1">
                <PartyPopper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Today's Fun: {todayFunActivity.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {todayFunActivity.activity}
                </p>
                <div className="space-y-1.5 mb-1">
                  {todayFunActivity.examples.map((example, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{example}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      toast.success("Added to saved activities!");
                    }}
                  >
                    <Bookmark className="w-3.5 h-3.5 mr-1" />
                    Save Activity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Questions - with more emotionally enticing language */}
        <div 
          className="relative mb-4 cursor-pointer"
          onClick={() => navigate("/daily-questions")}
        >
          <Card className={`border-2 ${colors.borderAccent} shadow-md overflow-hidden hover:shadow-lg transition-shadow`}>
            <div className={`${colors.bgSubtle} p-4`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${colors.primary} text-white`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Questions</h3>
                  {selectedQuestionCategory ? (
                    <p className="text-sm text-gray-600">Category: <span className="font-medium">{selectedQuestionCategory}</span></p>
                  ) : (
                    <p className="text-sm text-gray-600">Ignite meaningful conversation</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Discover each other anew every day. These soul-stirring questions will spark connection, vulnerability, and deeper intimacy that brings you closer than ever before.
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate("/daily-questions")}
              >
                Deepen Your Connection Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Path to Together / Journey - with more emotionally enticing language */}
        <div className="relative mb-4">
          <Card 
            className="overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => continueUserJourney()}
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-purple-500 text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Path to Together</h3>
                  {selectedJourneyCategory ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category: <span className="font-medium">{selectedJourneyCategory}</span></p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transform your relationship</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Embark on a transformative journey that will reignite passion, deepen understanding, and create an unbreakable bond. Experience the relationship you've always dreamed of through these captivating experiences.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-rose-500">❤️</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Deeper Connection</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-amber-500">✨</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">New Understanding</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-emerald-500">🔄</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Better Communication</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-blue-500">🛡️</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Renewed Intimacy</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white border-none"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  continueUserJourney();
                }}
              >
                {activeJourney ? 'Continue Your Journey' : 'Begin Your Transformation'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="today" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Daily</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-6 space-y-4">
            {dailyActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`overflow-hidden ${activity.highlighted ? `border-2 ${colors.borderAccent}` : ''}`}
                onClick={() => handleActivityClick(activity.path, activity.id)}
              >
                <CardContent className="p-4 flex items-center cursor-pointer">
                  <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100' : colors.bgSubtle} mr-4`}>
                    {activity.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className={activity.highlighted ? colors.textPrimary : "text-gray-600"}>
                        {activity.icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      {activity.premium && (
                        <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Premium</Badge>
                      )}
                      {activity.new && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="goals" className="mt-6 space-y-4">
            {userData.goals.map((goal) => (
              <Card key={goal.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <span className="text-xs text-gray-500">Due: {goal.dueDate}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className={`h-2.5 rounded-full ${colors.primary}`} 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{goal.progress}% complete</span>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="events" className="mt-6 space-y-4">
            {userData.upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colors.bgSubtle}`}>
                      <Calendar className={`w-5 h-5 ${colors.textPrimary}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.date}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate("/date-ideas")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Plan New Date
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6 space-y-4">
            {userData.insights.map((insight) => (
              <Card key={insight.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colors.bgSubtle}`}>
                      <div className={colors.textPrimary}>{insight.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
            <Badge className="ml-2 bg-purple-100 text-purple-800">New Features</Badge>
          </div>
          
          <div className="space-y-4">
            {upcomingFeatures.map((feature) => (
              <Card key={feature.id} className="overflow-hidden opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colors.bgSubtle}`}>
                      <div className={colors.textPrimary}>{feature.icon}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                        {feature.premium && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    {feature.path ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(feature.path)}
                        className="text-xs"
                      >
                        Preview
                      </Button>
                    ) : (
                      <Badge variant="outline">Soon</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Card className={`bg-gradient-to-r ${colors.featureGradient} text-white mb-8`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
                <p className="text-white/80 text-sm mb-4">
                  Get access to all premium features, including the upcoming AI Relationship Coach.
                </p>
                <Button 
                  className="bg-white text-gray-900 hover:bg-white/90"
                  onClick={() => navigate("/subscription")}
                >
                  View Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
} 