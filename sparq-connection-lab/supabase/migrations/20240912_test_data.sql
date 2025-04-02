-- This script adds test data for the messaging feature
-- Replace 'YOUR_USER_ID' with your actual user ID from Supabase auth
-- Replace 'PARTNER_USER_ID' with another user ID for testing

-- Variables (replace these with actual UUIDs)
DO $$
DECLARE
    user_id UUID := 81e1110a-0075-4674-b600-d7480fb455a3; -- Replace with your user ID
    partner_id UUID := 'PARTNER_USER_ID'; -- Replace with partner user ID
    conversation_id UUID;
BEGIN
    -- Create a test conversation
    INSERT INTO public.conversations (participant_ids)
    VALUES (ARRAY[user_id, partner_id])
    RETURNING id INTO conversation_id;
    
    -- Add some test messages
    INSERT INTO public.messages (conversation_id, sender_id, receiver_id, content, read, created_at)
    VALUES
        (conversation_id, user_id, partner_id, 'Hey there! How are you doing?', true, now() - interval '2 days'),
        (conversation_id, partner_id, user_id, 'I''m doing great! Thanks for asking. How about you?', true, now() - interval '2 days' + interval '5 minutes'),
        (conversation_id, user_id, partner_id, 'Pretty good! Just working on this new project.', true, now() - interval '2 days' + interval '10 minutes'),
        (conversation_id, partner_id, user_id, 'That sounds interesting! What kind of project is it?', true, now() - interval '1 day'),
        (conversation_id, user_id, partner_id, 'It''s a real-time messaging app using Supabase!', true, now() - interval '1 day' + interval '5 minutes'),
        (conversation_id, partner_id, user_id, 'That sounds awesome! I''d love to see it when it''s ready.', false, now() - interval '5 hours');
END $$; 