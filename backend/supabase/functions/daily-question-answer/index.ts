import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AnswerPayload {
  question_id: string;
  answer_text: string;
}

interface UserProgress {
  id: string;
  user_id: string;
  category_id: string;
  current_question_position: number;
  current_level: 'Light' | 'Medium' | 'Deep';
  paused: boolean;
  completed: boolean;
  // last_question_answered_at: string | null; // This column does not exist in the schema, updated_at is used instead
}

interface QuestionDetails {
    id: string;
    category_id: string;
    level: 'Light' | 'Medium' | 'Deep';
    position: number;
}

const LEVEL_ORDER: ('Light' | 'Medium' | 'Deep')[] = ['Light', 'Medium', 'Deep'];

// Helper to get the total number of questions for a given category and level
async function getTotalQuestionsInLevel(supabase: SupabaseClient, categoryId: string, level: string): Promise<number> {
    const { count, error } = await supabase
        .from('daily_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('level', level);

    if (error) {
        console.error(`Error counting questions for level ${level}:`, error);
        return 0; // Or throw? Returning 0 might lead to unexpected completion.
    }
    return count ?? 0;
}


serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200, // Return 200 OK for preflight
      headers: getCorsHeaders(req),
    });
  }

  try {
    const supabase = createSupabaseClientWithAuth(req);
    const { user, error: authError } = await authenticateUser(supabase);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError || 'Unauthorized' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const payload: AnswerPayload = await req.json();
    if (!payload.question_id || typeof payload.answer_text !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing question_id or answer_text' }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // 1. Get the details of the question being answered
    const { data: questionDetails, error: questionError } = await supabase
        .from('daily_questions')
        .select('id, category_id, level, position')
        .eq('id', payload.question_id)
        .single();

    if (questionError || !questionDetails) {
        console.error('Error fetching question details:', questionError);
        return new Response(JSON.stringify({ error: 'Invalid question ID' }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 404,
        });
    }
    const qDetails = questionDetails as QuestionDetails;

    // 2. Get current user progress for this category
    const { data: progressData, error: progressError } = await supabase
        .from('user_daily_question_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_id', qDetails.category_id)
        .single();

    if (progressError || !progressData) {
        console.error('Error fetching user progress:', progressError);
        // Should not happen if daily-question function ran first, but handle defensively
        return new Response(JSON.stringify({ error: 'Could not find user progress for this category.' }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 404,
        });
    }
    const currentProgress = progressData as UserProgress;

    // 3. Validate: Is this the question the user is supposed to be answering?
    if (currentProgress.completed || currentProgress.paused) {
         return new Response(JSON.stringify({ error: 'Cannot answer question while daily questions are completed or paused.' }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 400, // Bad Request
        });
    }
    if (currentProgress.current_level !== qDetails.level || currentProgress.current_question_position !== qDetails.position) {
         console.warn(`Mismatch: User ${user.id} tried to answer Q ${payload.question_id} (L${qDetails.level} P${qDetails.position}) but progress is at L${currentProgress.current_level} P${currentProgress.current_question_position}`);
         return new Response(JSON.stringify({ error: 'Question answered does not match current progress.' }), {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
            status: 409, // Conflict
        });
    }


    // 4. Insert the answer
    const { error: insertAnswerError } = await supabase
      .from('user_daily_question_answers')
      .insert({
        user_id: user.id,
        question_id: payload.question_id,
        answer_text: payload.answer_text,
      });

    if (insertAnswerError) {
      // Handle potential unique constraint violation if user somehow answers twice
      if (insertAnswerError.code === '23505') { // unique_violation
         console.warn(`User ${user.id} attempted to answer question ${payload.question_id} again.`);
         // Proceed with progress update anyway? Or return error? For now, let's proceed.
      } else {
        console.error('Error inserting answer:', insertAnswerError);
        return new Response(JSON.stringify({ error: 'Could not save answer' }), {
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    // 5. Determine next progress state
    let nextPosition = currentProgress.current_question_position;
    let nextLevel = currentProgress.current_level;
    let isCategoryCompleted = false;
    let didCompleteLevel = false;

    const totalQuestionsInCurrentLevel = await getTotalQuestionsInLevel(supabase, qDetails.category_id, currentProgress.current_level);

    if (currentProgress.current_question_position < totalQuestionsInCurrentLevel) {
        // Advance position within the current level
        nextPosition++;
    } else {
        // End of the current level
        didCompleteLevel = true; // Mark level as completed
        const currentLevelIndex = LEVEL_ORDER.indexOf(currentProgress.current_level);

        if (currentLevelIndex < LEVEL_ORDER.length - 1) {
            // Move to the next level
            nextLevel = LEVEL_ORDER[currentLevelIndex + 1];
            nextPosition = 1; // Start at the first question of the new level
            console.log(`User ${user.id} completed level ${currentProgress.current_level}, moving to ${nextLevel}`);
        } else {
            // End of the last level (Deep) - category completed!
            isCategoryCompleted = true;
            // Position/Level don't strictly matter now, but keep them consistent
            nextPosition = currentProgress.current_question_position; // Keep last answered position
            nextLevel = currentProgress.current_level; // Keep last answered level
            console.log(`User ${user.id} completed category ${qDetails.category_id}`);
        }
    }

    // 6. Update user progress
    const { error: updateProgressError } = await supabase
      .from('user_daily_question_progress')
      .update({
        current_question_position: nextPosition,
        current_level: nextLevel,
        completed: isCategoryCompleted,
        // last_question_answered_at: new Date().toISOString(), // Column does not exist, updated_at covers this
        updated_at: new Date().toISOString(), // Also update general timestamp
      })
      .eq('id', currentProgress.id); // Use the progress record ID

    if (updateProgressError) {
      console.error('Error updating progress:', updateProgressError);
      // Answer was saved, but progress update failed. This is problematic.
      // Consider retry logic or logging for manual intervention.
      return new Response(JSON.stringify({ error: 'Answer saved, but failed to update progress' }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 500, // Internal Server Error, but maybe a more specific code?
      });
    }

    // 7. Return success with celebration flags
    return new Response(JSON.stringify({
        success: true,
        level_completed: didCompleteLevel && !isCategoryCompleted, // True only if level done, but not whole category
        category_completed: isCategoryCompleted
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Unexpected error in daily-question-answer:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});