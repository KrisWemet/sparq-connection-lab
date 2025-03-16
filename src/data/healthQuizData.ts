
// Health quiz questions for relationship assessment
export const healthQuizQuestions = [
  {
    id: 1,
    text: "How satisfied are you with the communication in your relationship?",
    category: "communication",
    options: [
      { value: "1", label: "Very unsatisfied" },
      { value: "2", label: "Unsatisfied" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Satisfied" },
      { value: "5", label: "Very satisfied" }
    ]
  },
  {
    id: 2,
    text: "How often do you and your partner resolve conflicts in a healthy way?",
    category: "conflict",
    options: [
      { value: "1", label: "Never" },
      { value: "2", label: "Rarely" },
      { value: "3", label: "Sometimes" },
      { value: "4", label: "Often" },
      { value: "5", label: "Always" }
    ]
  },
  {
    id: 3,
    text: "How emotionally connected do you feel to your partner?",
    category: "emotional",
    options: [
      { value: "1", label: "Not at all connected" },
      { value: "2", label: "Slightly connected" },
      { value: "3", label: "Moderately connected" },
      { value: "4", label: "Very connected" },
      { value: "5", label: "Extremely connected" }
    ]
  },
  {
    id: 4,
    text: "How satisfied are you with the level of intimacy in your relationship?",
    category: "intimacy",
    options: [
      { value: "1", label: "Very unsatisfied" },
      { value: "2", label: "Unsatisfied" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Satisfied" },
      { value: "5", label: "Very satisfied" }
    ]
  },
  {
    id: 5,
    text: "How much do you trust your partner?",
    category: "trust",
    options: [
      { value: "1", label: "No trust at all" },
      { value: "2", label: "Little trust" },
      { value: "3", label: "Moderate trust" },
      { value: "4", label: "High trust" },
      { value: "5", label: "Complete trust" }
    ]
  },
  {
    id: 6,
    text: "How well do you and your partner support each other's goals?",
    category: "support",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "A little" },
      { value: "3", label: "Moderately" },
      { value: "4", label: "Very well" },
      { value: "5", label: "Extremely well" }
    ]
  },
  {
    id: 7,
    text: "How often do you and your partner spend quality time together?",
    category: "quality_time",
    options: [
      { value: "1", label: "Never" },
      { value: "2", label: "Rarely" },
      { value: "3", label: "Sometimes" },
      { value: "4", label: "Often" },
      { value: "5", label: "Very often" }
    ]
  },
  {
    id: 8,
    text: "How well do you and your partner respect each other's boundaries?",
    category: "boundaries",
    options: [
      { value: "1", label: "Not at all" },
      { value: "2", label: "A little" },
      { value: "3", label: "Moderately" },
      { value: "4", label: "Very well" },
      { value: "5", label: "Extremely well" }
    ]
  },
  {
    id: 9,
    text: "How fairly are responsibilities shared in your relationship?",
    category: "responsibilities",
    options: [
      { value: "1", label: "Very unfairly" },
      { value: "2", label: "Unfairly" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Fairly" },
      { value: "5", label: "Very fairly" }
    ]
  },
  {
    id: 10,
    text: "Overall, how happy are you in your relationship?",
    category: "overall",
    options: [
      { value: "1", label: "Very unhappy" },
      { value: "2", label: "Unhappy" },
      { value: "3", label: "Neutral" },
      { value: "4", label: "Happy" },
      { value: "5", label: "Very happy" }
    ]
  }
];

// Helper functions for quiz operations
export const calculateQuizScore = (answers: Record<number, string>): number => {
  const totalPossiblePoints = healthQuizQuestions.length * 5; // Max 5 points per question
  const totalPoints = Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);
  return Math.round((totalPoints / totalPossiblePoints) * 100);
};
