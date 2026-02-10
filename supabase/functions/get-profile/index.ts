import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// Types
type PersonalityDimension = 'attachment' | 'loveLanguage' | 'conflict' | 'emotionalExpression' | 'values' | 'intimacy' | 'relationalIdentity';
type AttachmentStyle = 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'fearful-avoidant';
type LoveLanguage = 'words-of-affirmation' | 'quality-time' | 'physical-touch' | 'acts-of-service' | 'receiving-gifts';
type ConflictPattern = 'pursuer' | 'withdrawer' | 'validator' | 'volatile' | 'conflict-avoidant';

interface DimensionScore {
  dimension: PersonalityDimension;
  score: number; // 0-1 normalized score
  confidence: number; // 0-1 confidence level
  signalCount: number;
  isReliable: boolean;
  description?: string;
}

interface PersonalityProfile {
  // Attachment
  attachment: {
    style: AttachmentStyle;
    anxietyLevel: number;
    avoidanceLevel: number;
    observations: string[];
  };
  // Love Languages
  loveLanguages: {
    ranked: LoveLanguage[];
    scores: Record<LoveLanguage, number>;
  };
  // Conflict
  conflict: {
    primaryPattern: ConflictPattern;
    repairCapacity: number;
    criticismTendency: number;
    defensivenessTendency: number;
  };
  // Emotional Expression
  emotional: {
    opennessToVulnerability: number;
    vocabularyDepth: 'limited' | 'moderate' | 'rich';
    processingStyle: 'cognitive' | 'somatic' | 'expressive' | 'reflective';
  };
  // Values
  values: {
    coreValues: string[];
    growthOrientation: number;
    autonomyInterdependence: number;
  };
  // Intimacy
  intimacy: {
    emotionalComfort: number;
    physicalComfort: number;
    noveltyPreference: number;
    progressionRate: 'cautious' | 'moderate' | 'eager';
  };
  // Relational Identity
  relationalIdentity: {
    selfAsPartner: string;
    growthAreas: string[];
    strengths: string[];
  };
}

// Derive attachment style from anxiety and avoidance levels
function deriveAttachmentStyle(anxiety: number, avoidance: number): AttachmentStyle {
  if (anxiety < 0.4 && avoidance < 0.4) return 'secure';
  if (anxiety >= 0.4 && avoidance < 0.4) return 'anxious-preoccupied';
  if (anxiety < 0.4 && avoidance >= 0.4) return 'dismissive-avoidant';
  return 'fearful-avoidant';
}

