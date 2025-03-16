
import { createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/services/supabaseService';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>; 
  signUp: (email: string, password: string, fullName: string, gender?: string, relationshipType?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isOnboarded: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
