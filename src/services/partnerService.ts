import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PartnerInvitation {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invite_code: string;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if a pending invitation already exists for this email
    const { data: existingInvite } = await supabase
      .from('partner_invites')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_email', partnerEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email');
    }

    const { data: invitation, error } = await supabase
      .from('partner_invites')
      .insert({
        sender_id: user.id,
        receiver_email: partnerEmail,
      })
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: send email via Edge Function
    const inviteUrl = `${window.location.origin}/partner-invite/${invitation.invite_code}`;
    supabase.functions.invoke('send-partner-invite', {
      body: { partnerEmail, inviteLink: inviteUrl, inviteCode: invitation.invite_code }
    }).catch(console.error);

    return invitation;
  },

  /**
   * Accept a partner invitation by invite code
   */
  async acceptInvitation(inviteCode: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: invitation, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (inviteError || !invitation) throw new Error('Invitation not found');
    if (new Date(invitation.expires_at) < new Date()) throw new Error('This invitation has expired');
    if (invitation.status === 'accepted') throw new Error('This invitation has already been accepted');

    // Mark accepted
    await supabase
      .from('partner_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Link both profiles
    await Promise.all([
      supabase.from('profiles').update({ partner_id: invitation.sender_id }).eq('id', user.id),
      supabase.from('profiles').update({ partner_id: user.id }).eq('id', invitation.sender_id),
    ]);

    return invitation;
  },

  /**
   * Decline a partner invitation
   */
  async declineInvitation(inviteCode: string) {
    const { data: invitation, error } = await supabase
      .from('partner_invites')
      .select('id')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (error || !invitation) throw new Error('Invitation not found');

    await supabase
      .from('partner_invites')
      .update({ status: 'rejected' })
      .eq('id', invitation.id);
  },

  /**
   * Get all invitations sent by or received by the current user
   */
  async getInvitations(): Promise<PartnerInvitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('partner_invites')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PartnerInvitation[];
  },

  /** Check if current user has a connected partner */
  async hasPartner(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();

    return !!data?.partner_id;
  },

  /** Get the partner's public profile */
  async getPartnerProfile(): Promise<PartnerProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: me } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!me?.partner_id) return null;

    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, streak_count, last_active, discovery_day, identity_archetype, partner_id')
      .eq('id', me.partner_id)
      .maybeSingle();

    return partnerProfile as PartnerProfile | null;
  },

  /** Remove partner connection from both profiles */
  async removePartner() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: me } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!me?.partner_id) throw new Error('No partner connected');

    await Promise.all([
      supabase.from('profiles').update({ partner_id: null }).eq('id', user.id),
      supabase.from('profiles').update({ partner_id: null }).eq('id', me.partner_id),
    ]);

    toast.success('Partner connection removed');
  },
};
