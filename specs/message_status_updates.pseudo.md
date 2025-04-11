# specs/message_status_updates.pseudo.md

## Message Status Updates ('Sent', 'Delivered', 'Read')

Handles the lifecycle of message statuses, primarily using Supabase Realtime `broadcast` for notifying the sender of 'Delivered' and 'Read' events. Assumes message status enum includes 'Sending', 'Sent', 'Delivered', 'Read', 'Failed'.

### Module: StatusUpdateManager

**Purpose:** Centralizes logic for sending and receiving status updates via Realtime broadcast.

**Dependencies:**
*   `SupabaseClient` (For Realtime broadcast and channel subscription)
*   `MessageStore` (To update local message statuses)
*   `CurrentUserProvider` (To get current user ID)
*   `ConversationStore` (Potentially to get conversation details)

**State:**
*   `userId`: Current authenticated user's ID (initialized via `CurrentUserProvider`).
*   `activeStatusSubscriptions`: Map or Set to track active status update channel subscriptions (e.g., `Set<channelName>`).

---

**1. 'Sent' Status**

*   **Logic:** The sender's client marks a message as 'Sent' locally in the `MessageStore` immediately after the `SupabaseClient.from('messages').insert()` call returns successfully. The UI reflects this change.
*   **Implementation:** Covered in `handleSendMessage` within `specs/ui_logic.pseudo.md`.
*   **TDD Anchor:** `// TDD: Test successful send: message status changes to 'Sent' and ID is updated` (in `handleSendMessage`)

---

**2. 'Delivered' Status**

*   **Sender Side:** Waits to receive a 'Delivered' status update via broadcast. Updates local `MessageStore` upon receipt.
*   **Recipient Side Trigger:** Occurs after successfully receiving AND decrypting a message (text content or image metadata).
*   **Recipient Side Action:** Call `sendStatusUpdate(messageId, 'Delivered', conversationId)`.

```pseudocode
// --- Integration Point: RealtimeManager (handleIncomingTextMessage / handleIncomingImageMessage) ---
// Inside the handler, after successful decryption of message `msg`:
LOG "Message decrypted successfully, sending 'Delivered' status for:", msg.id
// TDD: Test that 'Delivered' status update is sent after successful decryption
AWAIT StatusUpdateManager.sendStatusUpdate(msg.id, 'Delivered', msg.conversation_id)
// Note: Local status update for the recipient happens when they receive their own broadcast (or could be done here explicitly). Relying on broadcast simplifies logic.
```

---

**3. 'Read' Status**

*   **Sender Side:** Waits to receive a 'Read' status update via broadcast. Updates local `MessageStore` upon receipt.
*   **Recipient Side Trigger:** Occurs when a received message becomes visible in the UI (`Messaging.tsx`), detected via `IntersectionObserver`.
*   **Recipient Side Action:**
    1.  Update the message status locally to 'Read' in `MessageStore` for immediate UI feedback.
    2.  Call `sendBulkStatusUpdate(messageIds, 'Read', conversationId)` for all newly visible messages.

```pseudocode
// --- Integration Point: Messaging.tsx (IntersectionObserver callback) ---
// Inside the useEffect hook handling IntersectionObserver:
IF messagesToMarkRead.length > 0 THEN
  LOG "Marking messages as read locally and sending status update:", messagesToMarkRead.map(m => m.id)
  // 1. Update status locally first for immediate UI feedback
  // TDD: Test local store is updated to 'Read' immediately on visibility
  updateMessageStatusInStore(conversationId, messagesToMarkRead.map(m => m.id), 'Read')
  // 2. Send 'Read' status update to partner(s) via the dedicated manager
  // TDD: Test that StatusUpdateManager.sendBulkStatusUpdate is called with correct message IDs and status
  StatusUpdateManager.sendBulkStatusUpdate(messagesToMarkRead.map(m => m.id), 'Read', conversationId)
ENDIF
```

---

**4. Sending Status Updates (Using Realtime Broadcast)**

