-- ============================================================================
-- Sparq Connection Lab — Complete Database Schema
-- Clean rebuild matching types.ts + new features (Stripe, Memory, Partner)
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.journey_type AS ENUM ('communication', 'intimacy', 'personal_growth');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'ultimate');
CREATE TYPE public.discovery_phase AS ENUM ('rhythm', 'deepening', 'navigating', 'layers', 'mirror', 'integration');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  partner_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  partner_id UUID REFERENCES public.profiles(id),
  relationship_level TEXT DEFAULT 'getting-started',
  relationship_points INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  isonboarded BOOLEAN DEFAULT false,
  last_daily_activity TIMESTAMP WITH TIME ZONE,
  discovery_day INTEGER DEFAULT 0,
  mirror_narrative_delivered BOOLEAN DEFAULT false,
  mirror_narrative_delivered_at TIMESTAMP WITH TIME ZONE,
  -- Personality discovery fields
  identity_archetype TEXT, -- calm-anchor, compassionate-listener, growth-seeker, connection-builder
  relationship_mode TEXT DEFAULT 'solo', -- solo or partner
  onboarding_goals TEXT[], -- up to 3 goals selected during onboarding
  preferred_session_time TEXT, -- morning, afternoon, evening
  -- Subscription fields
  subscription_tier public.subscription_tier DEFAULT 'free',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- DAILY SESSIONS (Learn → Implement → Reflect)
-- ============================================================================

CREATE TABLE public.daily_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  discovery_day INTEGER NOT NULL,
  phase TEXT NOT NULL, -- rhythm, deepening, navigating, layers, mirror, integration
  -- Learn step
  learn_question_text TEXT,
  learn_question_id TEXT,
  modality TEXT, -- multiple_choice, open_ended, scale
  learn_response TEXT NOT NULL,
  -- Implement step
  micro_action TEXT NOT NULL,
  micro_action_accepted BOOLEAN DEFAULT true,
  implement_action_id TEXT,
  -- Reflect step (optional, day 2+)
  reflect_response TEXT,
  check_in_response TEXT,
  -- Tracking
  points_earned INTEGER DEFAULT 10,
  streak_at_session INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, session_date)
);

-- User streaks (separate table for fast lookups)
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  total_sessions INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PERSONALITY DISCOVERY & PROGRESSIVE MEMORY
-- ============================================================================

-- Personality signals extracted from daily responses
CREATE TABLE public.personality_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL, -- attachment_style, love_language, conflict_style, etc.
  signal_key TEXT NOT NULL, -- e.g. "secure", "words_of_affirmation"
  confidence REAL DEFAULT 0.5, -- 0.0 to 1.0
  evidence TEXT, -- the response that generated this signal
  source_session_id UUID REFERENCES public.daily_sessions(id),
  discovery_day INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aggregated personality profile (rebuilt from signals)
CREATE TABLE public.personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- 7 dimensions with scores and confidence
  attachment_style JSONB DEFAULT '{}', -- {primary: "secure", scores: {...}, confidence: 0.7}
  love_language JSONB DEFAULT '{}',
  conflict_style JSONB DEFAULT '{}',
  emotional_expression JSONB DEFAULT '{}',
  core_values JSONB DEFAULT '{}',
  intimacy_profile JSONB DEFAULT '{}',
  relational_identity JSONB DEFAULT '{}',
  -- Metadata
  overall_confidence REAL DEFAULT 0.0,
  total_signals INTEGER DEFAULT 0,
  sensitive_topics TEXT[], -- topics to approach gently
  strengths TEXT[], -- identified strengths
  growth_areas TEXT[], -- areas for development
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mirror narratives (Day 14 "we see you" reflection)
CREATE TABLE public.mirror_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  narrative TEXT NOT NULL,
  dimension_summaries JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  core_insight TEXT DEFAULT '',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Progressive memory (key-value store that learns over time)
CREATE TABLE public.memory_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Conversation memories (for AI context building)
CREATE TABLE public.conversation_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384), -- for semantic search (optional)
  memory_type TEXT DEFAULT 'session', -- session, insight, pattern, preference
  importance REAL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User memories (richer structured memories)
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE,
  sentiment TEXT, -- positive, neutral, negative
  tags TEXT[],
  related_to TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- JOURNEYS
-- ============================================================================

CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type public.journey_type NOT NULL,
  difficulty INTEGER DEFAULT 1,
  estimated_duration INTERVAL,
  modality TEXT,
  premium_only BOOLEAN DEFAULT false,
  image_url TEXT,
  icon TEXT,
  color TEXT,
  phases JSONB, -- [{name, description, days, activities}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.journey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  explanation TEXT,
  category TEXT NOT NULL,
  modality TEXT DEFAULT 'reflection',
  love_language TEXT,
  difficulty INTEGER DEFAULT 1,
  sequence_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, journey_id)
);

CREATE TABLE public.journey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.journey_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- AI-generated journey content cache
CREATE TABLE public.ai_journey_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  content_type TEXT NOT NULL, -- learn, implement, reflect, intro
  content JSONB NOT NULL, -- {question, options, explanation, micro_action, etc.}
  is_personalized BOOLEAN DEFAULT false, -- true for premium, false for generic
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, journey_id, day_number, content_type)
);

