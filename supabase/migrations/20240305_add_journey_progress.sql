-- Create journey_progress table
create table public.journey_progress (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  journey_id text not null,
  day integer not null,
  completed boolean default false,
  responses jsonb default '{}'::jsonb,
  completed_at timestamp with time zone
);

-- Add indexes
create index journey_progress_user_journey_idx on public.journey_progress(user_id, journey_id);
create index journey_progress_completed_idx on public.journey_progress(completed);

-- Add RLS policies
alter table public.journey_progress enable row level security;

create policy "Users can view their own journey progress"
  on public.journey_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journey progress"
  on public.journey_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journey progress"
  on public.journey_progress for update
  using (auth.uid() = user_id);

-- Add function to check journey completion
create or replace function public.is_journey_completed(
  p_user_id uuid,
  p_journey_id text
) returns boolean
language plpgsql security definer
as $$
begin
  return exists (
    select 1
    from journey_progress
    where user_id = p_user_id
    and journey_id = p_journey_id
    and completed = true
    and day = (
      select count(distinct day)
      from journey_progress
      where journey_id = p_journey_id
      and user_id = p_user_id
    )
  );
end;
$$; 