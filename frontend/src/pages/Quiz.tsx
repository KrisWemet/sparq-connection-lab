
import { useState, useEffect } from "react";
import { Question } from "@/types/quiz";
import { weekdayQuestions, weekendActivities } from "@/data/quizData";
import { WeekendActivities } from "@/components/quiz/WeekendActivities";
import { QuestionView } from "@/components/quiz/QuestionView";
import { CompletionView } from "@/components/quiz/CompletionView";
import { toast } from "sonner";
import { BottomNav } from "@/components/bottom-nav";
import { Award } from "lucide-react";

export default function Quiz() {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);

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
  }, []);

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

  if (isWeekend) {
    return <WeekendActivities activities={weekendActivities} />;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Question Available
            </h2>
            <p className="text-gray-600">
              Check back later for your next relationship question!
            </p>
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
