import { BaseService } from './BaseService';
import { AuthCredentials, SignUpData } from './types';

/**
 * Service for handling authentication operations
 */
export class AuthService extends BaseService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: AuthCredentials) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword(credentials);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      return this.handleError(error, 'Failed to sign in');
    }
  }

  /**
   * Sign up with email, password and profile data
   */
  async signUp(signUpData: SignUpData) {
    const { email, password, fullName, gender, relationshipType } = signUpData;
    
    try {
      console.log('AuthService.signUp: Starting signup for', email);
      
      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (authError) {
        console.error('AuthService.signUp: Auth signup error:', authError);
        throw authError;
      }
      
      console.log('AuthService.signUp: Auth signup successful:', authData?.user?.id);
      
      if (authData?.user) {
        // Create the user profile with only essential fields we're confident exist
        // This makes the code more resilient to schema changes
        const profileData: any = {
          id: authData.user.id,
          name: fullName,
          email,
          username: fullName.toLowerCase().replace(/\s+/g, '.'),
          gender: gender || 'prefer-not-to-say',
          relationship_type: relationshipType || 'monogamous'
        };
        
        console.log('AuthService.signUp: Creating profile with data:', profileData);
        
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert(profileData);
          
        if (profileError) {
          console.error('AuthService.signUp: Profile creation error:', profileError);
          throw profileError;
        }
        
        console.log('AuthService.signUp: Profile created successfully');
        
        // Create user role (default to 'user')
        const { error: roleError } = await this.supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user'
          });
          
        if (roleError) {
          console.error('AuthService.signUp: Role creation error:', roleError);
          throw roleError;
        }
        
        console.log('AuthService.signUp: User role created successfully');
      }
      
      console.log('AuthService.signUp: Signup process complete');
      return authData;
    } catch (error: any) {
      console.error('AuthService.signUp: Error in signup process:', error);
      throw error; // Throw directly instead of using handleError to avoid toast
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      return this.handleError(error, 'Failed to sign out');
    }
  }

  /**
   * Get the current logged in user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error: any) {
      console.error('Error getting current user:', error.message);
      return null;
    }
  }

  /**
   * Check if the current user is an admin
   */
  async isAdmin() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;
      
      // Instead of using the RPC function, query the user_roles table directly
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (error) throw error;
      
      return !!data;
    } catch (error: any) {
      console.error('Error checking admin status:', error.message);
      return false;
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to reset password');
    }
  }

  /**
   * Update password for the current user
   */
  async updatePassword(password: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({ password });
      if (error) throw error;
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to update password');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();