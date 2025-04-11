import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getCorsHeaders } from '../../functions/_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../../functions/_shared/auth.ts';

console.log(`Function "start-category" up and running!`);

// Function to check if progress already exists for a user and category
const checkExistingProgress = async (supabase: any, userId: string, categoryId: string) => {
  const { data, error, count } = await supabase
    .from('user_daily_question_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error checking existing progress:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  return count !== null && count > 0;
};

// Function to start a category's progress
const startCategoryProgress = async (supabase: any, userId: string, categoryId: string) => {
  console.log(`Starting category ${categoryId} for user ${userId}`);
  
  const now = new Date().toISOString();
  
  // Get the category name for response
  const { data: categoryData, error: categoryError } = await supabase
    .from('daily_question_categories')
    .select('name')
    .eq('id', categoryId)
    .single();
    
  if (categoryError) {
    console.error('Error fetching category:', categoryError);
    throw new Error(`Category not found: ${categoryError.message}`);
  }
  
  // Create a progress record for this user and category
  const { data, error } = await supabase
    .from('user_daily_question_progress')
    .insert({
      user_id: userId,
      category_id: categoryId,
      completed: false,
      paused: false,
      current_level: 'Light', // Start with light questions
      current_question_position: 1, // Start at the first question
      started_at: now,
      last_accessed_at: now,
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting category progress:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  return {
    progress: data,
    categoryName: categoryData?.name,
  };
};

serve(async (req: Request) => {
  // Handle CORS preflight requests - THIS IS CRUCIAL
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200, // Return 200 OK for preflight
      headers: getCorsHeaders(req),
    });
  }

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Get categoryId from request body
    const body = await req.json();
    const { categoryId } = body;

    if (!categoryId) {
      return new Response(JSON.stringify({ error: 'Missing categoryId in request body' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createSupabaseClientWithAuth(req);
    const { user, error: authError } = await authenticateUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // TEMPORARY DEV/DEBUG RESPONSE - JUST RETURN SUCCESS WITHOUT TOUCHING THE DATABASE
    // Remove this in production
    return new Response(JSON.stringify({
      success: true,
      categoryId,
      categoryName: "Simulated Response",
      message: `Started category: ${categoryId} (simulated)`,
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });

    // Uncomment this in production:
    /*
    // Check if progress already exists
    const alreadyStarted = await checkExistingProgress(supabase, user.id, categoryId);
    if (alreadyStarted) {
      // If progress exists, just return success (idempotent operation)
      return new Response(JSON.stringify({
        success: true,
        message: 'Category already started',
      }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Start the category progress
    const result = await startCategoryProgress(supabase, user.id, categoryId);

    return new Response(JSON.stringify({
      success: true,
      categoryId,
      categoryName: result.categoryName,
      message: `Started category: ${result.categoryName}`,
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 201, // Created
    });
    */

  } catch (err) {
    console.error('Caught error:', err);
    let errorMessage = 'Internal Server Error';
    let status = 500;

    if (err instanceof Error) {
      errorMessage = err.message;
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Failed to authenticate')) {
        status = 401;
      } else if (errorMessage.includes('Category not found')) {
        status = 404;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status,
    });
  }
}); 