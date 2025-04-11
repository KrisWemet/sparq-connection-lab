# specs/ui_logic.pseudo.md

## Core UI Logic (`Messages.tsx` & `Messaging.tsx`)

Pseudocode for the main React components handling conversation list display and individual message views. Assumes usage of React hooks and state management (e.g., Zustand, Redux, or Context API) for `ConversationStore` and `MessageStore`.

### Module: `Messages.tsx` (Conversation List View)

**Purpose:** Displays the list of user's conversations, ordered by recent activity. Allows navigation to individual conversations.

**Dependencies:**
*   `React` / `React Hooks` (useState, useEffect)
*   `ConversationStore` (Provides the list of conversations and updates)
*   `RealtimeManager` (To ensure subscriptions are active - though direct interaction might be minimal if store handles it)
*   `NavigationService` (e.g., `react-router-dom` `useNavigate`)
*   `UI Components` (List, ListItem, Avatar, Badge for unread count)
*   `CurrentUserProvider`

**State:**
*   `conversations`: Array of conversation objects (obtained from `ConversationStore`).
*   `isLoading`: Boolean indicating initial load state.
*   `error`: String or object for displaying errors.

```pseudocode
COMPONENT Messages():
  // --- Hooks ---
  currentUser = useCurrentUser() // Assume provides { id, ... }
  // Subscribe to relevant parts of the ConversationStore state
  conversations = useConversationStore(state => state.conversations)
  fetchConversations = useConversationStore(state => state.fetchInitialConversations)
  isLoading = useConversationStore(state => state.isLoading)
  error = useConversationStore(state => state.error)
  navigate = useNavigate() // From react-router or similar

  // --- Effects ---
  // Fetch initial conversations on component mount if not already loaded
  useEffect(() => {
    // TDD: Test initial fetch is triggered on mount
    // TDD: Test fetch is skipped if conversations already exist in store and not loading
    IF conversations.length == 0 AND NOT isLoading THEN
      LOG "Messages.tsx: Fetching initial conversations..."
      fetchConversations(currentUser.id) // Action in ConversationStore
        .catch(err => {
          ERROR "Failed to fetch initial conversations:", err
          // Error state is likely set within the store action, UI will react via `error` state variable
        })
    ENDIF

    // Ensure Realtime subscription for conversation list is active
    // This might be handled globally after login, but calling it here ensures it's active
    // The RealtimeManager should make this call idempotent (won't create duplicate subscriptions)
    // TDD: Test that conversation list subscription is implicitly active via RealtimeManager
    RealtimeManager.subscribeToConversationListUpdates(currentUser.id)

    // No cleanup needed here if subscription is managed globally or persists across navigation
  }, [currentUser.id, fetchConversations, conversations.length, isLoading]) // Dependencies for effect

  // --- Event Handlers ---
  FUNCTION handleConversationClick(conversationId):
    // TDD: Test navigation to correct messaging route (e.g., /messaging/uuid-...)
    LOG "Navigating to conversation:", conversationId
    navigate(`/messaging/${conversationId}`)
  ENDFUNCTION

  // --- Rendering ---
  // TDD: Test loading state rendering (e.g., shows spinner)
  IF isLoading AND conversations.length == 0 THEN
    RETURN <LoadingSpinner />
  ENDIF

  // TDD: Test error state rendering (e.g., shows error message)
  IF error THEN
    RETURN <ErrorMessage message={error.message || "Failed to load conversations"} />
  ENDIF

  // TDD: Test empty state rendering (e.g., shows "No conversations")
  IF conversations.length == 0 THEN
    RETURN <EmptyState message="No conversations yet. Start a new chat!" />
  ENDIF

  // TDD: Test rendering list of conversations
  // TDD: Test correct display of participant names/avatars
  // TDD: Test correct display of last message snippet (requires fetching related message or storing denormalized data in convo object)
  // TDD: Test correct display of unread count badge for the current user
  // TDD: Test conversations are ordered correctly (e.g., by updated_at DESC)
  RETURN (
    <ConversationListView>
      {/* Assuming `conversations` from store is already sorted */}
      FOR EACH conversation IN conversations:
        // Determine partner info, unread count for current user, last message snippet
        // These helpers might need access to profile data or message data
        partner = getPartnerInfo(conversation, currentUser.id) // Needs implementation
        unreadCount = getUnreadCountForUser(conversation, currentUser.id) // Needs implementation
        lastMessageSnippet = getLastMessageSnippet(conversation) // Needs implementation (potentially complex)

        <ConversationListItem
          key={conversation.id}
          onClick={() => handleConversationClick(conversation.id)}
          isActive={false} // Or highlight if it's the currently viewed one (needs state)
        >
          <Avatar src={partner?.avatarUrl || defaultAvatar} />
          <Content>
            <Name>{partner?.displayName || "Unknown User"}</Name>
            <Snippet>{lastMessageSnippet || "..."}</Snippet>
          </Content>
          {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
        </ConversationListItem>
      ENDFOR
    </ConversationListView>
  )

ENDCOMPONENT

// --- Helper functions (could be part of the component or preferably in utils/selectors) ---
FUNCTION getPartnerInfo(conversation, currentUserId):
  // Logic to identify the other participant (participant_a or participant_b)
  // May need to fetch profile details based on the partner's ID if not included in conversation object
  // RETURN { id, displayName, avatarUrl } or null
FUNCTION getUnreadCountForUser(conversation, currentUserId):
  IF conversation.participant_a == currentUserId THEN RETURN conversation.unread_count_a
  IF conversation.participant_b == currentUserId THEN RETURN conversation.unread_count_b
  RETURN 0
FUNCTION getLastMessageSnippet(conversation):
  // Logic to get/format the latest message preview
  // Option 1: Store `last_message_preview` (plaintext, truncated) directly on conversation table (denormalized) - Requires trigger/update logic
  // Option 2: Store `last_message_id` on conversation, fetch the message separately (can be slow)
  // Option 3: Store `last_message_encrypted_content` and `last_message_sender_id` - Decrypt on client (complex, requires session)
  // Simplest for now: Assume it's available or return placeholder
  RETURN conversation.last_message_preview || "No messages yet"

// --- ConversationStore (Conceptual Actions & State Structure) ---
STORE ConversationStore:
  state: {
    conversations: [], // Array of conversation objects, sorted by updated_at DESC
    isLoading: false,
    error: null // Can store Error object or message string
  }
  actions: {
    fetchInitialConversations: async (userId) => {
      // Sets state.isLoading = true, state.error = null
      // Calls SupabaseClient.from('conversations').select(...).or(`participant_a.eq.${userId},participant_b.eq.${userId}`).order('updated_at', { ascending: false })
      // On success: Sets state.conversations = fetchedData, state.isLoading = false
      // On failure: Sets state.error = error, state.isLoading = false
      // TDD: Test store action for successful fetch and correct sorting
      // TDD: Test store action for fetch failure and error state update
    },
    addOrUpdateConversation: (conversation) => {
      // Finds existing conversation by ID or adds new one
      // Updates state.conversations array, ensuring it remains sorted by updated_at DESC
      // TDD: Test store action for adding a new conversation correctly
      // TDD: Test store action for updating an existing conversation and maintaining sort order
    },
    removeConversation: (conversationId) => {
      // Filters out the conversation with the given ID from state.conversations
      // TDD: Test store action for removing a conversation correctly
    },
    getConversationById: (conversationId) => {
        // Selector function to find a conversation in the current state
        RETURN state.conversations.find(c => c.id === conversationId)
    }
  }
ENDSTORE
```

