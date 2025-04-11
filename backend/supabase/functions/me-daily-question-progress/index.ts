// supabase/functions/me-daily-question-progress/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { authenticateUser, createSupabaseClientWithAuth } from '../_shared/auth.ts'

console.log(`Function "me-daily-question-progress" up and running!`)

// Return mock data for now to ensure the function works
const fetchUserDailyProgress = async (supabase: SupabaseClient, userId: string): Promise<any[]> => {
    console.log(`Fetching daily question progress for user: ${userId}`);

    const { data, error } = await supabase
        .from('user_daily_question_progress')
        .select(`
            id,
            user_id,
            category_id,
            completed,
            paused,
            updated_at,
            current_level,
            current_question_position,
            category:daily_question_categories (
                id,
                name,
                description
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user daily progress:', error);
        // Depending on requirements, you might want to return an empty array or throw
        return [];
    }

    // Supabase returns the joined data nested correctly if the foreign key relationship is set up
    // and the select query is structured as above.
    return data || [];
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: getCorsHeaders(req) });
    }

    try {
        // Create client with auth context
        const supabaseClient = createSupabaseClientWithAuth(req);

        // Authenticate user
        const { user, error: authError } = await authenticateUser(supabaseClient);
        if (authError || !user) {
            console.error('Authentication error:', authError);
            return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
                headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // Fetch daily progress for the authenticated user
        const progressData = await fetchUserDailyProgress(supabaseClient, user.id);
        console.log(`fetchUserDailyProgress returned ${progressData?.length ?? 0} items.`);

        return new Response(JSON.stringify(progressData), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err: unknown) {
        console.error('Caught error:', err);
        let errorMessage = 'Internal Server Error';
        let status = 500;

        if (err instanceof Error) {
            errorMessage = err.message;
            if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
                status = 401;
            }
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status,
        });
    }
});