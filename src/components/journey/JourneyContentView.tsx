
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getJourneyContent, saveJourneyProgress, JourneyContent, JourneyDay } from '@/services/journeyContentService';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function JourneyContentView({ journeyId }: { journeyId: string }) {
  const [journeyContent, setJourneyContent] = useState<JourneyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

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
    if (journeyContent && currentDay < journeyContent.days.length) {
      // Save progress before moving to next day
      await saveJourneyProgress(journeyId, currentDay, true, responses);
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
    return <div className="flex justify-center py-8">Loading journey content...</div>;
  }

  if (!journeyContent) {
    return <div className="py-8">Could not load journey content.</div>;
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
        <Button 
          onClick={handleNextDay} 
          disabled={currentDay >= journeyContent.days.length}
        >
          Next Day <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
