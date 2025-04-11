import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Send, Lock, Users } from "lucide-react";

interface ReflectionInputProps {
  dayNumber: number;
  pathToTogetherId: string; // Renamed prop
  initialReflection?: string;
  sharedWithPartner?: boolean;
  hasPartner: boolean;
  onSave: (reflection: string, shared: boolean) => void;
}

export function ReflectionInput({
  dayNumber,
  pathToTogetherId, // Use renamed prop
  initialReflection = "",
  sharedWithPartner = false,
  hasPartner,
  onSave
}: ReflectionInputProps) {
  const [reflection, setReflection] = useState(initialReflection);
  const [isShared, setIsShared] = useState(sharedWithPartner);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!reflection.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(reflection, isShared);
      // No need to clear the reflection as we keep it for editing
    } catch (error) {
      console.error("Error saving reflection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Your Reflection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Write your reflection here..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="min-h-[150px]"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasPartner ? (
              <>
                <Switch
                  id="share-reflection"
                  checked={isShared}
                  onCheckedChange={setIsShared}
                />
                <Label htmlFor="share-reflection" className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  Share with partner
                </Label>
              </>
            ) : (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                Connect with partner to enable sharing
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={!reflection.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 