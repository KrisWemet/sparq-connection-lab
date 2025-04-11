
export interface Question {
  id: number;
  text: string;
  options?: string[];
  category: string;
  timeSlot: "AM" | "PM";
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI";
  intimacyLevel: 1 | 2 | 3 | 4 | 5;
  modality: PsychologyModality;
  explanation?: string;
}

export interface WeekendActivity {
  id: number;
  title: string;
  description: string;
  category: string;
  modality: PsychologyModality;
  explanation?: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  type: "communication" | "intimacy" | "personal_growth";
  created_at: string;
  difficulty?: number;
  modality?: string;
  estimated_duration?: string;
}

export interface JourneyQuestion {
  id: string;
  journey_id: string;
  text: string;
  category: string;
  modality: string;
  explanation?: string;
  created_at: string;
}

export interface UserJourney {
  id: string;
  user_id: string;
  journey_id: string;
  start_date: string;
  completed_at?: string;
}

export interface JourneyResponse {
  id: string;
  user_id: string;
  journey_id: string;
  question_id: string;
  answer: string;
  created_at: string;
}

export type PsychologyModality = 
  | "Influence & Persuasion"
  | "Positive Psychology"
  | "CBT"
  | "Motivational Interviewing"
  | "Narrative Therapy"
  | "Love Languages"
  | "Mindfulness"
  | "Nonviolent Communication"
  | "Imago Therapy"
  | "Gottman Method"
  | "Emotional Focused Therapy"
  | "Attachment Theory";