---

### Module: `Messaging.tsx` (Individual Conversation View)

**Purpose:** Displays messages for a specific conversation. Allows sending new messages and loads message history.

**Dependencies:**
*   `React` / `React Hooks` (useState, useEffect, useRef)
*   `MessageStore` (Provides messages for the current conversation)
*   `ConversationStore` (To get conversation details like participant IDs)
*   `RealtimeManager` (To subscribe/unsubscribe from new messages for this conversation)
*   `MessageEncryptorDecryptor` (To encrypt outgoing messages)
*   `SupabaseClient` (To insert new messages)
*   `NavigationService` / `RouteParams` (To get `conversationId` from URL)
*   `UI Components` (MessageList, MessageBubble, TextInput, SendButton, Headers, Loaders)
*   `CurrentUserProvider`
*   `KeyManager` (To ensure E2EE session is ready before sending)
*   `StatusUpdateManager` (To handle sending/receiving message status updates like 'Read')
*   `Utils` (generateTemporaryUUID, scrollToBottom, setupIntersectionObserver, findUnreadVisibleMessages)

**State:**
*   `conversationId`: String (from route params).
*   `messages`: Array of message objects for the current conversation (from `MessageStore`).
*   `conversationDetails`: Object containing participant info (from `ConversationStore`).
*   `isLoading`: Boolean for initial message load (from `MessageStore`).
*   `isLoadingMore`: Boolean for pagination load (from `MessageStore`).
*   `error`: String or object for errors (from `MessageStore`).
*   `inputText`: String for the message input field.
*   `isSending`: Boolean to disable input/button while sending.

