// ============================================================================
// Notification List Component - Slide-out panel showing all notifications
// ============================================================================

import { useRef, useEffect } from 'react';
import { 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  Trophy, 
  UserPlus, 
  XCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RealtimeNotification } from '@/hooks/useRealtimeSync';
import { formatDistanceToNow } from '@/lib/utils';

interface NotificationListProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: RealtimeNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
}

// Icon mapping for notification types
const notificationIcons: Record<RealtimeNotification['type'], React.ReactNode> = {
  shared_answer: <MessageCircle className="h-4 w-4" />,
  session_complete: <Trophy className="h-4 w-4" />,
  invite_accepted: <UserPlus className="h-4 w-4" />,
  invite_declined: <XCircle className="h-4 w-4" />,
  partner_joined: <UserPlus className="h-4 w-4" />,
};

// Color mapping for notification types
const notificationColors: Record<RealtimeNotification['type'], string> = {
  shared_answer: 'bg-blue-500/10 text-blue-600',
  session_complete: 'bg-green-500/10 text-green-600',
  invite_accepted: 'bg-purple-500/10 text-purple-600',
  invite_declined: 'bg-red-500/10 text-red-600',
  partner_joined: 'bg-purple-500/10 text-purple-600',
};

// Navigation mapping for notification types
const getNotificationLink = (notification: RealtimeNotification): string | null => {
  switch (notification.type) {
    case 'shared_answer':
      return '/messages';
    case 'session_complete':
      return '/dashboard';
    case 'invite_accepted':
    case 'partner_joined':
      return '/profile';
    default:
      return null;
  }
};

export function NotificationList({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
}: NotificationListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  
  // Mark as read when viewed
  useEffect(() => {
    if (isOpen) {
      // Mark visible notifications as read after a delay
      const timer = setTimeout(() => {
        notifications
          .filter(n => !n.isRead)
          .forEach(n => onMarkAsRead(n.id));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, notifications, onMarkAsRead]);
  
  const handleNotificationClick = (notification: RealtimeNotification) => {
    onMarkAsRead(notification.id);
    
    const link = getNotificationLink(notification);
    if (link) {
      window.location.href = link;
    }
    
    onClose();
  };
  
  const hasNotifications = notifications.length > 0;
  const hasUnread = notifications.some(n => !n.isRead);
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2.5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Notifications
              {hasUnread && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </SheetTitle>
            
            {hasNotifications && (
              <div className="flex items-center gap-1">
                {hasUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="h-8 px-2"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6" ref={listRef}>
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll notify you when your partner shares or completes activities
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Individual notification item component
interface NotificationItemProps {
  notification: RealtimeNotification;
  onClick: () => void;
  onMarkAsRead: () => void;
}

function NotificationItem({ notification, onClick, onMarkAsRead }: NotificationItemProps) {
  const link = getNotificationLink(notification);
  
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border p-3 transition-all",
        "hover:bg-muted/50 cursor-pointer",
        !notification.isRead && "bg-muted/30 border-l-4 border-l-primary"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        notificationColors[notification.type]
      )}>
        {notificationIcons[notification.type]}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium",
            !notification.isRead && "text-foreground"
          )}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        
        {link && (
          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
            <span>View</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
      
      {/* Unread indicator */}
      {!notification.isRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
          aria-label="Mark as read"
        />
      )}
    </div>
  );
}

// Helper to format time ago
function formatTimeAgo(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export default NotificationList;
