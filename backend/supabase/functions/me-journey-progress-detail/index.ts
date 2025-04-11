// supabase/functions/me-journey-progress-detail/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-journey-progress-detail" up and running!`)

// Removed getJourneyId helper function

const fetchSpecificUserProgress = async (supabase: SupabaseClient, userId: string, journeyId: string) => {
    const { data, error } = await supabase
        .from('user_journey_progress')
        .select(`
            journey_id:journeyId,
            current_day:currentDay,
            completed_days:completedDays,
            start_date:startDate,
            last_accessed_date:lastAccessedDate,
            reflections
        `) // Select specific fields and alias
        .eq('user_id', userId)
        .eq('journey_id', journeyId)
        .maybeSingle(); // Use maybeSingle as progress might not exist

    if (error) {
        console.error('Error fetching specific user journey progress:', error);
        throw new Error(`Database error: ${error.message}`);
    }
    return data; // Returns the single record or null
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
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
            console.error('Authentication error:', authError);
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const progressData = await fetchSpecificUserProgress(supabaseClient, user.id, journeyId);

        if (!progressData) {
            // If maybeSingle() returned null, progress doesn't exist for this user/journey
            return new Response(JSON.stringify({ error: 'Progress not found for this journey' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            });
        }

        return new Response(JSON.stringify(progressData), {
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
                // Keep status 500 for general DB errors unless more specific handling is needed
            }
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        })
    }
})