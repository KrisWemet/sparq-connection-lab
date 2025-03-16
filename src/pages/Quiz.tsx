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
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { NoQuestionView } from "@/components/quiz/NoQuestionView";
import { HealthScoreView } from "@/components/quiz/HealthScoreView";

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
          <NoQuestionView />
          <HealthScoreView 
            relationshipScore={relationshipScore}
            loadingScore={loadingScore}
            onStartHealthQuiz={handleStartHealthQuiz}
          />
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
