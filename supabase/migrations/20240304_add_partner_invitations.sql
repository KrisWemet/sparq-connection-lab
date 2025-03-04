-- Create partner_invitations table
create table public.partner_invitations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  inviter_id uuid references auth.users(id) on delete cascade not null,
  partner_email text not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'expired')) not null default 'pending',
  invitation_code text unique not null,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null
);

-- Add RLS policies
alter table public.partner_invitations enable row level security;

create policy "Users can view their own invitations"
  on public.partner_invitations for select
  using (auth.uid() = inviter_id);

create policy "Users can create invitations"
  on public.partner_invitations for insert
  with check (auth.uid() = inviter_id);

create policy "Users can update their own invitations"
  on public.partner_invitations for update
  using (auth.uid() = inviter_id);

-- Add partner_id to profiles table
alter table public.profiles add column partner_id uuid references auth.users(id) on delete set null;

-- Create function to check if users are partners
create or replace function public.are_users_partners(user_id_1 uuid, user_id_2 uuid)
returns boolean
language plpgsql security definer
as $$
begin
  return exists (
    select 1 from profiles
    where 
      (id = user_id_1 and partner_id = user_id_2) or
      (id = user_id_2 and partner_id = user_id_1)
  );
end;
$$; 