-- User daily question responses
CREATE TABLE public.daily_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_date DATE NOT NULL DEFAULT (now()::date), -- Add date column
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- Add updated_at
);

-- Create unique index on user_id, question_id, and the response_date
CREATE UNIQUE INDEX daily_question_responses_user_question_date_idx
ON public.daily_question_responses (user_id, question_id, response_date);

-- Add RLS policies (assuming trigger_set_updated_at function exists from schema.sql or another migration)
ALTER TABLE public.daily_question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily question responses"
ON public.daily_question_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily question responses"
ON public.daily_question_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily question responses"
ON public.daily_question_responses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily question responses"
ON public.daily_question_responses FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_daily_question_responses
BEFORE UPDATE ON public.daily_question_responses
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();