```pseudocode
// --- Module: StatusUpdateManager ---

FUNCTION initialize(currentUserId):
    // Call this once on app startup after user is authenticated
    SET this.userId = currentUserId
    SET this.activeStatusSubscriptions = new Set()

FUNCTION sendStatusUpdate(messageId, status: ('Delivered' | 'Read'), conversationId):
  // TDD: Test sending 'Delivered' status update via broadcast successfully
  // TDD: Test sending 'Read' status update via broadcast successfully
  // TDD: Test payload structure includes messageId, status, senderId
  // TDD: Test handling of Supabase broadcast errors (e.g., network issue, invalid channel)

  IF this.userId IS NULL THEN RETURN FAILURE // Ensure initialized

  LOG `Sending status update via broadcast: Msg ${messageId}, Status ${status}, Convo ${conversationId}`
  channelName = `status-updates:${conversationId}`
  event = 'message_status_update' // Event name for single updates
  payload = {
    messageId: messageId,
    status: status,
    senderId: this.userId // ID of the user sending this status update (the recipient of the original message)
  }

  // Get the channel instance. Assume it exists if subscribed, otherwise broadcast might fail.
  channel = SupabaseClient.channel(channelName)
  IF channel.state !== 'joined' THEN
      WARN `Cannot send status update, channel ${channelName} not joined.`
      // Optionally try to subscribe/join first? Or just fail? Let's fail for now.
      RETURN FAILURE
  ENDIF

  TRY
    broadcastResult = AWAIT channel.send({
      type: 'broadcast',
      event: event,
      payload: payload,
    })
    // Check result? Supabase client v2 might return { ok: true } or throw.
    LOG "Broadcast send result:", broadcastResult
    RETURN SUCCESS
  CATCH error
    ERROR `Failed to broadcast status update (${status}) for message ${messageId}:`, error
    RETURN FAILURE
  ENDTRY
ENDFUNCTION

FUNCTION sendBulkStatusUpdate(messageIds: Array<String>, status: ('Delivered' | 'Read'), conversationId):
    // TDD: Test sending bulk status updates successfully
    // TDD: Test bulk payload structure includes messageIds array, status, senderId
    IF this.userId IS NULL OR messageIds.length == 0 THEN RETURN FAILURE

    LOG `Sending bulk status update via broadcast: ${messageIds.length} msgs, Status ${status}, Convo ${conversationId}`
    channelName = `status-updates:${conversationId}`
    event = 'bulk_message_status_update' // Different event name for bulk handling
    payload = {
        messageIds: messageIds,
        status: status,
        senderId: this.userId
    }
    channel = SupabaseClient.channel(channelName)
    IF channel.state !== 'joined' THEN
        WARN `Cannot send bulk status update, channel ${channelName} not joined.`
        RETURN FAILURE
    ENDIF

    TRY
        broadcastResult = AWAIT channel.send({ type: 'broadcast', event: event, payload: payload })
        LOG "Bulk broadcast send result:", broadcastResult
        RETURN SUCCESS
    CATCH error
        ERROR `Failed to broadcast bulk status update (${status}) for ${messageIds.length} messages:`, error
        RETURN FAILURE
    ENDTRY
ENDFUNCTION
```

---

**5. Receiving Status Updates (Listening to Broadcasts)**

