
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Crown, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getJourneyContent, saveJourneyProgress, JourneyContent, JourneyDay } from '@/services/journeyContentService';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PeterLoading } from '@/components/PeterLoading';

export function JourneyContentView({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const [journeyContent, setJourneyContent] = useState<JourneyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadJourneyContent() {
      setLoading(true);
      const content = await getJourneyContent(journeyId);
      setJourneyContent(content);
      setLoading(false);
    }
    
    loadJourneyContent();
  }, [journeyId]);

  useEffect(() => {
    if (journeyContent?.days) {
      setProgress((currentDay / journeyContent.days.length) * 100);
    }
  }, [currentDay, journeyContent]);

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = async () => {
    if (!journeyContent) return;
    await saveJourneyProgress(journeyId, currentDay, true, responses);
    if (currentDay >= journeyContent.days.length) {
      setCompleted(true);
    } else {
      toast.success(`Day ${currentDay} completed!`);
      setCurrentDay(currentDay + 1);
      setResponses({});
    }
  };

  const handleResponseChange = (questionIndex: number, value: string) => {
    setResponses({
      ...responses,
      [`question_${questionIndex}`]: value
    });
  };

  const renderCurrentDay = () => {
    if (!journeyContent || !journeyContent.days || journeyContent.days.length === 0) {
      return <div>No content available</div>;
    }

    const day = journeyContent.days.find(d => d.number === currentDay);
    if (!day) {
      return <div>Day not found</div>;
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Day {day.number}: {day.title}</h2>
          <div className="mt-4 prose prose-slate max-w-none">
            <ReactMarkdown>
              {day.content}
            </ReactMarkdown>
          </div>
        </div>

        {day.activity && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{day.activity.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{day.activity.instructions}</ReactMarkdown>
              </div>
              
              {day.activity.reflectionQuestions && day.activity.reflectionQuestions.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Reflection Questions</h3>
                  {day.activity.reflectionQuestions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <p className="font-medium">{index + 1}. {question}</p>
                      <Textarea
                        placeholder="Your thoughts..."
                        value={responses[`question_${index}`] || ''}
                        onChange={(e) => handleResponseChange(index, e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return <PeterLoading isLoading />;
  }

  if (!journeyContent) {
    return <div className="py-8">Could not load journey content.</div>;
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        {/* Decorative hearts */}
        <div className="absolute top-12 left-8 text-rose-200 text-4xl select-none">♥</div>
        <div className="absolute top-24 right-6 text-violet-200 text-2xl select-none">♥</div>
        <div className="absolute bottom-32 left-6 text-pink-200 text-3xl select-none">♥</div>
        <div className="absolute bottom-20 right-10 text-violet-200 text-4xl select-none">♥</div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            You&apos;ve completed<br />{journeyContent.title}!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
            You&apos;ve done the work. Come back tomorrow to keep building on what you&apos;ve learned together.
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-8">
            {[0, 0.1, 0.2].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + delay, type: "spring" }}
              >
                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => router.push('/journeys')}
            className="w-full max-w-xs py-4 rounded-2xl bg-brand-primary text-white font-semibold text-base mb-3 shadow-md hover:bg-brand-hover transition-colors"
          >
            Explore More Journeys
          </button>

          <button
            onClick={() => router.push('/subscription')}
            className="w-full max-w-xs py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:bg-violet-700 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Unlock Premium Journeys
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{journeyContent.title}</h1>
        <p className="text-muted-foreground mb-4">{journeyContent.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Day {currentDay} of {journeyContent.days.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="mb-8">
        {renderCurrentDay()}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousDay} 
          disabled={currentDay === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous Day
        </Button>
        <Button onClick={handleNextDay}>
          {currentDay >= journeyContent.days.length
            ? <>Complete Journey <CheckCircle className="ml-2 h-4 w-4" /></>
            : <>Next Day <ChevronRight className="ml-2 h-4 w-4" /></>
          }
        </Button>
      </div>
    </div>
  );
}
