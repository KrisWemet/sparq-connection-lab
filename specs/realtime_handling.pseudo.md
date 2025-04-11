# specs/realtime_handling.pseudo.md

## Realtime Event Handling (Client-Side)

Utilizes Supabase Realtime subscriptions to receive updates for conversations and messages.

### Module: RealtimeManager

**Dependencies:**
*   `SupabaseClient` (Provides Realtime subscription capabilities)
*   `MessageEncryptorDecryptor` (To decrypt incoming messages)
*   `ConversationStore` (Client-side state management for conversations list)
*   `MessageStore` (Client-side state management for messages within a conversation)
*   `CurrentUserProvider` (To get current user ID)
*   `NotificationService` (Optional: For displaying notifications for new messages)
*   `StatusUpdateManager` (Handles sending status updates - see Section 7)

**State:**
*   `userId`: Current authenticated user's ID.
*   `activeSubscriptions`: Map or Set to track active Supabase Realtime subscriptions (e.g., by channel name).
*   `currentConversationId`: ID of the conversation currently being viewed by the user (if any).

---

**Function: `subscribeToConversationListUpdates(userId)`**

*   **Purpose:** Subscribes to changes in the `conversations` table relevant to the current user. Handles updates to the conversation list UI state.
*   **Trigger:** Called after login/app initialization.

```pseudocode
FUNCTION subscribeToConversationListUpdates(userId):
  // TDD: Test successful subscription setup
  // TDD: Test receiving INSERT event for a new conversation
  // TDD: Test receiving UPDATE event for an existing conversation (e.g., last_message_id, unread_count change)
  // TDD: Test event filtering (only receives events for user's conversations)
  // TDD: Test handling of Supabase Realtime connection errors/reconnects

  LOG "Subscribing to conversation list updates for user:", userId
  SET this.userId = userId
  // Use a predictable channel name based on user ID for conversation list updates
  channelName = `conversations:user=${userId}`

  IF channelName IN this.activeSubscriptions THEN
    LOG "Already subscribed to conversation list updates."
    RETURN SupabaseClient.channel(channelName) // Return existing channel instance
  ENDIF

  subscription = SupabaseClient
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'conversations',
        // Filter server-side for efficiency: RLS ensures user can only subscribe to their own,
        // but this filter might further optimize which events the client receives.
        // Check Supabase docs for exact OR filter syntax if needed, otherwise RLS handles security.
        // Example filter (might need adjustment based on Supabase capabilities):
        // filter: `or=(participant_a.eq.${userId},participant_b.eq.${userId})`
        // If complex filters aren't reliable, rely on RLS and client-side filtering after receiving.
      },
      (payload) => {
        LOG "Received conversation update:", payload.eventType, payload.new || payload.old
        // Ensure the update is relevant if server-side filter wasn't perfect
        relevantConversation = payload.new ?? payload.old
        IF relevantConversation.participant_a != this.userId AND relevantConversation.participant_b != this.userId THEN
            LOG "Ignoring irrelevant conversation update received." // Should ideally be filtered by RLS/filter
            RETURN
        ENDIF

        // TDD: Test payload structure for INSERT vs UPDATE vs DELETE
        SWITCH payload.eventType:
          CASE 'INSERT':
            // A new conversation involving the user was created
            // TDD: Test adding new conversation to ConversationStore
            ConversationStore.addOrUpdateConversation(payload.new)
            NotificationService.notifyNewConversation(payload.new) // Optional
            BREAK
          CASE 'UPDATE':
            // An existing conversation was updated (e.g., new message, unread count)
            // TDD: Test updating existing conversation in ConversationStore
            ConversationStore.addOrUpdateConversation(payload.new)
            // Optional: If unread count increased and conversation isn't active, notify
            isUnreadForCurrentUser = (payload.new.participant_a == this.userId AND payload.new.unread_count_a > (payload.old?.unread_count_a ?? 0)) OR
                                     (payload.new.participant_b == this.userId AND payload.new.unread_count_b > (payload.old?.unread_count_b ?? 0))

            IF isUnreadForCurrentUser AND payload.new.id != this.currentConversationId THEN
                NotificationService.notifyUnreadUpdate(payload.new)
            ENDIF
            BREAK
          CASE 'DELETE':
            // A conversation involving the user was deleted
            // TDD: Test removing conversation from ConversationStore
            ConversationStore.removeConversation(payload.old.id)
            BREAK
        ENDSWITCH
      }
    )
    .subscribe((status, error) => {
      IF status == 'SUBSCRIBED' THEN
        LOG "Successfully subscribed to conversation list updates."
        ADD channelName TO this.activeSubscriptions
      ELSE IF status == 'CHANNEL_ERROR' OR status == 'TIMED_OUT' THEN
        ERROR "Conversation list subscription error:", error?.message || status
        REMOVE channelName FROM this.activeSubscriptions
        // Implement retry logic if needed (e.g., exponential backoff)
      ELSE IF status == 'CLOSED' THEN
        LOG "Conversation list subscription closed."
        REMOVE channelName FROM this.activeSubscriptions
      ENDIF
    })

  RETURN subscription // Return the subscription object for potential cleanup

ENDFUNCTION
```

