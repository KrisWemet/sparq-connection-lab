// supabase/functions/me-partner-reflections/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-partner-reflections" up and running!`)

// Define the structure within the reflections JSONB column
interface ReflectionEntry {
    content: string;
    shared: boolean;
    updated_at: string;
}

// Define the structure for a shared reflection to be returned
interface SharedReflection {
    journey_id: string;
    journey_title: string; // Include for context
    day_number: number;
    content: string;
    updated_at: string;
}

// Function to get the user's partner ID from their profile
const getPartnerId = async (supabase: SupabaseClient, userId: string): Promise<string | null> => {
    const { data: profile, error } = await supabase
        .from('profiles') // Assuming a 'profiles' table
        .select('partner_id')
        .eq('id', userId)
        .maybeSingle(); // User might not have a profile entry yet

    if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`Database error fetching profile: ${error.message}`);
    }
    return profile?.partner_id || null;
}

// Function to fetch and filter partner's shared reflections
const fetchPartnerSharedReflections = async (supabase: SupabaseClient, partnerId: string): Promise<SharedReflection[]> => {
    const { data: partnerProgressRecords, error } = await supabase
        .from('user_journey_progress')
        .select(`
            journey_id,
            reflections,
            journeys ( title )
        `) // Fetch reflections and journey title
        .eq('user_id', partnerId)
        .not('reflections', 'is', null); // Only fetch records that have reflections

    if (error) {
        console.error("Error fetching partner's progress:", error);
        throw new Error(`Database error fetching partner progress: ${error.message}`);
    }

    const sharedReflections: SharedReflection[] = [];

    if (partnerProgressRecords) {
        for (const record of partnerProgressRecords) {
            if (record.reflections && typeof record.reflections === 'object') {
                const reflections = record.reflections as Record<string, ReflectionEntry>;
                for (const dayNumStr in reflections) {
                    const dayNumber = parseInt(dayNumStr, 10);
                    const entry = reflections[dayNumStr];
                    if (entry.shared === true && !isNaN(dayNumber)) {
                        sharedReflections.push({
                            journey_id: record.journey_id,
                            journey_title: record.journeys?.title || 'Unknown Journey', // Handle missing journey title
                            day_number: dayNumber,
                            content: entry.content,
                            updated_at: entry.updated_at,
                        });
                    }
                }
            }
        }
    }

    // Optional: Sort reflections, e.g., by journey then day, or by date
    sharedReflections.sort((a, b) => {
        if (a.journey_title !== b.journey_title) {
            return a.journey_title.localeCompare(b.journey_title);
        }
        if (a.day_number !== b.day_number) {
            return a.day_number - b.day_number;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); // Most recent first if same day
    });


    return sharedReflections;
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

        // Get the partner ID
        const partnerId = await getPartnerId(supabaseClient, user.id);

        if (!partnerId) {
            // No partner linked, return empty array
            return new Response(JSON.stringify([]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Fetch and filter shared reflections
        const reflections = await fetchPartnerSharedReflections(supabaseClient, partnerId);

        return new Response(JSON.stringify(reflections), {
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