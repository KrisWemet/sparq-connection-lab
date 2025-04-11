-- Create daily_question_categories and daily_questions tables
-- Moved here from 20250406201906 to resolve dependency issues

-- Enable UUID generation if not already enabled
create extension if not exists "uuid-ossp";

create table daily_question_categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique, -- Added unique constraint
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null -- Added not null
);

-- Insert initial categories
INSERT INTO public.daily_question_categories (id, name, description)
VALUES 
  ('2cbdeb46-9c77-404f-b175-5e7d51e5e29d', 'Adventure & Fun', 'Explore spontaneity, joy, and shared experiences.'),
  ('3d5281a1-7183-437e-8ba7-72ad99b75d16', 'Appreciation & Gratitude', 'Focus on thankfulness and recognizing the good in each other.')
ON CONFLICT (name) DO NOTHING; -- Avoid errors if run multiple times, just keep existing


create table daily_questions (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid references daily_question_categories(id) on delete cascade not null, -- Added not null
    level text check (level in ('Light', 'Medium', 'Deep')) not null,
    question_text text not null,
    position integer not null, -- Ensure uniqueness per category/level
    created_at timestamp with time zone default timezone('utc'::text, now()) not null, -- Added not null
    unique (category_id, level, position) -- Added unique constraint
);

-- Apply basic RLS policies needed early on
alter table daily_question_categories enable row level security;
alter table daily_questions enable row level security;

create policy "Allow read access to categories for authenticated users"
on daily_question_categories
for select
using (auth.role() = 'authenticated');

create policy "Allow read access to questions for authenticated users"
on daily_questions
for select
using (auth.role() = 'authenticated');