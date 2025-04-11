// supabase/functions/me-journeys-progress/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts' // Use shared auth utilities

console.log(`Function "me-journeys-progress" up and running!`)

const fetchUserProgress = async (supabase: SupabaseClient, userId: string): Promise<any[]> => { // Added return type promise
    console.log(`Fetching journey progress for user: ${userId}`); // Log entry
    const { data, error } = await supabase
        .from('user_journeys')
        .select(`
            *,
            journeys!inner ( id, title, description, theme )
        `) // Explicit inner join to bypass potential schema cache issues
        .eq('user_id', userId)
        .order('last_accessed_date', { ascending: false }); // Corrected: last_accessed_date instead of last_accessed_at

    if (error) {
        console.error('Database query failed in fetchUserProgress:', JSON.stringify(error, null, 2)); // Log detailed error
        throw new Error(`Database error: ${error.message}`);
    }
    console.log(`Successfully fetched journey progress for user: ${userId}. Count: ${data?.length ?? 0}`); // Log success
    return data;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders }) // Standard 204 No Content for OPTIONS
    }

    try {
        // Create client with auth context
        const supabaseClient = createSupabaseClientWithAuth(req);

        // Authenticate user
        const { user, error: authError } = await authenticateUser(supabaseClient);
        if (authError || !user) {
            console.error('Authentication error:', authError);
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Fetch progress for the authenticated user
        const progressData = await fetchUserProgress(supabaseClient, user.id);
        console.log(`fetchUserProgress returned ${progressData?.length ?? 0} items.`); // Log after call

        return new Response(JSON.stringify(progressData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: unknown) { // Explicitly type err as unknown
        console.error('Caught error:', err)
        let errorMessage = 'Internal Server Error';
        let status = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
            // Distinguish between auth errors and other server errors if needed
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
                status = 401;
            }
        }
        // else: Could handle non-Error types if necessary, but default is 500/Internal Server Error

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        })
    }
})