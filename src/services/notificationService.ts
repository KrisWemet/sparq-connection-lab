
import { toast } from "sonner";

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  description?: string;
  duration?: number;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notificationService = {
  /**
   * Show a notification to the user
   */
  notify(message: string, type: NotificationType = 'info', options: NotificationOptions = {}) {
    const { description, duration, icon, action } = options;
    
    switch (type) {
      case 'success':
        toast.success(message, { description, duration, icon, action });
        break;
      case 'error':
        toast.error(message, { description, duration, icon, action });
        break;
      case 'warning':
        toast.warning(message, { description, duration, icon, action });
        break;
      case 'info':
      default:
        toast.info(message, { description, duration, icon, action });
        break;
    }
  },
  
  /**
   * Show a success notification
   */
  success(message: string, options: NotificationOptions = {}) {
    this.notify(message, 'success', options);
  },
  
  /**
   * Show an error notification
   */
  error(message: string, options: NotificationOptions = {}) {
    this.notify(message, 'error', options);
  },
  
  /**
   * Show a warning notification
   */
  warning(message: string, options: NotificationOptions = {}) {
    this.notify(message, 'warning', options);
  },
  
  /**
   * Show an info notification
   */
  info(message: string, options: NotificationOptions = {}) {
    this.notify(message, 'info', options);
  },
  
  /**
   * Show a celebration notification
   */
  celebrate(achievement: string, options: NotificationOptions = {}) {
    this.notify(`🎉 ${achievement}`, 'success', {
      icon: '🏆',
      duration: 5000,
      ...options
    });
  },
  
  /**
   * Show a reminder notification
   */
  reminder(message: string, options: NotificationOptions = {}) {
    this.notify(`⏰ ${message}`, 'info', {
      icon: '⏰',
      duration: 7000,
      ...options
    });
  }
};
