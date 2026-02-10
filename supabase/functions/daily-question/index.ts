// Edge Function: Fetch Daily Question from Supabase DB
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load environment variables (log for debug, mask secrets)
const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key (masked):", supabaseKey ? supabaseKey.substring(0, 4) + "..." : undefined);
const supabase = createClient(supabaseUrl, supabaseKey);

// Debug CORS: Allow all origins for troubleshooting
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Log incoming request method and URL
  console.log("Incoming request:", req.method, req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  // --- CORS Handling ---
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  // --- End CORS Handling ---

  try {
    // Extract query parameters robustly
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id');
    const category_id = url.searchParams.get('category_id');
    console.log("Received params:", { user_id, category_id });

    if (!user_id || !category_id) {
      console.error("Missing user_id or category_id", { user_id, category_id });
      return new Response(JSON.stringify({
        error: 'Missing user_id or category_id',
        received: { user_id, category_id }
      }), {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }

    // Get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_daily_questions_progress')
      .select('current_question_position')
      .eq('user_id', user_id)
      .eq('category_id', category_id)
      .single();
    if (progressError && progressError.code !== 'PGRST116') {
      console.error("Progress error:", progressError);
      return new Response(JSON.stringify({
        error: progressError.message
      }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    const nextPosition = progress ? progress.current_question_position + 1 : 1;
    // Fetch the next question
    const { data: question, error: questionError } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('category_id', category_id)
      .eq('position', nextPosition)
      .single();
    if (questionError && questionError.code !== 'PGRST116') {
      console.error("Question error:", questionError);
      return new Response(JSON.stringify({
        error: questionError.message
      }), {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    if (!question) {
      console.log("No more questions in this category.");
      return new Response(JSON.stringify({
        message: 'No more questions in this category.'
      }), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("Returning question:", question);
    return new Response(JSON.stringify({
      question
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({
      error: err && err.message ? err.message : String(err) || 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
      }
    });
  }
});
