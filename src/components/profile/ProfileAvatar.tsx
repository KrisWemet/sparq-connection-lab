
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Upload, Camera } from "lucide-react";
import { ProfileFormData } from "@/types/profile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface ProfileAvatarProps {
  profile: ProfileFormData;
  onAvatarUpdate?: (url: string) => void;
}

export function ProfileAvatar({ profile, onAvatarUpdate }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !user) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      setUploading(true);
      
      // Check if the avatars bucket exists, if not this will fail but that's ok
      // as the bucket should be created through SQL migrations
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (data && onAvatarUpdate) {
        onAvatarUpdate(data.publicUrl);
        toast.success("Avatar uploaded successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading avatar");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative">
        <Avatar className="w-24 h-24 mb-1 border-2 border-primary/20">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md hover:bg-primary/80 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </label>
      </div>
      
      {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      
      <h2 className="text-2xl font-bold text-gray-900 mt-3">{profile.full_name}</h2>
      {profile.partner_name && (
        <p className="text-gray-500">Connected with {profile.partner_name}</p>
      )}
      {profile.anniversary_date && (
        <div className="flex items-center gap-2 mt-2">
          <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>Together since {new Date(profile.anniversary_date).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
