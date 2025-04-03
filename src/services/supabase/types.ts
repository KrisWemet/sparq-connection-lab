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
  if (!data) return null;
  
  console.log('Transforming profile data:', data);
  
  // Create a profile with all default values, only using what exists in the data
  const profile: UserProfile = {
    id: data.id || '',
    username: data.username || data.name || '',
    email: data.email || '',
    avatarUrl: data.avatar_url || null,
    gender: data.gender || 'prefer-not-to-say',
    relationshipType: data.relationship_type || data.relationshipType || 'monogamous',
    partnerId: data.partner_id || data.partnerId || null,
    anniversaryDate: data.anniversary_date || data.anniversaryDate || null,
    subscriptionTier: data.subscription_tier || data.subscriptionTier || 'free',
    subscriptionExpiry: data.subscription_expiry ? new Date(data.subscription_expiry) : undefined,
    isOnboarded: Boolean(data.is_onboarded ?? data.isOnboarded ?? true),
    lastActive: data.last_active ? new Date(data.last_active) : new Date()
  };
  
  console.log('Transformed profile:', profile);
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