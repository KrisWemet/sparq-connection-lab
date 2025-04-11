// supabase/functions/get-my-invites/index.ts

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

    try {
        const supabase = createSupabaseClientWithAuth(req);

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth Error:', authError?.message);
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // 2. Fetch invites sent BY the user
        // We might want recipient details if available
        const { data: sentInvites, error: sentError } = await supabase
            .from('partner_invites')
            .select(`
                id,
                invite_code,
                status,
                expires_at,
                created_at,
                recipient: recipient_id ( user_id, username, avatar_url )
            `)
            .eq('sender_id', user.id)
            .order('created_at', { ascending: false });

        if (sentError) {
            console.error('Error fetching sent invites:', sentError.message);
            throw new Error('Failed to fetch sent invites.');
        }

        // 3. Fetch invites received BY the user (where they acted)
        // We need sender details here
        const { data: receivedInvites, error: receivedError } = await supabase
            .from('partner_invites')
            .select(`
                id,
                invite_code,
                status,
                expires_at,
                created_at,
                updated_at,
                sender: sender_id ( user_id, username, avatar_url )
            `)
            .eq('recipient_id', user.id)
            .order('updated_at', { ascending: false }); // Order by when they were acted upon

        if (receivedError) {
            console.error('Error fetching received invites:', receivedError.message);
            throw new Error('Failed to fetch received invites.');
        }

        // 4. Combine and return (or return separately for easier frontend handling)
        // Returning separately might be cleaner
        const responsePayload = {
            sent: sentInvites || [],
            received: receivedInvites || [],
        };

        return new Response(JSON.stringify(responsePayload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching invites.';
        console.error('Unexpected Error:', errorMessage, error);
        return new Response(JSON.stringify({ error: errorMessage || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});