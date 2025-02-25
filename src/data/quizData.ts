
import { Question, WeekendActivity } from "@/types/quiz";

export const weekdayQuestions: Question[] = [
  // Phase 1: Begin (Days 1-7)
  {
    id: 1,
    category: "Core Values Discovery",
    text: "What are 5-7 core values that define who you are? (e.g., honesty, compassion, creativity)",
    timeSlot: "AM",
    dayOfWeek: "MON",
    intimacyLevel: 1,
    modality: "Positive Psychology",
    explanation: "Identifying personal core values is the foundation for self-awareness and relationship growth"
  },
  {
    id: 2,
    category: "Values in Action",
    text: "Describe a moment today when one of your core values influenced a decision you made.",
    timeSlot: "PM",
    dayOfWeek: "MON",
    intimacyLevel: 1,
    modality: "CBT",
    explanation: "Recognizing how values guide daily choices strengthens authentic living"
  },
  {
    id: 3,
    category: "Value Origins",
    text: "Think of one core value you listed. What life experience made this value important to you?",
    timeSlot: "AM",
    dayOfWeek: "TUE",
    intimacyLevel: 2,
    modality: "Narrative Therapy",
    explanation: "Understanding the origins of our values helps us connect them to our life story"
  },
  {
    id: 4,
    category: "Value Priorities",
    text: "Looking at your core values, which one feels most central to who you are right now?",
    timeSlot: "PM",
    dayOfWeek: "TUE",
    intimacyLevel: 2,
    modality: "Motivational Interviewing",
    explanation: "Prioritizing values helps guide life decisions and relationship choices"
  },
  {
    id: 5,
    category: "Values & Aspirations",
    text: "What's one personal dream or aspiration that connects directly to one of your top values?",
    timeSlot: "AM",
    dayOfWeek: "WED",
    intimacyLevel: 3,
    modality: "Positive Psychology",
    explanation: "Linking values to aspirations creates meaningful life direction"
  },
  {
    id: 6,
    category: "Past Decisions",
    text: "Recall a significant life decision you made. How did your values influence that choice?",
    timeSlot: "PM",
    dayOfWeek: "WED",
    intimacyLevel: 3,
    modality: "Narrative Therapy",
    explanation: "Reflecting on past decisions reveals our values in action"
  },
  {
    id: 7,
    category: "Values Visualization",
    text: "If you had to create a symbol or image that represents your core values, what would it be?",
    timeSlot: "AM",
    dayOfWeek: "THU",
    intimacyLevel: 2,
    modality: "Narrative Therapy",
    explanation: "Visual representation of values enhances emotional connection"
  },
  {
    id: 8,
    category: "Reflection & Integration",
    text: "What's the most surprising insight you've gained about your values this week?",
    timeSlot: "PM",
    dayOfWeek: "THU",
    intimacyLevel: 3,
    modality: "Nonviolent Communication",
    explanation: "Integration of insights strengthens self-awareness"
  },
  {
    id: 9,
    category: "Value Challenges",
    text: "What's one situation where it's challenging to live by your values? How do you handle it?",
    timeSlot: "AM",
    dayOfWeek: "FRI",
    intimacyLevel: 4,
    modality: "CBT",
    explanation: "Identifying challenges helps develop coping strategies"
  },
  {
    id: 10,
    category: "Future Vision",
    text: "How do you want your values to shape your life and relationships in the next year?",
    timeSlot: "PM",
    dayOfWeek: "FRI",
    intimacyLevel: 4,
    modality: "Motivational Interviewing",
    explanation: "Future visioning creates motivation for value-aligned living"
  }
];

export const weekendActivities: WeekendActivity[] = [
  {
    id: 1,
    title: "Values Story Sharing",
    description: "Set aside 30 minutes to share the stories behind your core values with each other. Take turns explaining how specific life experiences shaped what matters most to you.",
    category: "Deep Connection",
    modality: "Narrative Therapy",
    explanation: "Sharing personal stories builds intimacy and understanding"
  },
  {
    id: 2,
    title: "Values Vision Board",
    description: "Create a shared vision board that represents both of your core values and how they complement each other. Use images, words, or symbols that speak to your shared future.",
    category: "Creative Expression",
    modality: "Positive Psychology",
    explanation: "Visual representation of shared values strengthens couple identity"
  }
];
