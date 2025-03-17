
import { Loader2 } from "lucide-react";

export function LoadingProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-xs mx-auto">
        <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mb-1" /> {/* Reduced size further */}
        <p className="text-gray-700 font-medium text-sm">Loading profile...</p> {/* Reduced text size */}
      </div>
    </div>
  );
}
