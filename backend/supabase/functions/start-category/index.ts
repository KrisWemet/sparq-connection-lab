import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';

console.log(`Function "start-category" up and running!`);

// List of allowed categories (all categories are enabled)
const ENABLED_CATEGORIES = [
  '3d5281a1-7183-437e-8ba7-72ad99b75d16', // Appreciation & Gratitude (Corrected ID)
  'abcdef12-3456-7890-abcd-ef1234567890', // Communication (Conflict Repair)
  '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Emotional (Emotional Intimacy)
  'aaaa1111-bbbb-cccc-dddd-eeeeffffffff', // Intimacy (Hopes & Dreams)
  '2cbdeb46-9c77-404f-b175-5e7d51e5e29d', // Adventure & Fun
];

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
      updated_at: now,
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

    // // Check if the requested category is enabled (COMMENTED OUT FOR NOW)
    // if (!ENABLED_CATEGORIES.includes(categoryId)) {
    //   return new Response(JSON.stringify({
    //     success: false,
    //     categoryId,
    //     message: "This category is coming soon! Try Adventure & Fun for now.",
    //   }), {
    //     headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    //     status: 200, // Return 200 so frontend doesn't treat this as an error
    //   });
    // }

    // Attempt to authenticate the user (but continue even if it fails)
    const supabase = createSupabaseClientWithAuth(req);
    const { user, error: authError } = await authenticateUser(supabase);

    // // DEVELOPMENT/TESTING RESPONSE - SIMULATE SUCCESS FOR ALL CATEGORIES (REMOVED)
    // // Return success regardless of authentication status for now
    // return new Response(JSON.stringify({
    //   success: true,
    //   categoryId,
    //   categoryName: "Adventure & Fun", // Hardcoded for simplicity
    //   message: `Started category: Adventure & Fun`,
    // }), {
    //   headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    //   status: 200,
    // });

    // UNCOMMENTED FOR PRODUCTION
    // Check authentication
    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Check if progress already exists
    const alreadyStarted = await checkExistingProgress(supabase, user.id, categoryId);
    if (alreadyStarted) {
      // If progress exists, just return success (idempotent operation)
      // Fetch category name for consistent response
      const { data: categoryData, error: categoryError } = await supabase
        .from('daily_question_categories')
        .select('name')
        .eq('id', categoryId)
        .single();
      const categoryName = categoryError ? 'Unknown' : categoryData?.name;
      
      return new Response(JSON.stringify({
        success: true,
        categoryId,
        categoryName: categoryName,
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
    // END UNCOMMENTED BLOCK

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