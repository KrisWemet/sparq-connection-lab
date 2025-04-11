import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createSupabaseClientWithAuth, authenticateUser } from '../_shared/auth.ts';


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

    console.log(`User authenticated: ${user.id}`);

    const url = new URL(req.url);
    const categoryId = url.searchParams.get('category_id');

    if (!categoryId) {
      return new Response(JSON.stringify({
        status: "select_category",
        message: "Please select a category to begin daily questions"
      }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Fetch user progress for this category
    const { data: progressData, error: progressError } = await supabase
      .from('user_daily_question_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .single();

    if (progressError || !progressData) {
      console.warn('No user progress found, fetching first question in category');

      const { data: firstQuestion, error: firstQuestionError } = await supabase
        .from('daily_questions')
        .select('id, question_text, level, position')
        .eq('category_id', categoryId)
        .eq('level', 'Light')
        .eq('position', 1)
        .single();

      if (firstQuestionError || !firstQuestion) {
        console.error('Error fetching first question:', firstQuestionError);
        return new Response(JSON.stringify({
          error: 'No questions found for this category'
        }), {
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      return new Response(JSON.stringify({
        status: "question",
        questionId: firstQuestion.id,
        questionText: firstQuestion.question_text,
        level: firstQuestion.level,
        position: firstQuestion.position,
        category: categoryId,
        miniChallenge: null
      }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const currentLevel = progressData.current_level;
    const currentPosition = progressData.current_question_position;

    // Fetch the next question in this category and level
    const { data: questionData, error: questionError } = await supabase
      .from('daily_questions')
      .select('id, question_text, level, position')
      .eq('category_id', categoryId)
      .eq('level', currentLevel)
      .eq('position', currentPosition)
      .single();

    if (questionError || !questionData) {
      console.error('Error fetching question:', questionError);
      return new Response(JSON.stringify({
        error: 'No question found for current progress'
      }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    return new Response(JSON.stringify({
      status: "question",
      questionId: questionData.id,
      questionText: questionData.question_text,
      level: questionData.level,
      position: questionData.position,
      category: categoryId,
      miniChallenge: null
    }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
