// supabase/functions/reject-partner-invite/index.ts

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
        const { data: { user: rejectorUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !rejectorUser) {
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
            .maybeSingle();

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
             return new Response(JSON.stringify({ error: `Invite is already ${invite.status}. Cannot reject.` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        if (new Date(invite.expires_at) < new Date()) {
             // Optional: Update status to 'expired'
             await supabase.from('partner_invites').update({ status: 'expired' }).eq('id', invite.id);
             return new Response(JSON.stringify({ error: 'Invite has expired. Cannot reject.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        if (invite.sender_id === rejectorUser.id) {
             return new Response(JSON.stringify({ error: 'You cannot reject your own invite.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // --- Update Phase ---

        // 5. Update invite status to 'rejected' and set recipient_id
        const { error: inviteUpdateError } = await supabase
            .from('partner_invites')
            .update({ status: 'rejected', recipient_id: rejectorUser.id })
            .eq('id', invite.id);

        if (inviteUpdateError) {
            console.error('Error updating invite status to rejected:', inviteUpdateError.message);
            throw new Error('Failed to reject invite.');
        }

        // 6. Return success
        return new Response(JSON.stringify({ message: 'Invite successfully rejected.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while rejecting the invite.';
        console.error('Unexpected Error:', errorMessage, error);
        return new Response(JSON.stringify({ error: errorMessage || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});