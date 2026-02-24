import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareAnswerButtonProps {
  questionText: string;
  answerText: string;
  sessionId?: string;
  category?: string;
  discoveryDay?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareAnswerButton({
  questionText,
  answerText,
  sessionId,
  category,
  discoveryDay,
  variant = "outline",
  size = "sm",
}: ShareAnswerButtonProps) {
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to share.");
        return;
      }

      // Check if user has a partner
      const { data: profile } = await supabase
        .from("profiles")
        .select("partner_id")
        .eq("id", user.id)
        .single();

      if (!profile?.partner_id) {
        toast("Invite your partner first to share insights together!", {
          description: "Go to Settings to send a partner invite.",
        });
        return;
      }

      // Store the shared answer for partner to see
      await supabase.from("shared_answers").insert({
        sender_id: user.id,
        recipient_id: profile.partner_id,
        question_text: questionText,
        answer_text: answerText,
        session_id: sessionId,
        category: category,
        discovery_day: discoveryDay,
      });

      setShared(true);
      toast.success("Shared with your partner!");
    } catch (err) {
      toast.error("Could not share right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (shared) {
    return (
      <Button variant={variant} size={size} disabled className="gap-2">
        <Check className="h-4 w-4" />
        Shared
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={loading}
      className="gap-2"
    >
      <Share2 className="h-4 w-4" />
      {loading ? "Sharing..." : "Share with partner"}
    </Button>
  );
}
