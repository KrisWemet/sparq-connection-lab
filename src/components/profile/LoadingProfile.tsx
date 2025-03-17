
import { Loader2 } from "lucide-react";

export function LoadingProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-xs mx-auto">
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-2" /> {/* Reduced from w-6 h-6 to w-5 h-5 */}
        <p className="text-gray-700 font-medium">Loading your profile...</p>
        <p className="text-xs text-gray-500 mt-1">
          Just a moment while we get your information.
        </p>
      </div>
    </div>
  );
}