// Calculate dimension descriptions
function getDimensionDescription(dimension: PersonalityDimension, score: number): string {
  const descriptions: Record<PersonalityDimension, Record<string, string>> = {
    attachment: {
      low: 'You tend to feel comfortable with both closeness and independence in relationships.',
      medium: 'Your attachment style shows a mix of comfort with closeness and maintaining boundaries.',
      high: 'You may experience some tension between wanting closeness and maintaining independence.'
    },
    loveLanguage: {
      low: 'Your love language preferences are still emerging.',
      medium: 'You show clear preferences in how you give and receive love.',
      high: 'You have well-defined ways of expressing and receiving affection.'
    },
    conflict: {
      low: 'You tend to approach disagreements with a measured, thoughtful approach.',
      medium: 'You have a balanced approach to handling conflict, adapting to the situation.',
      high: 'You may have strong instincts around conflict that are worth understanding better.'
    },
    emotionalExpression: {
      low: 'You tend to process experiences internally before sharing.',
      medium: 'You show a balanced approach to emotional expression.',
      high: 'You tend to be quite expressive and open with your emotions.'
    },
    values: {
      low: 'Your core values are beginning to come into focus.',
      medium: 'Your values around relationships are becoming clearer.',
      high: 'You have a strong sense of what matters most to you in relationships.'
    },
    intimacy: {
      low: 'You tend to take a thoughtful, gradual approach to deepening intimacy.',
      medium: 'You show comfort with intimacy while maintaining healthy boundaries.',
      high: 'You tend to be comfortable with emotional and physical closeness.'
    },
    relationalIdentity: {
      low: 'Your sense of yourself as a partner is still developing.',
      medium: 'You have a growing sense of who you are in relationships.',
      high: 'You have a clear sense of your role and identity as a partner.'
    }
  };

  if (score < 0.33) return descriptions[dimension].low;
  if (score < 0.66) return descriptions[dimension].medium;
  return descriptions[dimension].high;
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

    // Fetch all personality signals for the user
    const { data: signals, error: signalsError } = await supabaseClient
      .from('personality_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('captured_at', { ascending: true });

    if (signalsError) {
      console.error('Signals fetch error:', signalsError);
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('name, discovery_day, identity_archetype, streak_count')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Calculate signal counts per dimension
    const dimensionData: Record<PersonalityDimension, {
      signals: typeof signals;
      totalStrength: number;
      count: number;
      indicators: string[];
      observations: string[];
    }> = {
      attachment: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      loveLanguage: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      conflict: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      emotionalExpression: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      values: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      intimacy: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
      relationalIdentity: { signals: [], totalStrength: 0, count: 0, indicators: [], observations: [] },
    };

    if (signals && signals.length > 0) {
      signals.forEach(signal => {
        const dim = signal.dimension as PersonalityDimension;
        if (dimensionData[dim]) {
          dimensionData[dim].signals.push(signal);
          dimensionData[dim].totalStrength += signal.strength || 0;
          dimensionData[dim].count++;
          dimensionData[dim].indicators.push(signal.indicator);
          dimensionData[dim].observations.push(signal.observation);
        }
      });
    }

    // Calculate discovery day and confidence
    const discoveryDay = profile?.discovery_day || 1;
    const totalSignals = signals?.length || 0;

    // Build 7 dimension scores
    const dimensionScores: DimensionScore[] = [
      'attachment',
      'loveLanguage',
      'conflict',
      'emotionalExpression',
      'values',
      'intimacy',
      'relationalIdentity'
    ].map(dim => {
      const data = dimensionData[dim as PersonalityDimension];
      const avgStrength = data.count > 0 ? data.totalStrength / data.count : 0.3;
      const dayBoost = (discoveryDay / 14) * 0.15;
      const confidence = Math.min(1, Math.log2(data.count + 1) / 4 + dayBoost);
      
      return {
        dimension: dim as PersonalityDimension,
        score: avgStrength,
        confidence,
        signalCount: data.count,
        isReliable: confidence >= 0.5,
        description: getDimensionDescription(dim as PersonalityDimension, avgStrength)
      };
    });

    // Calculate attachment specifics
    const attachmentSignals = dimensionData.attachment;
    let anxietySum = 0;
    let avoidanceSum = 0;
    let anxietyCount = 0;
    let avoidanceCount = 0;

    attachmentSignals.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = attachmentSignals.signals[i]?.strength || 0.5;
      
      if (ind.includes('anxious') || ind.includes('reassurance') || ind.includes('abandonment') || ind.includes('preoccupied')) {
        anxietySum += strength;
        anxietyCount++;
      }
      if (ind.includes('avoidant') || ind.includes('independence') || ind.includes('distance') || ind.includes('dismissive')) {
        avoidanceSum += strength;
        avoidanceCount++;
      }
      if (ind.includes('secure') || ind.includes('comfortable') || ind.includes('balanced')) {
        anxietySum -= strength * 0.3;
        avoidanceSum -= strength * 0.3;
      }
    });

    const anxietyLevel = anxietyCount > 0 ? Math.max(0, Math.min(1, anxietySum / anxietyCount)) : 0.3;
    const avoidanceLevel = avoidanceCount > 0 ? Math.max(0, Math.min(1, avoidanceSum / avoidanceCount)) : 0.3;
    const attachmentStyle = deriveAttachmentStyle(anxietyLevel, avoidanceLevel);

    // Calculate love language scores
    const llScores: Record<LoveLanguage, number> = {
      'words-of-affirmation': 0,
      'quality-time': 0,
      'physical-touch': 0,
      'acts-of-service': 0,
      'receiving-gifts': 0
    };
    const llCounts: Record<LoveLanguage, number> = { ...llScores };

    dimensionData.loveLanguage.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = dimensionData.loveLanguage.signals[i]?.strength || 0.5;

      const keywords: Record<string, LoveLanguage[]> = {
        words: ['words-of-affirmation'],
        affirmation: ['words-of-affirmation'],
        verbal: ['words-of-affirmation'],
        compliment: ['words-of-affirmation'],
        quality: ['quality-time'],
        time: ['quality-time'],
        presence: ['quality-time'],
        physical: ['physical-touch'],
        touch: ['physical-touch'],
        hug: ['physical-touch'],
        acts: ['acts-of-service'],
        service: ['acts-of-service'],
        help: ['acts-of-service'],
        gift: ['receiving-gifts'],
        surprise: ['receiving-gifts'],
        thoughtful: ['receiving-gifts']
      };

      Object.entries(keywords).forEach(([keyword, languages]) => {
        if (ind.includes(keyword)) {
          languages.forEach(lang => {
            llScores[lang] += strength;
            llCounts[lang]++;
          });
        }
      });
    });

    // Normalize love language scores
    const loveLanguageScores: Record<LoveLanguage, number> = { ...llScores };
    (Object.keys(llScores) as LoveLanguage[]).forEach(lang => {
      if (llCounts[lang] > 0) {
        loveLanguageScores[lang] = llScores[lang] / llCounts[lang];
      }
    });

    const loveLanguagesRanked = (Object.entries(loveLanguageScores) as [LoveLanguage, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    // Calculate conflict pattern
    const conflictPatterns: Record<ConflictPattern, number> = {
      pursuer: 0,
      withdrawer: 0,
      validator: 0,
      volatile: 0,
      'conflict-avoidant': 0
    };

    dimensionData.conflict.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = dimensionData.conflict.signals[i]?.strength || 0.5;

      if (ind.includes('pursu') || ind.includes('escalat') || ind.includes('demand')) {
        conflictPatterns.pursuer += strength;
      }
      if (ind.includes('withdraw') || ind.includes('shut down') || ind.includes('stonewall')) {
        conflictPatterns.withdrawer += strength;
      }
      if (ind.includes('validat') || ind.includes('compromis') || ind.includes('calm')) {
        conflictPatterns.validator += strength;
      }
      if (ind.includes('avoid') || ind.includes('sidestep')) {
        conflictPatterns['conflict-avoidant'] += strength;
      }
      if (ind.includes('intense') || ind.includes('passionat') || ind.includes('volatile')) {
        conflictPatterns.volatile += strength;
      }
    });

    const primaryConflictPattern = (Object.entries(conflictPatterns) as [ConflictPattern, number][])
      .sort((a, b) => b[1] - a[1])[0][0];

    // Calculate emotional expression
    const emotionalSignals = dimensionData.emotionalExpression;
    let vulnerabilitySum = 0;
    let vulnerabilityCount = 0;
    let depthSignals = 0;

    emotionalSignals.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = emotionalSignals.signals[i]?.strength || 0.5;

      if (ind.includes('vulnerab') || ind.includes('open') || ind.includes('shar')) {
        vulnerabilitySum += strength;
        vulnerabilityCount++;
      }
      if (strength > 0.6) {
        depthSignals++;
      }
    });

    const emotionalOpenness = vulnerabilityCount > 0 ? vulnerabilitySum / vulnerabilityCount : 0.4;
    let vocabularyDepth: 'limited' | 'moderate' | 'rich' = 'moderate';
    if (depthSignals > 5) vocabularyDepth = 'rich';
    else if (depthSignals < 2) vocabularyDepth = 'limited';

    // Extract core values
    const valueCounts = new Map<string, number>();
    let growthSum = 0;
    let growthCount = 0;

    dimensionData.values.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = dimensionData.values.signals[i]?.strength || 0.5;
      
      valueCounts.set(ind, (valueCounts.get(ind) || 0) + strength);

      if (ind.includes('growth') || ind.includes('change') || ind.includes('learn')) {
        growthSum += strength;
        growthCount++;
      }
      if (ind.includes('stability') || ind.includes('security')) {
        growthSum -= strength * 0.5;
        growthCount++;
      }
    });

    const coreValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value]) => value);

    const growthOrientation = growthCount > 0 ? Math.max(0, Math.min(1, 0.5 + growthSum / growthCount)) : 0.5;

    // Calculate intimacy
    const intimacySignals = dimensionData.intimacy;
    let emotionalComfortSum = 0;
    let physicalComfortSum = 0;
    let noveltySum = 0;
    let eCount = 0;
    let pCount = 0;
    let nCount = 0;

    intimacySignals.indicators.forEach((indicator, i) => {
      const ind = indicator.toLowerCase();
      const strength = intimacySignals.signals[i]?.strength || 0.5;

      if (ind.includes('emotional') || ind.includes('deep') || ind.includes('connect')) {
        emotionalComfortSum += strength;
        eCount++;
      }
      if (ind.includes('physical') || ind.includes('touch') || ind.includes('sensual')) {
        physicalComfortSum += strength;
        pCount++;
      }
      if (ind.includes('novel') || ind.includes('adventur') || ind.includes('explor')) {
        noveltySum += strength;
        nCount++;
      }
    });

    const emotionalComfort = eCount > 0 ? emotionalComfortSum / eCount : 0.4;
    const physicalComfort = pCount > 0 ? physicalComfortSum / pCount : 0.3;
    const noveltyPreference = nCount > 0 ? noveltySum / nCount : 0.5;

    let progressionRate: 'cautious' | 'moderate' | 'eager' = 'moderate';
    if (emotionalComfort > 0.7 && physicalComfort > 0.6) progressionRate = 'eager';
    else if (emotionalComfort < 0.4 || physicalComfort < 0.3) progressionRate = 'cautious';

    // Build response
    const personalityProfile: PersonalityProfile = {
      attachment: {
        style: attachmentStyle,
        anxietyLevel: Math.round(anxietyLevel * 100) / 100,
        avoidanceLevel: Math.round(avoidanceLevel * 100) / 100,
        observations: attachmentSignals.observations.slice(-5)
      },
      loveLanguages: {
        ranked: loveLanguagesRanked,
        scores: loveLanguageScores
      },
      conflict: {
        primaryPattern: primaryConflictPattern,
        repairCapacity: 0.5, // Default, refined over time
        criticismTendency: 0.5,
        defensivenessTendency: 0.5
      },
      emotional: {
        opennessToVulnerability: Math.round(emotionalOpenness * 100) / 100,
        vocabularyDepth,
        processingStyle: 'reflective'
      },
      values: {
        coreValues: coreValues.length > 0 ? coreValues : ['connection', 'growth', 'authenticity'],
        growthOrientation: Math.round(growthOrientation * 100) / 100,
        autonomyInterdependence: 0.5
      },
      intimacy: {
        emotionalComfort: Math.round(emotionalComfort * 100) / 100,
        physicalComfort: Math.round(physicalComfort * 100) / 100,
        noveltyPreference: Math.round(noveltyPreference * 100) / 100,
        progressionRate
      },
      relationalIdentity: {
        selfAsPartner: `A ${profile?.identity_archetype?.replace('-', ' ') || 'growth-oriented'} partner`,
        growthAreas: dimensionScores.filter(d => !d.isReliable).map(d => d.dimension),
        strengths: dimensionScores.filter(d => d.isReliable).map(d => d.dimension)
      }
    };

    return new Response(
      JSON.stringify({
        profile: personalityProfile,
        dimensions: dimensionScores,
        meta: {
          totalSignals,
          discoveryDay,
          archetype: profile?.identity_archetype || 'growth-seeker',
          profileComplete: dimensionScores.filter(d => d.isReliable).length >= 4
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        profile: null,
        dimensions: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
