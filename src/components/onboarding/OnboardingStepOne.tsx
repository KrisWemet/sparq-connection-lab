import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, User, Users } from "lucide-react";

interface OnboardingStepOneProps {
  fullName: string;
  setFullName: (value: string) => void;
  partnerName: string;
  setPartnerName: (value: string) => void;
  relationshipMode: "solo" | "partner";
  setRelationshipMode: (mode: "solo" | "partner") => void;
}

export function OnboardingStepOne({
  fullName,
  setFullName,
  partnerName,
  setPartnerName,
  relationshipMode,
  setRelationshipMode,
}: OnboardingStepOneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Sparq!</h2>
        <p className="text-muted-foreground">
          Let's get you started on your growth journey.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="full-name">What should we call you?</Label>
          <div className="mt-1.5">
            <Input
              id="full-name"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        {/* Solo / Partner toggle */}
        <div>
          <Label>How are you using Sparq?</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => setRelationshipMode("solo")}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                relationshipMode === "solo"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="block text-sm font-medium">Solo</span>
              <span className="block text-xs text-muted-foreground mt-1">
                Making me a better me
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRelationshipMode("partner")}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                relationshipMode === "partner"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="block text-sm font-medium">With a partner</span>
              <span className="block text-xs text-muted-foreground mt-1">
                Growing together
              </span>
            </button>
          </div>
        </div>

        {/* Partner name — only shown in partner mode */}
        {relationshipMode === "partner" && (
          <div>
            <Label htmlFor="partner-name">Your partner's name</Label>
            <div className="mt-1.5">
              <Input
                id="partner-name"
                type="text"
                placeholder="Partner's name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
