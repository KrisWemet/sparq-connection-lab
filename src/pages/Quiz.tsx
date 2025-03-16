
import { useState, useEffect } from "react";
import { Question } from "@/types/quiz";
import { weekdayQuestions, weekendActivities } from "@/data/quizData";
import { WeekendActivities } from "@/components/quiz/WeekendActivities";
import { QuestionView } from "@/components/quiz/QuestionView";
import { CompletionView } from "@/components/quiz/CompletionView";
import { RelationshipHealthQuiz } from "@/components/quiz/RelationshipHealthQuiz";
import { toast } from "sonner";
import { BottomNav } from "@/components/bottom-nav";
import { Award, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { supabase } from "@/integrations/supabase/client";

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);
  const [showHealthQuiz, setShowHealthQuiz] = useState(false);
  const [relationshipScore, setRelationshipScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(true);

  useEffect(() => {
    const now = new Date();
    const isWeekendDay = now.getDay() === 0 || now.getDay() === 6;
    const hour = now.getHours();
    const isAM = hour >= 5 && hour < 12;
    const dayMap: { [key: number]: "MON" | "TUE" | "WED" | "THU" | "FRI" } = {
      1: "MON",
      2: "TUE",
      3: "WED",
      4: "THU",
      5: "FRI"
    };

    setIsWeekend(isWeekendDay);
    
    if (!isWeekendDay) {
      const currentDayOfWeek = dayMap[now.getDay()];
      const timeSlot = isAM ? "AM" : "PM";
      const availableQuestion = weekdayQuestions.find(
        q => q.dayOfWeek === currentDayOfWeek && q.timeSlot === timeSlot
      );
      setCurrentQuestion(availableQuestion || null);
    }
    
    // Fetch the relationship health score if available
    if (user) {
      fetchRelationshipScore();
    } else {
      setLoadingScore(false);
    }
  }, [user]);
  
  const fetchRelationshipScore = async () => {
    if (!user) return;
    
    setLoadingScore(true);
    try {
      // Try to fetch the most recent quiz result
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('score, taken_at')
          .eq('user_id', user.id)
          .eq('quiz_type', 'relationship_health')
          .order('taken_at', { ascending: false })
          .limit(1);
          
        if (!error && data && data.length > 0) {
          setRelationshipScore(data[0].score);
        } else {
          setRelationshipScore(null);
        }
      } catch (err) {
        console.error("Error fetching quiz score:", err);
        setRelationshipScore(null);
      }
    } finally {
      setLoadingScore(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (answer === "other") {
      setShowCustomInput(true);
      return;
    }

    if (currentQuestion) {
      const newAnswers = { ...selectedAnswers };
      newAnswers[currentQuestion.id] = answer;
      setSelectedAnswers(newAnswers);
      setShowCustomInput(false);
      setCustomAnswer("");
      setIsCompleted(true);
      
      toast.info("Your partner has been notified about your answer!", {
        duration: 3000
      });
    }
  };

  const handleNudgePartner = () => {
    toast.info("Reminder sent to your partner!", {
      duration: 3000
    });
  };
  
  const handleHealthQuizComplete = async (score: number) => {
    setRelationshipScore(score);
    setShowHealthQuiz(false);
    
    toast.success("Relationship health quiz completed!", {
      description: `Your relationship health score is ${score}%`,
      duration: 5000,
    });
    
    // Navigate to dashboard after quiz completion
    navigate("/dashboard");
  };
  
  const handleStartHealthQuiz = () => {
    setShowHealthQuiz(true);
  };

  if (showHealthQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
          <RelationshipHealthQuiz 
            onComplete={handleHealthQuizComplete}
            onCancel={() => setShowHealthQuiz(false)}
          />
        </main>
        <BottomNav />
      </div>
    );
  }
  
  if (isWeekend) {
    return <WeekendActivities activities={weekendActivities} />;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Question Available
            </h2>
            <p className="text-gray-600">
              Check back later for your next relationship question!
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-medium">Relationship Health</h3>
            </div>
            
            {loadingScore ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {relationshipScore !== null ? (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Your score</span>
                      <span className="text-sm font-medium">{relationshipScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${relationshipScore}%` }}
                      ></div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Take the relationship health quiz again to see if your relationship has improved!
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Take our scientifically-backed quiz to establish a baseline measurement of your relationship health.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleStartHealthQuiz}
                  className="w-full"
                >
                  {relationshipScore !== null ? 'Retake Health Quiz' : 'Take Relationship Health Quiz'}
                </Button>
              </>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        {!isCompleted ? (
          <QuestionView
            currentQuestion={currentQuestion}
            showCustomInput={showCustomInput}
            customAnswer={customAnswer}
            onAnswerSubmit={handleAnswer}
            onCustomAnswerChange={(value) => setCustomAnswer(value)}
            onNudgePartner={handleNudgePartner}
          />
        ) : (
          <CompletionView
            onViewResults={() => console.log("View results", selectedAnswers)}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
