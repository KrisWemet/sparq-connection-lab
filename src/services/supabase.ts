import { createClient } from '@supabase/supabase-js';
import { Journey, UserJourneyProgress, JourneyInvitation } from '../types/journey';

const supabaseUrl = "https://nbljcvqiiurfbjquhbxu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibGpjdnFpaXVyZmJqcXVoYnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzUzMzAsImV4cCI6MjA1NjAxMTMzMH0.pDb4vjIdSTvRPGHAtolC47Icu2o3DXKhlwVllv6GvOY";

// No need to check for environment variables since we're using hardcoded values
export const supabase = createClient(supabaseUrl, supabaseKey);

// Journey functions
export async function getJourneys(): Promise<Journey[]> {
  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .order('sequence');
    
  if (error) throw error;
  return data;
}

export async function getJourneyById(id: string): Promise<Journey | null> {
  const { data, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

// User Journey Progress functions
export async function getUserJourneyProgress(userId: string, journeyId: string): Promise<UserJourneyProgress | null> {
  const { data, error } = await supabase
    .from('user_journey_progress')
    .select('*')
    .eq('userId', userId)
    .eq('journeyId', journeyId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserJourneyProgress(
  userId: string,
  journeyId: string,
  progress: Partial<UserJourneyProgress>
): Promise<void> {
  const { error } = await supabase
    .from('user_journey_progress')
    .upsert({
      userId,
      journeyId,
      ...progress,
      lastAccessedAt: new Date().toISOString()
    });
    
  if (error) throw error;
}

// Journey Invitation functions
export async function createJourneyInvitation(
  journeyId: string,
  inviterId: string,
  inviteeEmail: string
): Promise<JourneyInvitation> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const { data, error } = await supabase
    .from('journey_invitations')
    .insert({
      journeyId,
      inviterId,
      inviteeEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function respondToInvitation(
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const { error } = await supabase
    .from('journey_invitations')
    .update({ status })
    .eq('id', invitationId);
    
  if (error) throw error;
}

// Activity Response functions
export async function saveActivityResponse(
  userId: string,
  journeyId: string,
  day: number,
  activityId: string,
  response: {
    questionId: string;
    answer: string;
    answeredBy: 'user' | 'partner';
  }
): Promise<void> {
  const { error } = await supabase.rpc('save_activity_response', {
    p_user_id: userId,
    p_journey_id: journeyId,
    p_day: day,
    p_activity_id: activityId,
    p_response: response
  });
  
  if (error) throw error;
} 