import { BaseService } from './BaseService';
import { UserStats } from './types';
import { authService } from './AuthService';

/**
 * Service for handling admin operations
 */
export class AdminService extends BaseService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          *,
          roles:user_roles(role)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map((user: any) => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        gender: user.gender,
        relationshipType: user.relationship_type,
        subscriptionTier: 'free', // Default value as it's not in the schema
        isOnboarded: user.isonboarded,
        lastActive: user.last_daily_activity,
        role: user.roles?.[0]?.role || 'user',
        createdAt: user.created_at
      }));
    } catch (error: any) {
      return this.handleError(error, 'Failed to retrieve users');
    }
  }
  
  /**
   * Get user statistics for the admin dashboard
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const isAdminUser = await authService.isAdmin();
      if (!isAdminUser) throw new Error('Unauthorized access');
      
      // Get total users count
      const { count: totalUsers, error: countError } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      // Get active users (active in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers, error: activeError } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_daily_activity', sevenDaysAgo.toISOString());
        
      if (activeError) throw activeError;
      
      // Get premium users count - assuming we don't have this info in the schema
      const premiumUsers = 0;
      
      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers
      };
    } catch (error: any) {
      console.error('Error getting user stats:', error.message);
      return {
        totalUsers: 0,
        activeUsers: 0,
        premiumUsers: 0
      };
    }
  }
}

// Export a singleton instance
export const adminService = new AdminService();