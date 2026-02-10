// ============================================================================
// Realtime Sync Hook - Enhanced for Partner Interactions (Optimized)
// ============================================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/lib/subscription-provider';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types for realtime events
export interface RealtimeNotification {
  id: string;
  type: 'shared_answer' | 'session_complete' | 'invite_accepted' | 'invite_declined' | 'partner_joined';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface PartnerActivity {
  type: 'session_complete' | 'shared_answer';
  userId: string;
  userName: string;
  timestamp: string;
  data?: Record<string, any>;
}

interface UseRealtimeSyncReturn {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
  
  // Notifications
  notifications: RealtimeNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // Partner activity
  partnerActivity: PartnerActivity | null;
  partnerIsOnline: boolean;
  
  // Session sharing
  lastSharedAnswer: any | null;
}

// Constants
const READ_NOTIFICATIONS_KEY = 'sparq_read_notifications';
const NOTIFICATION_DEDUP_WINDOW = 5000; // 5 seconds

export function useRealtimeSync(): UseRealtimeSyncReturn {
  const { user, profile } = useAuth();
  const { subscription } = useSubscription();
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  
  // Partner state
  const [partnerActivity, setPartnerActivity] = useState<PartnerActivity | null>(null);
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const [lastSharedAnswer, setLastSharedAnswer] = useState<any | null>(null);
  
  // Refs for managing channels and cleanup
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const partnerIdRef = useRef<string | null>(null);
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Check if realtime features are available based on subscription
  const canReceivePartnerEvents = useCallback(() => {
    return subscription.tier === 'premium' || subscription.tier === 'ultimate';
  }, [subscription.tier]);
  
  // Check if event was recently processed (deduplication)
  const isDuplicateEvent = useCallback((eventId: string): boolean => {
    if (processedEventsRef.current.has(eventId)) {
      return true;
    }
    processedEventsRef.current.add(eventId);
    // Clean up old events after window expires
    setTimeout(() => processedEventsRef.current.delete(eventId), NOTIFICATION_DEDUP_WINDOW);
    return false;
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    
    // Persist to localStorage for session persistence
    try {
      const readIds = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]');
      if (!readIds.includes(notificationId)) {
        readIds.push(notificationId);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  
  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      try {
        const allIds = updated.map(n => n.id);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(allIds));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(READ_NOTIFICATIONS_KEY);
    } catch {
      // ignore
    }
  }, []);
  
  // Reconnect function
  const reconnect = useCallback(() => {
    setConnectionError(null);
    // Force re-subscription by clearing processed events
    processedEventsRef.current.clear();
    setNotifications(prev => [...prev]);
  }, []);
  
  // Helper to track timeouts for cleanup
  const trackTimeout = useCallback((timeout: ReturnType<typeof setTimeout>) => {
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);
  
  // Load persisted read status
  useEffect(() => {
    try {
      const readIds = JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]');
      if (Array.isArray(readIds) && readIds.length > 0) {
        setNotifications(prev => 
          prev.map(n => readIds.includes(n.id) ? { ...n, isRead: true } : n)
        );
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  
  // Main realtime subscription effect
  useEffect(() => {
    if (!user?.id) {
      // Cleanup when user logs out
      channelsRef.current.forEach(channel => {
        try {
          channel.unsubscribe();
        } catch {
          // ignore unsubscribe errors
        }
      });
      channelsRef.current = [];
      setIsConnected(false);
      return;
    }
    
    const partnerId = profile?.partner_id;
    partnerIdRef.current = partnerId || null;
    
    // Clean up existing channels
    channelsRef.current.forEach(channel => {
      try {
        channel.unsubscribe();
      } catch {
        // ignore
      }
    });
    channelsRef.current = [];
    
    // =========================================================================
    // Channel 1: User's personal broadcast channel (for direct notifications)
    // =========================================================================
    const userChannel = supabase.channel(`user:${user.id}`)
      .on('broadcast', { event: 'new_shared_answer' }, (payload) => {
        if (!canReceivePartnerEvents()) return;
        
        const eventId = `shared_${payload.payload?.shared_answer_id}`;
        if (isDuplicateEvent(eventId)) return;
        
        const notification: RealtimeNotification = {
          id: `${eventId}_${Date.now()}`,
          type: 'shared_answer',
          title: 'New Shared Answer',
          message: `${payload.payload?.sender_name || 'Your partner'} shared an answer with you`,
          senderId: payload.payload?.sender_id,
          senderName: payload.payload?.sender_name,
          data: payload.payload,
          isRead: false,
          createdAt: payload.payload?.created_at || new Date().toISOString(),
        };
        
        setNotifications(prev => [notification, ...prev]);
        setLastSharedAnswer(payload.payload);
        
        toast.info(`${payload.payload?.sender_name || 'Your partner'} shared an answer`, {
          description: 'Tap to view their response',
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = '/messages';
            }
          }
        });
      })
      .on('broadcast', { event: 'partner_session_complete' }, (payload) => {
        if (!canReceivePartnerEvents()) return;
        
        const eventId = `session_${payload.payload?.session_id}`;
        if (isDuplicateEvent(eventId)) return;
        
        const notification: RealtimeNotification = {
          id: `${eventId}_${Date.now()}`,
          type: 'session_complete',
          title: 'Partner Completed Session',
          message: `${payload.payload?.partner_name || 'Your partner'} just completed their daily session!`,
          senderId: payload.payload?.partner_id,
          senderName: payload.payload?.partner_name,
          data: payload.payload,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        
        setNotifications(prev => [notification, ...prev]);
        setPartnerActivity({
          type: 'session_complete',
          userId: payload.payload?.partner_id,
          userName: payload.payload?.partner_name,
          timestamp: new Date().toISOString(),
          data: payload.payload,
        });
        
        toast.success(`${payload.payload?.partner_name || 'Your partner'} completed their session! 🎉`, {
          description: `They're on a ${payload.payload?.streak || 0}-day streak`,
        });
      })
      .on('broadcast', { event: 'invite_accepted' }, (payload) => {
        const eventId = `invite_accept_${payload.payload?.invite_id}`;
        if (isDuplicateEvent(eventId)) return;
        
        const notification: RealtimeNotification = {
          id: `${eventId}_${Date.now()}`,
          type: 'invite_accepted',
          title: 'Partner Connected!',
          message: `${payload.payload?.partner_name || 'Someone'} accepted your invitation`,
          senderId: payload.payload?.partner_id,
          senderName: payload.payload?.partner_name,
          data: payload.payload,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        
        setNotifications(prev => [notification, ...prev]);
        
        toast.success(`${payload.payload?.partner_name || 'Your partner'} is now your partner! 🎉`, {
          description: 'You can now share answers and see each other\'s progress',
          action: {
            label: 'View Partner',
            onClick: () => {
              window.location.href = '/profile';
            }
          }
        });
        
        // Navigate to profile after a delay
        const timeout = trackTimeout(setTimeout(() => {
          window.location.href = '/profile';
        }, 2000));
        timeoutsRef.current.push(timeout);
      })
      .on('broadcast', { event: 'invite_declined' }, (payload) => {
        const eventId = `invite_decline_${payload.payload?.invite_id}`;
        if (isDuplicateEvent(eventId)) return;
        
        const notification: RealtimeNotification = {
          id: `${eventId}_${Date.now()}`,
          type: 'invite_declined',
          title: 'Invitation Declined',
          message: 'Your partner invitation was declined',
          data: payload.payload,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        
        setNotifications(prev => [notification, ...prev]);
        
        toast.error('Your partner invitation was declined', {
          description: 'You can send a new invitation anytime',
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionError('Failed to connect to realtime service');
          setIsConnected(false);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });
    
    channelsRef.current.push(userChannel);
    
    // =========================================================================
    // Channel 2: Partner presence channel (online/offline status)
    // =========================================================================
    if (partnerId) {
      const presenceChannel = supabase.channel(`presence:${partnerId}`)
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          setPartnerIsOnline(Object.keys(state).length > 0);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track own presence
            try {
              await presenceChannel.track({ 
                user_id: user.id,
                online_at: new Date().toISOString(),
              });
            } catch (err) {
              console.warn('Failed to track presence:', err);
            }
          }
        });
      
      channelsRef.current.push(presenceChannel);
    }
    
    // =========================================================================
    // Channel 3: Database changes - shared_answers (fallback for missed broadcasts)
    // =========================================================================
    if (partnerId && canReceivePartnerEvents()) {
      const sharedAnswersChannel = supabase.channel('db:shared_answers')
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'shared_answers',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload: any) => {
            // Only process if we haven't seen this via broadcast
            const exists = notifications.some(
              n => n.data?.shared_answer_id === payload.new?.id
            );
            
            if (!exists && payload.new?.sender_id === partnerId) {
              const notification: RealtimeNotification = {
                id: `shared_db_${payload.new?.id}`,
                type: 'shared_answer',
                title: 'New Shared Answer',
                message: 'Your partner shared an answer with you',
                senderId: payload.new?.sender_id,
                data: payload.new,
                isRead: false,
                createdAt: payload.new?.created_at,
              };
              
              setNotifications(prev => [notification, ...prev]);
              
              toast.info('Your partner shared an answer with you', {
                description: 'Tap to view',
              });
            }
          }
        )
        .subscribe();
      
      channelsRef.current.push(sharedAnswersChannel);
    }
    
    // =========================================================================
    // Channel 4: Database changes - partner_invitations (invite status)
    // =========================================================================
    const invitesChannel = supabase.channel('db:invites')
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partner_invites',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new?.status === 'accepted' && payload.old?.status === 'pending') {
            const eventId = `invite_update_${payload.new?.id}`;
            if (isDuplicateEvent(eventId)) return;
            
            const notification: RealtimeNotification = {
              id: `${eventId}`,
              type: 'invite_accepted',
              title: 'Partner Connected!',
              message: 'Your invitation was accepted',
              data: payload.new,
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            
            setNotifications(prev => [notification, ...prev]);
            
            toast.success('Your partner accepted your invitation! 🎉');
            
            // Navigate to profile after a delay
            const timeout = trackTimeout(setTimeout(() => {
              window.location.href = '/profile';
            }, 2000));
            timeoutsRef.current.push(timeout);
          } else if (payload.new?.status === 'declined' && payload.old?.status === 'pending') {
            const notification: RealtimeNotification = {
              id: `invite_decline_${payload.new?.id}_${Date.now()}`,
              type: 'invite_declined',
              title: 'Invitation Declined',
              message: 'Your partner invitation was declined',
              data: payload.new,
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            
            setNotifications(prev => [notification, ...prev]);
            
            toast.error('Your partner invitation was declined');
          }
        }
      )
      .subscribe();
    
    channelsRef.current.push(invitesChannel);
    
    // Handle connection errors and reconnection
    const handleOnline = () => {
      setConnectionError(null);
      reconnect();
    };
    
    const handleOffline = () => {
      setIsConnected(false);
      setConnectionError('You are offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
    if (!navigator.onLine) {
      handleOffline();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      
      // Unsubscribe from all channels
      channelsRef.current.forEach(channel => {
        try {
          channel.unsubscribe();
        } catch {
          // ignore unsubscribe errors
        }
      });
      channelsRef.current = [];
    };
  }, [user?.id, profile?.partner_id, canReceivePartnerEvents, reconnect, isDuplicateEvent, trackTimeout]);
  
  return {
    isConnected,
    connectionError,
    reconnect,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    partnerActivity,
    partnerIsOnline,
    lastSharedAnswer,
  };
}

export default useRealtimeSync;
