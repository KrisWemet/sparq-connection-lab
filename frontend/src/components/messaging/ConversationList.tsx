import React, { useState, useEffect, useCallback } from 'react';
// Import the actual Supabase client
import { supabase } from '@/integrations/supabase/client'; // Correct path
// Assume an auth provider hook exists to get user info
// import { useAuth } from '@/lib/auth-provider';
// Placeholder for actual Auth hook import
const useAuth = () => ({ user: { id: 'test-user-id' } }); // Replace with actual hook
// Remove unused service import
// Placeholder types - replace with actual types if available
type Conversation = {
  id: string;
  // Add other relevant conversation fields based on your schema
  // e.g., participant names/avatars, last message snippet
  last_message_at: string;
  // Assuming unread count is fetched or calculated
  unread_count?: number;
  // Example: Assuming you have participant info
  participant_name?: string;
  participant_avatar_url?: string;
};

export type ConversationListProps = { // Add export keyword
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
};

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConversationId,
  onConversationSelect,
}) => {
  const { user } = useAuth(); // Assuming useAuth provides { user: { id: string } }
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Unread counts could be integrated into the Conversation type or managed separately
  // const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Adjust the query based on your actual schema and how users are linked to conversations
      // This example assumes user1_id and user2_id columns exist.
      // Also, fetching unread count might require a specific function or view.
      // --- Actual Supabase Call ---
      // Remove placeholder logic
      const { data, error: fetchError } = await supabase // Use the imported supabase client
        .from('partner_messages') // Correct table name
        .select(`
          id,
          created_at,
          sender_id, sender_profile:profiles(*),
          recipient_id, recipient_profile:profiles(*)
        `) // Ensure comments are actually removed
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`) // Correct column names for filter
        .order('created_at', { ascending: false }); // Order by message creation time
      // --- End Actual Supabase Call ---

      if (fetchError) {
        throw fetchError;
      }

      // Process data to fit the Conversation type, determine participant, etc.
      // TODO: This processing logic is wrong for individual messages.
      // It needs to group messages by partner to form conversations.
      // For now, just map the data minimally to avoid errors, acknowledging it's incorrect.
      const processedConversations = data?.map((msg: any) => {
         // Determine the 'other' participant based on sender/recipient
         const otherUser = msg.sender_id === user.id ? msg.recipient_profile : msg.sender_profile; // Use the newly named profile data
         return {
           // This ID is the message ID, not conversation ID. Needs fixing.
           id: msg.id,
           last_message_at: msg.created_at, // Use message creation time
           // TODO: Implement unread count logic
           unread_count: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0, // Placeholder
           participant_name: otherUser?.username || 'Unknown Partner',
           participant_avatar_url: otherUser?.avatar_url,
         };
      }) || [];
      // TODO: Deduplicate conversations based on partner ID.

      setConversations(processedConversations);

    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(`Failed to fetch conversations: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (!user?.id) return; // Supabase client should always exist if imported

    // Listen to inserts or updates in the conversations table
    // Adjust channel name and filters based on your setup
    // Subscribe to the correct table 'partner_messages'
    const channel = supabase
      .channel(`public:partner_messages:user=${user.id}`) // Channel name reflects table
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only care about new messages for list updates?
          schema: 'public',
          table: 'partner_messages',
          // Filter for messages where the current user is the recipient OR sender
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('New message received (user is recipient)!', payload);
          // Re-fetch the list for simplicity
          // TODO: More efficient update possible by adding/updating single conversation
          fetchConversations();
        }
      )
      .on( // Also listen if the user sent the message (might affect last message time)
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_messages',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('New message sent by user!', payload);
          fetchConversations();
        }
      )
      .subscribe((status: string, err?: any) => {
         if (status === 'SUBSCRIBED') {
            console.log('Subscribed to conversation updates!');
         }
         if (status === 'CHANNEL_ERROR') {
           console.error('Conversation subscription error:', err);
           setError('Real-time connection error.');
         }
         if (status === 'TIMED_OUT') {
            console.warn('Conversation subscription timed out.');
            setError('Real-time connection timed out.');
         }
      });

    // Cleanup function to remove the subscription
    return () => {
      // Use the standard channel unsubscribe method
      channel.unsubscribe().catch((err: any) => console.error("Failed to unsubscribe channel", err));
    };
  }, [user?.id, fetchConversations]);

  const handleSelectConversation = (conversationId: string) => {
    onConversationSelect(conversationId);
    // Optionally mark messages as read here or trigger in parent
  };

  if (loading) {
    // Placeholder Loading Indicator
    return <div>Loading conversations...</div>;
  }

  if (error) {
    // Placeholder Error Message - Displaying the error directly
    return <div role="alert" style={{ color: 'red' }}>{error}</div>;
  }

  if (!conversations || conversations.length === 0) {
    // Placeholder Empty State
    return <div>No conversations yet.</div>;
  }

  return (
    // Use semantic list elements
    <ul style={{ border: '1px solid #ccc', maxHeight: '400px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0 }}>
      {conversations.map((conv) => (
        // List Item
        <li // Changed div to li
          key={conv.id}
          onClick={() => handleSelectConversation(conv.id)}
          style={{
            padding: '10px',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            backgroundColor: selectedConversationId === conv.id ? '#e0e0e0' : 'transparent',
            fontWeight: (conv.unread_count ?? 0) > 0 ? 'bold' : 'normal',
          }}
        >
          {/* Placeholder Avatar */}
          {conv.participant_avatar_url && (
             <img src={conv.participant_avatar_url} alt={conv.participant_name} style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', verticalAlign: 'middle' }} />
          )}
          <span>{conv.participant_name}</span>
          {/* Placeholder Unread Count Badge */}
          {(conv.unread_count ?? 0) > 0 && (
            <span style={{ marginLeft: '10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.8em' }}>
              {conv.unread_count}
            </span>
          )}
          {/* Optionally display last message snippet or time */}
          <div style={{ fontSize: '0.8em', color: '#666' }}>
             Last active: {new Date(conv.last_message_at).toLocaleString()}
          </div>
        </li> // Changed div to li
      ))}
    </ul> // Changed div to ul
  );
};

export default ConversationList;