```pseudocode
// --- Module: StatusUpdateManager ---

FUNCTION subscribeToStatusUpdates(conversationId):
  // TDD: Test successful subscription to the correct status update channel
  // TDD: Test receiving 'message_status_update' event and updating store correctly
  // TDD: Test receiving 'bulk_message_status_update' event and updating store correctly
  // TDD: Test ignoring broadcasts sent by the current user
  // TDD: Test ignoring updates for messages not sent by the current user
  // TDD: Test status upgrade logic (Sent -> Delivered, Sent/Delivered -> Read)
  // TDD: Test handling of channel subscription errors and state management

  IF this.userId IS NULL THEN RETURN // Ensure initialized

  LOG "Subscribing to status updates for conversation:", conversationId
  channelName = `status-updates:${conversationId}`

  IF this.activeStatusSubscriptions.has(channelName) THEN
    LOG "Already subscribed to status updates for conversation:", conversationId
    RETURN SupabaseClient.channel(channelName) // Return existing channel
  ENDIF

  channel = SupabaseClient.channel(channelName)

  // Handler for single status updates
  FUNCTION handleSingleUpdate({ payload }):
      LOG "Received status update broadcast:", payload
      // Ignore if broadcast was sent by self OR if required fields missing
      IF payload?.senderId == this.userId OR payload?.messageId IS NULL OR payload?.status IS NULL THEN RETURN

      // Find the message in our local store
      message = MessageStore.getState().getMessageById(conversationId, payload.messageId)

      // Ignore if message not found, or if it wasn't sent by us
      IF message IS NULL OR message.sender_id != this.userId THEN RETURN

      // Apply status update only if it's an upgrade
      currentStatus = message.status
      newStatus = payload.status
      shouldUpdate = (newStatus == 'Read' AND currentStatus != 'Read') OR \
                     (newStatus == 'Delivered' AND currentStatus == 'Sent')

      IF shouldUpdate THEN
          LOG `Updating status for message ${payload.messageId} from ${currentStatus} to ${newStatus}`
          // TDD: Test MessageStore.updateMessageStatus is called with correct params
          MessageStore.getState().updateMessageStatus(conversationId, [payload.messageId], newStatus)
      ENDIF
  ENDFUNCTION

  // Handler for bulk status updates
  FUNCTION handleBulkUpdate({ payload }):
      LOG "Received bulk status update broadcast:", payload
      IF payload?.senderId == this.userId OR payload?.messageIds IS NULL OR payload?.status IS NULL THEN RETURN

      messagesToUpdate = []
      newStatus = payload.status

      FOR EACH messageId IN payload.messageIds:
          message = MessageStore.getState().getMessageById(conversationId, messageId)
          IF message IS NOT NULL AND message.sender_id == this.userId THEN
              currentStatus = message.status
              shouldUpdate = (newStatus == 'Read' AND currentStatus != 'Read') OR \
                             (newStatus == 'Delivered' AND currentStatus == 'Sent')
              IF shouldUpdate THEN
                  messagesToUpdate.push(messageId)
              ENDIF
          ENDIF
      ENDFOR

      IF messagesToUpdate.length > 0 THEN
          LOG `Bulk updating status for ${messagesToUpdate.length} messages to ${newStatus}`
          MessageStore.getState().updateMessageStatus(conversationId, messagesToUpdate, newStatus)
      ENDIF
  ENDFUNCTION

  // Attach listeners
  channel.on('broadcast', { event: 'message_status_update' }, handleSingleUpdate)
  channel.on('broadcast', { event: 'bulk_message_status_update' }, handleBulkUpdate)

  // Subscribe and handle channel state
  channel.subscribe((status, error) => {
    IF status == 'SUBSCRIBED' THEN
      LOG "Successfully subscribed to status updates for conversation:", conversationId
      this.activeStatusSubscriptions.add(channelName)
    ELSE IF status == 'CHANNEL_ERROR' OR status == 'TIMED_OUT' THEN
      ERROR "Status update subscription error:", error?.message || status, "for conversation:", conversationId
      this.activeStatusSubscriptions.delete(channelName)
      // Implement retry logic here if desired (e.g., exponential backoff)
    ELSE IF status == 'CLOSED' THEN
      LOG "Status update subscription closed for conversation:", conversationId
      this.activeStatusSubscriptions.delete(channelName)
    ENDIF
  })

  RETURN channel // Return channel instance

ENDFUNCTION

// --- Integration Point: App Initialization / Conversation Entry ---
// Call StatusUpdateManager.initialize(userId) after login.
// When entering a conversation view (`Messaging.tsx` mount):
// StatusUpdateManager.subscribeToStatusUpdates(conversationId)

// --- Integration Point: Logout / Conversation Exit ---
// When user logs out or leaves a conversation (`Messaging.tsx` unmount):
FUNCTION unsubscribeFromStatusUpdates(conversationId):
    channelName = `status-updates:${conversationId}`
    LOG "Unsubscribing from status updates for conversation:", conversationId
    channel = SupabaseClient.channel(channelName, { broadcast: { ack: true } }) // Ensure we have the instance
    IF channel THEN
        TRY
            AWAIT SupabaseClient.removeChannel(channel)
            this.activeStatusSubscriptions.delete(channelName)
        CATCH removeError
            ERROR "Error removing status update channel:", removeError
            // Still remove from local tracking
            this.activeStatusSubscriptions.delete(channelName)
        ENDTRY
    ENDIF
ENDFUNCTION

FUNCTION unsubscribeFromAllStatusUpdates():
    // Called on logout
    LOG "Unsubscribing from all status update channels."
    // Create a copy of the set to iterate over, as removeChannel might modify it indirectly via callbacks
    subscriptionsToRemove = new Set(this.activeStatusSubscriptions)
    FOR EACH channelName IN subscriptionsToRemove:
        channel = SupabaseClient.channel(channelName)
        IF channel THEN
            TRY
                AWAIT SupabaseClient.removeChannel(channel)
            CATCH removeError
                ERROR `Error removing channel ${channelName}:`, removeError
            FINALLY
                // Ensure it's removed from tracking even if Supabase call failed
                this.activeStatusSubscriptions.delete(channelName)
        ELSE
             this.activeStatusSubscriptions.delete(channelName) // Remove if channel instance wasn't found
        ENDIF
    ENDFOR
    // Verify the set is empty
    IF this.activeStatusSubscriptions.size > 0 THEN
        WARN "Some status subscriptions might not have been cleaned up properly."
        CLEAR this.activeStatusSubscriptions
    ENDIF
ENDFUNCTION

// --- MessageStore Helper ---
STORE MessageStore:
  // ... existing state/actions
  actions: {
    // Add selector to get message by ID efficiently
    getMessageById: (convoId, messageId) => {
      // Finds a message by ID within state.messages[convoId]
      // RETURN message object or null
    }
    // updateMessageStatus action already defined
  }
ENDSTORE