import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
      },
    });
  }

  try {
    const supabase = createSupabaseClientWithAuth(req);
    const { user, error: authError } = await authenticateUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log(`Test function: User authenticated: ${user.id}`);

    // Just return a simple success response
    return new Response(JSON.stringify({
      success: true,
      message: "Test function working",
      userId: user.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Test function unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 