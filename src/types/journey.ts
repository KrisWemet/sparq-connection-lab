import { LucideIcon } from 'lucide-react';

export interface JourneyPhase {
  title: string;
  description: string;
  days: string;
  activities: JourneyActivity[];
}

export interface JourneyActivity {
  title: string;
  description: string;
  steps: string[];
  quote: string;
  video?: string;
  funActivity?: {
    title: string;
    instructions: string;
    examples: string[];
    reflection: string;
  };
  questions?: string[];
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'communication' | 'intimacy' | 'growth' | 'trust' | 'connection';
  sequence: number;
  image: string;
  psychology: string[];
  benefits: string[];
  icon: LucideIcon;
  color: string;
  phases: JourneyPhase[];
  overview: string;
}

export interface UserJourneyProgress {
  userId: string;
  journeyId: string;
  currentDay: number;
  completedActivities: {
    day: number;
    activityId: string;
    completedAt: string;
    responses?: {
      questionId: string;
      answer: string;
      answeredAt: string;
      answeredBy: 'user' | 'partner';
    }[];
  }[];
  startedAt: string;
  lastAccessedAt: string;
  partnerId?: string;
}

export interface JourneyInvitation {
  id: string;
  journeyId: string;
  inviterId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
} 