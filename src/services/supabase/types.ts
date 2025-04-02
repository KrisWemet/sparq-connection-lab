// Authentication types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  fullName: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  relationshipType?: 'monogamous' | 'polyamorous' | 'open' | 'long-distance';
}

// User profile types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  gender?: string;
  relationshipType?: string;
  partnerId?: string;
  anniversaryDate?: string | null; // Add anniversary date field
  subscriptionTier: 'free' | 'premium' | 'platinum';
  subscriptionExpiry?: Date;
  isOnboarded: boolean;
  lastActive: Date;
}

// Partner invitation types
export interface PartnerInvitation {
  id: string;
  recipientEmail: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
}

// Journey types
export interface Journey {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface JourneyQuestion {
  id: string;
  journeyId: string;
  question: string;
  description?: string;
  sequenceNumber: number;
}

export interface UserJourney {
  id: string;
  userId: string;
  journeyId: string;
  progress: number;
  isActive: boolean;
  startDate: Date;
  completedAt?: Date;
  journey?: Journey;
}

// Goal types
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  dueDate?: string;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  milestones?: GoalMilestone[];
  isShared?: boolean;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  sequenceNumber: number;
  isCompleted: boolean;
}

export interface GoalCreateParams {
  title: string;
  description?: string;
  category: string;
  dueDate?: string;
  milestones?: { title: string }[];
  isShared?: boolean;
}

// Shared Event types
export type EventStatus = 'planned' | 'completed' | 'cancelled';

export interface SharedEvent {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  eventDatetime?: string; // ISO string format
  status: EventStatus;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface SharedEventCreateParams {
  title: string;
  description?: string;
  eventDatetime?: string; // ISO string format
}

export interface CommunicationPrompt {
  id: string;
  text: string;
  category?: string;
  createdAt: string; // ISO string format
  updatedAt?: string; // ISO string format (if added to schema)
}


// Admin types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
}

// Helper functions to transform database records to frontend models
export function transformProfile(data: any): UserProfile {
  // Create a profile with all default values, only using what we know exists in the database
  const profile: UserProfile = {
    id: data.id,
    username: data.username || '', // Corrected to use username from schema
    email: data.email || '',
    avatarUrl: null, // Default value
    gender: 'prefer-not-to-say', // Default value
    relationshipType: 'monogamous', // Default value
    partnerId: null, // Default value
    anniversaryDate: null, // Default value
    subscriptionTier: 'free', // Default value
    subscriptionExpiry: undefined, // Default value
    isOnboarded: true, // Default value
    lastActive: new Date() // Default to current date
  };
  
  return profile;
}

export function transformInvitation(data: any): PartnerInvitation {
  return {
    id: data.id,
    recipientEmail: data.recipient_email,
    inviteCode: data.invite_code,
    status: data.status,
    expiresAt: new Date(data.expires_at)
  };
}

export function transformGoal(data: any): Goal {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    description: data.description,
    category: data.category,
    dueDate: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    progress: data.progress ?? 0,
    isCompleted: data.is_completed ?? false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    isShared: data.is_shared ?? false,
    // Milestones would need a separate query/join or handling if stored in the same table
    milestones: [],
  };
}