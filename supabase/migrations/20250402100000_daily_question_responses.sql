-- User daily question responses
CREATE TABLE public.daily_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX daily_question_responses_user_id_question_id_created_at_idx ON public.daily_question_responses (user_id, question_id, date_trunc('day', created_at));