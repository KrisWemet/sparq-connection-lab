import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

// Adapted from the Relationship Assessment Scale (Hendrick, 1988)
const QUESTIONS = [
  { id: 'q1', text: 'How well does your partner meet your needs?' },
  { id: 'q2', text: 'In general, how satisfied are you with your relationship?' },
  { id: 'q3', text: 'How good is your relationship compared to most?' },
  { id: 'q4', text: 'How often do you wish you hadn\'t gotten into this relationship?', reversed: true },
  { id: 'q5', text: 'To what extent has your relationship met your original expectations?' },
  { id: 'q6', text: 'How much do you love your partner?' },
  { id: 'q7', text: 'How many problems are there in your relationship?', reversed: true },
];

const SCALE_LABELS = ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Completely'];

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const milestone = (router.query.milestone as string) || 'baseline';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [previousAssessments, setPreviousAssessments] = useState<any[]>([]);
  const [improvement, setImprovement] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch('/api/me/assessment', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPreviousAssessments(data.assessments || []);
          setImprovement(data.improvement);
        }
      } catch { }
    })();
  }, [user]);

  const handleScore = (questionId: string, score: number) => {
    setResponses(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const formattedResponses = QUESTIONS.map(q => ({
      question_id: q.id,
      score: q.reversed ? (6 - (responses[q.id] || 3)) : (responses[q.id] || 3),
    }));

    try {
      const res = await fetch('/api/me/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ milestone, responses: formattedResponses }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Assessment saved!');
      } else {
        toast.error('Failed to save assessment');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const q = QUESTIONS[currentQuestion];
  const isComplete = Object.keys(responses).length === QUESTIONS.length;
  const progress = (Object.keys(responses).length / QUESTIONS.length) * 100;

  if (!user) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="max-w-md w-full bg-[#111111] border-zinc-800 text-zinc-100">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif tracking-wide mb-2">Assessment Complete</h2>
              <p className="text-zinc-400 mb-4 text-sm font-light leading-relaxed">
                {milestone === 'baseline'
                  ? "We've saved your baseline. We'll check in again at Day 14 to see how things have grown."
                  : "Your responses have been recorded. Keep up the great work!"}
              </p>
              {improvement !== null && improvement > 0 && (
                <div className="flex items-center justify-center gap-2 text-emerald-500 mb-4 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold tracking-wide">+{improvement.toFixed(1)} points since baseline</span>
                </div>
              )}
              <Button onClick={() => router.push('/dashboard')} className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans">
      <header className="sticky top-0 z-10 bg-[#050505] border-b border-zinc-900">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#111111] rounded-lg transition-colors text-zinc-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold tracking-widest uppercase text-zinc-500">Relationship Check-In</h1>
          <span className="text-sm text-zinc-600 font-medium">{currentQuestion + 1}/{QUESTIONS.length}</span>
        </div>
        <div className="h-0.5 bg-zinc-900">
          <div
            className="h-full bg-zinc-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-[#111111] border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-zinc-100 leading-relaxed tracking-wide text-center">{q.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-8">
                {SCALE_LABELS.map((label, idx) => {
                  const score = idx + 1;
                  const isSelected = responses[q.id] === score;
                  return (
                    <button
                      key={score}
                      onClick={() => handleScore(q.id, score)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${isSelected
                          ? 'border-white bg-white text-black font-semibold tracking-wide'
                          : 'border-zinc-800 hover:border-zinc-700 hover:bg-[#141414] text-zinc-300'
                        }`}
                    >
                      <span className={`inline-block w-8 text-sm ${isSelected ? 'text-zinc-600' : 'text-zinc-600'}`}>{score}.</span>
                      {label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-[#111111] hover:text-zinc-200 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentQuestion < QUESTIONS.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!responses[q.id]}
              className="bg-white text-black hover:bg-zinc-200 rounded-xl px-6"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isComplete}
              className="bg-white text-black hover:bg-zinc-200 border border-zinc-300 rounded-xl px-6 shadow-lg shadow-white/5"
            >
              Finish
              <CheckCircle className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