---

**Function: `subscribeToNewMessages(conversationId)`**

*   **Purpose:** Subscribes to new messages inserted into a specific conversation and handles decryption.
*   **Trigger:** Called when the user navigates into a specific conversation view (`Messaging.tsx`).

```pseudocode
FUNCTION subscribeToNewMessages(conversationId):
  // TDD: Test successful subscription to a specific conversation
  // TDD: Test receiving INSERT event for a new message in the conversation
  // TDD: Test filtering (only receives messages for the specified conversation)
  // TDD: Test ignoring messages sent by the current user via Realtime (already handled optimistically)
  // TDD: Test triggering decryption for incoming messages
  // TDD: Test handling decryption failure
  // TDD: Test updating MessageStore with decrypted message
  // TDD: Test triggering 'Delivered' status update upon successful decryption
  // TDD: Test triggering 'Read' status update if conversation is active

  LOG "Subscribing to new messages for conversation:", conversationId
  // Use a predictable channel name based on conversation ID
  channelName = `messages:conversation=${conversationId}`

  IF channelName IN this.activeSubscriptions THEN
    LOG "Already subscribed to messages for conversation:", conversationId
    RETURN SupabaseClient.channel(channelName) // Return existing channel instance
  ENDIF

  subscription = SupabaseClient
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT', // Only care about new messages here
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}` // Filter server-side
      },
      async (payload) => {
        LOG "Received new message payload:", payload.new
        newMessage = payload.new

        // Ignore messages sent by the current user (they are added optimistically)
        IF newMessage.sender_id == this.userId THEN
          LOG "Ignoring own message received via Realtime."
          RETURN
        ENDIF

        // TDD: Test message structure received from payload
        IF newMessage.encrypted_content IS NULL OR newMessage.signal_message_type IS NULL THEN
            ERROR "Received message payload is missing required encryption fields."
            RETURN
        ENDIF

        // Trigger decryption
        LOG "Attempting to decrypt message:", newMessage.id
        decryptedPlaintext = AWAIT MessageEncryptorDecryptor.decryptMessage(
          newMessage.sender_id,
          { ciphertext: newMessage.encrypted_content, signal_message_type: newMessage.signal_message_type }
        )

        IF decryptedPlaintext IS FAILURE THEN
          ERROR "Failed to decrypt incoming message:", newMessage.id
          // TDD: Test handling decryption failure (e.g., show error message in UI)
          // Add/update message in store with failure state
          MessageStore.addOrUpdateMessage(conversationId, { ...newMessage, decryptedContent: "[Decryption Failed]", status: 'Failed' })
        ELSE
          LOG "Decryption successful for message:", newMessage.id
          // TDD: Test adding decrypted message to MessageStore
          // Update the message store with the decrypted content
          // The status is initially whatever the DB had ('Sent' probably), update happens next.
          MessageStore.addOrUpdateMessage(conversationId, { ...newMessage, decryptedContent: decryptedPlaintext })

          // Send 'Delivered' status update back to the sender
          // TDD: Test that StatusUpdateManager.sendStatusUpdate is called correctly
          AWAIT StatusUpdateManager.sendStatusUpdate(newMessage.id, 'Delivered')

          // If this conversation is the currently viewed one, mark as 'Read' immediately
          // (or based on visibility logic in UI component - see Section 7)
          IF conversationId == this.currentConversationId THEN
             // TDD: Test that StatusUpdateManager.sendStatusUpdate is called for 'Read' status
             // This might be delayed slightly or tied to UI visibility confirmation
             AWAIT StatusUpdateManager.sendStatusUpdate(newMessage.id, 'Read')
          ENDIF

          // Optional: Trigger UI update, scroll to bottom, etc. handled by MessageStore updates
        ENDIF
      }
    )
    .subscribe((status, error) => {
      IF status == 'SUBSCRIBED' THEN
        LOG "Successfully subscribed to new messages for conversation:", conversationId
        ADD channelName TO this.activeSubscriptions
        SET this.currentConversationId = conversationId // Track currently viewed conversation
      ELSE IF status == 'CHANNEL_ERROR' OR status == 'TIMED_OUT' THEN
        ERROR "New message subscription error:", error?.message || status, "for conversation:", conversationId
        REMOVE channelName FROM this.activeSubscriptions
        // Implement retry logic or notify user
      ELSE IF status == 'CLOSED' THEN
        LOG "New message subscription closed for conversation:", conversationId
        REMOVE channelName FROM this.activeSubscriptions
        IF this.currentConversationId == conversationId THEN
            SET this.currentConversationId = NULL // Clear tracker if the closed channel was the active one
        ENDIF
      ENDIF
    })

  RETURN subscription

