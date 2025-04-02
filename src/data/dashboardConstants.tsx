// src/data/dashboardConstants.tsx
import {
  MessageCircle,
  Heart,
  Brain,
  Clock,
  Target,
} from "lucide-react";
import React from "react"; // Import React for JSX elements

// Define types for better structure (optional but good practice)
interface DailyActivity {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode; // Use React.ReactNode for JSX elements
  path: string;
  completed: boolean;
  highlighted?: boolean;
  premium: boolean;
  new?: boolean;
  comingSoon?: boolean;
}

interface UpcomingFeature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode; // Use React.ReactNode for JSX elements
  premium: boolean;
  path: string;
  available: boolean;
}

export const dailyActivities: DailyActivity[] = [
  {
    id: 1,
    title: "Daily Questions",
    description: "Answer today's relationship questions",
    icon: <MessageCircle className="w-5 h-5" />,
    path: "/daily-questions",
    completed: false, // TODO: Fetch completion status
    highlighted: true,
    premium: false,
    new: false
  },
  {
    id: 2,
    title: "Path to Together",
    description: "Science-based relationship journeys for growth",
    icon: <Brain className="w-5 h-5" />,
    path: "/path-to-together",
    completed: false, // TODO: Fetch completion status
    highlighted: true,
    premium: false,
    new: true
  },
  {
    id: 3,
    title: "Relationship Check-in",
    description: "Quick assessment of your relationship",
    icon: <Heart className="w-5 h-5" />,
    path: "/quiz",
    completed: false, // TODO: Fetch completion status
    highlighted: false,
    premium: false,
    new: false
  },
  {
    id: 4,
    title: "Message Partner",
    description: "Send a thoughtful message",
    icon: <MessageCircle className="w-5 h-5" />,
    path: "/messaging",
    completed: true, // TODO: Fetch completion status
    premium: false
  },
  {
    id: 5,
    title: "AI Therapist",
    description: "Get personalized relationship advice",
    icon: <Brain className="w-5 h-5" />,
    path: "/ai-therapist",
    completed: false,
    premium: true,
    comingSoon: true
  }
];

export const upcomingFeatures: UpcomingFeature[] = [
  {
    id: 1,
    title: "AI Relationship Therapist",
    description: "Get personalized guidance from our AI therapist",
    icon: <Brain className="w-5 h-5" />,
    premium: true,
    path: "/ai-therapist",
    available: true // Assuming this means it's available now, despite being 'upcoming'
  },
  {
    id: 2,
    title: "Relationship Timeline",
    description: "Document and celebrate your journey together",
    icon: <Clock className="w-5 h-5" />,
    premium: true,
    path: "",
    available: false
  },
  {
    id: 3,
    title: "Couples Challenges",
    description: "Fun activities to strengthen your bond",
    icon: <Target className="w-5 h-5" />,
    premium: false,
    path: "",
    available: false
  }
];