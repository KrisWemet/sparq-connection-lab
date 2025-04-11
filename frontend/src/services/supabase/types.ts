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
  username?: string;
  email?: string;
  avatarUrl?: string;
  gender?: string;
  relationshipType?: string;
  subscriptionTier?: string;
  isOnboarded?: boolean;
  partnerId?: string;
  lastActive: Date;
  anniversaryDate?: string | null;
  phoneNumber?: string | null;
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
export interface PathToTogetherJourney { // Renamed
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PathToTogetherQuestion { // Renamed
  id: string;
  journeyId: string;
  question: string;
  description?: string;
  sequenceNumber: number;
}

export interface UserPathToTogetherProgress { // Renamed
  id: string;
  userId: string;
  journeyId: string;
  progress: number;
  isActive: boolean;
  startDate: Date;
  completedAt?: Date;
  pathToTogetherJourney?: PathToTogetherJourney; // Renamed nested property and its type
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

// Define partner_invites table types
export type PartnerInviteRow = {
  id: string;
  sender_id: string;
  recipient_email?: string | null;
  invite_code: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type PartnerInviteInsert = Omit<PartnerInviteRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export type PartnerInviteUpdate = Partial<PartnerInviteInsert>;

// Update Database interface to include partner_invites table
export interface Database {
  // ... existing code ...
  Tables: {
    // ... existing code ...
    partner_invites: {
      Row: PartnerInviteRow;
      Insert: PartnerInviteInsert;
      Update: PartnerInviteUpdate;
      Relationships: [
        {
          foreignKeyName: "partner_invites_sender_id_fkey";
          columns: ["sender_id"];
          isOneToOne: false;
          referencedRelation: "users";
          referencedColumns: ["id"];
        }
      ];
    };
    // ... existing code ...
  };
  // ... existing code ...
}

// Helper functions to transform database records to frontend models
export function transformProfile(data: any): UserProfile | null { // Allow returning null
  if (!data) return null;
  
  console.log('Transforming profile data:', data);
  
  // Create a profile with all default values, only using what exists in the data
  const profile: UserProfile = {
    id: data.id || '',
    username: data.name || '', // Use name field from database as username
    email: data.email || '',
    avatarUrl: data.avatar_url || null,
    gender: 'prefer-not-to-say', // Default, not in DB
    relationshipType: 'monogamous', // Default, not in DB
    partnerId: data.partner_id || null,
    anniversaryDate: data.anniversary_date || null, // Map anniversary_date from DB
    subscriptionTier: 'free', // Default, not in DB
    // subscriptionExpiry: undefined, // Removed - Property does not exist on UserProfile
    isOnboarded: Boolean(data.isonboarded ?? true),
    lastActive: data.last_daily_activity ? new Date(data.last_daily_activity) : new Date(),
    phoneNumber: data.phone_number || null,
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