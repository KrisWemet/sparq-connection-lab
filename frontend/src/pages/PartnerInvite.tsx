import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Copy, Mail, QrCode, Heart, Link as LinkIcon, Loader2, X } from "lucide-react"; // Added X icon
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/bottom-nav";
import { PendingInvites } from "@/components/partner/PendingInvites"; // Import the new component
// import { Database } from "@/integrations/supabase/types"; // Types might be inferred or defined elsewhere

export default function PartnerInvite() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false); // State for rejecting
  const [inviteCode, setInviteCode] = useState("");
  // const [partnerEmail, setPartnerEmail] = useState(""); // Removed email state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null); // Store generated code separately
  const [activeTab, setActiveTab] = useState("generate");

  // Replaced with Edge Function call
  const handleGenerateInvite = async () => {
    if (!user) {
      toast.error("You need to be logged in to generate an invite");
      return;
    }
    if (profile?.partnerId) {
       toast.error("You are already connected with a partner.");
       return;
    }

    setIsGenerating(true);
    setGeneratedCode(null); // Clear previous code

    try {
      const { data, error } = await supabase.functions.invoke('create-partner-invite');

      if (error) {
        console.error("Function Invoke Error:", error);
        // Attempt to parse Supabase Edge Function error details
        let errorMessage = "Failed to generate invite code.";
        try {
            const errorJson = JSON.parse(error.context?.responseText || '{}');
            errorMessage = errorJson.error || errorMessage;
        } catch (parseError) {
            // Ignore if responseText is not valid JSON
        }
         toast.error(errorMessage);
      } else if (data?.invite_code) {
        setGeneratedCode(data.invite_code);
        toast.success("Invite code generated successfully!");
      } else {
         toast.error("Failed to generate invite code. No code returned.");
      }
    } catch (error: any) {
      console.error("Error calling generate invite function:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Removed sendInviteEmail function as per spec (focus on code sharing)

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast.success("Invite code copied to clipboard!");
  };

  // Replaced with Edge Function call
  const handleAcceptInvite = async (code: string) => {
     if (!user) {
      toast.error("You need to be logged in to accept an invite");
      return;
    }
     if (!code) {
      toast.error("Please enter an invite code.");
      return;
    }
     if (profile?.partnerId) {
       toast.error("You are already connected with a partner.");
       return;
    }

    setIsAccepting(true);
    try {
      const { data, error } = await supabase.functions.invoke('accept-partner-invite', {
        body: { invite_code: code },
      });

      if (error) {
        console.error("Function Invoke Error:", error);
        let errorMessage = "Failed to accept invite.";
         try {
            const errorJson = JSON.parse(error.context?.responseText || '{}');
            errorMessage = errorJson.error || errorMessage;
        } catch (parseError) {
            // Ignore if responseText is not valid JSON
        }
        toast.error(errorMessage);
      } else {
        toast.success("You're now connected with your partner!", {
          description: "Redirecting to dashboard..."
        });
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
          window.location.reload(); // Force refresh to update profile state and auth context
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error calling accept invite function:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  // Function to handle rejecting an invite
  const handleRejectInvite = async (code: string) => {
    if (!user) {
      toast.error("You need to be logged in to reject an invite");
      return;
    }
    if (!code) {
      toast.error("Please enter an invite code.");
      return;
    }
     if (profile?.partnerId) {
       // Technically shouldn't happen if they are on this screen, but good check
       toast.error("You are already connected with a partner.");
       return;
    }

    setIsRejecting(true);
    try {
      const { error } = await supabase.functions.invoke('reject-partner-invite', {
        body: { invite_code: code },
      });

      if (error) {
        console.error("Function Invoke Error (Reject):", error);
        let errorMessage = "Failed to reject invite.";
         try {
            const errorJson = JSON.parse(error.context?.responseText || '{}');
            errorMessage = errorJson.error || errorMessage;
        } catch (parseError) { /* Ignore */ }
        toast.error(errorMessage);
      } else {
        toast.success("Invite successfully rejected.");
        setInviteCode(""); // Clear the input field
        // Optionally navigate away or update UI state
      }
    } catch (error: any) {
      console.error("Error calling reject invite function:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  // Check if there's an invite code in the URL (for accepting invites)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      setActiveTab("accept");
      setInviteCode(code); // Pre-fill the input field
    }
  }, []);

  // If the user already has a partner, show different UI
  // Use partner_id from the profile context
  if (profile?.partnerId) { // Corrected property name
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 mx-auto">Partner Connection</h1>
            <div className="w-8"></div>
          </div>
        </header>

        <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-center">You're Already Connected!</CardTitle>
              <CardDescription className="text-center">
                You are already connected with your partner.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="mb-4">If you need to disconnect from your current partner, please visit the settings page.</p>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 mx-auto">Partner Connection</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 pt-6 animate-slide-up">
        <Card className="border-primary/20 mb-6">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-center">Connect with Your Partner</CardTitle>
            <CardDescription className="text-center">
              Link your account with your partner to unlock the full experience and share your journey together.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="generate">Create Invite</TabsTrigger>
            <TabsTrigger value="accept">Accept Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate an Invite</CardTitle>
                <CardDescription>Create an invite code to share with your partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedCode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm text-green-700 mb-2">Share this code with your partner:</p>
                      <p className="font-mono text-xl font-semibold text-green-900 break-all">{generatedCode}</p>
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                  </div> {/* End flex justify-center */}
                 </div> // <<< Add missing closing div here
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">Generate a unique invite code for your partner</p>
                    <Button onClick={handleGenerateInvite} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                      {isGenerating ? "Generating..." : "Generate New Code"}
                    </Button>
                  </div>
                )}

                {/* Removed Email Sending Section */}
              </CardContent>
              <CardFooter className="flex-col space-y-2 text-sm text-gray-500">
                <p>Your partner will need to log in or create an account to accept the invite.</p>
                <p>The invite will expire in 7 days for security.</p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="accept" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accept an Invite</CardTitle>
                <CardDescription>Enter the invite code shared by your partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRejectInvite(inviteCode)}
                    disabled={!inviteCode || isRejecting || isAccepting}
                  >
                    {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" /> /* Use X icon */}
                    {isRejecting ? "Rejecting..." : "Reject Invite"}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => handleAcceptInvite(inviteCode)}
                    disabled={!inviteCode || isAccepting || isRejecting}
                  >
                    {isAccepting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2" />}
                    {isAccepting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-500">
                  You can also scan a QR code if your partner has shared one.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
} 