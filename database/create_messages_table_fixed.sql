-- Create messages table for partner communication
CREATE TABLE IF NOT EXISTS public.partner_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_via_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS partner_messages_sender_id_idx ON public.partner_messages(sender_id);
CREATE INDEX IF NOT EXISTS partner_messages_recipient_id_idx ON public.partner_messages(recipient_id);
CREATE INDEX IF NOT EXISTS partner_messages_created_at_idx ON public.partner_messages(created_at);

-- Enable RLS
ALTER TABLE public.partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.partner_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can only create messages they are sending
CREATE POLICY "Users can create their own messages" ON public.partner_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can only update message read status for messages they received
CREATE POLICY "Users can update read status of received messages" ON public.partner_messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Add phone_number to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'profiles' 
                AND column_name = 'phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
  END IF;
END $$; 