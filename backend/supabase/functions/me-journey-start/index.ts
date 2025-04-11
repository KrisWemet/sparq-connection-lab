// supabase/functions/me-journey-start/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-journey-start" up and running!`)

// Removed getJourneyId helper function

// Function to check if progress already exists
const checkExistingProgress = async (supabase: SupabaseClient, userId: string, journeyId: string) => {
    const { data, error, count } = await supabase
        .from('user_journey_progress')
        .select('id', { count: 'exact', head: true }) // Efficiently check existence
        .eq('user_id', userId)
        .eq('journey_id', journeyId);

    if (error) {
        console.error('Error checking existing progress:', error);
        throw new Error(`Database error: ${error.message}`);
    }
    return count !== null && count > 0;
}

// Function to start the journey progress
const startJourneyProgress = async (supabase: SupabaseClient, userId: string, journeyId: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('user_journey_progress')
        .insert({
            user_id: userId,
            journey_id: journeyId,
            status: 'in_progress',
            current_day: 1, // Start at day 1
            completed_days: [], // Initialize as empty array
            started_at: now,
            last_accessed_at: now,
            reflections: [], // Initialize as empty array
            // reflections can be null/empty initially
        })
        .select(`
            journey_id:journeyId,
            current_day:currentDay,
            completed_days:completedDays,
            started_at:startDate,
            last_accessed_at:lastAccessedDate,
            reflections
         `) // Return the newly created record with aliased fields
        .single(); // Expecting a single record to be inserted and returned

    if (error) {
        console.error('Error starting journey progress:', error);
        // Could check for specific errors like foreign key violation if journeyId is invalid
        throw new Error(`Database error: ${error.message}`);
    }
    return data;
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST, OPTIONS' },
            status: 405
        });
    }

    try {
        // Get journeyId from request body
        const body = await req.json();
        const journeyId = body.journeyId;

        if (!journeyId || typeof journeyId !== 'string') {
          return new Response(JSON.stringify({ error: 'Missing or invalid journeyId in request body' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }

        const supabaseClient = createSupabaseClientWithAuth(req);
        const { user, error: authError } = await authenticateUser(supabaseClient);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Check if progress already exists
        const alreadyStarted = await checkExistingProgress(supabaseClient, user.id, journeyId);
        if (alreadyStarted) {
            return new Response(JSON.stringify({ error: 'Journey progress already started' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 409, // Conflict
            });
        }

        // Start the journey
        const newProgress = await startJourneyProgress(supabaseClient, user.id, journeyId);

        return new Response(JSON.stringify(newProgress), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201, // Created
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
                // Could add more specific checks, e.g., foreign key violation -> 404 Not Found for journeyId
                status = 500; // Or maybe 400 Bad Request if insert fails due to bad data
            }
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        })
    }
})