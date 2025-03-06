import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Brain,
  Target, 
  Sparkles,
  HeartHandshake,
  Lightbulb,
  Puzzle,
  Anchor,
  Flame,
  Shield,
  Zap,
  ArrowRight,
  RocketIcon,
  Hash,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { sexualityJourneyData } from "@/data/relationshipContent";
import { loadJourneyContent, type JourneyContent } from "@/services/journeyService";

// Journey IDs that correspond to our markdown files
const JOURNEY_IDS = [
  'love-languages',
  'communication',
  'conflict',
  'intimacy',
  'values',
  'sexual-intimacy',
  'emotional-intelligence',
  'fantasy-exploration',
  'trust-rebuilding',
  'power-dynamics',
  'mindful-sexuality',
  'relationship-renewal',
  'attachment-healing',
  'conflict-resolution'
];

// Category colors for consistent styling
const CATEGORY_COLORS = {
  "foundation": {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-200 dark:border-green-800/50",
    badge: "bg-green-500",
    hover: "hover:bg-green-50 dark:hover:bg-green-900/20",
    button: "bg-green-500 hover:bg-green-600",
    description: "Foundation journeys help you build the essential elements of a strong relationship."
  },
  "skills": {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/50",
    badge: "bg-indigo-500",
    hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    button: "bg-indigo-500 hover:bg-indigo-600",
    description: "Skills journeys help you develop practical abilities to enhance your relationship."
  },
  "connection": {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/50",
    badge: "bg-rose-500",
    hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20",
    button: "bg-rose-500 hover:bg-rose-600",
    description: "Connection journeys help you deepen your emotional and physical bond."
  },
  "intimacy": {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-800 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800/50",
    badge: "bg-pink-500",
    hover: "hover:bg-pink-50 dark:hover:bg-pink-900/20",
    button: "bg-pink-500 hover:bg-pink-600",
    description: "Intimacy journeys help you explore and enhance your physical connection."
  },
  "healing": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    badge: "bg-amber-500",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    button: "bg-amber-500 hover:bg-amber-600",
    description: "Healing journeys help you overcome challenges and rebuild trust in your relationship."
  },
  "growth": {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-800 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/50",
    badge: "bg-cyan-500",
    hover: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
    button: "bg-cyan-500 hover:bg-cyan-600",
    description: "Growth journeys help you evolve together and prevent relationship stagnation."
  }
};

