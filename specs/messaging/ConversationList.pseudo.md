// File: specs/messaging/ConversationList.pseudo.md

# Component: ConversationList

## Description
Displays a list of the current user's conversations, indicates unread messages,
allows selection of a conversation, and handles loading/error states.

## Dependencies
- Supabase Client (for data fetching)
- Auth Context (to get current user ID)
- UI Components (List, ListItem, LoadingIndicator, ErrorMessage)
- State Management (e.g., React useState/useEffect or global state manager)
- Navigation/Routing (to signal selected conversation change)

## State
- `conversations`: Array | null (List of conversation objects)
- `selectedConversationId`: String | null (ID of the currently selected conversation)
- `loading`: Boolean (Indicates if conversations are being fetched)
- `error`: String | null (Stores any error message during fetch)
- `unreadCounts`: Object (Map of conversation_id -> unread_count) // Optional: Could be part of conversation object

## Functions

### `fetchConversations()`
  - **Purpose:** Fetches the list of conversations for the current user from Supabase.
  - **Trigger:** Component mount, potentially on user change.
  - **Logic:**
    1. Set `loading` to true, clear `error`.
    2. Get `currentUserId` from Auth Context.
    3. Call Supabase client:
       `supabase.from('conversations')`
       `.select('*, messages(count)')` // Or a dedicated function/view for unread count
       `.or(filter conditions based on user participation, e.g., 'user1_id.eq.{currentUserId},user2_id.eq.{currentUserId}')`
       `.order('last_message_at', { ascending: false })`
    4. **On Success:**
       - Process the fetched data:
         - Map data to `conversations` state array.
         - Extract/calculate unread counts and store in `unreadCounts` state (or directly in conversation objects). # TDD: Verify unread count calculation/extraction.
       - Set `loading` to false.
    5. **On Error:**
       - Set `error` state with an appropriate message. # TDD: Verify error state is set on fetch failure.
       - Set `loading` to false.

### `handleSelectConversation(conversationId)`
  - **Purpose:** Updates the selected conversation state and notifies parent/router.
  - **Trigger:** User clicks/taps on a conversation item.
  - **Logic:**
    1. Set `selectedConversationId` state to the passed `conversationId`.
    2. Trigger navigation or call a prop function (e.g., `onConversationSelect(conversationId)`) to update the view. # TDD: Verify state update and callback trigger.
    3. Optionally: Mark messages in this conversation as read locally or trigger a backend update if needed immediately.

### `subscribeToConversationUpdates()`
  - **Purpose:** Listens for real-time updates that might affect the conversation list (e.g., new conversation created, last message updated).
  - **Trigger:** Component mount.
  - **Logic:**
    1. Get `currentUserId` from Auth Context.
    2. Subscribe to Supabase Realtime channel for changes related to the user's conversations.
       `supabase.channel('public:conversations:user={currentUserId}')` // Example channel naming
       `.on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${currentUserId}` }, payload => {` // Adjust filter based on schema
         `// Re-fetch or intelligently update the conversations list based on payload`
         `fetchConversations(); // Simplest approach, might be inefficient`
       `})`
       `.subscribe()`
    3. Store the subscription reference for cleanup.
  - **Cleanup:** Unsubscribe from the channel on component unmount. # TDD: Verify subscription and unsubscription logic.

## UI Rendering Logic
- If `loading` is true, display `LoadingIndicator`.
- If `error` is not null, display `ErrorMessage` with the error message.
- If `conversations` is null or empty, display an empty state message ("No conversations yet").
- If `conversations` has data:
  - Map through the `conversations` array.
  - For each `conversation`:
    - Render a `ListItem` component.
    - Display relevant conversation details (e.g., partner's name/avatar, last message snippet).
    - Indicate if it's the `selectedConversationId`.
    - Display unread count from `unreadCounts` (if > 0). # TDD: Verify unread indicator visibility.
    - Attach `handleSelectConversation(conversation.id)` to the item's click/tap event.

## TDD Anchors
- `fetchConversations()` successfully fetches and formats data.
- `fetchConversations()` correctly handles API errors.
- `handleSelectConversation()` updates state and calls callback.
- Unread counts are calculated/displayed correctly.
- Realtime subscription updates the list (or triggers re-fetch).
- Loading and error states render correctly.
- Empty state renders correctly.