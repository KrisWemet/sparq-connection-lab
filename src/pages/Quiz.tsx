
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, ChevronRight, Plus } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { Input } from "@/components/ui/input";

interface Question {
  id: number;
  text: string;
  options: string[];
  category: string;
}

// Sample categories and questions (you can expand this with actual data)
const categories = [
  "Communication",
  "Quality Time",
  "Affection",
  "Support",
  "Trust",
  "Values",
  "Future Goals",
  "Conflict Resolution",
  "Independence",
  "Boundaries",
  "Family",
  "Lifestyle",
  "Intimacy",
  "Finances",
  "Shared Activities"
];

const sampleQuestions: Question[] = [
  {
    id: 1,
    category: "Communication",
    text: "How do I prefer to discuss important matters?",
    options: [
      "Face-to-face conversations",
      "Written messages",
      "Phone calls",
      "Taking time to process first"
    ]
  },
  {
    id: 2,
    category: "Quality Time",
    text: "What's my ideal way to spend time with my partner?",
    options: [
      "Active outdoor activities",
      "Quiet time at home",
      "Going out to events",
      "Trying new experiences together"
    ]
  },
  {
    id: 3,
    category: "Affection",
    text: "How do I most naturally express affection?",
    options: [
      "Through physical touch",
      "With words and compliments",
      "By doing helpful things",
      "Spending focused time together"
    ]
  }
];

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(categories[0]);
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / sampleQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (answer === "other") {
      setShowCustomInput(true);
      return;
    }

    const newAnswers = { ...selectedAnswers };
    newAnswers[currentQuestion.id] = answer;
    setSelectedAnswers(newAnswers);
    setShowCustomInput(false);
    setCustomAnswer("");

    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (sampleQuestions[currentQuestionIndex + 1].category !== currentCategory) {
        setCurrentCategory(sampleQuestions[currentQuestionIndex + 1].category);
      }
    } else {
      setIsCompleted(true);
    }
  };

  const handleCustomAnswer = () => {
    if (customAnswer.trim()) {
      handleAnswer(customAnswer.trim());
    }
  };

  const handleCategorySelect = (category: string) => {
    setCurrentCategory(category);
    // Here you would filter questions by category and set the current question
    console.log("Selected category:", category);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="container max-w-lg mx-auto px-4 pt-8 animate-slide-up">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="text-primary w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Daily Quiz
              </h1>
              <p className="text-sm text-gray-500">{currentCategory}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {sampleQuestions.length}
          </div>
        </header>

        <Progress value={progress} className="mb-8" />

        {!isCompleted ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                {currentQuestion.text}
              </h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between text-left font-normal hover:text-primary hover:border-primary"
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal hover:text-primary hover:border-primary"
                  onClick={() => handleAnswer("other")}
                >
                  Other
                  <Plus className="w-4 h-4" />
                </Button>

                {showCustomInput && (
                  <div className="mt-4 space-y-3">
                    <Input
                      placeholder="Enter your answer..."
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      className="w-full"
                    />
                    <Button 
                      className="w-full"
                      onClick={handleCustomAnswer}
                      disabled={!customAnswer.trim()}
                    >
                      Submit Custom Answer
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex-shrink-0 p-4 rounded-lg shadow-sm min-w-[140px] text-center transition-colors ${
                      category === currentCategory
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 hover:bg-primary/5"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4">
            <Award className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Quiz Completed!
            </h2>
            <p className="text-gray-600">
              Great job! Your answers have been saved and can be compared with your partner's responses.
            </p>
            <Button 
              className="w-full" 
              onClick={() => console.log("View results", selectedAnswers)}
            >
              View Results
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
