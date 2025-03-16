
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { JourneyDay as JourneyDayType } from '@/services/journeyContentService';

interface JourneyDayProps {
  day: JourneyDayType;
  responses: Record<string, string>;
  onResponseChange: (questionIndex: number, value: string) => void;
}

export function JourneyDay({ day, responses, onResponseChange }: JourneyDayProps) {
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
                      onChange={(e) => onResponseChange(index, e.target.value)}
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
}
