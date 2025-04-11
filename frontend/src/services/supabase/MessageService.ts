import { BaseService } from './BaseService';
import { authService } from './AuthService';
import { profileService } from './ProfileService';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  senderName?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  isOutgoing: boolean;
  sentViaSms?: boolean;
}

/**
 * Service for handling messaging between partners
 */
export class MessageService extends BaseService {
  /**
   * Get all messages between current user and their partner
   */
  async getMessages(): Promise<Message[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const profile = await profileService.getCurrentProfile();
      if (!profile?.partnerId) return [];

      // Get all messages where the user is either sender or recipient
      const { data, error } = await this.supabase
        .from('partner_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!data) return [];
      
      // Transform database records into frontend model
      return data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        recipientId: msg.recipient_id,
        content: msg.content,
        isRead: msg.read,
        createdAt: new Date(msg.created_at),
        isOutgoing: msg.sender_id === user.id,
        sentViaSms: msg.sent_via_sms
      }));
    } catch (error: any) {
      console.error('Error fetching messages:', error.message);
      return [];
    }
  }

  /**
   * Send a message to the partner
   */
  async sendMessage(content: string, sendSms = false): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const profile = await profileService.getCurrentProfile();
      if (!profile?.partnerId) throw new Error('Not connected with a partner');

      // Insert the new message
      const { error } = await this.supabase
        .from('partner_messages')
        .insert({
          sender_id: user.id,
          recipient_id: profile.partnerId,
          content: content,
          read: false,
          sent_via_sms: sendSms
        });

      if (error) throw error;

      // If user wants to send via SMS and partner has a phone number
      if (sendSms) {
        const partnerProfile = await profileService.getProfileById(profile.partnerId);
        if (partnerProfile?.phoneNumber) {
          // For now, just log that we would send SMS. In production, integrate with Twilio or similar
          console.log(`Would send SMS to ${partnerProfile.phoneNumber}: ${content}`);
          // TODO: Implement actual SMS sending via Twilio or similar service
          // this.sendSmsViaThirdParty(partnerProfile.phoneNumber, content, user.name);
        }
      }

      return true;
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(messageIds: string[]): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Update messages to mark as read
      const { error } = await this.supabase
        .from('partner_messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .in('id', messageIds);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error marking messages as read:', error.message);
      return false;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return 0;

      const { data, error } = await this.supabase
        .from('partner_messages')
        .select('id', { count: 'exact' })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return data?.length || 0;
    } catch (error: any) {
      console.error('Error getting unread count:', error.message);
      return 0;
    }
  }

  /**
   * Listen for new messages in real-time
   */
  subscribeToNewMessages(callback: (message: Message) => void): () => void {
    // Fixed: Using async/await with getCurrentUser instead of getCurrentUserSync
    const getUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) return null;
        
        // Set up the subscription once we have the user
        const subscription = this.supabase
          .channel('new_messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'partner_messages',
              filter: `recipient_id=eq.${user.id}`
            },
            (payload) => {
              // Transform the payload into our Message type
              const msg = payload.new;
              const message: Message = {
                id: msg.id,
                senderId: msg.sender_id,
                recipientId: msg.recipient_id,
                content: msg.content,
                isRead: msg.read,
                createdAt: new Date(msg.created_at),
                isOutgoing: false, // It's incoming if we're the recipient
                sentViaSms: msg.sent_via_sms
              };
              callback(message);
            }
          )
          .subscribe();
          
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in message subscription:", error);
        return () => {};
      }
    };

    // Start subscription setup
    let unsubscribe = () => {};
    getUser().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });

    // Return function to unsubscribe
    return () => unsubscribe();
  }
  
  /**
   * Send SMS to external number (implementation placeholder)
   * Note: In a real app, you would implement this with Twilio, Vonage, or similar
   */
  private async sendSmsViaThirdParty(phoneNumber: string, message: string, senderName?: string): Promise<boolean> {
    try {
      // This is where you would integrate with Twilio, Vonage, AWS SNS, etc.
      // Example Twilio integration (pseudo-code):
      /*
      const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `${senderName || 'Your partner'}: ${message}`,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      */
      
      console.log(`SMS would be sent to ${phoneNumber} from ${senderName || 'Partner'}: ${message}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const messageService = new MessageService(); 