-- ============================================================================
-- ACTIVITIES & ACHIEVEMENTS
-- ============================================================================

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  content_id TEXT NOT NULL,
  mood_rating INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  response TEXT,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_level INTEGER DEFAULT 1,
  achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, badge_type)
);

-- User activity logs
CREATE TABLE public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  details JSONB,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- QUIZ
-- ============================================================================

CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PARTNER FEATURES
-- ============================================================================

CREATE TABLE public.partner_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_email TEXT NOT NULL,
  status public.invitation_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Shared answers between partners
CREATE TABLE public.shared_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  session_id UUID REFERENCES public.daily_sessions(id),
  category TEXT,
  discovery_day INTEGER,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- partner_shared, achievement, streak, session_reminder
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID REFERENCES public.profiles(id),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- STRIPE SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier public.subscription_tier DEFAULT 'free',
  status TEXT DEFAULT 'active', -- active, past_due, canceled, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ADMIN
-- ============================================================================

CREATE TABLE public.system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Generate unique partner code
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT AS $$
  SELECT upper(encode(gen_random_bytes(4), 'hex'));
$$ LANGUAGE sql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.partner_invites FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.personality_profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.shared_answers FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Update streak on session completion
CREATE OR REPLACE FUNCTION public.update_streak_on_session()
RETURNS TRIGGER AS $$
DECLARE
  v_streak RECORD;
  v_yesterday DATE;
BEGIN
  v_yesterday := CURRENT_DATE - 1;

  SELECT * INTO v_streak FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_session_date, total_sessions)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1);
  ELSE
    IF v_streak.last_session_date = CURRENT_DATE THEN
      -- Already completed today, just update total
      NULL;
    ELSIF v_streak.last_session_date = v_yesterday THEN
      -- Consecutive day!
      UPDATE public.user_streaks SET
        current_streak = v_streak.current_streak + 1,
        longest_streak = GREATEST(v_streak.longest_streak, v_streak.current_streak + 1),
        last_session_date = CURRENT_DATE,
        total_sessions = v_streak.total_sessions + 1,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken, restart
      UPDATE public.user_streaks SET
        current_streak = 1,
        last_session_date = CURRENT_DATE,
        total_sessions = v_streak.total_sessions + 1,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  -- Update profile streak_count too
  UPDATE public.profiles SET
    streak_count = (SELECT current_streak FROM public.user_streaks WHERE user_id = NEW.user_id),
    discovery_day = NEW.discovery_day,
    last_daily_activity = now()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_daily_session_created
AFTER INSERT ON public.daily_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_session();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mirror_narratives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_journey_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read partner profile" ON public.profiles FOR SELECT USING (id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Own-data policies (user can CRUD their own rows)
CREATE POLICY "Own data" ON public.daily_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.personality_signals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.personality_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.mirror_narratives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.memory_storage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.conversation_memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.user_journeys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.journey_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.ai_journey_content FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.daily_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.user_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own data" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- Public read for journeys and questions
CREATE POLICY "Anyone can read journeys" ON public.journeys FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON public.journey_questions FOR SELECT USING (true);

-- Partner invites: sender can manage, recipient can read
CREATE POLICY "Sender manages invites" ON public.partner_invites FOR ALL USING (auth.uid() = sender_id);

-- Shared answers: sender or recipient can read
CREATE POLICY "Shared answers access" ON public.shared_answers FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Sender creates shared" ON public.shared_answers FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: recipient can read and update
CREATE POLICY "Own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System creates notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- User roles: users can read own, admins can manage all
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "System inserts roles" ON public.user_roles FOR INSERT WITH CHECK (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_partner_id ON public.profiles(partner_id);
CREATE INDEX idx_profiles_partner_code ON public.profiles(partner_code);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_daily_sessions_user_date ON public.daily_sessions(user_id, session_date);
CREATE INDEX idx_personality_signals_user ON public.personality_signals(user_id, dimension);
CREATE INDEX idx_memory_storage_user_key ON public.memory_storage(user_id, key);
CREATE INDEX idx_conversation_memories_user ON public.conversation_memories(user_id);
CREATE INDEX idx_user_journeys_user ON public.user_journeys(user_id);
CREATE INDEX idx_journey_questions_journey ON public.journey_questions(journey_id);
CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_user_activities_user ON public.user_activities(user_id);
CREATE INDEX idx_shared_answers_recipient ON public.shared_answers(recipient_id, is_read);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_customer_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
  ('enable_premium_features', 'true', 'Enable premium features for subscribers'),
  ('enable_user_registration', 'true', 'Allow new users to register'),
  ('enable_partner_invites', 'true', 'Allow users to invite partners'),
  ('maintenance_mode', 'false', 'Put the application in maintenance mode'),
  ('free_tier_daily_limit', '2', 'Daily session limit for free users'),
  ('premium_tier_daily_limit', '4', 'Daily session limit for premium users'),
  ('trial_duration_days', '14', 'Trial period length in days');
