-- Create enums for various types
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'partner');
CREATE TYPE public.relationship_type AS ENUM ('monogamous', 'polyamorous', 'lgbtq', 'long-distance');
CREATE TYPE public.journey_type AS ENUM ('communication', 'intimacy', 'trust', 'growth', 'conflict');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'platinum');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE public.question_modality AS ENUM ('reflection', 'discussion', 'activity');
CREATE TYPE public.love_language AS ENUM (
  'words-of-affirmation', 
  'acts-of-service', 
  'receiving-gifts', 
  'quality-time', 
  'physical-touch'
);

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  gender public.gender DEFAULT 'prefer-not-to-say',
  relationship_type public.relationship_type DEFAULT 'monogamous',
  avatar_url TEXT,
  partner_id UUID REFERENCES public.profiles(id),
  subscription_tier public.subscription_tier DEFAULT 'free',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  is_onboarded BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles for multi-role support
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Partner invitations table
CREATE TABLE public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Journeys table (predefined relationship growth journeys)
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type public.journey_type NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  estimated_days INTEGER,
  premium_only BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Journey questions (steps within journeys)
CREATE TABLE public.journey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  explanation TEXT,
  category TEXT,
  modality public.question_modality DEFAULT 'reflection',
  love_language public.love_language,
  sequence_number INTEGER NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User journey progress
CREATE TABLE public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, journey_id)
);

-- Journey responses (answers to journey questions)
CREATE TABLE public.journey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.journey_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Goal milestones
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily questions
CREATE TABLE public.daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT,
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User daily question responses
CREATE TABLE public.daily_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.daily_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id, created_at::date)
);

-- Date ideas table
CREATE TABLE public.date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cost_level INTEGER DEFAULT 1,
  time_required INTEGER, -- in minutes
  at_home BOOLEAN DEFAULT false,
  outdoor BOOLEAN DEFAULT false,
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User saved date ideas
CREATE TABLE public.user_date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_idea_id UUID NOT NULL REFERENCES public.date_ideas(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  scheduled_for DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date_idea_id)
);

-- User activity logs for analytics
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  details JSONB,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System settings (admin configurable)
CREATE TABLE public.system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 
    AND role = 'admin'::public.user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Row Level Security Policies

-- Profiles: Users can read their own profile and their partner's profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);
  
CREATE POLICY "Users can view their partner's profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() IN (
    SELECT partner_id FROM public.profiles WHERE id = auth.uid()
  ));
  
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
  
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR ALL 
  USING (public.is_admin(auth.uid()));

-- User roles: Only admins can manage roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Partner invitations: Users can manage their own invitations
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own invitations"
  ON public.partner_invitations FOR ALL
  USING (auth.uid() = sender_id);
  
CREATE POLICY "Admins can manage all invitations"
  ON public.partner_invitations FOR ALL
  USING (public.is_admin(auth.uid()));

-- Apply similar RLS policies to other tables...

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.partner_invitations
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_profiles_partner_id ON public.profiles(partner_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_partner_invitations_sender_id ON public.partner_invitations(sender_id);
CREATE INDEX idx_partner_invitations_recipient_email ON public.partner_invitations(recipient_email);
CREATE INDEX idx_user_journeys_user_id ON public.user_journeys(user_id);
CREATE INDEX idx_user_journeys_journey_id ON public.user_journeys(journey_id);
CREATE INDEX idx_journey_questions_journey_id ON public.journey_questions(journey_id);
CREATE INDEX idx_journey_responses_user_id ON public.journey_responses(user_id);
CREATE INDEX idx_journey_responses_journey_id ON public.journey_responses(journey_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goal_milestones_goal_id ON public.goal_milestones(goal_id);
CREATE INDEX idx_daily_question_responses_user_id ON public.daily_question_responses(user_id);
CREATE INDEX idx_user_date_ideas_user_id ON public.user_date_ideas(user_id);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON public.user_activities(activity_type);

-- Initial system settings
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('enable_premium_features', 'true', 'Enable premium features for subscribers'),
  ('enable_user_registration', 'true', 'Allow new users to register'),
  ('enable_partner_invites', 'true', 'Allow users to invite partners'),
  ('maintenance_mode', 'false', 'Put the application in maintenance mode'),
  ('debug_mode', 'false', 'Enable detailed error logging'),
  ('system_announcement', '{"enabled": false, "message": "", "level": "info"}', 'System-wide announcement message'); 