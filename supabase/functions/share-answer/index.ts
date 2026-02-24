// Supabase Edge Function: share-answer
// Handles sharing answers between partners with realtime notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ShareAnswerRequest {
  recipient_id: string;
  question_text: string;
  answer_text: string;
  session_id?: string;
  category?: string;
  discovery_day?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: ShareAnswerRequest = await req.json()
    const { recipient_id, question_text, answer_text, session_id, category, discovery_day } = body

    // Validate required fields
    if (!recipient_id || !question_text || !answer_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recipient_id, question_text, answer_text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify recipient exists and is the sender's partner
    const { data: senderProfile, error: senderError } = await supabaseClient
      .from('profiles')
      .select('partner_id, subscription_tier, full_name, name')
      .eq('id', user.id)
      .single()

    if (senderError || !senderProfile) {
      return new Response(
        JSON.stringify({ error: 'Sender profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription tier (must be premium or ultimate)
    if (senderProfile.subscription_tier === 'free') {
      return new Response(
        JSON.stringify({ error: 'Premium subscription required to share answers', code: 'SUBSCRIPTION_REQUIRED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the recipient is the sender's partner
    if (senderProfile.partner_id !== recipient_id) {
      return new Response(
        JSON.stringify({ error: 'Recipient is not your partner', code: 'NOT_PARTNER' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify recipient exists
    const { data: recipientProfile, error: recipientError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, name')
      .eq('id', recipient_id)
      .single()

    if (recipientError || !recipientProfile) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert the shared answer
    const { data: sharedAnswer, error: insertError } = await supabaseClient
      .from('shared_answers')
      .insert({
        sender_id: user.id,
        recipient_id,
        question_text,
        answer_text,
        session_id: session_id || null,
        category: category || null,
        discovery_day: discovery_day || null,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting shared answer:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to share answer', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Broadcast realtime notification via the broadcast-event function
    const senderName = senderProfile.full_name || senderProfile.name || 'Your partner';
    
    try {
      // Call broadcast-event edge function
      const broadcastResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/broadcast-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization')!,
          },
          body: JSON.stringify({
            type: 'new_shared_answer',
            recipientId: recipient_id,
            payload: {
              shared_answer_id: sharedAnswer.id,
              question_preview: question_text.substring(0, 100),
              answer_preview: answer_text.substring(0, 50),
              category,
              discovery_day,
              created_at: sharedAnswer.created_at,
            },
            options: {
              persist: true,
              priority: 'normal',
            },
          }),
        }
      );

      if (!broadcastResponse.ok) {
        console.error('Broadcast failed:', await broadcastResponse.text());
        // Don't fail the request - the share succeeded even if notification failed
      }
    } catch (broadcastError) {
      console.error('Error broadcasting event:', broadcastError);
      // Don't fail the request - the share succeeded
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: sharedAnswer,
        message: 'Answer shared successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in share-answer function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
