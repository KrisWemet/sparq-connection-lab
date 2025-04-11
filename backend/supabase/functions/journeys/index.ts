// supabase/functions/journeys/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "journeys" up and running!`)

serve(async (req: Request) => { // Add Request type
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // No specific user auth needed for public list, but good practice to have client ready
    // const { data: { user } } = await supabaseClient.auth.getUser()
    // if (!user) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: 401,
    //   })
    // }

    // Fetch all journeys (adjust columns as needed for summary)
    const { data: journeys, error } = await supabaseClient
      .from('journeys')
      .select('id, title, description, category, estimated_duration_days:estimatedDurationDays, image') // Select summary fields, alias snake_case, use image
      .order('title', { ascending: true }) // Optional: order results

    if (error) {
      console.error('Error fetching journeys:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify(journeys), {
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