
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileFormData } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface PartnerConnectionCardProps {
  profile: ProfileFormData;
  partnerAvatarUrl: string;
}

export function PartnerConnectionCard({ profile, partnerAvatarUrl }: PartnerConnectionCardProps) {
  const [uploadingPartnerAvatar, setUploadingPartnerAvatar] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewPartner = () => {
    navigate("/partner-profile");
  };

  const handlePartnerAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user || !profile.partner_name) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `partner-${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      setUploadingPartnerAvatar(true);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (data) {
        // In a real app, you would associate this with the partner's profile
        // For now, we'll just show it in the UI without saving it to the partner's profile
        toast.success("Partner avatar uploaded!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading partner avatar");
      console.error("Error uploading partner avatar:", error);
    } finally {
      setUploadingPartnerAvatar(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Partner Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage src={partnerAvatarUrl} />
                <AvatarFallback>{profile.partner_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              
              <label 
                htmlFor="partner-avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
                style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Camera className="w-2.5 h-2.5" />
                <input 
                  id="partner-avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePartnerAvatarUpload}
                  disabled={uploadingPartnerAvatar}
                />
              </label>
            </div>
            <div>
              <p className="font-medium">{profile.partner_name}</p>
              {profile.anniversary_date && (
                <p className="text-xs text-gray-500">
                  Connected since {new Date(profile.anniversary_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewPartner}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
