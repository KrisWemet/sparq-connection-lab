# Sparq Connection - Realtime Features

This document describes the Supabase Realtime implementation for live partner interactions in Sparq Connection.

## Overview

The realtime system enables instant notifications between partners for:
- **Shared answers** - When a partner shares an answer
- **Session completions** - When a partner completes their daily session
- **Invite status changes** - When an invite is accepted or declined
- **Partner presence** - Online/offline status

## Architecture

### Components

1. **useRealtimeSync Hook** (`src/hooks/useRealtimeSync.ts`)
   - Central hook managing all realtime subscriptions
   - Handles connection state and reconnection
   - Maintains notification state with localStorage persistence

2. **NotificationBell Component** (`src/components/notifications/NotificationBell.tsx`)
   - Shows unread notification count with animated badge
   - Opens notification list on click

3. **NotificationList Component** (`src/components/notifications/NotificationList.tsx`)
   - Slide-out panel showing all notifications
   - Supports mark-as-read and clear functionality

4. **broadcast-event Edge Function** (`supabase/functions/broadcast-event/index.ts`)
   - Server-side function for broadcasting events
   - Handles subscription tier validation
   - Persists notifications to database

## Database Schema

### notifications Table
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'new_shared_answer', 'partner_session_complete', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Event Types

### 1. new_shared_answer
Broadcast when a user shares an answer with their partner.

**Payload:**
```typescript
{
  shared_answer_id: string;
  question_preview: string;
  answer_preview: string;
  category?: string;
  discovery_day?: number;
  sender_id: string;
  sender_name: string;
  timestamp: string;
}
```

### 2. partner_session_complete
Broadcast when a partner completes their daily session.

**Payload:**
```typescript
{
  session_id: string;
  partner_id: string;
  partner_name: string;
  streak: number;
  streak_continued: boolean;
  phase: string;
  discovery_day: number;
  completed_at: string;
}
```

### 3. invite_accepted
Broadcast when a partner accepts an invitation.

**Payload:**
```typescript
{
  invite_id: string;
  partner_id: string;
  partner_name: string;
  accepted_at: string;
}
```

### 4. invite_declined
Broadcast when a partner declines an invitation.

**Payload:**
```typescript
{
  invite_id: string;
  declined_at: string;
}
```

## Subscription Tiers

### Free Tier
- ✅ Connection status monitoring
- ✅ Invite status changes (accepted/declined)
- ❌ Partner shared answers (requires premium)
- ❌ Partner session completions (requires premium)

### Premium/Ultimate Tier
- ✅ All free tier features
- ✅ Real-time shared answer notifications
- ✅ Partner session completion notifications
- ✅ Badge/streak milestone notifications

## Usage

### In Components

```tsx
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead,
    partnerIsOnline 
  } = useRealtimeSync();
  
  return (
    <div>
      <span>{unreadCount} unread notifications</span>
      <span>Partner is {partnerIsOnline ? 'online' : 'offline'}</span>
    </div>
  );
}
```

### Broadcasting Events from Edge Functions

```typescript
// From any edge function
await fetch(
  `${SUPABASE_URL}/functions/v1/broadcast-event`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: 'new_shared_answer',
      recipientId: partnerId,
      payload: { /* event data */ },
      options: {
        persist: true,  // Save to notifications table
        priority: 'normal',
      },
    }),
  }
);
```

## Testing

### Manual Testing with Two Browser Windows

1. Open the app in two different browsers (or incognito windows)
2. Sign in as Partner A in Window 1
3. Sign in as Partner B in Window 2
4. Connect the partners via invite
5. Test notifications:
   - Share an answer from Partner A → Partner B should receive notification
   - Complete a session as Partner B → Partner A should receive notification

### Test Script
```bash
# Start the dev server
npm run dev

# Open two browser windows
open http://localhost:5173

# Sign in with different accounts and test realtime features
```

## Security Considerations

1. **RLS Policies**: Notifications table has strict RLS policies - users can only access their own notifications
2. **Partner Verification**: Edge functions verify sender/recipient are actually partners
3. **Subscription Validation**: Premium features check subscription tier before broadcasting
4. **Authentication**: All realtime connections require valid JWT tokens

## Troubleshooting

### Connection Issues
- Check browser console for WebSocket connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Ensure realtime is enabled in Supabase dashboard

### Missing Notifications
- Verify notification bell component is mounted
- Check that user has a partner connected
- Verify subscription tier allows the feature

## Future Enhancements

- [ ] Push notifications for mobile
- [ ] Email notifications for offline users
- [ ] Notification preferences/settings
- [ ] Group/aggregate similar notifications
- [ ] In-app notification center with history
