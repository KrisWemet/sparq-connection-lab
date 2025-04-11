-- Migration to set up partner connection schema using invite codes

-- 1. Create ENUM type for invite status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
    CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
  END IF;
END
$$;

-- 2. Create or Update partner_invites table
CREATE TABLE IF NOT EXISTS public.partner_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who accepted/rejected the invite
  invite_code TEXT NOT NULL UNIQUE,
  status public.invite_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
COMMENT ON COLUMN public.partner_invites.recipient_id IS 'The user ID of the person who accepted or rejected the invitation.';

-- Add comment for clarity
COMMENT ON TABLE public.partner_invites IS 'Stores partner connection invitations using unique codes.';

-- 3. Ensure partner_id column exists in profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'profiles'
                 AND column_name = 'partner_id') THEN
    ALTER TABLE public.profiles ADD COLUMN partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    -- Add a constraint to ensure a user cannot be their own partner
    ALTER TABLE public.profiles ADD CONSTRAINT check_not_own_partner CHECK (id <> partner_id);
    -- Add an index for faster partner lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON public.profiles(partner_id);
    COMMENT ON COLUMN public.profiles.partner_id IS 'Reference to the connected partner''s profile id.';
  END IF;
END $$;

-- 4. Set up RLS policies for partner_invites
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist from previous attempts to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own sent invites" ON public.partner_invites;
DROP POLICY IF EXISTS "Users can create invites" ON public.partner_invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON public.partner_invites;
DROP POLICY IF EXISTS "Users can view invites by code" ON public.partner_invites; -- Remove insecure policy
DROP POLICY IF EXISTS "Allow recipient to view pending invite" ON public.partner_invites; -- Remove if exists

-- Users can view invites they sent
CREATE POLICY "Users can view their own sent invites" ON public.partner_invites
  FOR SELECT USING (auth.uid() = sender_id);
-- Users can view invites where they were the recipient (after action)
CREATE POLICY "Recipients can view their acted-upon invites" ON public.partner_invites
  FOR SELECT USING (auth.uid() = recipient_id);

-- Note: Viewing *pending* invites intended for the current user (before they become the recipient_id)
-- still needs to be handled carefully, likely via a function that checks potential invites
-- without exposing all pending invites. The `accept_invite` function will handle this check.
-- We will handle viewing incoming pending invites via a dedicated function (`get_pending_invites`).

-- Users can create new invites
CREATE POLICY "Users can create invites" ON public.partner_invites
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can cancel (update status to 'rejected'?) invites they sent, if still pending
CREATE POLICY "Senders can cancel pending invites" ON public.partner_invites
  FOR UPDATE USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (status = 'rejected'); -- Or maybe a 'cancelled' status? Let's stick to 'rejected' for now.

-- No policy for general updates by sender after invite is accepted/rejected/expired.
-- No policy for recipients to directly update invites; acceptance/rejection via functions.

-- 5. Set up trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_partner_invites_timestamp ON public.partner_invites;
CREATE TRIGGER set_partner_invites_timestamp
BEFORE UPDATE ON public.partner_invites
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 6. Set up RLS policies for profiles table regarding partner_id
-- Ensure profiles table has RLS enabled (assuming it might already)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing partner-related policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles; -- Recreate below if needed
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; -- Recreate below if needed
DROP POLICY IF EXISTS "Users can view their partner profile" ON public.profiles;

-- Allow users to view their own profile (Standard policy)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (Standard policy)
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow users to view the profile of their connected partner
CREATE POLICY "Users can view their partner profile" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p_self
      WHERE p_self.id = auth.uid() AND p_self.partner_id = public.profiles.id
    )
  );

-- Optional: Index on invite_code for faster lookups during acceptance
CREATE INDEX IF NOT EXISTS idx_partner_invites_invite_code ON public.partner_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_partner_invites_sender_id ON public.partner_invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_partner_invites_status ON public.partner_invites(status);
CREATE INDEX IF NOT EXISTS idx_partner_invites_recipient_id ON public.partner_invites(recipient_id);