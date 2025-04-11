// File: specs/messaging/MessageView.pseudo.md

# Component: MessageView

## Description
Displays messages for a selected conversation, handles pagination,
subscribes to and displays new messages in real-time.

## Dependencies
- Supabase Client (for data fetching and real-time subscription)
- Auth Context (to get current user ID for identifying own messages)
- UI Components (MessageList, MessageItem, LoadingIndicator, ErrorMessage, Button)
- State Management
- Utility functions (e.g., for date formatting)

## Props
- `conversationId`: String (ID of the conversation to display messages for)

## State
- `messages`: Array (List of message objects for the current conversation)
- `loadingInitial`: Boolean (Indicates initial message fetch)
- `loadingMore`: Boolean (Indicates fetching older messages)
- `error`: String | null (Stores any error message)
- `subscription`: Object | null (Reference to the Supabase Realtime subscription)
- `currentPage`: Integer (Tracks the current page for pagination)
- `hasMoreMessages`: Boolean (Indicates if older messages are available)

## Functions

### `fetchMessages(page = 1)`
  - **Purpose:** Fetches a page of messages for the given `conversationId`.
  - **Trigger:** `conversationId` prop changes, user requests older messages.
  - **Logic:**
    1. If `page === 1`, set `loadingInitial` to true, clear `error`, reset `messages`, set `currentPage` to 1.
    2. Else, set `loadingMore` to true.
    3. Define pagination parameters (e.g., `pageSize = 20`, `offset = (page - 1) * pageSize`).
    4. Call Supabase client:
       `supabase.from('messages')`
       `.select('*, sender:profiles(id, username, avatar_url))' // Join with profiles table`
       `.eq('conversation_id', conversationId)`
       `.order('created_at', { ascending: false })` // Fetch newest first for pagination
       `.range(offset, offset + pageSize - 1)`
    5. **On Success:**
       - Reverse the fetched messages (since we fetched newest first but want to display oldest first). # TDD: Verify message order after fetch and reversal.
       - If `page === 1`:
         - Set `messages` state to the reversed fetched messages.
       - Else:
         - Prepend the reversed fetched messages to the existing `messages` state array. # TDD: Verify older messages are prepended correctly.
       - Update `currentPage` to `page`.
       - Set `hasMoreMessages` based on whether the number of fetched messages equals `pageSize`. # TDD: Verify `hasMoreMessages` logic.
       - Set `loadingInitial` or `loadingMore` to false.
    6. **On Error:**
       - Set `error` state. # TDD: Verify error state on fetch failure.
       - Set `loadingInitial` or `loadingMore` to false.

### `subscribeToNewMessages()`
  - **Purpose:** Listens for new messages inserted into the current conversation via Supabase Realtime.
  - **Trigger:** `conversationId` prop changes (after initial fetch).
  - **Logic:**
    1. Unsubscribe from any existing subscription first. # TDD: Verify cleanup of previous subscription.
    2. If `conversationId` is null, return.
    3. Subscribe to Supabase Realtime channel for the specific conversation:
       `supabase.channel('public:messages:conversation_id=eq.{conversationId}')`
       `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.{conversationId}` }, payload => {`
         `handleNewMessage(payload.new);`
       `})`
       `.subscribe(status => {`
         `// Handle subscription status changes (e.g., log errors)`
       `})`
    4. Store the subscription reference in `subscription` state.
  - **Cleanup:** Unsubscribe on component unmount or when `conversationId` changes.

### `handleNewMessage(newMessageData)`
  - **Purpose:** Processes a new message received via the Realtime subscription.
  - **Trigger:** Realtime subscription receives an INSERT event.
  - **Logic:**
    1. Format `newMessageData` if necessary (e.g., fetch sender profile if not included in payload). // Note: Ideally, payload includes necessary sender info.
    2. Append the new message to the end of the `messages` state array. # TDD: Verify new message is appended correctly.
    3. Scroll the message view to the bottom (optional).

### `loadMoreMessages()`
  - **Purpose:** Fetches the next page of older messages.
  - **Trigger:** User interaction (e.g., scrolling to top, clicking "Load More" button).
  - **Logic:**
    1. If `loadingMore` or not `hasMoreMessages`, return.
    2. Call `fetchMessages(currentPage + 1)`.

## UI Rendering Logic
- If `loadingInitial` is true, display `LoadingIndicator`.
- If `error` is not null, display `ErrorMessage`.
- If `messages` is empty and not loading, display an empty state ("No messages yet" or "Start the conversation").
- If `messages` has data:
  - Display a "Load More" button/trigger at the top if `hasMoreMessages` is true and not `loadingMore`. Attach `loadMoreMessages` to its action.
  - Display `LoadingIndicator` at the top if `loadingMore` is true.
  - Map through the `messages` array.
  - For each `message`:
    - Render a `MessageItem` component.
    - Pass message content, sender info (name, avatar), timestamp.
    - Style differently based on whether the sender is the current user. # TDD: Verify own vs. other message styling.
    - Format timestamp appropriately.

## TDD Anchors
- `fetchMessages()` fetches initial messages correctly.
- `fetchMessages()` handles pagination and prepends older messages.
- `fetchMessages()` correctly sets `hasMoreMessages`.
- `fetchMessages()` handles API errors.
- `subscribeToNewMessages()` establishes and cleans up subscriptions correctly.
- `handleNewMessage()` appends new messages to the state.
- Messages are displayed in the correct order (oldest at top).
- Own messages are styled differently from others'.
- Loading and error states render correctly.
- Pagination controls (`loadMoreMessages` trigger) work as expected.