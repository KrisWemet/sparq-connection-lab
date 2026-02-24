// ============================================================================
// Notification Bell Component - Shows unread count and triggers notification list
// ============================================================================

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationList } from './NotificationList';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function NotificationBell({ 
  className, 
  variant = 'ghost',
  size = 'icon'
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications, markAsRead, markAllAsRead, clearNotifications } = useRealtimeSync();
  
  // Show badge animation when new notifications arrive
  const hasNewNotifications = unreadCount > 0;
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn('relative', className)}
        onClick={() => setIsOpen(true)}
        aria-label={`Notifications${hasNewNotifications ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread badge */}
        {hasNewNotifications && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
        
        {/* Connection status indicator */}
        {/* Uncomment to show connection status
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
        />
        */}
      </Button>
      
      <NotificationList
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClear={clearNotifications}
      />
    </>
  );
}

export default NotificationBell;
