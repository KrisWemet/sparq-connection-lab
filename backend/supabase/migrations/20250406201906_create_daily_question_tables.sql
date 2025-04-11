-- Daily Question System Migration for Sparq Connection

-- Enable UUID generation if not already enabled
create extension if not exists "uuid-ossp";

-- CREATE TABLE daily_question_categories moved to 20250401150000_create_daily_questions.sql
-- CREATE TABLE daily_questions moved to 20250401150000_create_daily_questions.sql

create table mini_challenges (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references daily_question_categories(id) on delete cascade not null, -- Added not null
    challenge_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null -- Added not null
);

create table user_daily_question_progress (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null, -- Added not null
    category_id uuid references daily_question_categories(id) on delete cascade not null, -- Added not null
    current_question_position integer default 1 not null, -- Added not null
    current_level text check (current_level in ('Light', 'Medium', 'Deep')) default 'Light' not null, -- Added level tracking
    paused boolean default false not null, -- Added not null
    completed boolean default false not null, -- Added not null
    started_at timestamp with time zone default timezone('utc'::text, now()) not null, -- Added not null
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null, -- Added not null
    unique (user_id, category_id) -- Ensure one progress entry per user/category
);

create table user_daily_question_answers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null, -- Added not null
    question_id uuid references daily_questions(id) on delete cascade not null, -- Added not null
    answer_text text, -- Allow null if user skips? Revisit based on UX.
    answered_at timestamp with time zone default timezone('utc'::text, now()) not null, -- Added not null
    unique (user_id, question_id) -- Ensure one answer per user/question
);

-- Indexes for performance
create index idx_user_progress_user_category on user_daily_question_progress (user_id, category_id);
create index idx_user_answers_user_question on user_daily_question_answers (user_id, question_id);
create index idx_questions_category_level_position on daily_questions (category_id, level, position);

-- Policies: Only allow users to access their own data
alter table user_daily_question_progress enable row level security;
alter table user_daily_question_answers enable row level security;

create policy "Users can view and modify their own progress"
on user_daily_question_progress
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id); -- Added with check

create policy "Users can view and modify their own answers"
on user_daily_question_answers
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id); -- Added with check

-- Allow read access to categories, questions, and challenges for authenticated users
-- RLS enable for daily_question_categories and daily_questions moved to 20250401150000
alter table mini_challenges enable row level security;

-- RLS policies for daily_question_categories and daily_questions moved to 20250401150000

create policy "Allow read access to mini_challenges for authenticated users"
on mini_challenges
for select
using (auth.role() = 'authenticated');