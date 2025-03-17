
import { Loader2 } from "lucide-react";

export function LoadingProfile() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-xs mx-auto">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" /> {/* Reduced from w-8 h-8 to w-6 h-6 */}
        <p className="text-gray-700 font-medium">Loading your profile...</p>
        <p className="text-sm text-gray-500 mt-2">
          Like relationships, good things take time to build and nurture.
        </p>
      </div>
    </div>
  );
}