```pseudocode
COMPONENT Messaging():
  // --- Hooks ---
  currentUser = useCurrentUser()
  routeParams = useParams() // From react-router or similar
  conversationId = routeParams.conversationId

  // Get conversation details (needed for recipient ID)
  conversationDetails = useConversationStore(state => state.getConversationById(conversationId))
  // Get messages and loading states for this specific conversation from MessageStore
  messages = useMessageStore(state => state.messages[conversationId] || [])
  fetchMessages = useMessageStore(state => state.fetchInitialMessages)
  fetchMoreMessages = useMessageStore(state => state.fetchMoreMessages)
  addOptimisticMessage = useMessageStore(state => state.addOrUpdateMessage) // For optimistic UI
  updateMessageStatusInStore = useMessageStore(state => state.updateMessageStatus) // For local status updates
  replaceOptimistic = useMessageStore(state => state.replaceOptimisticMessage)
  isLoading = useMessageStore(state => state.isLoading[conversationId] ?? true) // Default to true initially
  isLoadingMore = useMessageStore(state => state.isLoadingMore[conversationId] ?? false)
  error = useMessageStore(state => state.error[conversationId] ?? null)

  messageListRef = useRef() // For scrolling control and observer attachment

  [inputText, setInputText] = useState('')
  [isSending, setIsSending] = useState(false)

  // --- Effects ---
  // Subscribe to new messages and fetch initial batch on mount
  useEffect(() => {
    // TDD: Test initial message fetch is triggered on mount for the correct conversationId
    LOG "Messaging.tsx: Mounting for conversation:", conversationId
    fetchMessages(conversationId) // Action in MessageStore
      .catch(err => ERROR "Failed initial message fetch:", err) // Store should handle error state

    // TDD: Test subscription to new messages is established on mount
    RealtimeManager.subscribeToNewMessages(conversationId) // Idempotent call in RealtimeManager

    // Cleanup on unmount
    RETURN () => {
      LOG "Messaging.tsx: Unmounting, unsubscribing from conversation:", conversationId
      // TDD: Test unsubscription occurs on component unmount
      RealtimeManager.unsubscribeFromConversationMessages(conversationId)
      // Optional: Clear messages for this convo from store if memory is a concern and state isn't persisted
      // useMessageStore.getState().clearMessagesForConversation(conversationId)
    }
  }, [conversationId, fetchMessages]) // Re-run if conversationId changes

  // Scroll to bottom when new messages arrive or initially loaded
  useEffect(() => {
    // TDD: Test that the view scrolls to the bottom when the messages array length increases
    IF NOT isLoadingMore THEN // Avoid scrolling up when loading more at the top
        scrollToBottom(messageListRef) // Utility function scrolls the referenced element
    ENDIF
  }, [messages.length, isLoadingMore]) // Dependency on message count and loading state

  // Mark messages as read when they become visible using IntersectionObserver
  useEffect(() => {
    // TDD: Test that incoming messages are marked as 'Read' when they become visible in the viewport
    // TDD: Test that only messages not sent by the current user are marked as 'Read'
    // TDD: Test that 'Read' status updates are sent via StatusUpdateManager
    observer = setupIntersectionObserver(messageListRef.current, (visibleMessageIds) => {
      // Find messages in the local 'messages' state that are visible and need marking as read
      messagesToMarkRead = findUnreadVisibleMessages(messages, visibleMessageIds, currentUser.id)

      IF messagesToMarkRead.length > 0 THEN
        LOG "Marking messages as read:", messagesToMarkRead.map(m => m.id)
        // Update status locally first for immediate UI feedback
        updateMessageStatusInStore(conversationId, messagesToMarkRead.map(m => m.id), 'Read')
        // Send 'Read' status update to partner(s) via the dedicated manager
        StatusUpdateManager.sendBulkStatusUpdate(messagesToMarkRead.map(m => m.id), 'Read')
      ENDIF
    })
    // Disconnect observer on cleanup
    RETURN () => {
        IF observer THEN observer.disconnect()
    }
  }, [messages, conversationId, currentUser.id, updateMessageStatusInStore]) // Re-run if messages array changes


  // --- Event Handlers ---
  FUNCTION handleInputChange(event):
    setInputText(event.target.value)
  ENDFUNCTION

  FUNCTION handleSendMessage():
    // TDD: Test sending a valid text message successfully
    // TDD: Test attempting to send an empty or whitespace-only message (should be prevented)
    // TDD: Test UI state changes during sending (input disabled, sending indicator shown)
    // TDD: Test optimistic update: message appears immediately with 'Sending' status
    // TDD: Test handling of encryption failure (message status changes to 'Failed')
    // TDD: Test handling of Supabase insert failure (message status changes to 'Failed')
    // TDD: Test successful send: message status changes to 'Sent' and ID is updated
    trimmedText = inputText.trim()
    IF trimmedText == '' OR isSending OR conversationDetails IS NULL THEN
      LOG "Send prevented: Empty input, already sending, or missing conversation details."
      RETURN
    ENDIF

    LOG "Attempting to send message:", trimmedText
    setIsSending(true)
    currentUserId = currentUser.id
    partnerUserId = (conversationDetails.participant_a == currentUserId) ? conversationDetails.participant_b : conversationDetails.participant_a

    // 1. Optimistic UI Update
    optimisticId = generateTemporaryUUID() // Utility function
    optimisticMessage = {
      id: optimisticId, // Temporary ID
      conversation_id: conversationId,
      sender_id: currentUserId,
      recipient_id: partnerUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_type: 'TEXT',
      encrypted_content: null, // Not encrypted yet
      decryptedContent: trimmedText, // Show plaintext optimistically
      status: 'Sending', // Initial status
      signal_message_type: null,
      isOptimistic: true // Flag for potential replacement later
    }
    addOptimisticMessage(conversationId, optimisticMessage) // Add to store
    setInputText('') // Clear input field
    scrollToBottom(messageListRef) // Scroll after adding

    // --- Asynchronous sending process ---
    TRY
      // 2. Ensure E2EE session is ready with partner
      sessionStatus = AWAIT KeyManager.establishSession(partnerUserId) // Idempotent check/setup
      IF sessionStatus IS FAILURE THEN
        THROW new Error("Failed to establish session with partner.")
      ENDIF

      // 3. Encrypt Message using MessageEncryptorDecryptor
      encryptionResult = AWAIT MessageEncryptorDecryptor.encryptTextMessage(partnerUserId, trimmedText)
      IF encryptionResult IS FAILURE THEN
        THROW new Error("Encryption failed.")
      ENDIF

      // 4. Prepare Payload and Insert into Supabase 'messages' table
      messagePayload = {
        // Let DB generate 'id', 'created_at', 'updated_at'
        conversation_id: conversationId,
        sender_id: currentUserId,
        recipient_id: partnerUserId,
        message_type: 'TEXT',
        encrypted_content: encryptionResult.ciphertext, // Base64 string from encryption result
        signal_message_type: encryptionResult.signal_message_type, // 1 or 3 from encryption result
        status: 'Sent' // Mark as 'Sent' as it's being sent to DB
      }

      { data: insertedMessage, error: insertError } = AWAIT SupabaseClient
        .from('messages')
        .insert(messagePayload)
        .select() // Select the inserted row to get the real ID, timestamps
        .single()

      IF insertError THEN
        THROW new Error(`Supabase insert failed: ${insertError.message}`)
      ENDIF

      // 5. Success: Replace Optimistic Message with Real DB Data
      LOG "Message sent successfully to DB:", insertedMessage.id
      // Use a store action to find the message by optimisticId and replace it with insertedMessage
      replaceOptimistic(conversationId, optimisticId, { ...insertedMessage, decryptedContent: trimmedText }) // Keep decrypted content
      // Ensure status is 'Sent' (should be from insertedMessage, but confirm)
      updateMessageStatusInStore(conversationId, [insertedMessage.id], 'Sent')

      // 6. Update Conversation Metadata (last message, timestamp) - Optional but good practice
      // This helps the conversation list update correctly. Could also be a DB trigger.
      AWAIT SupabaseClient
          .from('conversations')
          .update({
              last_message_id: insertedMessage.id,
              // Optionally store preview: last_message_preview: trimmedText.substring(0, 50),
              updated_at: insertedMessage.created_at // Use DB timestamp for consistency
          })
          .eq('id', conversationId)

    CATCH sendError
      ERROR "Failed to send message:", sendError.message
      // Update optimistic message status to 'Failed' in the store
      updateMessageStatusInStore(conversationId, [optimisticId], 'Failed', sendError.message)
    FINALLY
      setIsSending(false) // Re-enable input regardless of success/failure
    ENDTRY

  ENDFUNCTION

  FUNCTION handleLoadMore():
    // TDD: Test loading more messages when user scrolls near the top
    // TDD: Test that loading more is prevented if already loading
    IF NOT isLoadingMore AND messages.length > 0 THEN // Check messages exist to get oldest
      LOG "Requesting older messages for conversation:", conversationId
      // Get the timestamp or ID of the oldest message currently displayed
      oldestMessageTimestamp = messages[0]?.created_at
      IF oldestMessageTimestamp THEN
          fetchMoreMessages(conversationId, oldestMessageTimestamp) // Action in MessageStore
            .catch(err => ERROR "Failed to load more messages:", err) // Store handles error state
      ENDIF
    ENDIF
  ENDFUNCTION

  // --- Rendering ---
  // TDD: Test rendering the correct partner name in the header
  // TDD: Test rendering the list of messages correctly
  // TDD: Test rendering own vs partner messages with distinct styles/alignment
  // TDD: Test rendering message status indicators (Sending, Sent, Delivered, Read, Failed) based on message.status
  // TDD: Test rendering loading indicators for initial load and pagination
  // TDD: Test rendering error states for message loading
  // TDD: Test rendering the text input field and send button
  // TDD: Test send button disabled state when input is empty or sending is in progress

  partnerName = getPartnerInfo(conversationDetails, currentUser.id)?.displayName || "Chat" // Get partner name

  RETURN (
    <MessagingView>
      <Header title={partnerName} /> {/* Display partner's name */}
      <MessageListContainer ref={messageListRef}>
        {/* Loading indicator for initial load */}
        {isLoading AND messages.length == 0 AND <LoadingSpinner text="Loading messages..." />}
        {/* Error display */}
        {error AND <ErrorMessage message={error.message || "Failed to load messages"} />}
        {/* Loading indicator for pagination */}
        {isLoadingMore AND <LoadingMoreIndicator />}

        {/* Add scroll listener or use a component that detects scroll to top */}
        <MessageList onScrollNearTop={handleLoadMore}>
          {/* Render messages, assuming sorted oldest to newest */}
          FOR EACH message IN messages:
            isOwnMessage = message.sender_id == currentUser.id
            // Use message.id as key once it's the real ID, maybe fallback to optimisticId
            messageKey = message.isOptimistic ? message.id : message.id

            <MessageBubble
              key={messageKey}
              isOwn={isOwnMessage}
              status={message.status} // Pass status for display (e.g., checkmarks, clock icon)
              errorMessage={message.errorMessage} // Show error tooltip if status is 'Failed'
              timestamp={message.created_at} // Display time
              // Add necessary props/attributes for IntersectionObserver target
              data-message-id={message.id} // ID for observer callback
            >
              {/* Display decrypted text or placeholder/indicator */}
              {message.decryptedContent ?? (message.message_type === 'TEXT' ? "[Encrypted Text]" : "[Encrypted Media]")}
            </MessageBubble>
          ENDFOR
        </MessageList>
      </MessageListContainer>
      <InputArea>
        <TextInput
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type an encrypted message..."
          disabled={isSending}
          // Handle Enter key press to send?
        />
        <SendButton onClick={handleSendMessage} disabled={inputText.trim() == '' || isSending}>
          {isSending ? <SendingIndicator /> : "Send"}
        </SendButton>
      </InputArea>
    </MessagingView>
  )

ENDCOMPONENT


// --- MessageStore (Conceptual Actions & State Structure) ---
STORE MessageStore:
  state: {
    messages: {
        // [conversationId]: [message1, message2, ...] // Sorted by created_at ASC
    },
    isLoading: {
        // [conversationId]: boolean
    },
    isLoadingMore: {
        // [conversationId]: boolean
    },
    error: {
        // [conversationId]: Error | string | null
    },
    hasMoreMessages: {
        // [conversationId]: boolean // To know when to stop pagination
    }
  }
  actions: {
    fetchInitialMessages: async (convoId, limit = 30) => {
      // Sets isLoading[convoId] = true, error[convoId] = null
      // Calls SupabaseClient.from('messages').select(...).eq('conversation_id', convoId).order('created_at', { ascending: false }).limit(limit)
      // IMPORTANT: Fetch newest first, then reverse client-side for display order ASC
      // Decrypts messages (requires async map or similar) - handle decryption errors per message
      // On success: Sets messages[convoId] = decryptedMessages.reverse(), isLoading = false, hasMoreMessages = fetchedCount === limit
      // On failure: Sets error[convoId] = error, isLoading = false
      // TDD: Test store action for initial fetch, decryption, sorting, and state updates
    },
    fetchMoreMessages: async (convoId, beforeTimestamp, limit = 30) => {
      // Sets isLoadingMore[convoId] = true
      // Calls SupabaseClient.from('messages')... .lt('created_at', beforeTimestamp).order('created_at', { ascending: false }).limit(limit)
      // Decrypts messages
      // On success: Prepends decryptedMessages.reverse() to messages[convoId], isLoadingMore = false, hasMoreMessages = fetchedCount === limit
      // On failure: Sets error[convoId] = error, isLoadingMore = false
      // TDD: Test store action for pagination fetch, decryption, prepending, and state updates
    },
    addOrUpdateMessage: (convoId, message) => {
      // If message with same ID exists, update it. Otherwise, add it.
      // Ensure the messages[convoId] array remains sorted by created_at ASC.
      // Handles both optimistic messages and messages received via Realtime.
      // TDD: Test store action for adding/updating message while maintaining sort order
    },
    updateMessageStatus: (convoId, messageIds, status, errorMessage = null) => {
      // Finds message(s) by ID within messages[convoId] and updates their status field (and optionally errorMessage).
      // TDD: Test store action for updating status of one or multiple messages
    },
    replaceOptimisticMessage: (convoId, optimisticId, realMessage) => {
      // Finds the message with id === optimisticId in messages[convoId]
      // Replaces its properties with those from realMessage (keeping decryptedContent if needed)
      // Ensure the message ID is updated to the real ID.
      // TDD: Test store action for correctly replacing an optimistic message with real data
    }
    // clearMessagesForConversation: (convoId) => { ... } // Optional cleanup action
  }
ENDSTORE