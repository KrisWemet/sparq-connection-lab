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

export interface PartnerProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  streak_count: number | null;
  last_active: string | null;
  discovery_day: number | null;
  identity_archetype: string | null;
  partner_id: string | null;
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
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      const inviteUrl = `${window.location.origin}/join/${invitationCode}`;
      await supabase.functions.invoke('send-partner-invite', {
        body: { partnerEmail, inviteLink: inviteUrl, invitationCode }
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

      // Get invitation details with inviter profile
      const { data: invitation, error: inviteError } = await supabase
        .from('partner_invitations')
        .select('*, inviter:inviter_id(full_name, name)')
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

      // Get current user's profile for the broadcast
      const { data: accepterProfile } = await supabase
        .from('profiles')
        .select('full_name, name')
        .eq('id', user.id)
        .single();

      const accepterName = accepterProfile?.full_name || accepterProfile?.name || 'Your partner';

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

      // Broadcast event to inviter
      try {
        await supabase.functions.invoke('broadcast-event', {
          body: {
            type: 'invite_accepted',
            recipientId: invitation.inviter_id,
            payload: {
              invite_id: invitation.id,
              partner_id: user.id,
              partner_name: accepterName,
              accepted_at: new Date().toISOString(),
            },
            options: {
              persist: true,
              priority: 'high',
            },
          },
        });
      } catch (broadcastError) {
        console.error('Error broadcasting invite acceptance:', broadcastError);
        // Don't fail the operation if broadcast fails
      }

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
   * Decline a partner invitation
   */
  async declineInvitation(invitationCode: string) {
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

      // Update invitation status
      const { error: updateError } = await supabase
        .from('partner_invitations')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Broadcast event to inviter (optional, but good for UX)
      try {
        await supabase.functions.invoke('broadcast-event', {
          body: {
            type: 'invite_declined',
            recipientId: invitation.inviter_id,
            payload: {
              invite_id: invitation.id,
              declined_at: new Date().toISOString(),
            },
            options: {
              persist: true,
              priority: 'normal',
            },
          },
        });
      } catch (broadcastError) {
        console.error('Error broadcasting invite decline:', broadcastError);
        // Don't fail the operation if broadcast fails
      }

      // Track analytics
      await analyticsService.trackPartnerInvitation('declined', {
        invitation_id: invitation.id
      });

      return invitation;
    } catch (error: any) {
      console.error('Error declining invitation:', error);
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
  async getPartnerProfile(): Promise<PartnerProfile | null> {
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

      const { data: partnerProfile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, streak_count, last_active, discovery_day, identity_archetype, partner_id')
        .eq('id', profile.partner_id)
        .single();

      if (error || !partnerProfile) {
        console.error('Error fetching partner profile:', error);
        return null;
      }

      return partnerProfile;
    } catch (error) {
      console.error('Error getting partner profile:', error);
      return null;
    }
  },

  /**
   * Get partner's daily activity status
   */
  async getPartnerActivityStatus(): Promise<{ hasCompletedToday: boolean; lastActivity: string | null }> {
    try {
      const partnerProfile = await this.getPartnerProfile();
      
      if (!partnerProfile?.id) {
        return { hasCompletedToday: false, lastActivity: null };
      }

      // Check if partner has completed today's session
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivity } = await supabase
        .from('daily_activities')
        .select('completed_at')
        .eq('user_id', partnerProfile.id)
        .gte('completed_at', today)
        .limit(1);

      return {
        hasCompletedToday: !!todayActivity && todayActivity.length > 0,
        lastActivity: partnerProfile.last_active
      };
    } catch (error) {
      console.error('Error getting partner activity:', error);
      return { hasCompletedToday: false, lastActivity: null };
    }
  },

  /**
   * Remove partner connection
   */
  async removePartner() {
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
        throw new Error('No partner connected');
      }

      // Remove partner connection from both profiles
      const updates = [
        supabase
          .from('profiles')
          .update({ partner_id: null })
          .eq('id', user.id),
        supabase
          .from('profiles')
          .update({ partner_id: null })
          .eq('id', profile.partner_id)
      ];

      await Promise.all(updates);

      toast.success('Partner connection removed');
    } catch (error: any) {
      console.error('Error removing partner:', error);
      throw error;
    }
  }
};

// Helper function to generate a unique code
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
