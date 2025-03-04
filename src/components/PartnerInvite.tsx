import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Copy, Check, UserPlus } from "lucide-react";
import { partnerService } from '@/services/partnerService';

export function PartnerInvite() {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!partnerEmail) {
      toast.error("Please enter your partner's email");
      return;
    }

    setIsLoading(true);
    try {
      const invitation = await partnerService.sendInvitation(partnerEmail);
      const inviteUrl = `${window.location.origin}/join/${invitation.invitation_code}`;
      setInviteLink(inviteUrl);
      toast.success("Invitation sent successfully!");
      setPartnerEmail('');
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Invite Your Partner</h2>
        </div>

        <div className="space-y-2">
          <label htmlFor="partner-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Partner's Email
          </label>
          <div className="flex gap-2">
            <Input
              id="partner-email"
              type="email"
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleInvite}
              disabled={isLoading || !partnerEmail}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Invite
                </div>
              )}
            </Button>
          </div>
        </div>

        {inviteLink && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Or share this invite link
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 