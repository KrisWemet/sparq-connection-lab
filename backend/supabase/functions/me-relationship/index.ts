// supabase/functions/me-relationship/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-relationship" up and running!`)

// Define the expected response structure
interface RelationshipStatus {
    user_id: string;
    partner_id: string | null;
    partner_profile?: { // Include partner details if found
        id: string;
        username?: string; // Adjust fields based on your 'profiles' table
        avatar_url?: string;
        // Add other relevant fields
    } | null;
    // Could add relationship status enum if needed (e.g., 'linked', 'pending', 'none')
}

// Function to get user and potentially partner profile details
const getRelationshipDetails = async (supabase: SupabaseClient, userId: string): Promise<RelationshipStatus> => {
    // Fetch user's profile including partner_id
    const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('id, partner_id') // Select necessary fields
        .eq('id', userId)
        .single(); // Expect the user's own profile to exist

    if (userProfileError || !userProfile) {
        if (userProfileError?.code === 'PGRST116' || !userProfile) {
            // This case might indicate a problem - user exists in auth but not profiles?
             console.warn(`User profile not found for authenticated user ID: ${userId}`);
             // Return a default status indicating no relationship found due to missing profile
             return { user_id: userId, partner_id: null, partner_profile: null };
        }
        console.error('Error fetching user profile:', userProfileError);
        throw new Error(`Database error fetching user profile: ${userProfileError?.message}`);
    }

    const partnerId = userProfile.partner_id;
    let partnerProfileData = null;

    // If a partner ID exists, fetch the partner's profile
    if (partnerId) {
        const { data: partnerProfile, error: partnerProfileError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url') // Select desired partner details
            .eq('id', partnerId)
            .maybeSingle(); // Partner profile might not exist (data inconsistency?)

        if (partnerProfileError) {
            console.error(`Error fetching partner profile (ID: ${partnerId}):`, partnerProfileError);
            // Decide how to handle: throw error or return relationship without partner details?
            // Let's return without partner details but log the error.
        } else {
            partnerProfileData = partnerProfile; // Will be null if not found
        }
    }

    return {
        user_id: userId,
        partner_id: partnerId,
        partner_profile: partnerProfileData,
    };
}


serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, OPTIONS' },
            status: 405
        });
    }

    try {
        const supabaseClient = createSupabaseClientWithAuth(req);
        const { user, error: authError } = await authenticateUser(supabaseClient);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Fetch relationship details
        const relationshipStatus = await getRelationshipDetails(supabaseClient, user.id);

        return new Response(JSON.stringify(relationshipStatus), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (err: unknown) {
        console.error('Caught error:', err)
        let errorMessage = 'Internal Server Error';
        let status = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
                status = 401;
            } else if (errorMessage.includes('Database error')) {
                status = 500;
            }
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        })
    }
})