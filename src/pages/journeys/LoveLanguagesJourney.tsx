import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  Gift,
  Handshake,
  Hand,
  CheckCircle,
  Home,
  MessageSquare,
  Target,
  User,
  HeartCrack,
  History,
  RefreshCw,
  PanelTop,
  PartyPopper,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyticsService } from "@/services/analyticsService";
import { loadJourneyContent } from "@/services/journeyService";
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface JourneyProgress {
  id: string;
  day: number;
  completed: boolean;
  responses: Record<string, any>;
  completed_at: string | null;
}

const loveLanguages = [
  {
    id: "words",
    title: "Words of Affirmation",
    description: "Kind, encouraging words that make you feel appreciated",
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    id: "time",
    title: "Quality Time",
    description: "Spending focused, uninterrupted time together",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    id: "service",
    title: "Acts of Service",
    description: "Doing helpful things for each other",
    icon: <Handshake className="w-5 h-5" />,
  },
  {
    id: "touch",
    title: "Physical Touch",
    description: "Hugs, kisses, or gentle touches that create warmth",
    icon: <Hand className="w-5 h-5" />,
  },
  {
    id: "gifts",
    title: "Receiving Gifts",
    description: "Small, thoughtful items that show you care",
    icon: <Gift className="w-5 h-5" />,
  },
];

