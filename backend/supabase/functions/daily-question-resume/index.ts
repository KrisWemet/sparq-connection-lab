import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';

// Assume resuming applies to the 'Adventure & Fun' category for now
// TODO: Allow specifying category ID in request body if multiple categories are supported
const DEFAULT_CATEGORY_NAME = 'Adventure & Fun';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // This function might not need a request body if we assume the default category
  // If category selection is added, expect { category_id: string } in the body

  try {
    const supabase = createSupabaseClientWithAuth(req);
    const { user, error: authError } = await authenticateUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 1. Get the category ID (using default for now)
    const { data: categoryData, error: categoryError } = await supabase
      .from('daily_question_categories')
      .select('id')
      .eq('name', DEFAULT_CATEGORY_NAME)
      .single();

    if (categoryError || !categoryData) {
      console.error('Error fetching category:', categoryError);
      return new Response(JSON.stringify({ error: 'Could not find default category to resume' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    const categoryId = categoryData.id;

    // 2. Update the user's progress to NOT paused for this category
    // Also fetch the updated progress record to potentially return the next question info
    const { data: updatedProgress, error: updateError } = await supabase
      .from('user_daily_question_progress')
      .update({
        paused: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .neq('completed', true) // Only resume if not already completed
      .select() // Select the updated record
      .single(); // Expecting one record to be updated

    if (updateError) {
       // Handle case where progress doesn't exist or is already completed/not paused
       if (updateError.code === 'PGRST116') { // No rows returned/updated
            return new Response(JSON.stringify({ error: 'No active, paused daily questions found for this category to resume.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404, // Not Found or 400 Bad Request?
            });
       }
      console.error('Error resuming progress:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to resume progress' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 3. Return success (optionally include next question details if needed)
    // The frontend might just call the /daily-question endpoint again after resuming.
    return new Response(JSON.stringify({
        success: true,
        message: 'Daily questions resumed!',
        // Optionally return current state if helpful:
        // current_level: updatedProgress.current_level,
        // current_question_position: updatedProgress.current_question_position
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Unexpected error in daily-question-resume:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});