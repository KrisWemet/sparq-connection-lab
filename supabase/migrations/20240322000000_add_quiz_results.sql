
-- Create table for quiz results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own quiz results
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own quiz results
CREATE POLICY "Users can insert their own quiz results"
  ON public.quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create new column for isOnboarded in profiles table if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'isOnboarded'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN isOnboarded BOOLEAN DEFAULT false;
  END IF;
END
$$;