export default function LoveLanguagesJourney() {
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(1);
  const [progress, setProgress] = useState<JourneyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [journeyContent, setJourneyContent] = useState<string>('');
  const [dayContent, setDayContent] = useState<string>('');
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [selectedLanguageDetails, setSelectedLanguageDetails] = useState<{
    id: string;
    title: string;
    description: string;
    example: string;
    color: string;
    icon: React.ReactNode;
  } | null>(null);

  useEffect(() => {
    loadProgress();
    loadContent();
  }, []);

  useEffect(() => {
    if (journeyContent) {
      extractDayContent(currentDay);
    }
  }, [currentDay, journeyContent]);

  const loadContent = async () => {
    try {
      const content = await loadJourneyContent('love-languages');
      if (content) {
        setJourneyContent(content.content);
      }
    } catch (error) {
      console.error('Error loading journey content:', error);
    }
  };

  const extractDayContent = (day: number) => {
    if (!journeyContent) return;
    
    // Extract content for the specific day
    const dayRegex = new RegExp(`## Day ${day}:.*?(?=## Day ${day + 1}:|## Your Journey Plan|$)`, 's');
    const match = journeyContent.match(dayRegex);
    
    if (match) {
      setDayContent(match[0]);
    } else {
      setDayContent('');
    }
  };

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: journeyProgress } = await supabase
        .from('journey_progress')
        .select('*')
        .eq('journey_id', 'love-languages')
        .eq('user_id', user.id)
        .order('day', { ascending: true });

      if (journeyProgress && journeyProgress.length > 0) {
        setProgress(journeyProgress);
        
        // Find the highest day the user has completed
        const highestCompletedDay = Math.max(...journeyProgress.filter(p => p.completed).map(p => p.day), 0);
        
        // Set current day to the next day after the highest completed day
        // If user has completed all days up to day X, they should continue with day X+1
        // If no days completed yet, start with day 1
        setCurrentDay(highestCompletedDay >= 14 ? 14 : highestCompletedDay + 1);
        
        // If they have already started the current day, load those responses
        const currentDayProgress = journeyProgress.find(p => p.day === currentDay);
        if (currentDayProgress) {
          setResponses(currentDayProgress.responses || {});
          
          // If they already selected languages, restore those selections
          if (currentDayProgress.responses && currentDayProgress.responses.selectedLanguages) {
            setSelectedLanguages(currentDayProgress.responses.selectedLanguages);
          }
        }
      } else {
        // No progress yet, start from day 1
        setCurrentDay(1);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();
      
      // Save journey progress with both current day and user responses
      await supabase
        .from('journey_progress')
        .upsert({
          journey_id: 'love-languages',
          user_id: user.id,
          day: currentDay,
          responses,
          completed: true,
          completed_at: now,
          updated_at: now
        });

      // Track progress in analytics
      await analyticsService.trackJourneyProgress('love-languages', 'activity_completed', {
        day: currentDay,
        responses,
      });

      toast.success('Progress saved!');
      
      // If this was the last day, mark the journey as completed
      if (currentDay === 14) {
        await analyticsService.trackJourneyProgress('love-languages', 'completed');
        toast.success('Congratulations on completing the Love Languages Journey! 🎉');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleNext = async () => {
    await saveProgress();
    setCelebrationOpen(true);
  };

  const handleCelebrationClose = () => {
    setCelebrationOpen(false);
    navigate('/');
  };

  const handlePrevious = () => {
    setCurrentDay(prev => Math.max(prev - 1, 1));
    
    // When navigating to previous day, load any saved responses for that day
    const prevDayProgress = progress.find(p => p.day === currentDay - 1);
    if (prevDayProgress && prevDayProgress.responses) {
      setResponses(prevDayProgress.responses);
      
      // If they already had selected languages, restore those selections
      if (prevDayProgress.responses.selectedLanguages) {
        setSelectedLanguages(prevDayProgress.responses.selectedLanguages);
      } else {
        setSelectedLanguages([]);
      }
    } else {
      // If no saved responses, reset
      setResponses({});
      setSelectedLanguages([]);
    }
  };

  const renderDailyContent = () => {
    // If we have markdown content for the day, render it
    if (dayContent) {
      // Extract title, sections, and content more effectively
      const titleMatch = dayContent.match(/## Day \d+: (.*?)[\r\n]/);
      const title = titleMatch ? titleMatch[1] : `Day ${currentDay}`;
      
      // Extract "Today's Learning" section
      const learningMatch = dayContent.match(/### Today's Learning\s+([\s\S]*?)(?=###|$)/);
      const learningContent = learningMatch ? learningMatch[1].trim() : '';
      
      // Extract key insights
      const insightsMatch = learningContent.match(/Here are some powerful insights([\s\S]*?)Let's look at how these principles/);
      const insightsContent = insightsMatch ? insightsMatch[1].trim() : '';
      
      // Extract examples
      const examplesMatch = learningContent.match(/Let's look at how these principles([\s\S]*?)(?=### Why This Matters|$)/);
      const examplesContent = examplesMatch ? examplesMatch[1].trim() : '';
      
      // Extract specific examples
      const bridgingMatch = examplesContent.match(/\*\*Bridging Love Language Differences\*\*([\s\S]*?)(?=\*\*Quality Time|$)/);
      const bridgingExample = bridgingMatch ? bridgingMatch[1].trim() : '';
      
      const qualityTimeMatch = examplesContent.match(/\*\*Quality Time in a Busy World\*\*([\s\S]*?)(?=\*\*Physical Touch|$)/);
      const qualityTimeExample = qualityTimeMatch ? qualityTimeMatch[1].trim() : '';
      
      const touchMatch = examplesContent.match(/\*\*Physical Touch as Emotional Connection\*\*([\s\S]*?)$/);
      const touchExample = touchMatch ? touchMatch[1].trim() : '';
      
      // Extract "Why This Matters" section
      const whyMatch = dayContent.match(/### Why This Matters For Your Relationship\s+([\s\S]*?)(?=###|$)/);
      const whyContent = whyMatch ? whyMatch[1].trim() : '';
      
      // Extract "Today's Activity" section
      const activityMatch = dayContent.match(/### Today's Activity\s+([\s\S]*?)(?=###|$)/);
      const activityContent = activityMatch ? activityMatch[1].trim() : '';
      
      // Extract "Reflection Questions" section
      const reflectionMatch = dayContent.match(/### Reflection Questions\s+([\s\S]*?)(?=##|$)/);
      const reflectionQs = reflectionMatch ? reflectionMatch[1].trim() : '';
      
      // Parse reflection questions into array
      const reflectionQuestions = reflectionQs.split(/\d+\.\s/).filter(q => q.trim().length > 0);
      
      // Extract the love languages descriptions if day 2
      let loveLanguageDescriptions = {};
      if (currentDay === 2) {
        const wordsMatch = learningContent.match(/\*\*Words of Affirmation\*\*[\s\S]*?(?=\*\*Acts of Service\*\*)/);
        const actsMatch = learningContent.match(/\*\*Acts of Service\*\*[\s\S]*?(?=\*\*Receiving Gifts\*\*)/);
        const giftsMatch = learningContent.match(/\*\*Receiving Gifts\*\*[\s\S]*?(?=\*\*Quality Time\*\*)/);
        const timeMatch = learningContent.match(/\*\*Quality Time\*\*[\s\S]*?(?=\*\*Physical Touch\*\*)/);
        const touchMatch = learningContent.match(/\*\*Physical Touch\*\*[\s\S]*?(?=Understanding your own primary)/);
        
        loveLanguageDescriptions = {
          words: wordsMatch ? wordsMatch[0].trim() : '',
          acts: actsMatch ? actsMatch[0].trim() : '',
          gifts: giftsMatch ? giftsMatch[0].trim() : '',
          time: timeMatch ? timeMatch[0].trim() : '',
          touch: touchMatch ? touchMatch[0].trim() : ''
        };
      }
      
      // Get the love language image for the current day
      const getLoveLanguageImage = () => {
        // Different images for different days
        switch(currentDay) {
          case 1:
            return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
          case 2:
            return "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80";
          case 3:
            return "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
          case 4:
            return "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80";
          default:
            return "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
        }
      };
      
      // Extract the introduction paragraph
      const introMatch = learningContent.match(/Welcome to Day \d+[\s\S]*?(?=Have you ever felt|Here are some powerful)/);
      const introContent = introMatch ? introMatch[0].trim() : '';
      
      // Extract the "Have you ever felt" paragraph if it exists
      const questionMatch = learningContent.match(/Have you ever felt[\s\S]*?(?=Many couples find|Here are some powerful)/);
      const questionContent = questionMatch ? questionMatch[0].trim() : '';
      
      // Extract the "Many couples find" paragraph
      const couplesMatch = learningContent.match(/Many couples find[\s\S]*?(?=Here are some powerful)/);
      const couplesContent = couplesMatch ? couplesMatch[0].trim() : '';
      
      // Function to extract key points from text content
      const extractKeyPoints = (content) => {
        const points = content.split('\n\n').filter(p => p.trim().length > 0);
        return points.length > 0 ? points : [content];
      };
      
      // Turn lesson insights into cards
      const insightCards = () => {
        const insights = [
          {
            title: "We all have different love languages",
            icon: <Heart className="w-5 h-5 text-pink-500" />,
            content: "Each person has primary ways they prefer to receive love. What makes you feel loved might be completely different from what makes your partner feel loved."
          },
          {
            title: "Mismatched languages create disconnection",
            icon: <HeartCrack className="w-5 h-5 text-red-500" />,
            content: "When you speak different love languages, you can both be trying hard but missing each other emotionally."
          },
          {
            title: "Your past influences your love language",
            icon: <History className="w-5 h-5 text-purple-500" />,
            content: "How you were shown love growing up, or what you lacked, often shapes what resonates most with you now."
          },
          {
            title: "Love languages can change over time",
            icon: <RefreshCw className="w-5 h-5 text-green-500" />,
            content: "Life circumstances, personal growth, and relationship dynamics can shift which expressions of love feel most meaningful to you."
          }
        ];
        
        return (
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {insights.map((insight, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      {insight.icon}
                    </div>
                    <h4 className="font-medium text-primary">{insight.title}</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300">{insight.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      };
      
      // Get language-specific examples
      const getLanguageExample = (langId: string) => {
        switch(langId) {
          case "words":
            return "Jamie feels most loved through Words of Affirmation. After learning about love languages, Alex began leaving small notes of appreciation and verbally acknowledging Jamie's contributions.";
          case "service":
            return "Alex's love language is Acts of Service. Jamie started recognizing that taking care of car maintenance and handling the taxes were actually profound expressions of love.";
          case "gifts":
            return "Lin treasures the small thoughtful gifts Pat gives—not because of their value, but because they show that Pat was thinking about Lin even when they were apart.";
          case "time":
            return "Morgan and Taylor created a ritual of 20 minutes of completely undistracted connection each evening, making it a sacred part of their day.";
          case "touch":
            return "Sam feels connected through Physical Touch. Jordan began incorporating small moments of physical connection throughout the day—transforming their relationship.";
          default:
            return "Understanding this love language can transform how you experience love in your relationship.";
        }
      };
      
      // Language cards with integrated examples
      const languageCards = () => {
        const languages = [
          {
            id: "words",
            title: "Words of Affirmation",
            description: "Verbal expressions of love and appreciation that touch the heart",
            icon: <MessageCircle className="w-5 h-5" />,
            color: "pink",
            example: getLanguageExample("words")
          },
          {
            id: "service",
            title: "Acts of Service",
            description: "Doing helpful things for your partner that show you truly care",
            icon: <Handshake className="w-5 h-5" />,
            color: "amber",
            example: getLanguageExample("service")
          },
          {
            id: "gifts",
            title: "Receiving Gifts",
            description: "Thoughtful presents that symbolize \"I was thinking of you\"",
            icon: <Gift className="w-5 h-5" />,
            color: "emerald",
            example: getLanguageExample("gifts")
          },
          {
            id: "time",
            title: "Quality Time",
            description: "Giving your undivided attention - the gift of your presence",
            icon: <Clock className="w-5 h-5" />,
            color: "blue",
            example: getLanguageExample("time")
          },
          {
            id: "touch",
            title: "Physical Touch",
            description: "Expressing affection through touch that creates connection",
            icon: <Hand className="w-5 h-5" />,
            color: "purple",
            example: getLanguageExample("touch")
          }
        ];
        
        return (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {languages.map(language => (
              <Card 
                key={language.id} 
                className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedLanguageDetails(language)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r from-${language.color}-100 to-${language.color}-50 dark:from-${language.color}-900/30 dark:to-${language.color}-800/10 p-4 flex items-center gap-3 justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm`}>
                        {language.icon}
                      </div>
                      <h4 className={`font-medium text-${language.color}-700 dark:text-${language.color}-400`}>{language.title}</h4>
                    </div>
                    <ExternalLink className={`w-4 h-4 text-${language.color}-500`} />
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{language.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      };
      
      // Render detailed love language descriptions for day 2
      const renderLanguageDetails = () => {
        if (currentDay !== 2) return null;
        
        return (
          <div className="mt-6 space-y-6">
            <h3 className="text-lg font-semibold text-primary">Recognizing Your Love Language</h3>
            <p className="text-gray-700 dark:text-gray-300">
              As you read about each love language, notice which descriptions resonate most deeply with you.
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="words">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Words of Affirmation</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <p>You might have this as your primary language if:</p>
                    <ul>
                      <li>Compliments and praise stay with you for days</li>
                      <li>Hearing "I love you" never gets old</li>
                      <li>Harsh words hurt deeply and are hard to forget</li>
                      <li>You save cards, notes, or texts with kind words</li>
                    </ul>
                    <p className="italic mt-2 text-gray-600 dark:text-gray-400">
                      "Does your heart light up when your partner notices your efforts and tells you how much they appreciate you?"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="acts">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-primary" />
                    <span>Acts of Service</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <p>You might have this as your primary language if:</p>
                    <ul>
                      <li>Someone helping with tasks makes you feel deeply cared for</li>
                      <li>You appreciate when someone makes your life easier</li>
                      <li>You feel loved when your partner takes initiative</li>
                      <li>Broken promises feel particularly hurtful</li>
                    </ul>
                    <p className="italic mt-2 text-gray-600 dark:text-gray-400">
                      "Do you feel a surge of appreciation when your partner makes dinner after your long day?"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="gifts">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span>Receiving Gifts</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <p>You might have this as your primary language if:</p>
                    <ul>
                      <li>You treasure physical symbols of love</li>
                      <li>You remember gifts you've received in detail</li>
                      <li>You put significant thought into selecting gifts for others</li>
                      <li>Forgotten special occasions feel particularly hurtful</li>
                    </ul>
                    <p className="italic mt-2 text-gray-600 dark:text-gray-400">
                      "Does your heart melt when your partner brings you a small gift 'just because'?"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="time">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Quality Time</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <p>You might have this as your primary language if:</p>
                    <ul>
                      <li>Undivided attention makes you feel truly valued</li>
                      <li>You feel most connected during one-on-one time</li>
                      <li>Canceled plans feel especially painful</li>
                      <li>You prefer conversation without distractions</li>
                    </ul>
                    <p className="italic mt-2 text-gray-600 dark:text-gray-400">
                      "Do you feel most connected when you and your partner are fully present with each other?"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="touch">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Hand className="w-4 h-4 text-primary" />
                    <span>Physical Touch</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert max-w-none prose-sm">
                    <p>You might have this as your primary language if:</p>
                    <ul>
                      <li>You feel calmer after hugs or physical contact</li>
                      <li>You naturally reach out to touch your partner</li>
                      <li>Physical distance feels particularly painful</li>
                      <li>You find comfort in holding hands or sitting close</li>
                    </ul>
                    <p className="italic mt-2 text-gray-600 dark:text-gray-400">
                      "Does a hug communicate more than words ever could?"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      };
      
      // Render reflection questions as interactive cards
      const renderReflectionCards = () => {
        if (!reflectionQuestions.length) return null;
        
        return (
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {reflectionQuestions.map((question, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full text-green-600 dark:text-green-400 shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{question.trim()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      };
      
      // Streamlined activity section
      const renderActivity = () => {
        if (!activityContent) return null;
        
        // Extract just the key instructions from activity
        const activitySteps = activityContent.split('\n\n').filter(p => p.trim().length > 0);
        const sentences = activitySteps.length > 1 ? activitySteps[1].split(/\r?\n/).filter(s => s.includes('- "')) : [];
        
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-md border-0 overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-l-4 border-blue-400">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Today's Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Put your learning into practice
              </p>
            </div>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {activitySteps.length > 0 ? activitySteps[0] : 'Set aside time to complete today\'s activity.'}
              </p>
              
              {sentences.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Complete these sentences together:</h4>
                  <ul className="space-y-2">
                    {sentences.map((sentence, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {sentence.replace(/- "/g, '').replace(/"/g, '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-3 shrink-0">
                    <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400">Pro Tip</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Set a calendar reminder to practice what you've learned today. Consistency is key to creating lasting change in your relationship.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      };
      
      return (
        <div className="space-y-8">
          {/* Featured Image with Title Overlay */}
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={getLoveLanguageImage()} 
              alt={`Love Languages Day ${currentDay}`} 
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 w-full">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  {`Day ${currentDay}: ${title}`}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Quick Overview Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    Day {currentDay} of 14
                  </Badge>
                  <Badge variant="outline" className="bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 px-3 py-1">
                    {currentDay <= 3 ? 'Foundation' : currentDay <= 7 ? 'Discovery' : 'Application'}
                  </Badge>
                </div>
                
                <div className="prose dark:prose-invert">
                  <p className="text-lg">
                    {introContent.split('.')[0]}. 
                  </p>
                </div>
                
                {questionContent && (
                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mt-4">
                    <p className="italic text-gray-700 dark:text-gray-300">{questionContent}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Key Insights Section - MOVED ABOVE language cards */}
          {currentDay === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Key Insights</h3>
              {insightCards()}
            </div>
          )}
          
          {/* Love Language Cards with Examples - REPLACED separate examples section */}
          {currentDay === 1 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-semibold text-primary">The Five Love Languages</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click on each card to learn more about that love language and see real-life examples.
              </p>
              {languageCards()}
            </div>
          )}
          
          {/* Day 2 Love Language Details */}
          {renderLanguageDetails()}
          
          {/* Today's Activity */}
          {renderActivity()}
          
          {/* Love Languages Selection */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border-0">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-xl font-semibold text-primary">Which love languages resonate with you?</CardTitle>
              <CardDescription>Select up to two that speak to you most</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {loveLanguages.map(language => (
                  <div 
                    key={language.id} 
                    className={`p-4 rounded-lg flex items-center gap-3 cursor-pointer border-2 transition-all hover:shadow-md ${
                      selectedLanguages.includes(language.id) 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedLanguages.includes(language.id)) {
                        setSelectedLanguages(selectedLanguages.filter(id => id !== language.id));
                        setResponses({
                          ...responses,
                          selectedLanguages: selectedLanguages.filter(id => id !== language.id),
                        });
                      } else if (selectedLanguages.length < 2) {
                        setSelectedLanguages([...selectedLanguages, language.id]);
                        setResponses({
                          ...responses,
                          selectedLanguages: [...selectedLanguages, language.id],
                        });
                      }
                    }}
                  >
                    <div className={`p-3 rounded-full ${selectedLanguages.includes(language.id) ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                      {language.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{language.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{language.description}</p>
                    </div>
                    {selectedLanguages.includes(language.id) && (
                      <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Reflection Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border-0 overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-l-4 border-green-400">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Your Reflections</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Capture your thoughts and feelings
              </p>
            </div>
            <CardContent className="p-6">
              <Textarea
                className="min-h-[120px] resize-none border-gray-200 dark:border-gray-700 focus:border-green-400 focus:ring-green-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                placeholder="How does today's learning relate to your own relationship experiences? What insights feel most meaningful to you personally?"
                value={responses.reflection || ''}
                onChange={(e) => setResponses({ ...responses, reflection: e.target.value })}
              />
              
              {reflectionQuestions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">Reflection Prompts:</h4>
                  {renderReflectionCards()}
                </div>
              )}
              
              <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Remember:</span> There are no right or wrong answers. Your personal experiences and feelings are what matter most in this journey.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation buttons - CHANGED "Next Day" to "Finish Day X" */}
          <div className="flex justify-between items-center mt-8 pb-20">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentDay === 1}
              className="flex items-center gap-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Day
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isCurrentDayComplete()}
              className="flex items-center gap-1 bg-primary hover:bg-primary/90 transition-all"
            >
              <span>Finish Day {currentDay}</span>
              <CheckCircle className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Love Language Details Dialog */}
          <Dialog open={selectedLanguageDetails !== null} onOpenChange={(open) => !open && setSelectedLanguageDetails(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedLanguageDetails?.icon}
                  <span>{selectedLanguageDetails?.title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLanguageDetails?.description}</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Real-Life Example:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLanguageDetails?.example}</p>
                </div>
                
                <h4 className="font-medium mt-2 text-gray-800 dark:text-gray-200">Signs this might be your love language:</h4>
                <ul className="text-sm space-y-2">
                  {selectedLanguageDetails?.id === "words" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-500 mt-1 shrink-0" />
                        <span>Compliments and praise stay with you for days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-500 mt-1 shrink-0" />
                        <span>Hearing "I love you" never gets old</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-pink-500 mt-1 shrink-0" />
                        <span>You save cards, notes, or texts with kind words</span>
                      </li>
                    </>
                  )}
                  {selectedLanguageDetails?.id === "service" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                        <span>Someone helping with tasks makes you feel deeply cared for</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                        <span>You feel loved when your partner takes initiative</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                        <span>"Actions speak louder than words" resonates with you</span>
                      </li>
                    </>
                  )}
                  {selectedLanguageDetails?.id === "gifts" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                        <span>You treasure physical symbols of love</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                        <span>You remember gifts you've received in detail</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                        <span>You keep and cherish mementos from experiences</span>
                      </li>
                    </>
                  )}
                  {selectedLanguageDetails?.id === "time" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <span>Undivided attention makes you feel truly valued</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <span>Canceled plans feel especially painful</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                        <span>You prefer conversation without distractions</span>
                      </li>
                    </>
                  )}
                  {selectedLanguageDetails?.id === "touch" && (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                        <span>You feel calmer after hugs or physical contact</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                        <span>You naturally reach out to touch your partner</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                        <span>Physical distance feels particularly painful</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedLanguageDetails(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Celebration Dialog */}
          <Dialog open={celebrationOpen} onOpenChange={setCelebrationOpen}>
            <DialogContent className="max-w-md">
              <div className="py-6 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <PartyPopper className="w-10 h-10 text-primary" />
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-blue-400 absolute -bottom-1 -left-1 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-primary">Day {currentDay} Complete!</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Great job! You've completed today's lesson on love languages. 
                    Your insights have been saved and will help strengthen your relationship.
                  </p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg text-left">
                  <h3 className="font-medium text-primary mb-2">Your key takeaways:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You selected: {selectedLanguages.map(id => 
                        loveLanguages.find(l => l.id === id)?.title
                      ).join(' & ')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You've learned about the foundations of the 5 love languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You've reflected on how love languages apply to your relationship</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleCelebrationClose} 
                    className="w-full"
                  >
                    Continue Your Journey
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
    
    // Fallback to the original hardcoded content if markdown isn't available
    switch (currentDay) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learn About the Love Languages</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Today, you'll learn about the five different ways people express and receive love.
                Pay attention to which ones resonate with you the most.
              </p>
              
              <div className="grid gap-4">
                {loveLanguages.map(language => (
                  <Card key={language.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {language.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{language.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {language.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4 mt-6">
                <Label>Which two love languages resonated with you most today?</Label>
                <div className="grid gap-2">
                  {loveLanguages.map(language => (
                    <div key={language.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={language.id}
                        checked={selectedLanguages.includes(language.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedLanguages.length < 2) {
                              setSelectedLanguages([...selectedLanguages, language.id]);
                              setResponses({
                                ...responses,
                                selectedLanguages: [...selectedLanguages, language.id],
                              });
                            }
                          } else {
                            setSelectedLanguages(selectedLanguages.filter(id => id !== language.id));
                            setResponses({
                              ...responses,
                              selectedLanguages: selectedLanguages.filter(id => id !== language.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={language.id}>{language.title}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Reflect on today's observations</Label>
                <Textarea
                  placeholder="Share your thoughts about the love languages you noticed today..."
                  value={responses.reflection || ''}
                  onChange={(e) => setResponses({ ...responses, reflection: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reflect on Past Moments of Feeling Loved</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Today, we'll explore your memories of feeling deeply loved and identify which love languages were present in those moments.
              </p>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Memory 1: A time you felt deeply loved</Label>
                  <Textarea
                    placeholder="Describe a specific memory when you felt deeply loved by your partner or someone close to you..."
                    value={responses.memory1 || ''}
                    onChange={(e) => setResponses({ ...responses, memory1: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <div className="space-y-2">
                    <Label>Which love language was most present in this memory?</Label>
                    <RadioGroup
                      value={responses.memory1Language || ''}
                      onValueChange={(value) => setResponses({ ...responses, memory1Language: value })}
                    >
                      {loveLanguages.map(language => (
                        <div key={language.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={language.id} id={`memory1-${language.id}`} />
                          <Label htmlFor={`memory1-${language.id}`}>{language.title}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Memory 2: Another meaningful moment</Label>
                  <Textarea
                    placeholder="Describe another memory when you felt particularly loved and appreciated..."
                    value={responses.memory2 || ''}
                    onChange={(e) => setResponses({ ...responses, memory2: e.target.value })}
                    className="min-h-[100px]"
                  />
                  <div className="space-y-2">
                    <Label>Which love language was most present in this memory?</Label>
                    <RadioGroup
                      value={responses.memory2Language || ''}
                      onValueChange={(value) => setResponses({ ...responses, memory2Language: value })}
                    >
                      {loveLanguages.map(language => (
                        <div key={language.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={language.id} id={`memory2-${language.id}`} />
                          <Label htmlFor={`memory2-${language.id}`}>{language.title}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Today's Observations</Label>
                  <Textarea
                    placeholder="Reflect on any moments today that reminded you of these memories or made you feel loved in similar ways..."
                    value={responses.reflection || ''}
                    onChange={(e) => setResponses({ ...responses, reflection: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      // Add more cases for other days...
      default:
        return <div>Content for day {currentDay} is coming soon!</div>;
    }
  };

  const isCurrentDayComplete = () => {
    switch (currentDay) {
      case 1:
        return responses.reflection && selectedLanguages.length === 2;
      case 2:
        return (
          responses.memory1 &&
          responses.memory2 &&
          responses.memory1Language &&
          responses.memory2Language &&
          responses.reflection
        );
      default:
        return false;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/journeys')}
            className="flex items-center text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Journeys
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">5 Love Languages Journey</h1>
          <p className="text-gray-600 dark:text-gray-400">Day {currentDay} of 14</p>
        </div>

        <Progress value={(currentDay / 14) * 100} className="h-2" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your journey...</p>
          </div>
        ) : (
          renderDailyContent()
        )}
      </div>
      
      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-gray-200 dark:border-gray-800 p-3 flex justify-around items-center">
        <a href="/" className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs">
          <Home className="w-6 h-6 mb-1" />
          Home
        </a>
        <a href="/messages" className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs">
          <MessageSquare className="w-6 h-6 mb-1" />
          Messages
        </a>
        <a href="/goals" className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs">
          <Target className="w-6 h-6 mb-1" />
          Goals
        </a>
        <a href="/profile" className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs">
          <User className="w-6 h-6 mb-1" />
          Profile
        </a>
      </div>
      
      {/* Add padding at the bottom to account for fixed footer */}
      <div className="h-20"></div>
    </div>
  );
} 