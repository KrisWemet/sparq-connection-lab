import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, UserPlus, Users, Circle } from 'lucide-react';
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
      <div className="rounded-3xl border border-brand-primary/10 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center relative">
            <Users className="h-5 w-5 text-brand-primary" />
            {partnerStatus === 'online' && (
              <Circle
                size={10}
                fill="#4ade80"
                stroke="#FFFFFF"
                strokeWidth={2}
                className="absolute -top-0.5 -right-0.5"
              />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-brand-taupe text-sm">
              Partner Connected
            </h4>
            <p className="text-xs text-zinc-500">
              {partnerStatus === 'online' ? (
                <span className="text-brand-growth font-medium">Online now</span>
              ) : (
                <span>Offline</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-brand-primary/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-brand-taupe text-sm">
              Invite Your Partner
            </h4>
            <p className="text-xs text-zinc-500">
              Share this journey to sync your progress
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="email"
              placeholder="Partner's email"
              className="pl-9 rounded-xl border-brand-primary/10 focus:ring-brand-primary/30"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={invitePartner}
            disabled={isInviting || !partnerEmail.trim()}
            className="rounded-xl bg-brand-primary hover:bg-brand-hover text-white"
          >
            {isInviting ? 'Sending...' : 'Invite'}
          </Button>
        </div>
      </div>
    </div>
  );
}
