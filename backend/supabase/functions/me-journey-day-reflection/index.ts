// supabase/functions/me-journey-day-reflection/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-journey-day-reflection" up and running!`)

// Define the expected request body structure
// Define the expected request body structure (matching frontend)
interface ReflectionPayload {
    journeyId: string;
    dayNumber: number;
    responseText: string;
    sharedWithPartner: boolean;
}

// Define the structure within the reflections JSONB column (adjust as needed)
interface ReflectionEntry {
    dayNumber: number; // Add dayNumber to the entry itself
    responseText: string;
    sharedWithPartner: boolean;
    timestamp: string; // Use timestamp consistent with frontend type
}

// Removed getPathParams helper function

// Fetch current progress for validation
const getCurrentProgress = async (supabase: SupabaseClient, userId: string, journeyId: string) => {
    const { data: progress, error } = await supabase
        .from('user_journey_progress')
        .select('id, current_day, reflections') // Select only needed fields
        .eq('user_id', userId)
        .eq('journey_id', journeyId)
        .single();

    // Handle errors first
    if (error) {
        // Check for specific 'not found' error code
        if (error.code === 'PGRST116') {
             console.warn(`Progress not found for user ${userId}, journey ${journeyId}`);
             throw new Error('ProgressNotFound'); // Throw specific error for not found
        }
        // Otherwise, it's a different database error
        console.error('Database error fetching progress:', error);
        throw new Error(`Database error fetching progress: ${error.message}`); // error is guaranteed non-null here
    }
    // If no error, check if progress data exists
    if (!progress) {
        // This case might occur if the query somehow succeeds without error but returns no data
        console.warn(`Progress query returned no data (and no error) for user ${userId}, journey ${journeyId}`);
        throw new Error('ProgressNotFound');
    }
    return progress;
}


serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'POST, OPTIONS' },
            status: 405
        });
    }

    try {
        // Parse request body
        let payload: ReflectionPayload;
        try {
            payload = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Validate payload structure
        const { journeyId, dayNumber, responseText, sharedWithPartner } = payload;
        if (!journeyId || typeof journeyId !== 'string' ||
            typeof dayNumber !== 'number' || dayNumber <= 0 ||
            typeof responseText !== 'string' || // Allow empty string, maybe? Frontend prevents empty trim.
            typeof sharedWithPartner !== 'boolean')
        {
             return new Response(JSON.stringify({ error: 'Missing or invalid fields in request body (journeyId, dayNumber, responseText, sharedWithPartner)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const supabaseClient = createSupabaseClientWithAuth(req);
        const { user, error: authError } = await authenticateUser(supabaseClient);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Fetch current progress for validation
        // Fetch only necessary progress fields
        const progress = await getCurrentProgress(supabaseClient, user.id, journeyId);

        // --- Validation Logic ---
        // Check if the day number is valid to add/update reflection for
        // User should have at least started the day (current_day >= dayNumber)
        if (dayNumber > progress.current_day) {
             return new Response(JSON.stringify({ error: `Cannot add reflection for future day ${dayNumber}. Current day is ${progress.current_day}.` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        // --- End Validation ---

        // Prepare the updated reflections array
        const now = new Date().toISOString();
        // Ensure reflections is treated as an array, default to empty if null/undefined
        const currentReflections: ReflectionEntry[] = Array.isArray(progress.reflections) ? progress.reflections : [];

        const existingIndex = currentReflections.findIndex(r => r.dayNumber === dayNumber);

        let updatedReflections: ReflectionEntry[];
        const newEntry: ReflectionEntry = {
            dayNumber: dayNumber,
            responseText: responseText,
            sharedWithPartner: sharedWithPartner,
            timestamp: now,
        };

        if (existingIndex !== -1) {
            // Update existing entry
            updatedReflections = [
                ...currentReflections.slice(0, existingIndex),
                newEntry, // Replace with the new entry
                ...currentReflections.slice(existingIndex + 1),
            ];
        } else {
            // Add new entry and sort by dayNumber
            updatedReflections = [...currentReflections, newEntry].sort((a, b) => a.dayNumber - b.dayNumber);
        }

        // Perform the update
        const { data: updatedProgress, error: updateError } = await supabaseClient
            .from('user_journey_progress')
            .update({
                reflections: updatedReflections,
                last_accessed_at: now // Also update last accessed time
            })
            .eq('id', progress.id) // Use the progress record's primary key
            .select('reflections') // Select only the updated reflections array back
            .single();

        if (updateError) {
            console.error('Error updating reflection:', updateError);
            throw new Error(`Database error updating reflection: ${updateError.message}`);
        }

        // Decide what to return: just the reflection, or the updated progress?
        // Returning the updated reflection entry might be cleaner.
        // Return the specific reflection entry that was just saved/updated
        const savedEntry = updatedProgress?.reflections?.find((r: ReflectionEntry) => r.dayNumber === dayNumber);
        return new Response(JSON.stringify(savedEntry || null), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // OK (or 201 if you track creation vs update)
        })

    } catch (err: unknown) {
        console.error('Caught error:', err)
        let errorMessage = 'Internal Server Error';
        let status = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
                status = 401;
            } else if (errorMessage === 'ProgressNotFound') {
                status = 404;
                errorMessage = 'Journey progress not found. Cannot save reflection.';
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