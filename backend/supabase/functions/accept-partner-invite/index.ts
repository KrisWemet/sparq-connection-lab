// supabase/functions/accept-partner-invite/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Helper to create Supabase client with auth context
const createSupabaseClientWithAuth = (req: Request): SupabaseClient => {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
};

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405,
        });
    }

    try {
        const supabase = createSupabaseClientWithAuth(req);

        // 1. Authenticate user (the potential recipient, User B)
        const { data: { user: recipientUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !recipientUser) {
            console.error('Auth Error:', authError?.message);
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // 2. Get invite_code from request body
        let invite_code: string | null = null;
        try {
            const body = await req.json();
            invite_code = body.invite_code;
            if (!invite_code || typeof invite_code !== 'string') {
                throw new Error('Missing or invalid invite_code');
            }
        } catch (e) {
             return new Response(JSON.stringify({ error: 'Invalid request body. Missing or invalid invite_code.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }


        // --- Validation Phase ---

        // 3. Find the invite by code
        const { data: invite, error: inviteFetchError } = await supabase
            .from('partner_invites')
            .select('id, sender_id, status, expires_at')
            .eq('invite_code', invite_code)
            .maybeSingle(); // Use maybeSingle as code might not exist

        if (inviteFetchError) {
            console.error('Error fetching invite:', inviteFetchError.message);
            throw new Error('Failed to retrieve invite details.');
        }

        if (!invite) {
            return new Response(JSON.stringify({ error: 'Invalid invite code.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404, // Not Found
            });
        }

        // 4. Validation Checks
        if (invite.status !== 'pending') {
             return new Response(JSON.stringify({ error: `Invite is already ${invite.status}.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        if (new Date(invite.expires_at) < new Date()) {
             // Optional: Update status to 'expired' here or rely on a background job
             await supabase.from('partner_invites').update({ status: 'expired' }).eq('id', invite.id);
             return new Response(JSON.stringify({ error: 'Invite has expired.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        if (invite.sender_id === recipientUser.id) {
             return new Response(JSON.stringify({ error: 'You cannot accept your own invite.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Check if acceptor (recipient) already has a partner
        const { data: recipientProfile, error: recipientProfileError } = await supabase
            .from('profiles')
            .select('partner_id')
            .eq('user_id', recipientUser.id)
            .maybeSingle();

        if (recipientProfileError) {
             console.error('Error fetching recipient profile:', recipientProfileError.message);
             throw new Error('Failed to check recipient profile.');
        }
        if (recipientProfile?.partner_id) {
             return new Response(JSON.stringify({ error: 'You are already connected with a partner.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Check if sender already has a partner (in case they got partnered while invite was pending)
        const { data: senderProfile, error: senderProfileError } = await supabase
            .from('profiles')
            .select('partner_id')
            .eq('user_id', invite.sender_id)
            .maybeSingle();

        if (senderProfileError) {
             console.error('Error fetching sender profile:', senderProfileError.message);
             throw new Error('Failed to check sender profile.');
        }
        if (senderProfile?.partner_id) {
             // Update invite status to reflect this? Maybe 'rejected' or a new 'sender_partnered' status?
             // For now, just reject the acceptance.
             await supabase.from('partner_invites').update({ status: 'rejected', recipient_id: recipientUser.id }).eq('id', invite.id);
             return new Response(JSON.stringify({ error: 'The sender is already connected with another partner.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // --- Update Phase ---
        // Note: Ideally, this would be a transaction. Doing sequential updates.

        // 5. Update invite status and recipient_id
        const { error: inviteUpdateError } = await supabase
            .from('partner_invites')
            .update({ status: 'accepted', recipient_id: recipientUser.id })
            .eq('id', invite.id);

        if (inviteUpdateError) {
            console.error('Error updating invite status:', inviteUpdateError.message);
            // Attempt to rollback or log inconsistency if needed
            throw new Error('Failed to update invite status.');
        }

        // 6. Link users in profiles table
        const { error: recipientUpdateError } = await supabase
            .from('profiles')
            .update({ partner_id: invite.sender_id })
            .eq('user_id', recipientUser.id);

        if (recipientUpdateError) {
            console.error('Error updating recipient profile:', recipientUpdateError.message);
            // CRITICAL: Try to revert invite status if possible, or log for manual fix
            await supabase.from('partner_invites').update({ status: 'pending', recipient_id: null }).eq('id', invite.id); // Attempt rollback
            throw new Error('Failed to link recipient profile.');
        }

        const { error: senderUpdateError } = await supabase
            .from('profiles')
            .update({ partner_id: recipientUser.id })
            .eq('user_id', invite.sender_id);

        if (senderUpdateError) {
            console.error('Error updating sender profile:', senderUpdateError.message);
            // CRITICAL: Rollback recipient's partner_id and invite status
            await supabase.from('profiles').update({ partner_id: null }).eq('user_id', recipientUser.id);
            await supabase.from('partner_invites').update({ status: 'pending', recipient_id: null }).eq('id', invite.id);
            throw new Error('Failed to link sender profile.');
        }

        // 7. Return success
        return new Response(JSON.stringify({ message: 'Partner connection successful!' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during invite acceptance.';
        console.error('Unexpected Error:', errorMessage, error); // Log the full error object too
        return new Response(JSON.stringify({ error: errorMessage || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});