-- Peter Memories: stores key moments Peter should remember across sessions
-- These are extracted from conversations and referenced naturally later.

create table if not exists peter_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- What Peter remembers
  memory_text text not null,
  -- Why it matters (for prompt injection into Peter's context)
  context text,
  -- Category helps Peter retrieve relevant memories
  category text not null default 'general'
    check (category in (
      'struggle',      -- something the user finds hard
      'win',           -- something the user did well
      'partner_detail', -- something about the partner
      'preference',    -- user's preference or style
      'milestone',     -- a relationship milestone
      'general'        -- catch-all
    )),
  -- Emotional weight (higher = more important to reference)
  salience integer not null default 5
    check (salience between 1 and 10),
  -- Source tracking
  source_type text not null default 'conversation'
    check (source_type in ('conversation', 'onboarding', 'daily_growth', 'reflection')),
  source_day integer,  -- which day of daily growth, if applicable
  -- Timestamps
  created_at timestamptz not null default now(),
  last_referenced_at timestamptz,
  -- Soft delete
  archived boolean not null default false
);

-- Index for efficient retrieval by user
create index if not exists idx_peter_memories_user
  on peter_memories(user_id, archived, salience desc);

-- Index for category-based lookups
create index if not exists idx_peter_memories_category
  on peter_memories(user_id, category, archived);

-- RLS
alter table peter_memories enable row level security;

create policy "Users can read their own memories"
  on peter_memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on peter_memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on peter_memories for update
  using (auth.uid() = user_id);


-- Proactive check-ins: tracks when Peter last nudged so he doesn't repeat
create table if not exists peter_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_type text not null
    check (checkin_type in (
      'morning_nudge',
      'evening_reminder',
      'streak_at_risk',
      'comeback',
      'milestone_celebration',
      'weekly_reflection'
    )),
  message text not null,
  day integer,
  delivered_at timestamptz not null default now(),
  dismissed_at timestamptz,
  acted_on boolean not null default false
);

create index if not exists idx_peter_checkins_user
  on peter_checkins(user_id, checkin_type, delivered_at desc);

alter table peter_checkins enable row level security;

create policy "Users can read their own checkins"
  on peter_checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert their own checkins"
  on peter_checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own checkins"
  on peter_checkins for update
  using (auth.uid() = user_id);
