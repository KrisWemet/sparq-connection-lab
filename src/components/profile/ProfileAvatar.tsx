
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import { ProfileFormData } from "@/types/profile";

interface ProfileAvatarProps {
  profile: ProfileFormData;
}

export function ProfileAvatar({ profile }: ProfileAvatarProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
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