ENDFUNCTION
```

---

**Function: `unsubscribe(channelName)`**

*   **Purpose:** Unsubscribes from a specific Supabase Realtime channel.
*   **Trigger:** Called when navigating away from a conversation view or on logout.

```pseudocode
FUNCTION unsubscribe(channelName):
  // TDD: Test successful unsubscription
  // TDD: Test unsubscription from a non-existent subscription
  LOG "Attempting to unsubscribe from channel:", channelName
  subscription = SupabaseClient.channel(channelName) // Get channel instance

  IF subscription THEN
    TRY
      result = AWAIT SupabaseClient.removeChannel(subscription)
      LOG "Unsubscribed from channel:", channelName, result
      REMOVE channelName FROM this.activeSubscriptions
      // If unsubscribing from the current message channel, clear the tracker
      IF channelName == `messages:conversation=${this.currentConversationId}` THEN
          SET this.currentConversationId = NULL
      ENDIF
      RETURN SUCCESS
    CATCH error
      ERROR "Error removing channel:", channelName, error
      // Still remove from local tracking even if Supabase call fails?
      REMOVE channelName FROM this.activeSubscriptions
      RETURN FAILURE
    ENDTRY
  ELSE
    LOG "No active subscription found for channel:", channelName
    RETURN SUCCESS // Nothing to do
  ENDIF

ENDFUNCTION
```

---

**Function: `unsubscribeFromConversationMessages(conversationId)`**

*   **Purpose:** Convenience function to unsubscribe from a specific conversation's message channel.
*   **Trigger:** Typically called when the user navigates away from the `Messaging.tsx` view for that conversation.

```pseudocode
FUNCTION unsubscribeFromConversationMessages(conversationId):
  // TDD: Test unsubscribing using conversation ID
  channelName = `messages:conversation=${conversationId}`
  CALL unsubscribe(channelName)
ENDFUNCTION
```

---

**Function: `unsubscribeAll()`**

*   **Purpose:** Unsubscribes from all active Realtime channels managed by this module.
*   **Trigger:** Called on user logout or app termination.

```pseudocode
FUNCTION unsubscribeAll():
  // TDD: Test unsubscribing from multiple channels
  LOG "Unsubscribing from all active channels."
  TRY
    result = AWAIT SupabaseClient.removeAllChannels()
    LOG "removeAllChannels result:", result
    CLEAR this.activeSubscriptions
    SET this.currentConversationId = NULL
    LOG "All channels removed."
    RETURN SUCCESS
  CATCH error
    ERROR "Error removing all channels:", error
    // Clear local state anyway
    CLEAR this.activeSubscriptions
    SET this.currentConversationId = NULL
    RETURN FAILURE
  ENDTRY

ENDFUNCTION