import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { HeartHandshake, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { partnerService } from '@/services/partnerService';
import { supabase } from '@/integrations/supabase/client';

export default function JoinPartner() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!inviteCode) {
        setError('No invitation code provided');
        setLoading(false);
        return;
      }

      try {
        const { data: invite, error: inviteError } = await supabase
          .from('partner_invitations')
          .select('*')
          .eq('invitation_code', inviteCode)
          .single();

        if (inviteError || !invite) {
          throw new Error('Invitation not found');
        }

        // Check if invitation has expired
        if (new Date(invite.expires_at) < new Date()) {
          throw new Error('This invitation has expired');
        }

        // Check if invitation has already been accepted
        if (invite.status === 'accepted') {
          throw new Error('This invitation has already been accepted');
        }

        setInvitation(invite);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkInvitation();
  }, [inviteCode]);

  const handleAcceptInvitation = async () => {
    if (!user || !inviteCode) return;

    setLoading(true);
    try {
      await partnerService.acceptInvitation(inviteCode);
      toast.success("Invitation accepted successfully!");
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast.error(err.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-fit mx-auto mb-4">
              <HeartHandshake className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            <HeartHandshake className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Join Your Partner's Journey
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You've been invited to join a relationship journey. Together, you'll explore activities
            designed to strengthen your connection.
          </p>
          
          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please sign in or create an account to accept this invitation.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate('/signup')}>
                  Create Account
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleAcceptInvitation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
} 