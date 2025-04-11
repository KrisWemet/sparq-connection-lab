-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create communication_prompts table
CREATE TABLE IF NOT EXISTS public.communication_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shared_events table
CREATE TABLE IF NOT EXISTS public.shared_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_datetime TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for shared_events
ALTER TABLE public.shared_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own events" ON public.shared_events
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can insert their own events" ON public.shared_events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own events" ON public.shared_events
  FOR UPDATE USING (auth.uid() = creator_id);

-- Add RLS policies for communication_prompts
ALTER TABLE public.communication_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view communication prompts" ON public.communication_prompts
  FOR SELECT USING (true); 