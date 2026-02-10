import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

// Types
type DiscoveryPhase = 'rhythm' | 'deepening' | 'navigating' | 'layers' | 'mirror';

interface SessionData {
  session_date: string;
  discovery_day: number;
  phase: DiscoveryPhase;
  learn_response: string;
  micro_action: string;
  micro_action_accepted: boolean;
  reflect_response?: string;
  question_id?: string;
  question_text?: string;
  modality?: string;
  check_in_response?: string;
  implement_action_id?: string;
  points_earned?: number;
}

// Calculate if two dates are consecutive
function isConsecutiveDay(lastDate: string | null, currentDate: string): boolean {
  if (!lastDate) return false;
  
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  
  // Reset time to compare dates only
  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// Calculate streak status
function calculateStreak(
  currentStreak: number | null,
  lastSessionDate: string | null,
  sessionDate: string
): { streak: number; streakContinued: boolean; streakBroken: boolean } {
  const currentStreakCount = currentStreak || 0;
  
  if (!lastSessionDate) {
    // First session ever
    return { streak: 1, streakContinued: false, streakBroken: false };
  }
  
  const last = new Date(lastSessionDate);
  const current = new Date(sessionDate);
  
  // Reset time to compare dates only
  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day - don't increment streak
    return { streak: currentStreakCount, streakContinued: false, streakBroken: false };
  }
  
  if (diffDays === 1) {
    // Consecutive day - increment streak
    return { streak: currentStreakCount + 1, streakContinued: true, streakBroken: false };
  }
  
  if (diffDays > 1) {
    // Streak broken - reset to 1
    return { streak: 1, streakContinued: false, streakBroken: true };
  }
  
  // Future date (shouldn't happen but handle gracefully)
  return { streak: currentStreakCount, streakContinued: false, streakBroken: false };
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
    const sessionData: SessionData = await req.json();

    // Validate required fields
    if (!sessionData.session_date || !sessionData.discovery_day || !sessionData.phase) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: session_date, discovery_day, phase' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current profile for streak calculation
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('streak_count, last_daily_activity, relationship_points, discovery_day')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const currentProfile = profile || { streak_count: 0, last_daily_activity: null, relationship_points: 0, discovery_day: 1 };

    // Calculate streak
    const { streak, streakContinued, streakBroken } = calculateStreak(
      currentProfile.streak_count,
      currentProfile.last_daily_activity,
      sessionData.session_date
    );

    // Calculate points earned
    const basePoints = 10;
    const streakBonus = streakContinued ? Math.min(streak * 2, 20) : 0;
    const completionBonus = sessionData.reflect_response ? 5 : 0;
    const totalPoints = (sessionData.points_earned || 0) + basePoints + streakBonus + completionBonus;

    // Generate session ID
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert into daily_sessions table
    const { data: insertedSession, error: insertError } = await supabaseClient
      .from('daily_sessions')
      .insert({
        id: sessionId,
        user_id: user.id,
        session_date: sessionData.session_date,
        discovery_day: sessionData.discovery_day,
        phase: sessionData.phase,
        learn_response: sessionData.learn_response,
        learn_question_id: sessionData.question_id,
        learn_question_text: sessionData.question_text,
        modality: sessionData.modality,
        micro_action: sessionData.micro_action,
        micro_action_accepted: sessionData.micro_action_accepted ?? true,
        implement_action_id: sessionData.implement_action_id,
        reflect_response: sessionData.reflect_response,
        check_in_response: sessionData.check_in_response,
        points_earned: totalPoints,
        streak_at_session: streak,
        created_at: new Date().toISOString(),
        completed_at: sessionData.reflect_response ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Session insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save session', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user_streaks table
    const { error: streakError } = await supabaseClient
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: streak,
        longest_streak: Math.max(streak, currentProfile.streak_count || 0),
        last_session_date: sessionData.session_date,
        total_sessions: supabaseClient.rpc('increment', { x: 1 }),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (streakError) {
      console.error('Streak update error:', streakError);
      // Don't fail the request - session is already saved
    }

    // Update profile with new streak and points
    const newDiscoveryDay = Math.min(14, (currentProfile.discovery_day || 1) + 1);
    const { error: profileUpdateError } = await supabaseClient
      .from('profiles')
      .update({
        streak_count: streak,
        last_daily_activity: sessionData.session_date,
        relationship_points: (currentProfile.relationship_points || 0) + totalPoints,
        discovery_day: newDiscoveryDay,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      // Don't fail the request - session is already saved
    }

    // Check for streak milestones
    const milestones: number[] = [3, 7, 14, 30, 60, 100];
    const achievedMilestone = streakContinued && milestones.includes(streak);

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: sessionId,
          sessionDate: sessionData.session_date,
          discoveryDay: sessionData.discovery_day,
          phase: sessionData.phase,
          pointsEarned: totalPoints
        },
        streak: {
          current: streak,
          continued: streakContinued,
          broken: streakBroken,
          previous: currentProfile.streak_count || 0,
          milestone: achievedMilestone ? streak : null
        },
        progress: {
          totalPoints: (currentProfile.relationship_points || 0) + totalPoints,
          nextDiscoveryDay: newDiscoveryDay
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-session function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
