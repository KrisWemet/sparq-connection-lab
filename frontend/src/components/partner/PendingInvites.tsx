import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, parseISO } from 'date-fns';

// Define types for the invite data based on the get-my-invites function structure
interface ProfileStub {
    user_id: string;
    username: string | null;
    avatar_url: string | null;
}

interface InviteBase {
    id: string;
    invite_code: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    expires_at: string;
    created_at: string;
    updated_at?: string; // Only present on received invites after action
}

interface SentInvite extends InviteBase {
    recipient: ProfileStub | null;
}

interface ReceivedInvite extends InviteBase {
    sender: ProfileStub | null;
}

interface InvitesData {
    sent: SentInvite[];
    received: ReceivedInvite[];
}

export function PendingInvites() {
    const { user } = useAuth();
    const [invites, setInvites] = useState<InvitesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const fetchInvites = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.functions.invoke('get-my-invites');

            if (fetchError) {
                console.error("Function Invoke Error (get-my-invites):", fetchError);
                throw new Error('Failed to load your invites.');
            }

            if (data) {
                setInvites(data as InvitesData);
            } else {
                setInvites({ sent: [], received: [] }); // Set empty state if no data
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setInvites(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleCancelInvite = async (inviteId: string) => {
        if (!inviteId) return;
        setCancellingId(inviteId);
        try {
            const { error: cancelError } = await supabase.functions.invoke('cancel-partner-invite', {
                body: { invite_id: inviteId },
            });

            if (cancelError) {
                console.error("Function Invoke Error (cancel-partner-invite):", cancelError);
                let errorMessage = "Failed to cancel invite.";
                try {
                    const errorJson = JSON.parse(cancelError.context?.responseText || '{}');
                    errorMessage = errorJson.error || errorMessage;
                } catch (parseError) { /* Ignore */ }
                toast.error(errorMessage);
            } else {
                toast.success("Invite cancelled successfully.");
                // Refresh the list after cancellation
                fetchInvites();
            }
        } catch (err: any) {
            console.error("Error calling cancel invite function:", err);
            toast.error("An unexpected error occurred while cancelling.");
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadgeVariant = (status: InviteBase['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'pending': return 'default'; // Blue/Primary
            case 'accepted': return 'secondary'; // Green (using secondary for now)
            case 'rejected': return 'destructive'; // Red
            case 'expired': return 'outline'; // Grey
            default: return 'outline';
        }
    };

    const renderInviteTime = (invite: InviteBase) => {
        const createdDate = parseISO(invite.created_at);
        const expiresDate = parseISO(invite.expires_at);
        const now = new Date();

        if (invite.status === 'pending' && expiresDate > now) {
            return `Expires ${formatDistanceToNow(expiresDate, { addSuffix: true })}`;
        } else if (invite.status === 'pending' && expiresDate <= now) {
            // Should ideally be 'expired', but handle display just in case
             return `Expired ${formatDistanceToNow(expiresDate, { addSuffix: true })}`;
        } else if (invite.updated_at) {
             const updatedDate = parseISO(invite.updated_at);
             return `Updated ${formatDistanceToNow(updatedDate, { addSuffix: true })}`;
        }
        return `Created ${formatDistanceToNow(createdDate, { addSuffix: true })}`;
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading invites...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" /> Error Loading Invites
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <p className="text-destructive">{error}</p>
                    <Button variant="destructive" size="sm" onClick={fetchInvites}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!invites || (invites.sent.length === 0 && invites.received.length === 0)) {
        return (
            <Card className="text-center py-6">
                <CardContent>
                    <p className="text-gray-500">You have no pending or past invites.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Sent Invites Section */}
            {invites.sent.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sent Invites</CardTitle>
                        <CardDescription>Invites you have sent to others.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invites.sent.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                <div className="flex-1 mr-2">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Badge variant={getStatusBadgeVariant(invite.status)} className="capitalize">{invite.status}</Badge>
                                        <span className="text-sm font-mono text-gray-600 break-all">{invite.invite_code}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {renderInviteTime(invite)}
                                        {invite.recipient && ` | To: ${invite.recipient.username || 'User'}`}
                                    </p>
                                </div>
                                {invite.status === 'pending' && new Date(invite.expires_at) > new Date() && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelInvite(invite.id)}
                                        disabled={cancellingId === invite.id}
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {cancellingId === invite.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}
                                        <span className="ml-1">Cancel</span>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Received Invites Section */}
            {invites.received.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Received Invites</CardTitle>
                        <CardDescription>Invites you have received and acted upon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invites.received.map((invite) => (
                             <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                                <div className="flex-1 mr-2">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Badge variant={getStatusBadgeVariant(invite.status)} className="capitalize">{invite.status}</Badge>
                                        <span className="text-sm font-mono text-gray-600 break-all">{invite.invite_code}</span>
                                    </div>
                                     <p className="text-xs text-gray-500">
                                        {renderInviteTime(invite)}
                                        {invite.sender && ` | From: ${invite.sender.username || 'User'}`}
                                    </p>
                                </div>
                                {/* No actions needed for received invites in this view */}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}