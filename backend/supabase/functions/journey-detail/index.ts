// supabase/functions/journey-detail/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "journey-detail" up and running!`)

// Removed getJourneyId helper function as ID will come from request body


serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get journeyId from request body
    const body = await req.json();
    const journeyId = body.journeyId;

    if (!journeyId || typeof journeyId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid journeyId in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Fetch journey details
    const { data: journey, error: journeyError } = await supabaseClient
      .from('journeys')
      .select('id, title, description, theme, estimated_duration_days:estimatedDurationDays, image') // Select specific columns and alias
      .eq('id', journeyId)
      .single() // Expect only one result

    if (journeyError) {
      // Handle potential 'not found' error (PGRST116) vs. other errors
      if (journeyError.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Journey not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      console.error('Error fetching journey details:', journeyError)
      return new Response(JSON.stringify({ error: journeyError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!journey) { // Should be caught by single() error, but double-check
        return new Response(JSON.stringify({ error: 'Journey not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
    }

    // Fetch associated journey days and their content blocks
    // Assuming 'journey_days' table has 'journey_id', 'day_number', 'title', 'content' (JSONB?)
    const { data: days, error: daysError } = await supabaseClient
        .from('journey_days')
        .select('day_number:dayNumber, title, content, reflection_prompt:reflectionPrompt, activity') // Select specific columns and alias
        .eq('journey_id', journeyId)
        .order('day_number', { ascending: true });

    if (daysError) {
        console.error('Error fetching journey days:', daysError);
        // Decide if you want to return partial data (journey only) or fail completely
        return new Response(JSON.stringify({ error: `Failed to fetch days: ${daysError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // Combine journey details with its days
    const responseData = {
        ...journey,
        days: days || [], // Ensure days is always an array
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Caught error:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})