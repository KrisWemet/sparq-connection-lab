import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HeartHandshake, Loader2, Send, Copy, Check } from "lucide-react";
import { useAuth } from '@/lib/auth';
import { partnerService } from '@/services/partnerService';
import { supabase } from '@/integrations/supabase/client';

export default function JoinPartner() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Accept invitation flow (when inviteCode is in URL) ---
  const [loading, setLoading] = useState(!!inviteCode);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Send invitation flow ---
  const [partnerEmail, setPartnerEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentInviteLink, setSentInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load invitation details when inviteCode is present
  useEffect(() => {
    if (!inviteCode) return;

    const checkInvitation = async () => {
      try {
        const { data: invite, error: inviteError } = await supabase
          .from('partner_invites')
          .select('*')
          .eq('invite_code', inviteCode)
          .maybeSingle();

        if (inviteError || !invite) throw new Error('Invitation not found');
        if (new Date(invite.expires_at) < new Date()) throw new Error('This invitation has expired');
        if (invite.status === 'accepted') throw new Error('This invitation has already been accepted');

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
      toast.success("You're connected with your partner!");
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation");
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail.trim()) return;

    setSending(true);
    try {
      const inv = await partnerService.sendInvitation(partnerEmail.trim());
      const link = `${window.location.origin}/partner-invite/${inv.invite_code}`;
      setSentInviteLink(link);
      toast.success("Invitation sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    if (sentInviteLink) {
      navigator.clipboard.writeText(sentInviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Accept flow (inviteCode in URL) ─────────────────────────────────────

  if (inviteCode) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading invitation...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto mb-4">
              <HeartHandshake className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Return Home
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-6 text-center">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            <HeartHandshake className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Join Your Partner</h2>
          <p className="text-muted-foreground mb-6">
            Accept this invitation to connect and grow together.
          </p>

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Sign in first to accept this invitation.</p>
              <Button className="w-full" onClick={() => navigate(`/auth?redirect=/partner-invite/${inviteCode}`)}>
                Sign In
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/signup?redirect=/partner-invite/${inviteCode}`)}>
                Create Account
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={handleAcceptInvitation} disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Accepting...</>
                : 'Accept Invitation'}
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // ── Send invite flow (no code in URL) ────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            <HeartHandshake className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Invite Your Partner</h2>
          <p className="text-muted-foreground mt-2">
            Daily sessions are even more powerful when you grow together.
          </p>
        </div>

        {sentInviteLink ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm font-medium mb-1">Invitation sent to {partnerEmail}</p>
              <p className="text-xs text-muted-foreground">Share this link if they didn't get the email:</p>
            </div>
            <div className="flex gap-2">
              <Input value={sentInviteLink} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <Label htmlFor="partner-email">Partner's email</Label>
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending || !partnerEmail.trim()}>
              {sending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                : <><Send className="w-4 h-4 mr-2" /> Send Invitation</>}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
              Skip for now
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
