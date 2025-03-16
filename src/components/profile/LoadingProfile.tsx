
import { Loader2 } from "lucide-react";

export function LoadingProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-gray-500">Loading your profile...</p>
        <p className="text-xs text-gray-400 mt-2">If this takes too long, try refreshing the page</p>
      </div>
    </div>
  );
}
