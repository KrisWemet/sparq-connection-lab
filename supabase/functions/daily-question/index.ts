import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// Types
type IdentityArchetype = 'calm-anchor' | 'compassionate-listener' | 'growth-seeker' | 'connection-builder';
type DiscoveryPhase = 'rhythm' | 'deepening' | 'navigating' | 'layers' | 'mirror';
type PersonalityDimension = 'attachment' | 'loveLanguage' | 'conflict' | 'emotionalExpression' | 'values' | 'intimacy' | 'relationalIdentity';
type PsychologyModality = 'Positive Psychology' | 'Attachment Theory' | 'Gottman Method' | 'Narrative Therapy' | 'Emotional Focused Therapy' | 'Imago Therapy' | 'Love Languages' | 'CBT' | 'Nonviolent Communication' | 'Mindfulness' | 'Influence & Persuasion' | 'Motivational Interviewing';

interface ProfileContext {
  userName: string;
  partnerName?: string;
  relationshipStructure?: string;
  discoveryDay: number;
  discoveryPhase: DiscoveryPhase;
  knownTraits: string;
  uncertainDimensions: PersonalityDimension[];
  comfortLevel: number;
  preferredModalities: PsychologyModality[];
  sensitivities: string[];
  identityArchetype?: IdentityArchetype;
  relationshipMode: 'solo' | 'partner';
  onboardingGoals: string[];
  sessionsCompleted: number;
}

interface SessionQuestion {
  id: string;
  text: string;
  format: 'multiple-choice' | 'open-ended' | 'scale' | 'ranking';
  options?: Array<{ id: string; text: string; signalHints?: Array<{ dimension: string; indicator: string; strength: number }> }>;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string];
  rankingItems?: string[];
  targetDimensions: PersonalityDimension[];
  intimacyLevel: 1 | 2 | 3 | 4 | 5;
  modality: PsychologyModality;
}

interface GeneratedQuestion {
  id: string;
  text: string;
  targetDimensions: PersonalityDimension[];
  modality: PsychologyModality;
  category: string;
  intimacyLevel: 1 | 2 | 3 | 4 | 5;
  rationale: string;
}

// Archetype configurations for personalization
const ARCHETYPE_CONFIGS: Record<IdentityArchetype, { insightStyle: string; questionTone: string }> = {
  'calm-anchor': {
    insightStyle: 'Reflective and measured. Frame insights as foundations being strengthened. Use metaphors of roots, anchors, steady ground. Avoid urgency or pressure.',
    questionTone: 'Calm, thoughtful, unhurried. Questions should invite reflection, not demand immediate reaction.'
  },
  'compassionate-listener': {
    insightStyle: 'Warm and empathetic. Frame insights as deepening understanding. Use metaphors of bridges, open doors, safe spaces. Center the emotional experience.',
    questionTone: 'Gentle, feeling-oriented, emotionally attuned. Questions should feel like an invitation to share, not an interrogation.'
  },
  'growth-seeker': {
    insightStyle: 'Forward-looking and energizing. Frame insights as growth opportunities and progress markers. Use metaphors of paths, horizons, unlocking. Create excitement about learning.',
    questionTone: 'Curious, slightly challenging, forward-looking. Questions should feel like an invitation to explore and push boundaries.'
  },
  'connection-builder': {
    insightStyle: 'Warm and relational. Frame insights as bridges being built. Use metaphors of weaving, bridges, shared spaces, intertwining. Emphasize togetherness and shared experience.',
    questionTone: 'Warm, relational, togetherness-oriented. Questions should feel like they\'re about building something together.'
  }
};

// Phase-specific dimension targeting
function getPhaseForDay(day: number): DiscoveryPhase {
  if (day <= 3) return 'rhythm';
  if (day <= 6) return 'deepening';
  if (day <= 9) return 'navigating';
  if (day <= 12) return 'layers';
  return 'mirror';
}

