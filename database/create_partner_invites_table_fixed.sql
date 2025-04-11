-- Create partner_invites table for tracking connection invitations
CREATE TABLE IF NOT EXISTS public.partner_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_email TEXT,
  invite_code TEXT NOT NULL UNIQUE, -- This is the column that was causing issues
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for partner_invites
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

-- Users can view their own invites (as sender)
CREATE POLICY "Users can view their own sent invites" ON public.partner_invites
  FOR SELECT USING (auth.uid() = sender_id);

-- Users can create new invites
CREATE POLICY "Users can create invites" ON public.partner_invites
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update the invites they created
CREATE POLICY "Users can update their own invites" ON public.partner_invites
  FOR UPDATE USING (auth.uid() = sender_id);

-- Users can view invites by code (for accepting)
-- This policy was the one causing issues because invite_code column was missing
CREATE POLICY "Users can view invites by code" ON public.partner_invites
  FOR SELECT USING (invite_code IS NOT NULL);

-- Add column to profiles table for partner connection if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'partner_id') THEN
    ALTER TABLE public.profiles ADD COLUMN partner_id UUID REFERENCES auth.users(id);
  END IF;
END $$; 