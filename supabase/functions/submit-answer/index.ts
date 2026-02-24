import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// Types
type PersonalityDimension = 'attachment' | 'loveLanguage' | 'conflict' | 'emotionalExpression' | 'values' | 'intimacy' | 'relationalIdentity';
type PsychologyModality = 'Positive Psychology' | 'Attachment Theory' | 'Gottman Method' | 'Narrative Therapy' | 'Emotional Focused Therapy' | 'Imago Therapy' | 'Love Languages' | 'CBT' | 'Nonviolent Communication' | 'Mindfulness' | 'Influence & Persuasion' | 'Motivational Interviewing';

interface AnswerData {
  session_id: string;
  answer_text: string;
  question_id?: string;
  question_text?: string;
  modality?: PsychologyModality;
  discovery_day?: number;
  question_category?: string;
  question_intimacy_level?: number;
}

interface PersonalitySignal {
  dimension: PersonalityDimension;
  sourceModality: PsychologyModality;
  observation: string;
  strength: number;
  indicator: string;
  capturedAt: string;
  discoveryDay: number;
}

interface DimensionConfidence {
  dimension: PersonalityDimension;
  confidence: number;
  signalCount: number;
  isReliable: boolean;
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate confidence based on signal accumulation
function calculateConfidence(signalCount: number, discoveryDay: number): number {
  const baseConfidence = Math.min(1, Math.log2(signalCount + 1) / 4);
  const dayBoost = (discoveryDay / 14) * 0.15;
  return Math.min(1, baseConfidence + dayBoost);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const answerData: AnswerData = await req.json();

    // Validate required fields
    if (!answerData.session_id || !answerData.answer_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: session_id, answer_text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch session to get question details if not provided
    let sessionQuestionText = answerData.question_text;
    let sessionModality: PsychologyModality = answerData.modality || 'Positive Psychology';
    let sessionDiscoveryDay = answerData.discovery_day || 1;
    let sessionCategory = answerData.question_category || 'Emotional Intimacy';
    let sessionIntimacyLevel = answerData.question_intimacy_level || 2;

    if (!sessionQuestionText) {
      const { data: session, error: sessionError } = await supabaseClient
        .from('daily_sessions')
        .select('learn_question_text, modality, discovery_day, phase')
        .eq('id', answerData.session_id)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      sessionQuestionText = session.learn_question_text || 'What brings you to reflect on your relationship today?';
      sessionModality = (session.modality as PsychologyModality) || 'Positive Psychology';
      sessionDiscoveryDay = session.discovery_day || 1;
      sessionCategory = 'Emotional Intimacy';
      sessionIntimacyLevel = 2;
    }

    // Fetch existing profile data for context
    const { data: existingSignals } = await supabaseClient
      .from('personality_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false });

    // Build context from existing signals
    const dimensionCounts: Record<string, number> = {};
    const observations: string[] = [];
    
    if (existingSignals) {
      existingSignals.forEach(signal => {
        dimensionCounts[signal.dimension] = (dimensionCounts[signal.dimension] || 0) + 1;
        if (observations.length < 5) {
          observations.push(signal.observation);
        }
      });
    }

    const existingContext = existingSignals && existingSignals.length > 0
      ? `Existing signals: ${existingSignals.length} total. ${Object.entries(dimensionCounts).map(([d, c]) => `${d}: ${c}`).join(', ')}.`
      : 'Early in discovery — no significant profile data yet.';

    // Call OpenAI for personality inference
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a relationship psychology expert analyzing user responses to extract personality signals. You specialize in Attachment Theory, Gottman Method, Love Languages, CBT, and Emotional Focused Therapy.

Your job is to read a user's response to a relationship growth question and identify what it reveals about their personality. This is a SOLO-FIRST app — the user is working on being a better partner, so responses may be about themselves rather than their relationship directly.

Analyze their personality across these dimensions:

1. **attachment** — Attachment style signals. Look for: proximity-seeking vs. independence, fear of abandonment vs. discomfort with closeness, how they describe needing their partner.
2. **loveLanguage** — How they give and receive love. Look for: references to words/verbal affirmation, quality time together, physical closeness, doing things for partner, gift-giving/thoughtfulness.
3. **conflict** — How they handle disagreement. Look for: pursuing engagement vs. withdrawing, criticism patterns, defensiveness, repair attempts, conflict avoidance.
4. **emotionalExpression** — Emotional depth and vulnerability. Look for: emotional vocabulary range, willingness to share feelings, cognitive vs. feeling-based processing, how they regulate emotions.
5. **values** — Core values and meaning-making. Look for: what they prioritize (growth, stability, adventure, security, authenticity), autonomy vs. togetherness, future orientation.
6. **intimacy** — Comfort with emotional and physical closeness. Look for: how readily they discuss intimate topics, physical vs. emotional emphasis, novelty-seeking vs. comfort-seeking.
7. **relationalIdentity** — How they see themselves as a partner. Look for: role patterns, independence vs. merged identity, how they describe their contribution to the relationship.

For each signal you extract:
- Specify which dimension it informs
- Provide a brief observation (what you noticed)
- Rate the signal strength (0.0-1.0, where 1.0 = very clear signal)
- Name the specific trait it points toward

Not every response will contain signals for all dimensions. Only report what you genuinely observe. Do not invent or extrapolate beyond what the response shows. Quality over quantity.

Also generate a brief micro-insight (1-2 sentences) to share with the user about what their response reveals. Make it warm, encouraging, and insightful — like something a wise friend would say.

Respond with a JSON object containing:
{
  "signals": [{ "dimension", "observation", "strength", "indicator" }],
  "microInsight": "A warm, encouraging insight to share with the user",
  "memoryNotes": ["notable observations worth remembering"]
}`;

    const userPrompt = `Analyze this user response for personality signals.

**Question asked** (${sessionModality} framework, ${sessionCategory} category, intimacy level ${sessionIntimacyLevel}/5):
"${sessionQuestionText}"

**User's response**:
"${answerData.answer_text}"

**Discovery day**: ${sessionDiscoveryDay} of 14
**What we already know about this user**: ${existingContext}

Extract personality signals from the response. Focus on what's genuinely revealed, not what you'd expect. If the response is brief or surface-level, that itself is a signal about emotional expression style. Remember this is a solo-first app — the user may be reflecting on themselves as a partner.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI inference failed: ${error}`);
    }

    const aiData = await aiResponse.json();
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    // Parse and store signals
    const now = new Date().toISOString();
    const signals: PersonalitySignal[] = (analysisResult.signals || []).map((s: any) => ({
      dimension: s.dimension as PersonalityDimension,
      sourceModality: sessionModality,
      observation: s.observation,
      strength: Math.min(1, Math.max(0, s.strength)),
      indicator: s.indicator,
      capturedAt: now,
      discoveryDay: sessionDiscoveryDay,
    }));

    // Calculate confidence updates
    const dimensionSignalCounts = new Map<PersonalityDimension, number>();
    signals.forEach(signal => {
      const current = dimensionSignalCounts.get(signal.dimension) || 0;
      dimensionSignalCounts.set(signal.dimension, current + 1);
    });

    const confidenceUpdates: DimensionConfidence[] = Array.from(dimensionSignalCounts.entries()).map(([dimension, count]) => {
      const totalCount = (dimensionCounts[dimension] || 0) + count;
      const confidence = calculateConfidence(totalCount, sessionDiscoveryDay);
      return {
        dimension,
        confidence,
        signalCount: totalCount,
        isReliable: confidence >= 0.5,
      };
    });

    // Store signals in personality_signals table
    const signalInserts = signals.map(signal => ({
      id: generateId(),
      user_id: user.id,
      session_id: answerData.session_id,
      dimension: signal.dimension,
      source_modality: signal.sourceModality,
      observation: signal.observation,
      strength: signal.strength,
      indicator: signal.indicator,
      captured_at: signal.capturedAt,
      discovery_day: signal.discoveryDay,
    }));

    if (signalInserts.length > 0) {
      const { error: signalError } = await supabaseClient
        .from('personality_signals')
        .insert(signalInserts);

      if (signalError) {
        console.error('Failed to store signals:', signalError);
      }
    }

    // Store memory notes if any
    if (analysisResult.memoryNotes && analysisResult.memoryNotes.length > 0) {
      const memoryInserts = analysisResult.memoryNotes.map((note: string) => ({
        id: generateId(),
        user_id: user.id,
        content: JSON.stringify({ note, timestamp: now, source: 'personality_inference' }),
        created_at: now,
      }));

      const { error: memoryError } = await supabaseClient
        .from('conversation_memories')
        .insert(memoryInserts);

      if (memoryError) {
        console.error('Failed to store memory notes:', memoryError);
      }
    }

    // Update session with learn response
    const { error: updateError } = await supabaseClient
      .from('daily_sessions')
      .update({
        learn_response: answerData.answer_text,
        updated_at: now,
      })
      .eq('id', answerData.session_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update session:', updateError);
    }

    // Generate micro-insight
    const microInsight = analysisResult.microInsight || 
      `Thanks for sharing. Your response reveals something interesting about how you approach ${signals[0]?.dimension || 'relationships'} — keep noticing these patterns.`;

    return new Response(
      JSON.stringify({
        success: true,
        microInsight,
        signals: {
          extracted: signals.length,
          dimensions: signals.map(s => s.dimension),
          confidence: confidenceUpdates.map(c => ({
            dimension: c.dimension,
            confidence: Math.round(c.confidence * 100),
            isReliable: c.isReliable
          }))
        },
        discoveryDay: sessionDiscoveryDay
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-answer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        microInsight: "Thank you for sharing. Your willingness to reflect is already a sign of growth."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
