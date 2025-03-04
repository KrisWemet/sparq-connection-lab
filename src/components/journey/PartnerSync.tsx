import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, UserPlus, Users } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { createJourneyInvitation } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

interface PartnerSyncProps {
  journeyId: string;
  partnerId?: string;
  onPartnerJoined?: (partnerId: string) => void;
}

export function PartnerSync({ journeyId, partnerId, onPartnerJoined }: PartnerSyncProps) {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState<'offline' | 'online'>('offline');
  const { user } = useAuth();

  useEffect(() => {
    if (!partnerId) return;

    // Subscribe to partner's presence
    const presenceChannel = supabase.channel(`presence:${partnerId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setPartnerStatus(Object.keys(state).length > 0 ? 'online' : 'offline');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user?.id });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [partnerId, user?.id]);

  // Subscribe to invitation responses
  useEffect(() => {
    if (!user) return;

    const invitationChannel = supabase
      .channel('journey_invitations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'journey_invitations',
          filter: `inviter_id=eq.${user.id}`,
        },
        (payload) => {
          const invitation = payload.new;
          if (invitation.status === 'accepted') {
            toast.success('Your partner has accepted the invitation!');
            onPartnerJoined?.(invitation.inviter_id);
          } else if (invitation.status === 'declined') {
            toast.error('Your partner has declined the invitation.');
          }
        }
      )
      .subscribe();

    return () => {
      invitationChannel.unsubscribe();
    };
  }, [user, onPartnerJoined]);

  const invitePartner = async () => {
    if (!user || !partnerEmail.trim()) return;

    try {
      setIsInviting(true);
      await createJourneyInvitation(journeyId, user.id, partnerEmail);
      toast.success('Invitation sent to your partner!');
      setPartnerEmail('');
    } catch (error) {
      console.error('Error inviting partner:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  if (partnerId) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <Users className="h-5 w-5" />
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Partner Connected
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: {partnerStatus === 'online' ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-gray-400">Offline</span>
              )}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <UserPlus className="h-6 w-6 text-gray-400" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Invite Your Partner
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share this journey with your partner to sync your progress
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your partner's email"
              className="pl-9"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={invitePartner}
            disabled={isInviting || !partnerEmail.trim()}
          >
            {isInviting ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </div>
    </Card>
  );
} 