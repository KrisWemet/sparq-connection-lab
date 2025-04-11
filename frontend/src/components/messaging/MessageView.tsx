import React, { useState, useEffect, useCallback, useRef } from 'react';
// Assume supabase client is configured and exported from this path
// import { supabase } from '@/lib/supabaseClient';
// Placeholder for actual Supabase client import
const supabase = {} as any;
// Assume an auth provider hook exists to get user info
// import { useAuth } from '@/lib/auth-provider';
// Placeholder for actual Auth hook import
const useAuth = () => ({ user: { id: 'test-user-id' } }); // Replace with actual hook

// Placeholder types - replace with actual types if available
type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { // Optional: Include sender profile info
    id: string;
    username?: string;
    avatar_url?: string;
  };
};

type MessageViewProps = {
  conversationId: string | null; // Can be null if no conversation is selected
};

const PAGE_SIZE = 20; // Number of messages to fetch per page

const MessageView: React.FC<MessageViewProps> = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null); // Store Supabase subscription
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const messageListRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  const fetchMessages = useCallback(async (page = 1, isInitialLoad = false) => {
    if (!conversationId) {
        setMessages([]);
        setHasMoreMessages(false);
        return;
    };

    if (isInitialLoad) {
      setLoadingInitial(true);
      setError(null);
      setMessages([]); // Reset messages on initial load for a new conversation
      setCurrentPage(1);
      setHasMoreMessages(true); // Assume there might be messages initially
    } else {
      setLoadingMore(true);
    }

    const offset = (page - 1) * PAGE_SIZE;

    try {
      // --- Placeholder Supabase Call ---
      console.log(`Fetching messages for conversation ${conversationId}, page ${page}`);
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
      const mockMessages: Message[] = [];
      if (page < 3 && conversationId) { // Simulate having 2 pages of older messages
          for (let i = 0; i < PAGE_SIZE; i++) {
              const timestamp = new Date(Date.now() - (page * 3600000) - (i * 60000)).toISOString();
              const senderId = Math.random() > 0.5 ? 'test-user-id' : 'partner-id';
              mockMessages.push({
                  id: `msg-${conversationId}-${page}-${i}`,
                  conversation_id: conversationId,
                  sender_id: senderId,
                  content: `Message ${i} from page ${page} in ${conversationId}`,
                  created_at: timestamp,
                  sender: { id: senderId, username: senderId === 'test-user-id' ? 'Me' : 'Partner' }
              });
          }
      }
      const data = mockMessages.reverse(); // Simulate fetching newest first
      const fetchError = null;
      // --- End Placeholder Supabase Call ---
      /*
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          sender:profiles ( id, username, avatar_url )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }) // Fetch newest first
        .range(offset, offset + PAGE_SIZE - 1);
      */

      if (fetchError) {
        throw fetchError;
      }

      const fetchedMessages = data || [];
      // Reverse messages because we fetch newest first for pagination, but display oldest first
      const reversedMessages = [...fetchedMessages].reverse();

      setMessages((prevMessages) =>
        page === 1 ? reversedMessages : [...reversedMessages, ...prevMessages] // Prepend older messages
      );
      setCurrentPage(page);
      setHasMoreMessages(fetchedMessages.length === PAGE_SIZE);

    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(`Failed to fetch messages: ${err.message || 'Unknown error'}`);
      setHasMoreMessages(false); // Stop trying to load more on error
    } finally {
      if (isInitialLoad) {
        setLoadingInitial(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [conversationId]);

  // Initial fetch and refetch when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(1, true); // Initial load for the selected conversation
    } else {
      // Clear state if no conversation is selected
      setMessages([]);
      setError(null);
      setLoadingInitial(false);
      setLoadingMore(false);
      setCurrentPage(1);
      setHasMoreMessages(false);
    }
  }, [conversationId, fetchMessages]);


  // Scroll to bottom when new messages are added (or initially loaded)
  useEffect(() => {
    // Scroll down when initial messages load or a new message arrives
    if (messageListRef.current && !loadingMore) {
        const element = messageListRef.current;
        // Scroll down only if the user isn't scrolled up significantly
        // (e.g., within 200px of the bottom)
        const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 200;
        if (isScrolledToBottom) {
             element.scrollTop = element.scrollHeight;
        }
    }
  }, [messages, loadingInitial, loadingMore]); // Rerun when messages change or initial load finishes


  // Real-time subscription for new messages
  useEffect(() => {
    // Ensure cleanup happens if the effect re-runs before subscription is established
    if (subscription && supabase.removeChannel) {
        supabase.removeChannel(subscription).catch((err: any) => console.error("Failed to remove previous channel", err));
        setSubscription(null);
    } else if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe().catch((err: any) => console.error("Failed to unsubscribe previous channel", err));
        setSubscription(null);
    }


    if (!conversationId || !supabase.channel) {
      return;
    }

    const newSubscription = supabase
      .channel(`public:messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          console.log('New message received!', payload);
          // TODO: Fetch sender profile if not included in payload, or adjust select query
          const newMessage = payload.new as Message;
          // Add sender info if missing (placeholder)
          if (!newMessage.sender) {
              newMessage.sender = { id: newMessage.sender_id, username: newMessage.sender_id === user.id ? 'Me' : 'Partner' };
          }
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe((status: string, err?: any) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to new messages for ${conversationId}!`);
        }
         if (status === 'CHANNEL_ERROR') {
           console.error('Message subscription error:', err);
           setError('Real-time connection error for messages.');
         }
         if (status === 'TIMED_OUT') {
            console.warn('Message subscription timed out.');
            setError('Real-time message connection timed out.');
         }
      });

    setSubscription(newSubscription);

    // Cleanup function
    return () => {
      if (newSubscription && supabase.removeChannel) {
        supabase.removeChannel(newSubscription).catch((err: any) => console.error("Failed to remove channel", err));
      } else if (newSubscription && newSubscription.unsubscribe) {
         newSubscription.unsubscribe().catch((err: any) => console.error("Failed to unsubscribe channel", err));
      }
    };
  }, [conversationId, user?.id]); // Re-subscribe when conversationId changes

  const loadMoreMessages = () => {
    if (!loadingMore && hasMoreMessages) {
      // Store current scroll height before loading more
      const currentScrollHeight = messageListRef.current?.scrollHeight || 0;
      fetchMessages(currentPage + 1).then(() => {
          // Restore scroll position after messages are prepended
          if (messageListRef.current) {
              const newScrollHeight = messageListRef.current.scrollHeight;
              messageListRef.current.scrollTop += (newScrollHeight - currentScrollHeight);
          }
      });
    }
  };

  if (!conversationId) {
      return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Select a conversation to view messages.</div>;
  }

  if (loadingInitial) {
    // Placeholder Loading Indicator
    return <div>Loading messages...</div>;
  }

  if (error && messages.length === 0) { // Show error prominently if initial load failed
    // Placeholder Error Message
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    // Placeholder Message List Container
    <div style={{ border: '1px solid #ccc', height: '500px', display: 'flex', flexDirection: 'column' }}>
       {error && <div style={{ color: 'red', padding: '5px', textAlign: 'center', background: '#ffe0e0' }}>Error: {error}</div>}
       <div ref={messageListRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {/* Load More Button/Indicator */}
        {hasMoreMessages && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <button onClick={loadMoreMessages} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load Older Messages'}
            </button>
          </div>
        )}
        {!hasMoreMessages && messages.length > 0 && (
             <div style={{ textAlign: 'center', color: '#999', fontSize: '0.9em', marginBottom: '10px' }}>Beginning of conversation</div>
        )}

        {/* Message List */}
        {messages.length === 0 && !loadingInitial && !error && (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg) => {
          const isOwnMessage = msg.sender_id === user?.id;
          return (
            // Placeholder Message Item
            <div
              key={msg.id}
              style={{
                marginBottom: '10px',
                textAlign: isOwnMessage ? 'right' : 'left',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  backgroundColor: isOwnMessage ? '#dcf8c6' : '#f0f0f0',
                  maxWidth: '70%',
                  wordWrap: 'break-word', // Ensure long words break
                }}
              >
                {/* Optionally show sender name for group chats or first message */}
                {!isOwnMessage && msg.sender?.username && (
                    <div style={{ fontSize: '0.8em', fontWeight: 'bold', marginBottom: '3px', color: '#555' }}>
                        {msg.sender.username}
                    </div>
                )}
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.75em', color: '#888', marginTop: '4px', textAlign: 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageView;