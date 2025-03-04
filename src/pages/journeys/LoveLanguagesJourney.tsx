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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyticsService } from "@/services/analyticsService";

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

  useEffect(() => {
    loadProgress();
  }, []);

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

      if (journeyProgress) {
        setProgress(journeyProgress);
        // Find the latest incomplete day
        const lastIncomplete = journeyProgress.findIndex(p => !p.completed);
        setCurrentDay(lastIncomplete === -1 ? 14 : lastIncomplete + 1);
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
      
      await supabase
        .from('journey_progress')
        .upsert({
          journey_id: 'love-languages',
          user_id: user.id,
          day: currentDay,
          responses,
          completed: true,
          completed_at: now
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
    setCurrentDay(prev => Math.min(prev + 1, 14));
    setResponses({});
  };

  const handlePrevious = () => {
    setCurrentDay(prev => Math.max(prev - 1, 1));
    setResponses({});
  };

  const renderDailyContent = () => {
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
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/path-to-together')}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Journeys
      </Button>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">5 Love Languages Journey</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Day {currentDay} of 14
          </p>
          <Progress value={(currentDay / 14) * 100} className="mt-2" />
        </div>

        <Card>
          <CardContent className="p-6">
            {renderDailyContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentDay === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Day
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isCurrentDayComplete()}
          >
            {currentDay === 14 ? 'Complete Journey' : 'Next Day'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
} 