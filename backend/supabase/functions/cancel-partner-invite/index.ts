// supabase/functions/cancel-partner-invite/index.ts

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

        // 1. Authenticate user (the sender)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth Error:', authError?.message);
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // 2. Get invite_id from request body
        let invite_id: string | null = null;
        try {
            const body = await req.json();
            invite_id = body.invite_id;
            if (!invite_id || typeof invite_id !== 'string') {
                throw new Error('Missing or invalid invite_id');
            }
        } catch (e) {
             return new Response(JSON.stringify({ error: 'Invalid request body. Missing or invalid invite_id.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // --- Validation Phase ---

        // 3. Find the invite by ID, ensuring it belongs to the sender and is pending
        const { data: invite, error: inviteFetchError } = await supabase
            .from('partner_invites')
            .select('id, status')
            .eq('id', invite_id)
            .eq('sender_id', user.id) // Crucial check: only sender can cancel
            .maybeSingle();

        if (inviteFetchError) {
            console.error('Error fetching invite for cancellation:', inviteFetchError.message);
            throw new Error('Failed to retrieve invite details.');
        }

        if (!invite) {
            return new Response(JSON.stringify({ error: 'Invite not found or you do not have permission to cancel it.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404, // Not Found or Forbidden
            });
        }

        // 4. Check if status is 'pending'
        if (invite.status !== 'pending') {
             return new Response(JSON.stringify({ error: `Cannot cancel invite with status: ${invite.status}.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Bad Request
            });
        }

        // --- Update Phase ---

        // 5. Update invite status to 'rejected' (or 'cancelled' if enum is updated)
        // Using 'rejected' aligns with the existing RLS policy for cancellation by sender.
        const { error: inviteUpdateError } = await supabase
            .from('partner_invites')
            .update({ status: 'rejected' }) // Mark as rejected to signify cancellation
            .eq('id', invite.id)
            .eq('sender_id', user.id); // Redundant check, but safe

        if (inviteUpdateError) {
            console.error('Error updating invite status to cancel:', inviteUpdateError.message);
            throw new Error('Failed to cancel invite.');
        }

        // 6. Return success
        return new Response(JSON.stringify({ message: 'Invite successfully cancelled.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while cancelling the invite.';
        console.error('Unexpected Error:', errorMessage, error);
        return new Response(JSON.stringify({ error: errorMessage || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});