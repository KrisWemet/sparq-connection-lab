// ============================================================================
// Edge Function: accept-invite
// 
// Handles accepting partner invitations with realtime notification broadcast
// ============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface AcceptInviteRequest {
  invitation_code: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { invitation_code }: AcceptInviteRequest = await req.json();

    if (!invitation_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: invitation_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('partner_invitations')
      .select('*')
      .eq('invitation_code', invitation_code)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invitation has expired', code: 'INVITE_EXPIRED' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.status === 'accepted') {
      return new Response(
        JSON.stringify({ error: 'This invitation has already been accepted', code: 'ALREADY_ACCEPTED' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has been declined
    if (invitation.status === 'rejected') {
      return new Response(
        JSON.stringify({ error: 'This invitation has been declined', code: 'INVITE_DECLINED' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get accepter's profile
    const { data: accepterProfile, error: accepterError } = await supabaseClient
      .from('profiles')
      .select('full_name, name')
      .eq('id', user.id)
      .single();

    if (accepterError) {
      console.error('Error fetching accepter profile:', accepterError);
    }

    const accepterName = accepterProfile?.full_name || accepterProfile?.name || 'Your partner';

    // Update invitation status
    const { error: updateError } = await supabaseClient
      .from('partner_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to accept invitation', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update both users' profiles to link them as partners
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .update({ partner_id: invitation.inviter_id })
      .eq('id', user.id);

    if (profileUpdateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update profile', details: profileUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: inviterUpdateError } = await supabaseClient
      .from('profiles')
      .update({ partner_id: user.id })
      .eq('id', invitation.inviter_id);

    if (inviterUpdateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update inviter profile', details: inviterUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Broadcast event to inviter
    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/broadcast-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            type: 'invite_accepted',
            recipientId: invitation.inviter_id,
            payload: {
              invite_id: invitation.id,
              invitation_code,
              partner_id: user.id,
              partner_name: accepterName,
              accepted_at: new Date().toISOString(),
            },
            options: {
              persist: true,
              priority: 'high',
            },
          }),
        }
      );
    } catch (broadcastError) {
      console.error('Error broadcasting invite acceptance:', broadcastError);
      // Don't fail the request - the acceptance succeeded
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation accepted successfully',
        data: {
          invitation_id: invitation.id,
          partner_id: invitation.inviter_id,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in accept-invite function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