export default function PathToTogether() {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<JourneyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [activeJourneyDay, setActiveJourneyDay] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active journey in localStorage
    const checkActiveJourney = () => {
      for (const id of JOURNEY_IDS) {
        const lastDay = localStorage.getItem(`${id}_last_day`);
        if (lastDay) {
          setActiveJourney(id);
          setActiveJourneyDay(lastDay);
          break;
        }
      }
    };

    checkActiveJourney();
  }, []);

  useEffect(() => {
    async function loadJourneys() {
      try {
        const loadedJourneys = await Promise.all(
          JOURNEY_IDS.map(id => loadJourneyContent(id))
        );
        
        // Filter out any null results and sort by sequence
        setJourneys(
          loadedJourneys
            .filter((j): j is JourneyContent => j !== null)
            .sort((a, b) => (a.metadata.sequence || 0) - (b.metadata.sequence || 0))
        );
      } catch (error) {
        console.error('Error loading journeys:', error);
      } finally {
        setLoading(false);
      }
    }

    loadJourneys();
  }, []);

  const filteredJourneys = activeTab === "all" 
    ? journeys 
    : journeys.filter(journey => journey.metadata.category.toLowerCase() === activeTab);

  const handleBackNavigation = () => {
    if (activeJourney && activeJourneyDay) {
      // Navigate back to the active journey
      navigate(`/journey/${activeJourney}/start?day=${activeJourneyDay}`);
      toast.info(`Returning to your ${activeJourney.replace('-', ' ')} journey`);
    } else {
      // No active journey, go back to previous page
      navigate(-1);
    }
  };

  // Get the color theme for a category
  const getCategoryColors = (category: string) => {
    const lowerCategory = category.toLowerCase();
    return CATEGORY_COLORS[lowerCategory as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.foundation;
  };

  // Get all unique categories from journeys
  const getCategories = () => {
    const categories = journeys.map(journey => journey.metadata.category.toLowerCase());
    return [...new Set(categories)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={handleBackNavigation} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mx-auto">
            Path to Together
          </h1>
        </div>
      </header>

      {activeJourney && (
        <div className="container max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-full mt-0.5">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">You have an active journey</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
                  Continue your progress on the {activeJourney.replace('-', ' ')} journey for the best results.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => navigate(`/journey/${activeJourney}/start?day=${activeJourneyDay}`)}
                >
                  Continue Journey
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container max-w-6xl mx-auto px-4 pt-2 animate-slide-up">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-lg p-6 mb-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Science-Based Relationship Journeys
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our relationship journeys are carefully crafted based on established psychological theories and evidence-based practices. Each journey combines insights from relationship science, attachment theory, positive psychology, and therapeutic approaches to help you build a stronger, more fulfilling connection.
            </p>
            
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <RocketIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">Your Path to Together</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Our core program consists of five sequential journeys that build upon each other for maximum relationship growth. We recommend following them in order from Journey 1 to 5 for the most comprehensive experience.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    However, each journey is designed to stand on its own, so you can also start with the one that addresses your most pressing relationship needs right now. Every step you take brings you closer to a more connected partnership.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "The quality of our relationships determines the quality of our lives." — Esther Perel
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-full mt-0.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Recommended Journey Sequence</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                For the best results, we recommend completing the first five journeys in sequence. Start with 5 Love Languages (1), then proceed to Effective Communication (2), Healthy Conflict Resolution (3), Deepening Intimacy (4), and finally Values & Vision Alignment (5).
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Journeys</TabsTrigger>
            <TabsTrigger value="foundation" className="bg-green-500 data-[state=active]:bg-green-600 text-white">Foundation</TabsTrigger>
            <TabsTrigger value="skills" className="bg-indigo-500 data-[state=active]:bg-indigo-600 text-white">Skills</TabsTrigger>
            <TabsTrigger value="connection" className="bg-rose-500 data-[state=active]:bg-rose-600 text-white">Connection</TabsTrigger>
            <TabsTrigger value="intimacy" className="bg-pink-500 data-[state=active]:bg-pink-600 text-white">Intimacy</TabsTrigger>
            <TabsTrigger value="healing" className="bg-amber-500 data-[state=active]:bg-amber-600 text-white">Healing</TabsTrigger>
            <TabsTrigger value="growth" className="bg-cyan-500 data-[state=active]:bg-cyan-600 text-white">Growth</TabsTrigger>
          </TabsList>

          {activeTab !== "all" && (
            <div className="mt-4 mb-2 flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {CATEGORY_COLORS[activeTab as keyof typeof CATEGORY_COLORS]?.description || 
                "These journeys focus on a specific aspect of your relationship."}
              </p>
            </div>
          )}

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJourneys.map((journey) => {
                const categoryColors = getCategoryColors(journey.metadata.category);
                return (
                  <Card 
                    key={journey.id} 
                    className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${categoryColors.border}`}
                    onClick={() => navigate(`/journey/${journey.id}`)}
                  >
                    <CardHeader className={`${categoryColors.bg} ${categoryColors.hover}`}>
                      <div className="flex justify-between items-start">
                        <Badge className={`${categoryColors.badge} text-white`}>{journey.metadata.category}</Badge>
                        <Badge variant="outline">{journey.metadata.duration}</Badge>
                      </div>
                      <CardTitle className={`mt-2 ${categoryColors.text}`}>{journey.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        {journey.metadata.description || "Start your journey to a better relationship."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button className={`w-full ${categoryColors.button} text-white`}>
                        View Journey
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {["foundation", "skills", "connection", "intimacy", "healing", "growth"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJourneys.map((journey) => {
                  const categoryColors = getCategoryColors(journey.metadata.category);
                  return (
                    <Card 
                      key={journey.id} 
                      className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${categoryColors.border}`}
                      onClick={() => navigate(`/journey/${journey.id}`)}
                    >
                      <CardHeader className={`${categoryColors.bg} ${categoryColors.hover}`}>
                        <div className="flex justify-between items-start">
                          <Badge className={`${categoryColors.badge} text-white`}>{journey.metadata.category}</Badge>
                          <Badge variant="outline">{journey.metadata.duration}</Badge>
                        </div>
                        <CardTitle className={`mt-2 ${categoryColors.text}`}>{journey.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          {journey.metadata.description || "Start your journey to a better relationship."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className={`w-full ${categoryColors.button} text-white`}>
                          View Journey
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Our Psychological Approach
            </h3>
            <p className="text-gray-700 dark:text-gray-400 mb-4">
              At Sparq Connect, we integrate multiple evidence-based psychological modalities to provide a comprehensive approach to relationship growth:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Anchor className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Attachment Theory</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Understanding how early attachment patterns influence adult relationships and building secure connection.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Gottman Method</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Research-based approach to strengthen relationships through improved communication and conflict resolution.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Emotionally Focused Therapy (EFT)</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creating secure emotional bonds and addressing attachment needs in adult relationships.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Positive Psychology</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focusing on strengths, gratitude, and positive experiences to enhance relationship satisfaction.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cognitive Behavioral Techniques</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Identifying and changing negative thought patterns that impact relationship dynamics.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
} 