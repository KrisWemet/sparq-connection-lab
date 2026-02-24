import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the authorization header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { responseText } = await req.json()

    if (!responseText) {
      throw new Error('Response text is required')
    }

    // 2. Read the user's current psychological profile from the Supabase DB.
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('psychological_profile')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // 3. Call the OpenRouter API with Analyzer and Generator prompts
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      throw new Error('Missing OPENROUTER_API_KEY')
    }

    const systemPrompt = `You are a warm, friendly companion. Keep all output at a 4th-grade reading level. Do not use any clinical or psychological terms.`
    const combinedPrompt = `
Current Profile:
${profile?.psychological_profile || 'No profile yet.'}

Latest Response:
"${responseText}"

Please do three things:
1. Update their profile based on their new response. Keep it simple and focused on their likes, dislikes, feelings, and daily experiences.
2. Create a new question for tomorrow. It should be simple, friendly, and related to what you've learned about them.
3. Suggest a small, easy "Tonight Action" they can do right now to feel good or relax based on their response.

Return your answer EXACTLY as a JSON object with this format (no other text, no markdown block):
{
  "updatedProfile": "...",
  "tomorrowQuestion": "...",
  "tonightAction": "..."
}
`

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparqconnection.com', // Optional, for OpenRouter rankings
        'X-Title': 'Sparq Connection Lab' // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Cost-effective, warm, and friendly
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: combinedPrompt }
        ]
      })
    })

    if (!openRouterResponse.ok) {
      const errorBody = await openRouterResponse.text();
      throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${errorBody}`)
    }

    const aiData = await openRouterResponse.json()
    const aiText = aiData.choices[0].message.content

    let parsedResult;
    try {
      // In case the model returns markdown wrap despite JSON instruction
      const jsonStr = aiText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedResult = JSON.parse(jsonStr)
    } catch (e) {
      console.error("Failed to parse AI response:", aiText)
      throw new Error("Invalid JSON from AI model")
    }

    const { updatedProfile, tomorrowQuestion, tonightAction } = parsedResult;

    // 4. Write the updated profile and tomorrow's question back into the DB.
    
    // First insert the new question
    const { data: newQuestion, error: questionError } = await supabaseClient
      .from('questions')
      .insert({
        user_id: user.id,
        text: tomorrowQuestion,
        date_for: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
      })
      .select('id')
      .single()

    if (questionError) {
      console.error('Failed to create new question:', questionError)
      // Non-fatal, we still update the profile
    }

    // Update profile
    const profileUpdateData: any = {
      psychological_profile: updatedProfile
    }

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // 5. Return the immediate 'Tonight Action' to the frontend.
    return new Response(
      JSON.stringify({ tonightAction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})