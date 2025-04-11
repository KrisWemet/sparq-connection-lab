import { BaseService } from './BaseService';
import { PartnerInvitation, transformInvitation } from './types';
import { authService } from './AuthService';
import { generateUniqueCode } from '@/lib/utils';

/**
 * Service for handling partner connection operations
 */
export class PartnerService extends BaseService {
  /**
   * Send a partner invitation
   */
  async sendInvitation(receiverEmail: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Generate a unique partner code if needed
      const partnerCode = generateUniqueCode(8);
      
      const { error } = await this.supabase
        .from('partner_invites')
        .insert({
          sender_id: user.id,
          receiver_email: receiverEmail,
          status: 'pending'
        });
        
      if (error) throw error;
      
      // In a real app, we would send an email here with the invite code
      await this.logActivity(user.id, 'invitation_sent', { receiverEmail });
      
      return partnerCode;
    } catch (error: any) {
      return this.handleError(error, 'Failed to send invitation');
    }
  }
  
  /**
   * Accept a partner invitation
   */
  async acceptInvitation(invitationId: string) {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get the invitation
      const { data: invitation, error: inviteError } = await this.supabase
        .from('partner_invites')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();
        
      if (inviteError || !invitation) throw new Error('Invalid or expired invitation');
      
      // Update invitation status
      const { error: updateError } = await this.supabase
        .from('partner_invites')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
        
      if (updateError) throw updateError;
      
      // Get the sender profile
      const { data: senderProfile, error: senderError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', invitation.sender_id)
        .single();
        
      if (senderError || !senderProfile) throw new Error('Could not find partner profile');
      
      // Update both profiles to connect them
      const transactions = [];
      
      // Update current user's profile
      transactions.push(
        this.supabase
          .from('profiles')
          .update({ partner_id: invitation.sender_id })
          .eq('id', user.id)
      );
      
      // Update sender's profile
      transactions.push(
        this.supabase
          .from('profiles')
          .update({ partner_id: user.id })
          .eq('id', invitation.sender_id)
      );
      
      // Execute transactions
      const results = await Promise.all(transactions);
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error;
      }
      
      await this.logActivity(user.id, 'invitation_accepted', { 
        partnerId: invitation.sender_id 
      });
      
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to connect with partner');
    }
  }
  
  /**
   * Get pending invitations for the current user
   */
  async getPendingInvitations(): Promise<PartnerInvitation[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return [];
      
      const { data, error } = await this.supabase
        .from('partner_invites')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');
        
      if (error) throw error;
      
      return data.map((invite: any) => ({
        id: invite.id,
        recipientEmail: invite.receiver_email,
        inviteCode: '', // Not stored in the database
        status: invite.status,
        expiresAt: new Date(invite.updated_at) // Using updated_at as a fallback
      }));
    } catch (error: any) {
      console.error('Error getting pending invitations:', error.message);
      return [];
    }
  }
}

// Export a singleton instance
export const partnerService = new PartnerService();