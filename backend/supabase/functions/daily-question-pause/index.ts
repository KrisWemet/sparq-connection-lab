import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';

// Assume pausing applies to the 'Adventure & Fun' category for now
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
      return new Response(JSON.stringify({ error: 'Could not find default category to pause' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    const categoryId = categoryData.id;

    // 2. Update the user's progress to paused for this category
    const { error: updateError } = await supabase
      .from('user_daily_question_progress')
      .update({
        paused: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('category_id', categoryId);
      // Note: This won't error if the user has no progress record yet,
      // but pausing only makes sense if they've started.
      // Consider adding a check if progress exists first?

    if (updateError) {
      console.error('Error pausing progress:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to pause progress' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 3. Return success
    // Consider returning the updated progress state if needed by the frontend
    return new Response(JSON.stringify({ success: true, message: 'Daily questions paused.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Unexpected error in daily-question-pause:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});