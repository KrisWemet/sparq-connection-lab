
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Heart } from "lucide-react";

interface OnboardingStepOneProps {
  fullName: string;
  setFullName: (value: string) => void;
  partnerName: string;
  setPartnerName: (value: string) => void;
  partnerEmail: string;
  setPartnerEmail: (value: string) => void;
  anniversaryDate: Date | null;
  setAnniversaryDate: (date: Date | null) => void;
}

export function OnboardingStepOne({
  fullName,
  setFullName,
  partnerName,
  setPartnerName,
  partnerEmail,
  setPartnerEmail,
  anniversaryDate,
  setAnniversaryDate
}: OnboardingStepOneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center p-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Sparq Connect!</h2>
        <p className="text-muted-foreground">
          Let's set up your profile to make the most of your relationship journey.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="full-name">Your Full Name</Label>
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
        
        <div>
          <Label htmlFor="partner-name">Your Partner's Name (Optional)</Label>
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
        
        <div>
          <Label htmlFor="partner-email">Partner's Email Address (Optional)</Label>
          <div className="mt-1.5">
            <Input
              id="partner-email"
              type="email"
              placeholder="partner@example.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">
            We'll send them an invitation to join you on your relationship journey.
          </p>
        </div>
        
        <div>
          <Label htmlFor="anniversary-date">Anniversary Date (Optional)</Label>
          <div className="mt-1.5">
            <DatePicker
              date={anniversaryDate}
              setDate={setAnniversaryDate}
              placeholder="Select date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
