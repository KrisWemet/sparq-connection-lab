// supabase/functions/me-journey-progress-update/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-journey-progress-update" up and running!`)

// Define the expected request body structure
// Define the expected request body structure
interface UpdateRequestBody {
    journeyId: string;
    updates: { // Corresponds to Partial<UserJourneyProgress> but using snake_case for DB columns
        completed_days?: number[];
        current_day?: number;
        last_accessed_date?: string; // Frontend sends camelCase, but we'll use snake_case for DB
        status?: 'in_progress' | 'completed'; // Add status if frontend might send it
        completed_at?: string | null; // Add completed_at if frontend might send it
    };
}

// Removed getJourneyId and getCurrentProgressAndJourneyDays helpers


serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    if (req.method !== 'PUT') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'PUT, OPTIONS' },
            status: 405
        });
    }

    try {
        // Parse request body
        let payload: UpdateRequestBody;
        try {
            payload = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Validate payload structure
        if (!payload || typeof payload.journeyId !== 'string' || typeof payload.updates !== 'object' || payload.updates === null) {
             return new Response(JSON.stringify({ error: 'Missing or invalid "journeyId" or "updates" in request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const { journeyId, updates } = payload;

        // Convert frontend camelCase keys in updates to snake_case for DB, if necessary
        // The frontend sends lastAccessedDate, but DB expects last_accessed_at
        const dbUpdates: Record<string, any> = {};
        for (const key in updates) {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                const dbKey = key === 'lastAccessedDate' ? 'last_accessed_at'
                            : key === 'currentDay' ? 'current_day'
                            : key === 'completedDays' ? 'completed_days'
                            : key === 'startDate' ? 'started_at' // Handle other potential keys if needed
                            : key; // Assume other keys match DB column names
                 // @ts-ignore // Allow indexing with string key
                dbUpdates[dbKey] = updates[key];
            }
        }

        // Ensure last_accessed_at is always updated if not provided explicitly
        if (!dbUpdates.last_accessed_at) {
            dbUpdates.last_accessed_at = new Date().toISOString();
        }

        // Basic validation: Ensure there's something to update
        if (Object.keys(dbUpdates).length === 0) {
             return new Response(JSON.stringify({ error: 'No update data provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }


        const supabaseClient = createSupabaseClientWithAuth(req);
        const { user, error: authError } = await authenticateUser(supabaseClient);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Removed fetching current state - rely on frontend calculation passed in 'updates'
        // Removed validation logic based on old payload structure


        // Use the validated dbUpdates object directly
        const updateData = dbUpdates;

        // Perform the update
        const { data: updatedProgress, error: updateError } = await supabaseClient
            .from('user_journey_progress')
            .update(updateData)
            .eq('user_id', user.id) // Match on user and journey
            .eq('journey_id', journeyId)
            .select(`
                journey_id:journeyId,
                current_day:currentDay,
                completed_days:completedDays,
                started_at:startDate,
                last_accessed_at:lastAccessedDate,
                reflections,
                status,
                completed_at:completedAt
            `) // Select aliased fields
            .single();

        if (updateError) {
            console.error('Error updating progress:', updateError);
            throw new Error(`Database error updating progress: ${updateError.message}`);
        }

        return new Response(JSON.stringify(updatedProgress), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // OK
        })

    } catch (err: unknown) {
        console.error('Caught error:', err)
        let errorMessage = 'Internal Server Error';
        let status = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
                status = 401;
            // Removed ProgressNotFound/JourneyNotFound check as we don't fetch them anymore
            } else if (errorMessage.includes('Database error')) {
                status = 500;
            }
            // Add specific handling for validation errors if they throw custom errors
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: status,
        })
    }
})