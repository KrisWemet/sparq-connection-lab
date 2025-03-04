import { LucideIcon, Heart, MessageCircle, Shield, Flame, Target, HeartHandshake, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface JourneyPhase {
  name: string;
  days: string;
  description: string;
  icon: string;
}

interface Journey {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  sequence: number;
  image: string;
  psychology: string[];
  benefits: string[];
  icon: LucideIcon;
  phases?: JourneyPhase[];
  overview: string;
  free?: boolean;
  badge?: string;
}

export const journeys: Journey[] = [
  {
    id: "love-languages",
    title: "5 Love Languages",
    description: "Discover the primary ways you and your partner express and receive love",
    duration: "2 weeks",
    category: "Foundation",
    sequence: 1,
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Love Languages Framework (Chapman)",
      "Attachment Theory",
      "Emotional Intelligence"
    ],
    benefits: [
      "Identify your primary love language",
      "Recognize your partner's love language",
      "Learn to express love effectively",
      "Reduce misunderstandings about affection"
    ],
    icon: Heart,
    phases: [
      {
        name: "Discover",
        days: "Days 1-5",
        description: "Learn your love language",
        icon: "🔍"
      },
      {
        name: "Explore",
        days: "Days 6-10",
        description: "Deepen your understanding",
        icon: "🌱"
      },
      {
        name: "Reflect",
        days: "Days 11-13",
        description: "Observe love languages in action",
        icon: "💭"
      },
      {
        name: "Align",
        days: "Days 14",
        description: "Build your love languages plan",
        icon: "🎯"
      }
    ],
    overview: "This 14-day journey helps you discover and understand the five love languages, enabling you to express love in ways that truly resonate with your partner."
  },
  {
    id: "communication",
    title: "Effective Communication",
    description: "Master the art of truly understanding each other through validated techniques",
    duration: "3 weeks",
    category: "Skills",
    sequence: 2,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&h=500",
    psychology: [
      "Gottman Method",
      "Nonviolent Communication (Rosenberg)",
      "Active Listening Techniques"
    ],
    benefits: [
      "Reduce misunderstandings and conflicts",
      "Express needs clearly and compassionately",
      "Develop deeper understanding",
      "Create meaningful dialogue"
    ],
    icon: MessageCircle,
    phases: [
      {
        name: "Begin",
        days: "Days 1-5",
        description: "Getting to know how you communicate",
        icon: "🎯"
      },
      {
        name: "Share",
        days: "Days 6-11",
        description: "Talking openly together",
        icon: "🗣️"
      },
      {
        name: "Reflect",
        days: "Days 12-16",
        description: "Deepening your connection",
        icon: "🤔"
      },
      {
        name: "Align",
        days: "Days 17-21",
        description: "Building a shared plan for better communication",
        icon: "📝"
      }
    ],
    overview: "This 21-day journey is designed to help you and your partner talk and listen in a gentle, clear way. By following structured daily exercises, you'll develop skills to communicate effectively and resolve misunderstandings with compassion."
  },
  // Add other journeys here...
]; 