function getDimensionPriority(phase: DiscoveryPhase): PersonalityDimension[] {
  const phaseTargets: Record<DiscoveryPhase, PersonalityDimension[]> = {
    rhythm: ['values', 'emotionalExpression', 'relationalIdentity'],
    deepening: ['attachment', 'emotionalExpression', 'loveLanguage'],
    navigating: ['conflict', 'loveLanguage', 'attachment'],
    layers: ['intimacy', 'emotionalExpression', 'values'],
    mirror: ['relationalIdentity', 'values', 'attachment']
  };
  return phaseTargets[phase];
}

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
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

    // Fetch user profile with discovery data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('name, partner_name, relationship_structure, identity_archetype, relationship_mode, discovery_day, onboarding_goals, streak_count')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get discovery day (default to 1)
    const discoveryDay = profile.discovery_day || 1;
    const phase = getPhaseForDay(discoveryDay);
    const archetype = (profile.identity_archetype as IdentityArchetype) || 'growth-seeker';
    const archetypeConfig = ARCHETYPE_CONFIGS[archetype];

    // Get previous questions to avoid repetition
    const { data: previousSessions } = await supabaseClient
      .from('daily_sessions')
      .select('learn_question_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const previousQuestionIds = previousSessions?.map(s => s.learn_question_id).filter(Boolean) || [];

    // Target dimensions based on phase
    const targetDimensions = getDimensionPriority(phase);

    // Fetch personality signals for context building
    const { data: signals } = await supabaseClient
      .from('personality_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: false })
      .limit(50);

    // Build profile context summary
    const knownTraits = signals && signals.length > 0
      ? `Collected ${signals.length} signals across dimensions. Day ${discoveryDay} of discovery.`
      : 'Early in discovery — gathering initial signals.';

    // Generate question using AI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a warm, knowledgeable relationship coach crafting a daily question. You speak like a trusted friend who happens to know psychology.

STYLE: ${archetypeConfig.insightStyle}
TONE: ${archetypeConfig.questionTone}

This is a SOLO-FIRST app — frame everything as personal growth for better relationships. Not "what does your partner think?" but "what do you notice about yourself?"

Generate an OPEN-ENDED question that invites a narrative response (2-3 sentences). Frame it as a reflection or memory prompt.

RULES:
- Questions should feel like connection exercises, NOT personality tests
- Use warm, conversational language — no clinical terms
- Match intimacy to the discovery day (lower early, higher later)
- Each question should naturally reveal personality signals without feeling like an assessment

Respond with JSON:
{
  "text": "the question text",
  "targetDimensions": ["dimension1"],
  "modality": "PsychologyModality name",
  "intimacyLevel": 1-5,
  "insight": "Brief intro before the question: Today we're exploring...",
  "archetypePersonalization": "How this question is tailored to their archetype"
}`;

    const userPrompt = `Generate an open-ended question for ${profile.name}.

Day ${discoveryDay} of 14 | Phase: ${phase} | Archetype: ${archetype}
What we know: ${knownTraits}
Dimensions needing signal: ${targetDimensions.slice(0, 3).join(', ')}
${previousQuestionIds.length > 0 ? `Avoid repeating themes from ${previousQuestionIds.length} previous questions.` : ''}`;

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
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      throw new Error(`AI generation failed: ${error}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = JSON.parse(aiData.choices[0].message.content);

    // Create question object
    const questionId = generateId();
    const question: SessionQuestion = {
      id: questionId,
      text: generatedContent.text,
      format: 'open-ended',
      targetDimensions: generatedContent.targetDimensions || targetDimensions.slice(0, 2),
      intimacyLevel: Math.min(5, Math.max(1, generatedContent.intimacyLevel || 2)) as 1 | 2 | 3 | 4 | 5,
      modality: generatedContent.modality || 'Positive Psychology',
    };

    // Store question metadata for reference
    const { error: insertError } = await supabaseClient
      .from('generated_questions')
      .insert({
        id: questionId,
        user_id: user.id,
        text: question.text,
        target_dimensions: question.targetDimensions,
        modality: question.modality,
        intimacy_level: question.intimacyLevel,
        discovery_day: discoveryDay,
        phase: phase,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to store question:', insertError);
      // Continue anyway - don't fail the request
    }

    return new Response(
      JSON.stringify({
        question: {
          id: question.id,
          text: question.text,
          format: question.format,
          modality: question.modality,
          phase: phase,
          intimacyLevel: question.intimacyLevel,
          targetDimensions: question.targetDimensions
        },
        insight: generatedContent.insight || `Today we're exploring something about ${targetDimensions[0].replace(/([A-Z])/g, ' $1').toLowerCase()}...`,
        archetypePersonalization: generatedContent.archetypePersonalization || `Tailored for the ${archetype.replace('-', ' ')} archetype.`,
        discoveryDay,
        phase
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-question function:', error);
    
    // Return a fallback question on error
    return new Response(
      JSON.stringify({
        error: error.message,
        fallback: true,
        question: {
          id: generateId(),
          text: "What's one thing that always makes you feel connected to the people you love?",
          format: 'open-ended',
          modality: 'Positive Psychology',
          phase: 'rhythm',
          intimacyLevel: 1,
          targetDimensions: ['values', 'emotionalExpression']
        },
        insight: "Today we're exploring what connection means to you...",
        archetypePersonalization: "A warm starting point for everyone.",
        discoveryDay: 1,
        phase: 'rhythm'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
