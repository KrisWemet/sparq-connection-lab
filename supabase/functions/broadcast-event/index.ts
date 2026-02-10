// ============================================================================
// Edge Function: broadcast-event
// 
// Server-side trigger for realtime events. Called by other edge functions
// or database triggers to broadcast events to connected clients.
// ============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// Event types that can be broadcast
export type BroadcastEventType = 
  | 'new_shared_answer'
  | 'partner_session_complete'
  | 'invite_accepted'
  | 'invite_declined'
  | 'partner_joined'
  | 'streak_milestone'
  | 'badge_earned';

// Event payload structure
export interface BroadcastEvent {
  type: BroadcastEventType;
  recipientId: string;
  payload: Record<string, any>;
  options?: {
    // Whether to also create a database notification record
    persist?: boolean;
    // Priority level (affects delivery guarantees)
    priority?: 'low' | 'normal' | 'high';
  };
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
    // Create Supabase client with service role for broadcasting
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

    // Get user from JWT to verify sender
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
    const event: BroadcastEvent = await req.json();

    // Validate required fields
    if (!event.type || !event.recipientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, recipientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate event type
    const validEventTypes: BroadcastEventType[] = [
      'new_shared_answer',
      'partner_session_complete',
      'invite_accepted',
      'invite_declined',
      'partner_joined',
      'streak_milestone',
      'badge_earned',
    ];
    
    if (!validEventTypes.includes(event.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type', validTypes: validEventTypes }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For partner-related events, verify the sender is actually partnered with recipient
    if (event.type === 'new_shared_answer' || event.type === 'partner_session_complete') {
      const { data: senderProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('partner_id, subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError || !senderProfile) {
        return new Response(
          JSON.stringify({ error: 'Sender profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify they are partners
      if (senderProfile.partner_id !== event.recipientId) {
        return new Response(
          JSON.stringify({ error: 'Recipient is not your partner', code: 'NOT_PARTNER' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check subscription tier for premium features
      if (senderProfile.subscription_tier === 'free') {
        return new Response(
          JSON.stringify({ error: 'Premium subscription required for this feature', code: 'SUBSCRIPTION_REQUIRED' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get sender info for the payload
    const { data: senderProfile } = await supabaseClient
      .from('profiles')
      .select('full_name, name')
      .eq('id', user.id)
      .single();

    const senderName = senderProfile?.full_name || senderProfile?.name || 'Your partner';

    // Build the enriched payload
    const enrichedPayload = {
      ...event.payload,
      sender_id: user.id,
      sender_name: senderName,
      timestamp: new Date().toISOString(),
    };

    // Broadcast the event to the recipient's channel
    const channel = supabaseClient.channel(`user:${event.recipientId}`);
    
    const broadcastResult = await channel.send({
      type: 'broadcast',
      event: event.type,
      payload: enrichedPayload,
    });

    // Persist to database if requested
    if (event.options?.persist !== false) {
      const { error: persistError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: event.recipientId,
          type: event.type,
          title: getNotificationTitle(event.type),
          message: getNotificationMessage(event.type, enrichedPayload),
          sender_id: user.id,
          data: enrichedPayload,
          is_read: false,
        });

      if (persistError) {
        console.error('Error persisting notification:', persistError);
        // Don't fail the request - the realtime broadcast succeeded
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        broadcast: broadcastResult === 'ok',
        event: {
          type: event.type,
          recipientId: event.recipientId,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in broadcast-event function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to get notification title based on event type
function getNotificationTitle(type: BroadcastEventType): string {
  const titles: Record<BroadcastEventType, string> = {
    new_shared_answer: 'New Shared Answer',
    partner_session_complete: 'Partner Completed Session',
    invite_accepted: 'Partner Connected!',
    invite_declined: 'Invitation Declined',
    partner_joined: 'Partner Joined',
    streak_milestone: 'Streak Milestone!',
    badge_earned: 'New Badge Earned',
  };
  return titles[type] || 'New Notification';
}

// Helper function to get notification message based on event type
function getNotificationMessage(type: BroadcastEventType, payload: Record<string, any>): string {
  const messages: Record<BroadcastEventType, (p: typeof payload) => string> = {
    new_shared_answer: (p) => `${p.sender_name} shared an answer with you`,
    partner_session_complete: (p) => `${p.sender_name} completed their daily session`,
    invite_accepted: (p) => `${p.sender_name} accepted your invitation`,
    invite_declined: (p) => `Your invitation was declined`,
    partner_joined: (p) => `${p.sender_name} joined your journey`,
    streak_milestone: (p) => `You reached a ${p.streak}-day streak!`,
    badge_earned: (p) => `You earned the ${p.badge_name} badge!`,
  };
  return messages[type]?.(payload) || 'You have a new notification';
}
