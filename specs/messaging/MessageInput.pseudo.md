// File: specs/messaging/MessageInput.pseudo.md

# Component: MessageInput

## Description
Provides an input field and send button for composing and sending messages
within a specific conversation.

## Dependencies
- Supabase Client (for inserting data)
- Auth Context (to get current user ID)
- UI Components (TextInput, Button, ErrorMessage)
- State Management

## Props
- `conversationId`: String (ID of the conversation to send messages to)

## State
- `messageText`: String (Current value of the text input)
- `isSending`: Boolean (Indicates if a message is currently being sent)
- `error`: String | null (Stores any error message during sending)

## Functions

### `handleInputChange(event)`
  - **Purpose:** Updates the `messageText` state as the user types.
  - **Trigger:** Text input's change event.
  - **Logic:**
    1. Set `messageText` state to `event.target.value`.

### `handleSendMessage()`
  - **Purpose:** Sends the message content to Supabase.
  - **Trigger:** User clicks the Send button or presses Enter (optional).
  - **Logic:**
    1. Trim `messageText`. If empty or `isSending` is true, return. # TDD: Verify empty message is not sent.
    2. Set `isSending` to true, clear `error`.
    3. Get `currentUserId` from Auth Context.
    4. Prepare the message object:
       `newMessage = { conversation_id: conversationId, sender_id: currentUserId, content: messageText.trim() }`
    5. Call Supabase client:
       `supabase.from('messages').insert([newMessage])`
    6. **On Success:**
       - Clear `messageText` state. # TDD: Verify input clears on successful send.
       - Set `isSending` to false.
       - Optionally: Provide visual feedback (e.g., button state change).
    7. **On Error:**
       - Set `error` state with an appropriate message. # TDD: Verify error state is set on send failure.
       - Set `isSending` to false.

## UI Rendering Logic
- Display a `TextInput` field:
  - Value bound to `messageText` state.
  - `onChange` handler set to `handleInputChange`.
  - Placeholder text (e.g., "Type your message...").
  - Optionally disable if `isSending` is true.
- Display a `Button` (Send):
  - `onClick` handler set to `handleSendMessage`.
  - Disabled if `messageText` is empty or `isSending` is true. # TDD: Verify button disabled state logic.
  - May show a loading indicator if `isSending` is true.
- If `error` is not null, display `ErrorMessage` below the input/button.

## TDD Anchors
- `handleInputChange()` updates state correctly.
- `handleSendMessage()` prevents sending empty messages.
- `handleSendMessage()` calls Supabase insert with correct data.
- `handleSendMessage()` clears input and resets state on success.
- `handleSendMessage()` sets error state on failure.
- Send button is enabled/disabled based on input content and sending state.
- Error message displays correctly.