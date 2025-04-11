// supabase/functions/create-partner-invite/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { nanoid } from 'https://deno.land/x/nanoid@v3.0.0/mod.ts' // Using Deno version of nanoid

const INVITE_EXPIRY_DAYS = 7;

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

        // 2. Check if user already has a partner
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('partner_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError.message);
            throw new Error('Failed to check user profile.');
        }

        if (profileData?.partner_id) {
            return new Response(JSON.stringify({ error: 'User already has a partner.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Bad Request
            });
        }

        // 3. Check if user has an active pending invite they sent
        const { data: existingInvite, error: inviteCheckError } = await supabase
            .from('partner_invites')
            .select('id')
            .eq('sender_id', user.id)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString()) // Check if not expired
            .maybeSingle();

        if (inviteCheckError) {
            console.error('Error checking existing invites:', inviteCheckError.message);
            throw new Error('Failed to check existing invites.');
        }

        if (existingInvite) {
            return new Response(JSON.stringify({ error: 'User already has an active pending invite.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400, // Bad Request
            });
        }

        // 4. Generate unique invite code (e.g., 8 characters)
        const invite_code = nanoid(8); // Adjust length as needed

        // 5. Calculate expiration date
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + INVITE_EXPIRY_DAYS);

        // 6. Insert invite into the database
        const { data: newInvite, error: insertError } = await supabase
            .from('partner_invites')
            .insert({
                sender_id: user.id,
                invite_code: invite_code,
                expires_at: expires_at.toISOString(),
                status: 'pending', // Default status
            })
            .select('invite_code') // Select the code to return
            .single();

        if (insertError) {
            console.error('Error creating invite:', insertError.message);
            // Check for unique constraint violation (though nanoid makes collisions unlikely)
            if (insertError.code === '23505') { // unique_violation
                 return new Response(JSON.stringify({ error: 'Failed to generate a unique invite code, please try again.' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                });
            }
            throw new Error('Failed to create partner invite.');
        }

        // 7. Return the generated invite code
        return new Response(JSON.stringify({ invite_code: newInvite.invite_code }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201, // Created
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('Unexpected Error:', errorMessage, error); // Log the full error object too
        return new Response(JSON.stringify({ error: errorMessage || 'Internal Server Error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});