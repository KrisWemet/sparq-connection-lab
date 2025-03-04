import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { analyticsService } from './analyticsService';

export interface PartnerInvitation {
  id: string;
  created_at: string;
  inviter_id: string;
  partner_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invitation_code: string;
  accepted_at: string | null;
  expires_at: string;
}

export const partnerService = {
  /**
   * Send a partner invitation
   */
  async sendInvitation(partnerEmail: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if an invitation already exists for this email
      const { data: existingInvite } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('partner_email', partnerEmail)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('An invitation has already been sent to this email');
      }

      // Create new invitation
      const invitationCode = generateUniqueCode();
      const { data: invitation, error } = await supabase
        .from('partner_invitations')
        .insert([
          {
            inviter_id: user.id,
            partner_email: partnerEmail,
            status: 'pending',
            invitation_code: invitationCode,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      const inviteUrl = `${window.location.origin}/join/${invitationCode}`;
      await supabase.functions.invoke('send-partner-invite', {
        body: { partnerEmail, inviteLink: inviteUrl }
      });

      // Track analytics
      await analyticsService.trackPartnerInvitation('sent', {
        partner_email: partnerEmail,
        invitation_id: invitation.id
      });

      return invitation;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  /**
   * Accept a partner invitation
   */
  async acceptInvitation(invitationCode: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('invitation_code', invitationCode)
        .single();

      if (inviteError || !invitation) {
        throw new Error('Invitation not found');
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      // Check if invitation has already been accepted
      if (invitation.status === 'accepted') {
        throw new Error('This invitation has already been accepted');
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('partner_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Update both users' profiles
      const updates = [
        supabase
          .from('profiles')
          .update({ partner_id: invitation.inviter_id })
          .eq('id', user.id),
        supabase
          .from('profiles')
          .update({ partner_id: user.id })
          .eq('id', invitation.inviter_id)
      ];

      await Promise.all(updates);

      // Track analytics
      await analyticsService.trackPartnerInvitation('accepted', {
        invitation_id: invitation.id,
        inviter_id: invitation.inviter_id,
        accepter_id: user.id
      });

      return invitation;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  /**
   * Get all partner invitations for the current user
   */
  async getInvitations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('partner_invitations')
        .select('*')
        .or(`inviter_id.eq.${user.id},partner_email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error getting invitations:', error);
      throw error;
    }
  },

  /**
   * Check if the current user has a partner
   */
  async hasPartner() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user.id)
        .single();

      return !!profile?.partner_id;
    } catch (error) {
      console.error('Error checking partner status:', error);
      return false;
    }
  },

  /**
   * Get the current user's partner profile
   */
  async getPartnerProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user.id)
        .single();

      if (!profile?.partner_id) {
        return null;
      }

      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .single();

      return partnerProfile;
    } catch (error) {
      console.error('Error getting partner profile:', error);
      return null;
    }
  }
};

// Helper function to generate a unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 