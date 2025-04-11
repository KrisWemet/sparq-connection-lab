import {
  Compass,
  Star,
  MessageCircle,
  Heart,
  Sparkles,
  Flame,
  Users,
  Zap,
  HeartHandshake,
  Leaf,
  Shield,
  Clock
} from "lucide-react";
import { Flame as FlameIcon, Sparkles as SparklesIcon, Users as UsersIcon } from "lucide-react";
import { LucideIcon } from 'lucide-react';

interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
}

const questionCategories: QuestionCategory[] = [
  {
    id: 'light',
    name: 'Light Questions',
    description: 'Fun and easy questions to get to know each other better',
    isPremium: false,
  },
  {
    id: 'medium',
    name: 'Medium Questions',
    description: 'Deeper questions to explore thoughts and feelings',
    isPremium: false,
  },
  {
    id: 'deep',
    name: 'Deep Questions',
    description: 'Profound questions to strengthen your connection',
    isPremium: true,
  },
];

export default questionCategories;