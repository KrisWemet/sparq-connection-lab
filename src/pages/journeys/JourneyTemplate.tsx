import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Target,
  User,
  HeartCrack,
  History,
  RefreshCw,
  PanelTop,
  PartyPopper,
  Sparkles,
  ExternalLink,
  Home,
  MessageSquare,
  Lightbulb
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

interface JourneyTemplateProps {
  journeyId: string;  // e.g., 'sexual-intimacy', 'conflict-resolution'
  title: string;      // e.g., 'Sexual Intimacy & Desire'
  totalDays: number;  // e.g., 14, 21, 28
  conceptItems: {     // For the clickable concept cards
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    example: string;
  }[];
  backPath?: string;  // Optional custom back navigation path
  headerImage?: string; // Image shown at top of journey
  cardImage?: string;  // Image shown on journey card in listing
  conceptSelectionPrompt?: string; // Custom prompt for concept selection
  completionCriteria?: {
    requireConceptSelection: boolean;
    requireReflection: boolean;
    minReflectionLength: number;
    requireActivity: boolean;
  };
}

export default function JourneyTemplate({
  journeyId,
  title,
  totalDays = 14,
  conceptItems = [],
  backPath = "/journeys",
  headerImage,
  cardImage,
  conceptSelectionPrompt,
  completionCriteria
}: JourneyTemplateProps) {
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(1);
  const [progress, setProgress] = useState<JourneyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [journeyContent, setJourneyContent] = useState<string>('');
  const [dayContent, setDayContent] = useState<string>('');
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [selectedConceptDetails, setSelectedConceptDetails] = useState<{
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
      const content = await loadJourneyContent(journeyId);
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
        .eq('journey_id', journeyId)
        .eq('user_id', user.id)
        .order('day', { ascending: true });

      if (journeyProgress && journeyProgress.length > 0) {
        setProgress(journeyProgress);
        
        // Find the highest day the user has completed
        const highestCompletedDay = Math.max(...journeyProgress.filter(p => p.completed).map(p => p.day), 0);
        
        // Set current day to the next day after the highest completed day
        setCurrentDay(highestCompletedDay >= totalDays ? totalDays : highestCompletedDay + 1);
        
        // If they have already started the current day, load those responses
        const currentDayProgress = journeyProgress.find(p => p.day === currentDay);
        if (currentDayProgress) {
          setResponses(currentDayProgress.responses || {});
          
          // If they already selected concepts, restore those selections
          if (currentDayProgress.responses && currentDayProgress.responses.selectedConcepts) {
            setSelectedConcepts(currentDayProgress.responses.selectedConcepts);
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
          journey_id: journeyId,
          user_id: user.id,
          day: currentDay,
          responses,
          completed: true,
          completed_at: now,
          updated_at: now
        });

      // Track progress in analytics
      await analyticsService.trackJourneyProgress(journeyId, 'activity_completed', {
        day: currentDay,
        responses,
      });

      toast.success('Progress saved!');
      
      // If this was the last day, mark the journey as completed
      if (currentDay === totalDays) {
        await analyticsService.trackJourneyProgress(journeyId, 'completed');
        toast.success(`Congratulations on completing the ${title} Journey! 🎉`);
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
      
      // If they already had selected concepts, restore those selections
      if (prevDayProgress.responses.selectedConcepts) {
        setSelectedConcepts(prevDayProgress.responses.selectedConcepts);
      } else {
        setSelectedConcepts([]);
      }
    } else {
      // If no saved responses, reset
      setResponses({});
      setSelectedConcepts([]);
    }
  };

  const isCurrentDayComplete = () => {
    const criteria = completionCriteria || {
      requireConceptSelection: true,
      requireReflection: true,
      minReflectionLength: 10,
      requireActivity: false
    };

    const conceptsValid = !criteria.requireConceptSelection || selectedConcepts.length > 0;
    const reflectionValid = !criteria.requireReflection || 
      (responses.reflection && responses.reflection.trim().length >= criteria.minReflectionLength);
    const activityValid = !criteria.requireActivity || responses.activity;

    // Log completion status for debugging
    console.log('Completion status:', {
      conceptsValid,
      reflectionValid,
      activityValid,
      selectedConcepts: selectedConcepts.length,
      reflectionLength: responses.reflection?.trim().length || 0,
      hasActivity: !!responses.activity
    });

    return conceptsValid && reflectionValid && activityValid;
  };

  const renderDailyContent = () => {
    // If we have markdown content for the day, render it
    if (dayContent) {
      // Extract title, sections, and content more effectively
      const titleMatch = dayContent.match(/## Day \d+: (.*?)[\r\n]/);
      const dayTitle = titleMatch ? titleMatch[1] : `Day ${currentDay}`;
      
      // Extract "Today's Learning" section
      const learningMatch = dayContent.match(/### Today's Learning\s+([\s\S]*?)(?=###|$)/);
      const learningContent = learningMatch ? learningMatch[1].trim() : '';
      
      // Extract key insights
      const insightsMatch = learningContent.match(/Here are some (important|powerful) insights([\s\S]*?)Let's look at how these principles/);
      const insightsContent = insightsMatch ? insightsMatch[2].trim() : '';
      
      // Extract examples
      const examplesMatch = learningContent.match(/Let's look at how these principles([\s\S]*?)(?=### Why This Matters|$)/);
      const examplesContent = examplesMatch ? examplesMatch[1].trim() : '';
      
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
      
      // Get concept-specific examples (for the clickable concept cards)
      const getConceptExample = (conceptId: string) => {
        const matchingConcept = conceptItems.find(c => c.id === conceptId);
        return matchingConcept ? matchingConcept.example : "Understanding this concept can transform your relationship.";
      };
      
      // Extract the introduction paragraph
      const introMatch = learningContent.match(/Welcome to Day \d+[\s\S]*?(?=Have you ever|Here are some)/);
      const introContent = introMatch ? introMatch[0].trim() : '';
      
      // Extract the "Have you ever felt" paragraph if it exists
      const questionMatch = learningContent.match(/Have you ever[\s\S]*?(?=Many couples find|Here are some)/);
      const questionContent = questionMatch ? questionMatch[0].trim() : '';
      
      // Extract the "Many couples find" paragraph
      const couplesMatch = learningContent.match(/Many couples find[\s\S]*?(?=Here are some)/);
      const couplesContent = couplesMatch ? couplesMatch[0].trim() : '';
      
      // Get the journey image for the current day
      const getJourneyImage = () => {
        if (headerImage) return headerImage;
        
        // Default images based on journeyId
        const defaultImages = {
          'love-languages': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7',
          'conflict-resolution': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
          'emotional-intelligence': 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c',
          'communication': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
          'intimacy': 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47',
          'sexual-intimacy': 'https://images.unsplash.com/photo-1519975258993-60b42d1c2ee2',
          'trust-rebuilding': 'https://images.unsplash.com/photo-1521791136064-7986c2920216',
          'values': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9',
          'attachment-healing': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b',
          'relationship-renewal': 'https://images.unsplash.com/photo-1522849789990-26252a8f8e62',
          'mindful-sexuality': 'https://images.unsplash.com/photo-1515161318750-781d6122e367',
          'power-dynamics': 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70',
          'fantasy-exploration': 'https://images.unsplash.com/photo-1516146544193-b54a65682f16'
        };

        return defaultImages[journeyId] || 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c';
      };
      
      // Turn key insights into cards for visual presentation
      const insightCards = () => {
        // This could be customized per journey
        const insights = [
          {
            title: "Key Insight 1",
            icon: <Lightbulb className="w-5 h-5 text-pink-500" />,
            content: "Understanding your partner's needs is essential for a healthy relationship."
          },
          {
            title: "Key Insight 2",
            icon: <HeartCrack className="w-5 h-5 text-red-500" />,
            content: "Communication breakdowns can lead to misunderstandings and emotional distance."
          },
          {
            title: "Key Insight 3",
            icon: <History className="w-5 h-5 text-purple-500" />,
            content: "Past experiences influence how we respond to challenging situations."
          },
          {
            title: "Key Insight 4",
            icon: <RefreshCw className="w-5 h-5 text-green-500" />,
            content: "Relationships evolve over time as both partners grow and change."
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
      
      // Clickable concept cards based on the journey's concepts
      const conceptCards = () => {
        return (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {conceptItems.map(concept => (
              <Card 
                key={concept.id} 
                className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedConceptDetails(concept)}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r from-${concept.color}-100 to-${concept.color}-50 dark:from-${concept.color}-900/30 dark:to-${concept.color}-800/10 p-4 flex items-center gap-3 justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm`}>
                        {concept.icon}
                      </div>
                      <h4 className={`font-medium text-${concept.color}-700 dark:text-${concept.color}-400`}>{concept.title}</h4>
                    </div>
                    <ExternalLink className={`w-4 h-4 text-${concept.color}-500`} />
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{concept.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              src={getJourneyImage()} 
              alt={`${title} Day ${currentDay}`} 
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 w-full">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  {`Day ${currentDay}: ${dayTitle}`}
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
                    Day {currentDay} of {totalDays}
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
          
          {/* Key Insights Section */}
          {currentDay === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">Key Insights</h3>
              {insightCards()}
            </div>
          )}
          
          {/* Journey Concepts Cards */}
          {currentDay === 1 && conceptItems.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-semibold text-primary">Core Concepts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Click on each card to learn more about these important concepts.
              </p>
              {conceptCards()}
            </div>
          )}
          
          {/* Today's Activity */}
          {renderActivity()}
          
          {/* Concept Selection */}
          <Card className="bg-white dark:bg-gray-800 shadow-md border-0">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-xl font-semibold text-primary">
                {conceptSelectionPrompt || "Which concepts resonated with you?"}
              </CardTitle>
              <CardDescription>Select up to two that speak to you most</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {conceptItems.map(concept => (
                  <div 
                    key={concept.id} 
                    className={`p-4 rounded-lg flex items-center gap-3 cursor-pointer border-2 transition-all hover:shadow-md ${
                      selectedConcepts.includes(concept.id) 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                    onClick={() => {
                      if (selectedConcepts.includes(concept.id)) {
                        setSelectedConcepts(selectedConcepts.filter(id => id !== concept.id));
                        setResponses({
                          ...responses,
                          selectedConcepts: selectedConcepts.filter(id => id !== concept.id),
                        });
                      } else if (selectedConcepts.length < 2) {
                        setSelectedConcepts([...selectedConcepts, concept.id]);
                        setResponses({
                          ...responses,
                          selectedConcepts: [...selectedConcepts, concept.id],
                        });
                      }
                    }}
                  >
                    <div className={`p-3 rounded-full ${selectedConcepts.includes(concept.id) ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                      {concept.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{concept.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{concept.description}</p>
                    </div>
                    {selectedConcepts.includes(concept.id) && (
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
          
          {/* Navigation buttons */}
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
          
          {/* Concept Details Dialog */}
          <Dialog open={selectedConceptDetails !== null} onOpenChange={(open) => !open && setSelectedConceptDetails(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedConceptDetails?.icon}
                  <span>{selectedConceptDetails?.title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConceptDetails?.description}</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Example:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConceptDetails?.example}</p>
                </div>
                
                <h4 className="font-medium mt-2 text-gray-800 dark:text-gray-200">Why this matters:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Understanding {selectedConceptDetails?.title.toLowerCase()} can help you develop a deeper connection with your partner and navigate challenges together more effectively.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedConceptDetails(null)}>Close</Button>
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
                    Great job! You've completed today's lesson. 
                    Your insights have been saved and will help strengthen your relationship.
                  </p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg text-left">
                  <h3 className="font-medium text-primary mb-2">Your key takeaways:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You selected: {selectedConcepts.map(id => 
                        conceptItems.find(c => c.id === id)?.title
                      ).join(' & ')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You've learned about key concepts in {title}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>You've reflected on how these concepts apply to your relationship</span>
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
    
    // Loading state
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your journey...</p>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(backPath)}
            className="flex items-center text-gray-600 dark:text-gray-400"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Journeys
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">Day {currentDay} of {totalDays}</p>
        </div>

        <Progress value={(currentDay / totalDays) * 100} className="h-2" />

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
